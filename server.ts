import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Trust proxy for accurate client IP identification behind Cloud Run / reverse proxy
app.set("trust proxy", true);

// Body parser with 50mb limit for base64 image uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// --- VISITOR IP TRACKING SYSTEM ---
interface VisitorRecord {
  firstSeen: string;
  lastSeen: string;
  hits: number;
  userAgent?: string;
}

interface VisitorsData {
  uniqueIps: Record<string, VisitorRecord>;
  totalVisits: number;
  lastUpdated: string;
}

const VISITORS_FILE = path.join(process.cwd(), "visitors_data.json");

function loadVisitorsData(): VisitorsData {
  try {
    if (fs.existsSync(VISITORS_FILE)) {
      const raw = fs.readFileSync(VISITORS_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error reading visitors data:", err);
  }
  return {
    uniqueIps: {},
    totalVisits: 0,
    lastUpdated: new Date().toISOString(),
  };
}

function saveVisitorsData(data: VisitorsData) {
  try {
    fs.writeFileSync(VISITORS_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving visitors data:", err);
  }
}

let visitorsState = loadVisitorsData();

function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    const firstIp = forwarded.split(",")[0].trim();
    if (firstIp) return firstIp;
  }
  return req.ip || req.socket.remoteAddress || "127.0.0.1";
}

// Lazy GoogleGenAI initialization helper
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// System Instruction as specified by user
const SYSTEM_INSTRUCTION = `You are an expert OCR and inventory reconciliation engine specialized in luxury perfumes and retail logs.
Your task is to analyze photos of handwritten sales notebooks, extract the logged transactions, and match them strictly to known catalog products.

RULES:
1. Extract every row containing a product name, quantity, and transaction context.
2. Infer the transaction type:
   - If marked as "Venta", "V", "-[number]", or logged under daily sales: type = "SALE".
   - If marked as "Llegó", "Entrada", "Surtido", "+[number]", or "Abastecer": type = "RESTOCK".
   - Default to "SALE" if ambiguous but listed in a sales log.
3. Normalize fragrance names to their standard commercial title (e.g., "Aventus", "Sauvage", "L'Immensité", "Born in Roma", "Oud Wood", "Baccarat Rouge 540", "Santal 33", "Jazz Club", "Black Opium", "Chanel No. 5", "Ombré Leather").
4. If a handwriting is blurry, ambiguously spelled, or uncertain, set requiresHumanReview = true.
5. Output MUST strictly adhere to the provided JSON schema. Do not return markdown blocks, explanations, or conversational text.`;

// Structured Schema
const OCR_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    batchId: { type: Type.STRING },
    extractionConfidence: {
      type: Type.STRING,
      enum: ["HIGH", "MEDIUM", "LOW"],
    },
    totalItemsDetected: { type: Type.INTEGER },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          rawText: {
            type: Type.STRING,
            description: "Exact text read from the notebook page",
          },
          matchedProductName: {
            type: Type.STRING,
            description: "Standardized perfume name from catalog",
          },
          quantity: { type: Type.INTEGER },
          movementType: {
            type: Type.STRING,
            enum: ["SALE", "RESTOCK"],
          },
          unitPriceDetected: {
            type: Type.NUMBER,
            description: "Unit price if written, else null",
          },
          requiresHumanReview: {
            type: Type.BOOLEAN,
            description: "True if low confidence or spelling requires validation",
          },
        },
        required: [
          "rawText",
          "matchedProductName",
          "quantity",
          "movementType",
          "requiresHumanReview",
        ],
      },
    },
  },
  required: ["batchId", "totalItemsDetected", "items", "extractionConfidence"],
};

// Health endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({ status: "ok", geminiConfigured: hasKey });
});

// Visitor counter ping (registers new visitor or updates existing by client IP)
app.all("/api/visitors/ping", (req: Request, res: Response) => {
  try {
    const rawIp = getClientIp(req);
    const userAgent = (req.headers["user-agent"] as string) || "Unknown";
    const now = new Date().toISOString();

    if (!visitorsState.uniqueIps[rawIp]) {
      visitorsState.uniqueIps[rawIp] = {
        firstSeen: now,
        lastSeen: now,
        hits: 1,
        userAgent: userAgent.slice(0, 150),
      };
    } else {
      visitorsState.uniqueIps[rawIp].lastSeen = now;
      visitorsState.uniqueIps[rawIp].hits = (visitorsState.uniqueIps[rawIp].hits || 1) + 1;
    }

    visitorsState.totalVisits = (visitorsState.totalVisits || 0) + 1;
    visitorsState.lastUpdated = now;
    saveVisitorsData(visitorsState);

    const uniqueCount = Object.keys(visitorsState.uniqueIps).length;

    return res.json({
      success: true,
      uniqueCount,
      totalVisits: visitorsState.totalVisits,
      lastVisit: now,
      yourIpMasked: rawIp.replace(/(\d+)\.(\d+)\.(\d+)\.(\d+)/, "$1.$2.*.*"),
    });
  } catch (error: any) {
    console.error("Visitor ping error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Visitor count stats (read-only without incrementing visits)
app.get("/api/visitors/stats", (_req: Request, res: Response) => {
  try {
    const uniqueCount = Object.keys(visitorsState.uniqueIps).length;
    return res.json({
      success: true,
      uniqueCount,
      totalVisits: visitorsState.totalVisits || 0,
      lastUpdated: visitorsState.lastUpdated,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Perfume Database API Search Proxy (https://perfumapidatabase.onrender.com/perfumes/search/{query})
app.get("/api/perfumes/search/:query", async (req: Request, res: Response) => {
  try {
    const { query } = req.params;
    if (!query || !query.trim()) {
      return res.json({ success: true, data: [] });
    }

    const targetUrl = `https://perfumapidatabase.onrender.com/perfumes/search/${encodeURIComponent(query.trim())}`;
    const response = await fetch(targetUrl, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 PerfumesMariaMaria/1.0",
      },
    });

    if (!response.ok) {
      console.warn(`Perfume API responded with status ${response.status}`);
      return res.status(response.status).json({
        success: false,
        error: `External perfume API error (${response.status})`,
      });
    }

    const data = await response.json();
    return res.json({
      success: true,
      data: Array.isArray(data) ? data : [],
    });
  } catch (error: any) {
    console.error("Perfume search API proxy error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to query perfume database API",
    });
  }
});

// Real OCR Endpoint with Gemini
app.post("/api/gemini/ocr-notebook", async (req: Request, res: Response) => {
  try {
    const { 
      imageBase64, 
      mimeType = "image/jpeg", 
      notesText, 
      knownCatalog,
      targetMode = "AUTO" // 'SALE' | 'RESTOCK' | 'AUTO'
    } = req.body;

    const catalogContext = Array.isArray(knownCatalog) && knownCatalog.length > 0
      ? `\nKNOWN CATALOG PRODUCTS FOR RECONCILIATION: ${knownCatalog.join(", ")}`
      : "";

    const isSalesMode = targetMode === 'SALE';
    const isRestockMode = targetMode === 'RESTOCK';

    const client = getGeminiClient();

    if (!client) {
      // Fallback smart parser simulation if API key is not yet set
      const batchTimestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const simulatedItems = isRestockMode
        ? [
            {
              rawText: "3 Sauvage",
              matchedProductName: "Sauvage",
              quantity: 3,
              movementType: "RESTOCK",
              unitPriceDetected: 190,
              requiresHumanReview: false,
            },
            {
              rawText: "2 Good Girl",
              matchedProductName: "Good Girl",
              quantity: 2,
              movementType: "RESTOCK",
              unitPriceDetected: 175,
              requiresHumanReview: false,
            },
            {
              rawText: "4 One Million",
              matchedProductName: "1 Million",
              quantity: 4,
              movementType: "RESTOCK",
              unitPriceDetected: 160,
              requiresHumanReview: false,
            },
          ]
        : [
            {
              rawText: "2 Sauvage",
              matchedProductName: "Sauvage",
              quantity: 2,
              movementType: "SALE",
              unitPriceDetected: 240,
              requiresHumanReview: false,
            },
            {
              rawText: "1 Good Girl",
              matchedProductName: "Good Girl",
              quantity: 1,
              movementType: "SALE",
              unitPriceDetected: 220,
              requiresHumanReview: false,
            },
            {
              rawText: "1 One million",
              matchedProductName: "1 Million",
              quantity: 1,
              movementType: "SALE",
              unitPriceDetected: 180,
              requiresHumanReview: false,
            },
          ];

      const simulatedResult = {
        batchId: `BATCH-${batchTimestamp}-01`,
        extractionConfidence: "HIGH",
        totalItemsDetected: simulatedItems.length,
        items: simulatedItems,
      };
      return res.json({
        success: true,
        data: simulatedResult,
        source: "fallback_simulation",
        message: "Key not detected, simulated calibrated output loaded.",
      });
    }

    const contents: any = [];

    // If image provided
    if (imageBase64) {
      // Clean base64 string
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "");
      const mimeMatch = imageBase64.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,/);
      const actualMime = mimeMatch ? mimeMatch[1] : (mimeType || "image/jpeg");
      contents.push({
        inlineData: {
          mimeType: actualMime,
          data: cleanBase64,
        },
      });
    }

    let modeInstruction = "";
    if (isSalesMode) {
      modeInstruction = "\nCONTEXT: The user is in SALES mode. Every line in the note represents perfume names and the quantity of pieces SOLD (piezas vendidas). Set movementType = 'SALE' for every detected item.";
    } else if (isRestockMode) {
      modeInstruction = "\nCONTEXT: The user is in RESTOCK / PURCHASE mode. Every line in the note represents perfume names and the quantity of pieces PURCHASED / RECEIVED (piezas compradas). Set movementType = 'RESTOCK' for every detected item.";
    }

    const userPrompt = `Analyze this handwritten retail notebook page and reconcile items against the luxury perfume catalog.${modeInstruction}${catalogContext}
${notesText ? `Additional context / transcribed snippet: "${notesText}"` : ""}
Extract every row, standardize perfume title, identify the quantity of pieces, and set movementType (${isSalesMode ? "'SALE'" : isRestockMode ? "'RESTOCK'" : "'SALE' or 'RESTOCK'"}) accordingly. Set requiresHumanReview = true only for ambiguous or low-confidence entries.`;

    contents.push({
      text: userPrompt,
    });

    const response = await client.models.generateContent({
      model: "gemini-3.7-flash",
      contents: { parts: contents },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.1,
        topP: 0.95,
        topK: 40,
        responseMimeType: "application/json",
        responseSchema: OCR_RESPONSE_SCHEMA,
      },
    });

    const responseText = response.text || "{}";
    const parsedData = JSON.parse(responseText);

    return res.json({
      success: true,
      data: parsedData,
      source: "gemini-3.7-flash",
    });
  } catch (error: any) {
    console.error("Gemini OCR error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to process image with Gemini OCR",
    });
  }
});

// Webhook simulation endpoint for Antigravity / ERP integrations
app.post("/api/webhook/antigravity", (req: Request, res: Response) => {
  const { batchId, items, timestamp, targetUrl } = req.body;
  console.log(`[Webhook -> Antigravity] Dispatched batch ${batchId} to ${targetUrl || 'default-webhook'} with ${items?.length || 0} items at ${timestamp}`);
  
  res.json({
    success: true,
    dispatchedAt: new Date().toISOString(),
    batchId,
    itemCount: items?.length || 0,
    status: "DELIVERED",
    target: targetUrl || "https://api.antigravity.internal/v1/reconciliations",
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Perfumes Maria Maria Server running on http://localhost:${PORT}`);
  });
}

startServer();

import { PerfumeProduct } from '../types';

/**
 * Normalizes a text string for fuzzy comparison
 */
function cleanText(text: string): string {
  return (text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Extracts distinct note keywords from notes string
 */
function extractNoteTokens(notesString: string): string[] {
  if (!notesString) return [];
  return notesString
    .split(/[,;/•\n]|\s+[ye]\s+/i)
    .map((token) => cleanText(token).replace(/^[-•*]\s*/, ''))
    .filter((token) => token.length >= 3);
}

/**
 * Calculates a similarity score between a target perfume and a candidate perfume
 */
export function calculateSimilarityScore(target: PerfumeProduct, candidate: PerfumeProduct): number {
  if (target.id === candidate.id) return -1; // Ignore self

  let score = 0;

  // Category match (Hombre, Mujer, Unisex)
  if (target.category === candidate.category) {
    score += 15;
  } else if (target.category === 'Unisex' || candidate.category === 'Unisex') {
    score += 10;
  }

  // Same Brand bonus (lovers of a brand often like other fragrances from same brand)
  if (cleanText(target.brand) === cleanText(candidate.brand)) {
    score += 25;
  }

  // Olfactory notes matching (highest weighted factor)
  const targetNotes = extractNoteTokens(target.notes);
  const candidateNotes = extractNoteTokens(candidate.notes);
  
  if (targetNotes.length > 0 && candidateNotes.length > 0) {
    let matchingNotesCount = 0;
    for (const tNote of targetNotes) {
      for (const cNote of candidateNotes) {
        if (tNote === cNote || tNote.includes(cNote) || cNote.includes(tNote)) {
          matchingNotesCount++;
          break;
        }
      }
    }
    score += matchingNotesCount * 20;
  }

  // Description / Vibe keyword matches
  const targetDesc = cleanText(target.description);
  const candidateDesc = cleanText(candidate.description);

  const vibeKeywords = [
    'fresco', 'dulce', 'amaderado', 'citrico', 'acuatico', 'oriental', 
    'especiado', 'elegante', 'sensual', 'nocturno', 'seductor', 'limpio',
    'gourmand', 'cuero', 'calido', 'floral', 'vainilla', 'ahumado', 'intenso'
  ];

  for (const kw of vibeKeywords) {
    const targetHas = targetDesc.includes(kw) || cleanText(target.notes).includes(kw);
    const candidateHas = candidateDesc.includes(kw) || cleanText(candidate.notes).includes(kw);
    if (targetHas && candidateHas) {
      score += 8;
    }
  }

  // Top sales popularity slight nudge for better discovery
  if (candidate.topSalesRank && candidate.topSalesRank <= 10) {
    score += 5;
  }

  return score;
}

export interface SimilarProductResult {
  product: PerfumeProduct;
  score: number;
  sharedNotes: string[];
  reason: string;
}

/**
 * Returns the top similar perfume recommendations for a given perfume
 */
export function getSimilarFragrances(
  target: PerfumeProduct,
  allProducts: PerfumeProduct[],
  limit: number = 4
): SimilarProductResult[] {
  if (!target || !allProducts || allProducts.length <= 1) return [];

  const targetNotes = extractNoteTokens(target.notes);

  const scored = allProducts
    .filter((p) => p.id !== target.id)
    .map((candidate) => {
      const score = calculateSimilarityScore(target, candidate);
      
      // Find matching notes
      const candidateNotes = extractNoteTokens(candidate.notes);
      const sharedNotes: string[] = [];
      
      for (const tNote of targetNotes) {
        for (const cNote of candidateNotes) {
          if (tNote === cNote || tNote.includes(cNote) || cNote.includes(tNote)) {
            // Capitalize for display
            const displayName = cNote.charAt(0).toUpperCase() + cNote.slice(1);
            if (!sharedNotes.includes(displayName)) {
              sharedNotes.push(displayName);
            }
            break;
          }
        }
      }

      // Generate a friendly reason
      let reason = 'Estilo aromático complementario';
      if (cleanText(candidate.brand) === cleanText(target.brand)) {
        reason = `Misma casa de diseño (${target.brand})`;
      } else if (sharedNotes.length >= 2) {
        reason = `Comparte notas de ${sharedNotes.slice(0, 2).join(' y ')}`;
      } else if (target.category === candidate.category) {
        reason = `Familia aromática similar (${candidate.category})`;
      }

      return {
        product: candidate,
        score,
        sharedNotes,
        reason,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored;
}

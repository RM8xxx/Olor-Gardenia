export interface PerfumeApiRawResult {
  id?: string;
  name: string;
  brand: string;
  release_year?: number | string;
  gender?: string;
  notes_top?: string[];
  notes_middle?: string[];
  notes_base?: string[];
  rating?: number;
  votes?: number;
  description?: string;
  longevity?: string;
  sillage?: string;
  image_url?: string;
  perfume_url?: string;
  created_at?: string;
}

export interface FormattedPerfumeApiData {
  id: string;
  name: string;
  cleanName: string;
  brand: string;
  releaseYear: string;
  gender: 'Mujer' | 'Hombre' | 'Unisex';
  notes: string;
  notesTop: string[];
  notesMiddle: string[];
  notesBase: string[];
  description: string;
  imageUrl: string;
  rating?: number;
  votes?: number;
  perfumeUrl?: string;
}

/**
 * Normalizes gender string from API into application categories
 */
export function mapApiGender(gender?: string): 'Mujer' | 'Hombre' | 'Unisex' {
  if (!gender) return 'Unisex';
  const g = gender.toLowerCase().trim();
  if (g.includes('women') || g.includes('female') || g.includes('femme') || g.includes('mujer')) {
    return 'Mujer';
  }
  if (g.includes('men') || g.includes('male') || g.includes('homme') || g.includes('hombre')) {
    return 'Hombre';
  }
  return 'Unisex';
}

/**
 * Cleans the perfume name to remove redundant brand repetitions
 */
export function cleanPerfumeName(name: string, brand: string): string {
  if (!name) return '';
  let clean = name.trim();
  if (brand && brand.trim()) {
    const b = brand.trim();
    // If name ends with brand (e.g. "Aventus Creed" with brand "Creed" -> "Aventus")
    const brandRegexEnd = new RegExp(`\\s+${escapeRegex(b)}$`, 'i');
    if (brandRegexEnd.test(clean)) {
      clean = clean.replace(brandRegexEnd, '').trim();
    }
    // If name starts with brand followed by space (e.g. "Dior Sauvage" -> "Sauvage")
    const brandRegexStart = new RegExp(`^${escapeRegex(b)}\\s+`, 'i');
    if (brandRegexStart.test(clean)) {
      clean = clean.replace(brandRegexStart, '').trim();
    }
  }
  return clean || name.trim();
}

function escapeRegex(string: string) {
  return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
}

/**
 * Formats olfactory notes from top, middle and base arrays
 */
export function formatApiNotes(raw: PerfumeApiRawResult): string {
  const parts: string[] = [];

  if (raw.notes_top && raw.notes_top.length > 0) {
    parts.push(`Salida: ${raw.notes_top.join(', ')}`);
  }
  if (raw.notes_middle && raw.notes_middle.length > 0) {
    parts.push(`Corazón: ${raw.notes_middle.join(', ')}`);
  }
  if (raw.notes_base && raw.notes_base.length > 0) {
    parts.push(`Fondo: ${raw.notes_base.join(', ')}`);
  }

  if (parts.length > 0) {
    return parts.join(' | ');
  }

  return 'Notas olfativas exclusivas de alta fijación.';
}

/**
 * Generates an informative sensorial description from API metadata
 */
export function formatApiDescription(raw: PerfumeApiRawResult, cleanName: string): string {
  if (raw.description && raw.description.trim().length > 15) {
    return raw.description.trim();
  }

  const yearStr = raw.release_year ? `Lanzado en ${raw.release_year}. ` : '';
  const genderStr = raw.gender ? `Fragancia para ${raw.gender}. ` : '';
  return `${cleanName} de ${raw.brand}. ${yearStr}${genderStr}Composición olfativa selecta con excelente estela y duración.`;
}

/**
 * Searches perfumes exclusively using https://perfumapidatabase.onrender.com/perfumes/search/{query}
 * Uses server proxy first to bypass any CORS restrictions, with direct API fallback.
 */
export async function searchPerfumesApi(query: string): Promise<FormattedPerfumeApiData[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const encodedQuery = encodeURIComponent(trimmed);
  let rawData: PerfumeApiRawResult[] = [];

  // 1. Try server proxy endpoint first
  try {
    const proxyRes = await fetch(`/api/perfumes/search/${encodedQuery}`, {
      headers: { Accept: 'application/json' },
    });
    if (proxyRes.ok) {
      const json = await proxyRes.json();
      if (json && Array.isArray(json.data)) {
        rawData = json.data;
      } else if (Array.isArray(json)) {
        rawData = json;
      }
    }
  } catch (err) {
    console.warn('Proxy search failed, attempting direct fetch:', err);
  }

  // 2. Direct fetch fallback to https://perfumapidatabase.onrender.com/perfumes/search/{query}
  if (rawData.length === 0) {
    try {
      const directUrl = `https://perfumapidatabase.onrender.com/perfumes/search/${encodedQuery}`;
      const directRes = await fetch(directUrl, {
        headers: { Accept: 'application/json' },
      });
      if (directRes.ok) {
        const json = await directRes.json();
        if (Array.isArray(json)) {
          rawData = json;
        }
      }
    } catch (err) {
      console.error('Direct API search failed:', err);
    }
  }

  // Format and map results
  return rawData.map((item, index) => {
    const brand = item.brand?.trim() || 'Fragancia';
    const cleanName = cleanPerfumeName(item.name || '', brand);
    const releaseYear = item.release_year ? String(item.release_year) : '';
    const gender = mapApiGender(item.gender);
    const notes = formatApiNotes(item);
    const description = formatApiDescription(item, cleanName);
    const imageUrl = item.image_url?.trim() || '';

    return {
      id: item.id || `api-perfume-${index}-${Date.now()}`,
      name: item.name?.trim() || cleanName,
      cleanName,
      brand,
      releaseYear,
      gender,
      notes,
      notesTop: item.notes_top || [],
      notesMiddle: item.notes_middle || [],
      notesBase: item.notes_base || [],
      description,
      imageUrl,
      rating: item.rating,
      votes: item.votes,
      perfumeUrl: item.perfume_url,
    };
  });
}

import { PerfumeProduct } from '../types';

/**
 * Table of realistic retail market prices for original perfumes in Mexico (MXN)
 * Grounded in actual department store (Palacio de Hierro, Sephora, Liverpool) retail prices.
 */
const SPECIFIC_ORIGINAL_PRICES_MXN: Record<string, number> = {
  // Tom Ford Private Blend & Signature
  'cherry-smoke': 8900,
  'lost-cherry': 8900,
  'tobacco-vanille': 8500,
  'bitter-peach': 8900,
  'fucking-fabulous': 8900,
  'ebene-fume': 8500,
  'vanille-fatale': 8500,
  'neroli-portofino': 6500,
  'soleil-blanc': 6500,
  'oud-wood': 6800,
  'ombre-leather': 4400,
  'grey-vetiver': 4200,
  'noir-extreme': 4200,
  'costa-azzurra': 4200,
  'black-orchid': 4100,

  // Creed
  'aventus': 9800,
  'aventus-cologne': 9500,
  'aventus-for-her': 9200,
  'silver-mountain-water': 8900,
  'green-irish-tweed': 8900,
  'millesime-imperial': 8900,
  'virgin-island-water': 8900,
  'viking': 8900,
  'carmina': 9200,
  'wind-flowers': 8800,

  // Maison Francis Kurkdjian (MFK)
  'baccarat-rouge-540': 7900,
  'baccarat-rouge-540-extrait': 9800,
  'grand-soir': 6200,
  'gentle-fluidity-gold': 5900,
  'gentle-fluidity-silver': 5900,
  'oud-satin-mood': 7400,
  '724': 5900,
  'aqua-universalis': 5400,

  // Louis Vuitton
  'limmensite': 7200,
  'imagination': 7200,
  'afternoon-swim': 7200,
  'ombre-nomade': 9800,
  'pacific-chill': 7200,
  'meteore': 7200,
  'symphony': 12500,
  'rose-des-vents': 7200,
  'california-dream': 7200,
  'on-the-beach': 7200,

  // Parfums de Marly
  'layton': 7500,
  'layton-exclusif': 8200,
  'delina': 7800,
  'delina-exclusif': 8500,
  'herod': 7200,
  'carlisle': 7800,
  'percival': 7200,
  'haltane': 8200,
  'althair': 7800,
  'greenley': 7200,
  'oriana': 7800,
  'valaya': 7800,
  'sedley': 7200,
  'kalan': 7200,

  // Kilian
  'angels-share': 6200,
  'black-phantom': 6200,
  'love-dont-be-shy': 6200,
  'straight-to-heaven': 6200,
  'intoxicated': 6200,
  'vodka-on-the-rocks': 6200,
  'apple-brandy': 6200,

  // Xerjoff
  'erba-pura': 6800,
  'naxos': 6500,
  'alexandria-ii': 9500,
  'accento': 6500,
  'renaissance': 5800,
  'laylati': 6800,

  // Initio Parfums Prives
  'oud-for-greatness': 8500,
  'side-effect': 7800,
  'psychedelic-love': 7800,
  'atomic-rose': 7800,
  'musk-therapy': 7800,

  // Dior
  'sauvage-elixir': 4600,
  'sauvage-edp': 3800,
  'sauvage-edt': 3400,
  'sauvage-parfum': 4100,
  'dior-homme-intense': 3700,
  'fahrenheit': 3500,
  'jadore': 3900,
  'miss-dior': 3700,
  'pure-poison': 3600,
  'hypnotic-poison': 3500,
  'gris-dior': 6800,

  // Chanel
  'bleu-de-chanel': 3900,
  'bleu-de-chanel-parfum': 4400,
  'coco-mademoiselle': 3900,
  'chance-eau-tendre': 3800,
  'allure-homme-sport': 3700,
  'allure-homme-sport-eau-extreme': 3900,
  'chanel-no-5': 3900,
  'coco-noir': 4100,

  // Yves Saint Laurent
  'y-edp': 3600,
  'y-le-parfum': 3900,
  'libre': 3700,
  'libre-intense': 3900,
  'libre-le-parfum': 4100,
  'black-opium': 3600,
  'black-opium-le-parfum': 3900,
  'myslf': 3500,
  'la-nuit-de-lhomme': 3300,
  'mon-paris': 3500,
  'tuxedo': 6800,

  // Giorgio Armani
  'acqua-di-gio-parfum': 3800,
  'acqua-di-gio-profondo': 3600,
  'acqua-di-gio-edt': 3100,
  'armani-code': 3400,
  'armani-code-parfum': 3800,
  'stronger-with-you-intensely': 3400,
  'stronger-with-you-absolutely': 3600,
  'my-way': 3600,
  'si-passione': 3600,

  // Valentino
  'uomo-born-in-roma-green-stravaganza': 3600,
  'born-in-roma-uomo': 3500,
  'born-in-roma-uomo-intense': 3800,
  'born-in-roma-donna': 3600,
  'born-in-roma-coral-fantasy': 3600,
  'born-in-roma-yellow-dream': 3500,
  'voce-viva': 3400,

  // Jean Paul Gaultier
  'le-male-elixir': 3700,
  'le-male-le-parfum': 3400,
  'ultra-male': 3200,
  'le-beau-le-parfum': 3300,
  'le-beau-paradise-garden': 3500,
  'scandal-pour-homme': 3300,
  'scandal-pour-femme': 3400,
  'la-belle-le-parfum': 3500,

  // Carolina Herrera
  'good-girl': 3600,
  'good-girl-supreme': 3800,
  'very-good-girl': 3800,
  'bad-boy': 3400,
  'bad-boy-cobalt': 3600,
  'bad-boy-extreme': 3700,
  '212-vip-men': 3100,
  '212-vip-rose': 3200,
  'ch-men-prive': 3200,

  // Paco Rabanne
  '1-million-elixir': 3400,
  '1-million-royal': 3400,
  '1-million-parfum': 3300,
  '1-million-edt': 2900,
  'invictus-victory': 3200,
  'invictus-platinum': 3200,
  'phantom': 3200,
  'fame': 3300,
  'olympea': 3100,

  // Viktor & Rolf
  'spicebomb-extreme': 3600,
  'spicebomb-nightvision': 3400,
  'flowerbomb': 3700,

  // Prada
  'paradoxe': 3800,
  'paradoxe-intense': 4100,
  'luna-rossa-ocean': 3400,
  'luna-rossa-black': 3400,
  'luna-rossa-carbon': 3300,

  // Versace
  'eros-edp': 2900,
  'eros-flame': 2900,
  'eros-parfum': 3200,
  'dylan-blue': 2800,
  'bright-crystal': 2700,
  'crystal-noir': 2800,
  'versace-pour-homme': 2600,

  // Montale & Mancera
  'arabians-tonka': 3900,
  'cedrat-boise': 3600,
  'red-tobacco': 3800,
  'roses-vanille': 3600,
  'instant-crush': 3700,
  'intense-cafe': 3600,

  // Burberry
  'her-edp': 3400,
  'her-elixir': 3700,
  'goddess': 3600,
  'hero-edp': 3400,

  // Dolce & Gabbana
  'light-blue-eau-intense': 3100,
  'the-one-edp': 3100,
  'k-by-dolce-gabbana': 3000,
  'devotion': 3400,
};

/**
 * Brand-tier default price mapping if specific model is not listed in overrides
 */
const BRAND_TIER_BENCHMARKS_MXN: Record<string, number> = {
  // Ultra Niche / High Luxury ($7,000 - $12,000+)
  'creed': 9200,
  'louis vuitton': 7500,
  'clive christian': 11500,
  'roja parfums': 10500,
  'maison francis kurkdjian': 7400,
  'parfums de marly': 7600,
  'initio': 7900,
  'amouage': 8200,
  'xerjoff': 6800,
  'kilian': 6400,
  'byredo': 5900,
  'diptyque': 4800,
  'le labo': 6200,
  'tom ford': 6500,

  // Premium Designer ($3,400 - $4,800)
  'chanel': 3900,
  'dior': 3700,
  'christian dior': 3700,
  'hermes': 3600,
  'yves saint laurent': 3600,
  'ysl': 3600,
  'giorgio armani': 3500,
  'armani': 3500,
  'valentino': 3600,
  'prada': 3600,
  'givenchy': 3400,
  'narciso rodriguez': 3400,
  'viktor & rolf': 3500,
  'viktor&rolf': 3500,
  'jean paul gaultier': 3400,
  'mugler': 3400,
  'thierry mugler': 3400,
  'carolina herrera': 3500,
  'paco rabanne': 3200,
  'dolce & gabbana': 3100,
  'dolce&gabbana': 3100,
  'gucci': 3400,
  'burberry': 3300,
  'mancera': 3700,
  'montale': 3700,
  'nishane': 5600,

  // Accessible Designer ($2,400 - $3,200)
  'versace': 2800,
  'coach': 2600,
  'montblanc': 2500,
  'lacoste': 2400,
  'calvin klein': 2200,
  'ck': 2200,
  'hugo boss': 2700,
  'boss': 2700,
  'ralph lauren': 2800,
  'polo': 2800,
  'guess': 1900,
  'nautica': 1600,
  'ferragamo': 2600,
  'salvatore ferragamo': 2600,
  'halloween': 1800,
  'perry ellis': 1800,
  'ariana grande': 2400,
  'moschino': 2600,
  'diesel': 2400,
  'azzaro': 2900,
  'issey miyake': 2700,
  'kenzo': 2700,
  'juicy couture': 2400,

  // Middle Eastern Clones ($1,100 - $1,700)
  'lattafa': 1400,
  'armaf': 1500,
  'afnan': 1600,
  'al haramain': 1600,
  'orientica': 1800,
  'rasasi': 1700,
};

/**
 * Returns the estimated retail price of the authentic designer/niche perfume in MXN
 */
export function getEstimatedOriginalRetailPrice(product: PerfumeProduct): number {
  if (product.originalRetailPrice && product.originalRetailPrice > 0) {
    return product.originalRetailPrice;
  }

  // Check specific ID override
  const normalizedId = product.id.toLowerCase().trim();
  if (SPECIFIC_ORIGINAL_PRICES_MXN[normalizedId]) {
    return SPECIFIC_ORIGINAL_PRICES_MXN[normalizedId];
  }

  // Check name match against known keys
  for (const [key, price] of Object.entries(SPECIFIC_ORIGINAL_PRICES_MXN)) {
    if (normalizedId.includes(key) || key.includes(normalizedId)) {
      return price;
    }
  }

  // Check brand tier
  const normalizedBrand = (product.brand || '').toLowerCase().trim();
  for (const [brandKey, price] of Object.entries(BRAND_TIER_BENCHMARKS_MXN)) {
    if (normalizedBrand === brandKey || normalizedBrand.includes(brandKey)) {
      return price;
    }
  }

  // Default luxury perfume benchmark in MXN
  return 3400;
}

/**
 * Formats a currency value in Mexican Pesos (MXN)
 */
export function formatPriceMXN(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculates savings between original perfume and our inspired dupe
 */
export function calculateSavings(product: PerfumeProduct, ourPrice: number = 270): {
  originalPrice: number;
  originalPriceFormatted: string;
  ourPrice: number;
  ourPriceFormatted: string;
  savedAmount: number;
  savedAmountFormatted: string;
  savingsPercentage: number;
} {
  const originalPrice = getEstimatedOriginalRetailPrice(product);
  const effectiveOurPrice = ourPrice || product.price || 270;
  const savedAmount = Math.max(0, originalPrice - effectiveOurPrice);
  const savingsPercentage = Math.round((savedAmount / originalPrice) * 100);

  return {
    originalPrice,
    originalPriceFormatted: formatPriceMXN(originalPrice),
    ourPrice: effectiveOurPrice,
    ourPriceFormatted: formatPriceMXN(effectiveOurPrice),
    savedAmount,
    savedAmountFormatted: formatPriceMXN(savedAmount),
    savingsPercentage,
  };
}

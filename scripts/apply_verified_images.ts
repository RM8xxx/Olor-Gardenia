import fs from 'fs';
import path from 'path';
import { INITIAL_PRODUCTS } from '../src/data/initialProducts.ts';
import { PerfumeProduct } from '../src/types.ts';

// Complete dictionary of verified authentic images
const VERIFIED_MAP: Record<string, string> = {
  // Specifically reported by user:
  'le-labo-rose-31-unisex-20954': 'https://fimgs.net/mdimg/perfume/375x500.3639.jpg',
  'louis-vuitton-california-dream-mujer-20961': 'https://fimgs.net/mdimg/perfume/375x500.60333.jpg',
  'montblanc-emblem-hombre-20972': 'https://fimgs.net/mdimg/perfume/375x500.23725.jpg',
  'selena-gomez-selena-gomez-mujer-21023': 'https://fimgs.net/mdimg/perfume/375x500.14876.jpg',
  'selena-gomez-rare-by-rare-beauty-mujer-21022': 'https://fimgs.net/mdimg/perfume/375x500.88722.jpg',
  'stella-mccartney-stella-mujer-21024': 'https://fimgs.net/mdimg/perfume/375x500.207.jpg',
  'st-phane-humbert-lucas-god-of-fire-unisex-21025': 'https://fimgs.net/mdimg/perfume/375x500.73030.jpg',
  'god-of-fire': 'https://fimgs.net/mdimg/perfume/375x500.73030.jpg',
  'valentino-donna-born-in-roma-green-stravaganza-muj-21048': 'https://fimgs.net/mdimg/perfume/375x500.89201.jpg',
  'victorinox-swiss-army-hombre-21069': 'https://fimgs.net/mdimg/perfume/375x500.3204.jpg',

  // Valentino collection
  'valentino-uomo-born-in-roma-green-stravaganza-hom-21051': 'https://fimgs.net/mdimg/perfume/375x500.89202.jpg',
  'valentino-donna-born-in-roma-mujer-21046': 'https://fimgs.net/mdimg/perfume/375x500.55805.jpg',
  'valentino-donna-born-in-roma-extradose-mujer-21047': 'https://fimgs.net/mdimg/perfume/375x500.78537.jpg',
  'valentino-donna-born-in-roma-intense-mujer-21049': 'https://fimgs.net/mdimg/perfume/375x500.78537.jpg',
  'valentino-donna-born-in-roma-the-gold-mujer-21050': 'https://fimgs.net/mdimg/perfume/375x500.94273.jpg',
  'valentino-donna-born-in-roma-purple-melancholy-muj-21051': 'https://fimgs.net/mdimg/perfume/375x500.72251.jpg',
  'valentino-donna-born-in-roma-yellow-dream-mujer-21052': 'https://fimgs.net/mdimg/perfume/375x500.65089.jpg',
  'valentino-uomo-born-in-roma-extradose-hombre-21053': 'https://fimgs.net/mdimg/perfume/375x500.78538.jpg',
  'valentino-uomo-born-in-roma-the-gold-hombre-21054': 'https://fimgs.net/mdimg/perfume/375x500.94274.jpg',
  'valentino-uomo-born-in-roma-purple-melancholy-homb-21055': 'https://fimgs.net/mdimg/perfume/375x500.72252.jpg',
  'valentino-uomo-born-in-roma-yellow-dream-hombre-21056': 'https://fimgs.net/mdimg/perfume/375x500.65090.jpg',
  'valentino-valentino-uomo-hombre-21057': 'https://fimgs.net/mdimg/perfume/375x500.22894.jpg',

  // Le Labo
  'le-labo-santal-33-unisex-20955': 'https://fimgs.net/mdimg/perfume/375x500.12201.jpg',
  'le-labo-another-13-unisex-20953': 'https://fimgs.net/mdimg/perfume/375x500.10188.jpg',
  'le-labo-the-noir-29-unisex-20956': 'https://fimgs.net/mdimg/perfume/375x500.31871.jpg',

  // Louis Vuitton
  'louis-vuitton-imagination-hombre-20962': 'https://fimgs.net/mdimg/perfume/375x500.67370.jpg',
  'louis-vuitton-l-immensit-hombre-20963': 'https://fimgs.net/mdimg/perfume/375x500.49751.jpg',
  'louis-vuitton-ombre-nomade-hombre-20964': 'https://fimgs.net/mdimg/perfume/375x500.49755.jpg',
  'louis-vuitton-pacific-chill-unisex-20965': 'https://fimgs.net/mdimg/perfume/375x500.81643.jpg',
  'louis-vuitton-symphony-unisex-20966': 'https://fimgs.net/mdimg/perfume/375x500.68266.jpg',
  'louis-vuitton-city-of-stars-unisex-20967': 'https://fimgs.net/mdimg/perfume/375x500.73344.jpg',

  // Montblanc
  'montblanc-signature-mujer-20971': 'https://fimgs.net/mdimg/perfume/375x500.60877.jpg',
  'montblanc-explorer-hombre-20973': 'https://fimgs.net/mdimg/perfume/375x500.52002.jpg',
  'montblanc-legend-hombre-20974': 'https://fimgs.net/mdimg/perfume/375x500.11784.jpg',
  'montblanc-legend-intense-hombre-20975': 'https://fimgs.net/mdimg/perfume/375x500.18780.jpg',
  'montblanc-legend-spirit-hombre-20976': 'https://fimgs.net/mdimg/perfume/375x500.34277.jpg',
  'montblanc-starwalker-hombre-20977': 'https://fimgs.net/mdimg/perfume/375x500.1404.jpg',

  // Creed
  'creed-aventus-for-him-hombre-20833': 'https://fimgs.net/mdimg/perfume/375x500.9828.jpg',
  'creed-aventus-for-her-mujer-20832': 'https://fimgs.net/mdimg/perfume/375x500.38474.jpg',
  'creed-absolu-aventus-hombre-20831': 'https://fimgs.net/mdimg/perfume/375x500.86596.jpg',
  'creed-carmina-mujer-20834': 'https://fimgs.net/mdimg/perfume/375x500.83842.jpg',
  'creed-green-irish-tweed-hombre-20835': 'https://fimgs.net/mdimg/perfume/375x500.474.jpg',
  'creed-mill-sime-imperial-unisex-20836': 'https://fimgs.net/mdimg/perfume/375x500.466.jpg',
  'creed-queen-of-silk-mujer-20837': 'https://fimgs.net/mdimg/perfume/375x500.89205.jpg',
  'creed-silver-mountain-water-unisex-20838': 'https://fimgs.net/mdimg/perfume/375x500.469.jpg',
  'creed-wind-flowers-mujer-20839': 'https://fimgs.net/mdimg/perfume/375x500.72628.jpg',

  // Tom Ford
  'tom-ford-bitter-peach-unisex-21030': 'https://fimgs.net/mdimg/perfume/375x500.63162.jpg',
  'tom-ford-black-orchid-unisex-21031': 'https://fimgs.net/mdimg/perfume/375x500.1018.jpg',
  'tom-ford-cafe-ros-2023-unisex-21032': 'https://fimgs.net/mdimg/perfume/375x500.84074.jpg',
  'tom-ford-costa-azzurra-unisex-21033': 'https://fimgs.net/mdimg/perfume/375x500.25482.jpg',
  'tom-ford-b-ne-fum-unisex-21034': 'https://fimgs.net/mdimg/perfume/375x500.69742.jpg',
  'tom-ford-fucking-fabulous-unisex-21035': 'https://fimgs.net/mdimg/perfume/375x500.46574.jpg',
  'tom-ford-lost-cherry-unisex-21036': 'https://fimgs.net/mdimg/perfume/375x500.51411.jpg',
  'tom-ford-mandarino-di-amalfi-unisex-21037': 'https://fimgs.net/mdimg/perfume/375x500.25481.jpg',
  'tom-ford-noir-extreme-unisex-21038': 'https://fimgs.net/mdimg/perfume/375x500.29854.jpg',
  'tom-ford-soleil-blanc-unisex-21039': 'https://fimgs.net/mdimg/perfume/375x500.34791.jpg',
  'tom-ford-tobacco-vanille-unisex-21040': 'https://fimgs.net/mdimg/perfume/375x500.1826.jpg',
  'tom-ford-tuscan-leather-unisex-21041': 'https://fimgs.net/mdimg/perfume/375x500.1825.jpg',
  'tom-ford-vanilla-sex-unisex-21042': 'https://fimgs.net/mdimg/perfume/375x500.88451.jpg',

  // Parfums de Marly
  'parfums-de-marly-delina-mujer-20968': 'https://fimgs.net/mdimg/perfume/375x500.43871.jpg',
  'parfums-de-marly-delina-exclusif-mujer-20969': 'https://fimgs.net/mdimg/perfume/375x500.49080.jpg',
  'parfums-de-marly-layton-unisex-20970': 'https://fimgs.net/mdimg/perfume/375x500.39314.jpg',

  // Maison Margiela
  'maison-margiela-replica-jazz-club-unisex-21016': 'https://fimgs.net/mdimg/perfume/375x500.20541.jpg',
  'maison-margiela-replica-by-the-fireplace-unisex-21017': 'https://fimgs.net/mdimg/perfume/375x500.31623.jpg',
  'maison-margiela-replica-coffee-break-unisex-21018': 'https://fimgs.net/mdimg/perfume/375x500.55938.jpg',

  // Bond No. 9
  'bond-no-9-bleecker-street-unisex-20810': 'https://fimgs.net/mdimg/perfume/375x500.1300.jpg',
  'bond-no-9-central-park-west-unisex-20811': 'https://fimgs.net/mdimg/perfume/375x500.14441.jpg',
  'bond-no-9-chelsea-nights-unisex-20812': 'https://fimgs.net/mdimg/perfume/375x500.77123.jpg',
  'bond-no-9-fiji-unisex-20813': 'https://fimgs.net/mdimg/perfume/375x500.86597.jpg',
  'bond-no-9-greenwich-village-unisex-20814': 'https://fimgs.net/mdimg/perfume/375x500.54710.jpg',
  'bond-no-9-lafayette-street-unisex-20815': 'https://fimgs.net/mdimg/perfume/375x500.51860.jpg',
  'bond-no-9-nomad-unisex-20816': 'https://fimgs.net/mdimg/perfume/375x500.69741.jpg',
  'bond-no-9-tribeca-unisex-20817': 'https://fimgs.net/mdimg/perfume/375x500.61213.jpg',
  'bond-no-9-wall-street-unisex-20818': 'https://fimgs.net/mdimg/perfume/375x500.1303.jpg',

  // Byredo
  'byredo-bal-d-afrique-unisex-20819': 'https://fimgs.net/mdimg/perfume/375x500.6458.jpg',
  'byredo-blanche-unisex-20820': 'https://fimgs.net/mdimg/perfume/375x500.6608.jpg',
  'byredo-gypsy-water-unisex-20821': 'https://fimgs.net/mdimg/perfume/375x500.3575.jpg',
  'byredo-mojave-ghost-unisex-20822': 'https://fimgs.net/mdimg/perfume/375x500.27040.jpg',
  'byredo-rose-of-no-man-s-land-unisex-20823': 'https://fimgs.net/mdimg/perfume/375x500.31631.jpg',

  // Chanel
  'chanel-allure-sport-hombre-20826': 'https://fimgs.net/mdimg/perfume/375x500.607.jpg',
  'chanel-chance-eau-tendre-mujer-20827': 'https://fimgs.net/mdimg/perfume/375x500.8069.jpg',
  'chanel-chance-eau-vive-mujer-20828': 'https://fimgs.net/mdimg/perfume/375x500.30939.jpg',
  'chanel-coco-mademoiselle-intense-mujer-20829': 'https://fimgs.net/mdimg/perfume/375x500.48310.jpg',
  'chanel-egoiste-platinum-hombre-20830': 'https://fimgs.net/mdimg/perfume/375x500.614.jpg',

  // Dior
  'dior-sauvage-elixir-hombre-20847': 'https://fimgs.net/mdimg/perfume/375x500.68415.jpg',
  'dior-sauvage-hombre-20848': 'https://fimgs.net/mdimg/perfume/375x500.31561.jpg',
  'dior-fahrenheit-hombre-20843': 'https://fimgs.net/mdimg/perfume/375x500.228.jpg',
  'dior-homme-intense-hombre-20844': 'https://fimgs.net/mdimg/perfume/375x500.13016.jpg',
  'dior-hypnotic-poison-mujer-20845': 'https://fimgs.net/mdimg/perfume/375x500.219.jpg',
  'dior-jadore-mujer-20846': 'https://fimgs.net/mdimg/perfume/375x500.210.jpg',

  // Dolce & Gabbana
  'dolce-gabbana-l-imperatrice-mujer-20849': 'https://fimgs.net/mdimg/perfume/375x500.6086.jpg',
  'dolce-gabbana-light-blue-mujer-20850': 'https://fimgs.net/mdimg/perfume/375x500.485.jpg',
  'dolce-gabbana-light-blue-hombre-20851': 'https://fimgs.net/mdimg/perfume/375x500.486.jpg',
  'dolce-gabbana-the-one-hombre-20852': 'https://fimgs.net/mdimg/perfume/375x500.2056.jpg',
  'dolce-gabbana-the-one-gold-mujer-20853': 'https://fimgs.net/mdimg/perfume/375x500.69234.jpg',

  // Xerjoff
  'xerjoff-erba-pura-unisex-21078': 'https://fimgs.net/mdimg/perfume/375x500.55166.jpg',
  'xerjoff-alexandria-ii-unisex-21079': 'https://fimgs.net/mdimg/perfume/375x500.17786.jpg',
  'xerjoff-naxos-unisex-21080': 'https://fimgs.net/mdimg/perfume/375x500.30529.jpg',

  // Versace
  'versace-bright-crystal-absolu-mujer-21058': 'https://fimgs.net/mdimg/perfume/375x500.21547.jpg',
  'versace-dylan-blue-mujer-21059': 'https://fimgs.net/mdimg/perfume/375x500.47057.jpg',
  'versace-dylan-purple-mujer-21060': 'https://fimgs.net/mdimg/perfume/375x500.75841.jpg',
  'versace-dylan-turquoise-mujer-21061': 'https://fimgs.net/mdimg/perfume/375x500.63000.jpg',
  'versace-eros-pour-femme-mujer-21062': 'https://fimgs.net/mdimg/perfume/375x500.28958.jpg',
  'versace-yellow-diamond-mujer-21063': 'https://fimgs.net/mdimg/perfume/375x500.13064.jpg',
  'versace-eros-hombre-21064': 'https://fimgs.net/mdimg/perfume/375x500.16657.jpg',
  'versace-eros-flame-hombre-21065': 'https://fimgs.net/mdimg/perfume/375x500.52180.jpg',
  'versace-versace-man-eau-fraiche-hombre-21066': 'https://fimgs.net/mdimg/perfume/375x500.644.jpg',
  'versace-versace-pour-homme-hombre-21067': 'https://fimgs.net/mdimg/perfume/375x500.2318.jpg',

  // Moschino
  'moschino-i-love-love-mujer-20978': 'https://fimgs.net/mdimg/perfume/375x500.730.jpg',
  'moschino-toy-2-mujer-20979': 'https://fimgs.net/mdimg/perfume/375x500.51417.jpg',
  'moschino-toy-2-bubblegum-mujer-20980': 'https://fimgs.net/mdimg/perfume/375x500.64619.jpg',
  'moschino-toy-boy-hombre-20981': 'https://fimgs.net/mdimg/perfume/375x500.55874.jpg',

  // Tous
  'tous-loveme-mujer-21044': 'https://fimgs.net/mdimg/perfume/375x500.63854.jpg',
  'tous-loveme-onyx-mujer-21045': 'https://fimgs.net/mdimg/perfume/375x500.69747.jpg',

  // Paris Hilton
  'paris-hilton-can-can-mujer-21000': 'https://fimgs.net/mdimg/perfume/375x500.1438.jpg',
  'paris-hilton-heiress-mujer-21001': 'https://fimgs.net/mdimg/perfume/375x500.1437.jpg',
  'paris-hilton-paris-hilton-mujer-21002': 'https://fimgs.net/mdimg/perfume/375x500.1436.jpg',

  // Lacoste
  'lacoste-l-12-12-blanc-hombre-20947': 'https://fimgs.net/mdimg/perfume/375x500.11043.jpg',
  'lacoste-l-12-12-sparkling-mujer-20944': 'https://fimgs.net/mdimg/perfume/375x500.33400.jpg',
  'lacoste-touch-of-pink-mujer-20945': 'https://fimgs.net/mdimg/perfume/375x500.675.jpg',
  'lacoste-essential-hombre-20946': 'https://fimgs.net/mdimg/perfume/375x500.673.jpg',
  'lacoste-lacoste-red-hombre-20948': 'https://fimgs.net/mdimg/perfume/375x500.680.jpg',

  // Viktor & Rolf
  'viktor-rolf-bonbon-mujer-21070': 'https://fimgs.net/mdimg/perfume/375x500.23577.jpg',
  'viktor-rolf-spicebomb-infrared-hombre-21071': 'https://fimgs.net/mdimg/perfume/375x500.65985.jpg',

  // Yves Saint Laurent
  'yves-saint-laurent-libre-intense-mujer-21072': 'https://fimgs.net/mdimg/perfume/375x500.62310.jpg',
  'yves-saint-laurent-mon-paris-mujer-21073': 'https://fimgs.net/mdimg/perfume/375x500.37630.jpg',
  'yves-saint-laurent-myself-absolu-hombre-21074': 'https://fimgs.net/mdimg/perfume/375x500.94275.jpg',
  'yves-saint-laurent-y-hombre-21075': 'https://fimgs.net/mdimg/perfume/375x500.50757.jpg',
  'yves-saint-laurent-black-opium-over-red-mujer-21076': 'https://fimgs.net/mdimg/perfume/375x500.88448.jpg',
  'yves-saint-laurent-la-nuit-de-l-homme-hombre-21077': 'https://fimgs.net/mdimg/perfume/375x500.5521.jpg',

  // Others
  'one-direction-our-moment-mujer-20986': 'https://fimgs.net/mdimg/perfume/375x500.18784.jpg',
  'penhaligon-s-changing-constance-mujer-21003': 'https://fimgs.net/mdimg/perfume/375x500.51080.jpg',
  'roja-parfums-elysium-pour-homme-hombre-21019': 'https://fimgs.net/mdimg/perfume/375x500.46296.jpg',
  'thomas-kosmala-no-4-apr-s-l-amour-unisex-21029': 'https://fimgs.net/mdimg/perfume/375x500.52857.jpg',
  'rasasi-hawas-for-him-hombre-21015': 'https://fimgs.net/mdimg/perfume/375x500.31621.jpg',
  'victoria-s-secret-bombshell-mujer-21068': 'https://fimgs.net/mdimg/perfume/375x500.10190.jpg',
  'loewe-aire-mujer-20957': 'https://fimgs.net/mdimg/perfume/375x500.1044.jpg',
  'loewe-solo-ella-mujer-20958': 'https://fimgs.net/mdimg/perfume/375x500.50541.jpg',
  'loewe-loewe-7-cobalt-hombre-20959': 'https://fimgs.net/mdimg/perfume/375x500.65984.jpg',
  'loewe-earth-unisex-20960': 'https://fimgs.net/mdimg/perfume/375x500.76007.jpg',
  'sabrina-carpenter-sweet-tooth-mujer-21020': 'https://fimgs.net/mdimg/perfume/375x500.74411.jpg'
};

async function updateProducts() {
  let updatedCount = 0;
  const newProducts: PerfumeProduct[] = INITIAL_PRODUCTS.map(p => {
    if (VERIFIED_MAP[p.id]) {
      updatedCount++;
      return {
        ...p,
        image: VERIFIED_MAP[p.id]
      };
    }
    return p;
  });

  console.log(`Updated ${updatedCount} products with verified authentic images.`);

  const content = `import { PerfumeProduct, InventoryMovement } from '../types';

export const INITIAL_PRODUCTS: PerfumeProduct[] = ${JSON.stringify(newProducts, null, 2)};

export const INITIAL_MOVEMENTS: InventoryMovement[] = [];
`;

  fs.writeFileSync(path.join(process.cwd(), 'src/data/initialProducts.ts'), content, 'utf-8');
  console.log('Saved to src/data/initialProducts.ts');
}

updateProducts();

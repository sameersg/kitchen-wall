// Automatic food image finder & client-side image resizer/uploader
// Provides rich multi-image candidate collections with instant rotation

export interface CulinaryCollection {
  keywords: string[];
  urls: string[];
}

export const CULINARY_COLLECTIONS: CulinaryCollection[] = [
  {
    keywords: ['pasta', 'spaghetti', 'nudel', 'nudeln', 'noodles', 'carbonara', 'bolognese', 'lasagne', 'lasagna', 'penne', 'tagliatelle', 'pesto', 'ravioli', 'gnocchi', 'tortellini', 'maccheroni', 'fusilli', 'linguine'],
    urls: [
      'https://images.unsplash.com/photo-1621996346565-e3d5d62811b4?auto=format&fit=crop&w=900&q=80', // Bolognese pasta
      'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=900&q=80', // Pesto / Tagliatelle
      'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=900&q=80', // Tomato basil penne
      'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=900&q=80', // Fettuccine Alfredo
      'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=900&q=80', // Lasagne
      'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=900&q=80'  // Creamy carbonara
    ]
  },
  {
    keywords: ['pizza', 'calzone', 'margherita', 'flammkuchen'],
    urls: [
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80', // Wood-fired pizza
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=80', // Margherita fresh basil
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80', // Pepperoni slice
      'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=900&q=80', // Rustic Italian pizza
      'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=900&q=80'  // Crispy thin crust
    ]
  },
  {
    keywords: ['curry', 'indisch', 'indian', 'thai', 'tikka', 'masala', 'dal', 'daal', 'dhal', 'korma', 'butter chicken', 'paneer', 'vindaloo', 'biryani'],
    urls: [
      'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=900&q=80', // Vibrant Thai red curry
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80', // Chicken tikka masala
      'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=900&q=80', // Indian dal with rice
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=900&q=80', // Green curry with coconut
      'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=900&q=80'  // Creamy paneer butter curry
    ]
  },
  {
    keywords: ['bowl', 'quinoa', 'buddha', 'poke', 'salat', 'salad', 'caesar', 'coleslaw', 'tabouleh'],
    urls: [
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80', // Colorful Buddha bowl
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80', // Fresh garden salad
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80', // Quinoa avocado bowl
      'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=900&q=80', // Mediterranean bowl
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=900&q=80'  // Crispy salad plate
    ]
  },
  {
    keywords: ['lachs', 'fisch', 'fish', 'forelle', 'trout', 'meeresfrüchte', 'seafood', 'garnelen', 'shrimp', 'prawns', 'dorade', 'kabeljau', 'cod', 'zander', 'salmon', 'thunfisch', 'tuna'],
    urls: [
      'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=900&q=80', // Grilled salmon fillet
      'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=900&q=80', // Salmon with lemon herbs
      'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=900&q=80', // Pan-seared white fish
      'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=900&q=80', // Garlic herb prawns
      'https://images.unsplash.com/photo-1535400255456-984241443b29?auto=format&fit=crop&w=900&q=80'  // Grilled Mediterranean fish
    ]
  },
  {
    keywords: ['burger', 'cheeseburger', 'pommes', 'fries', 'hamburger'],
    urls: [
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80', // Gourmet cheeseburger
      'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80', // Classic juicy burger
      'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=900&q=80', // Brioche bun burger
      'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=900&q=80', // Double bacon cheese
      'https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=900&q=80'  // Burger with crispy fries
    ]
  },
  {
    keywords: ['taco', 'tacos', 'burrito', 'fajita', 'fajitas', 'mexican', 'mexikanisch', 'quesadilla', 'chili con carne', 'enchilada', 'enchiladas', 'nachos'],
    urls: [
      'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=900&q=80', // Street tacos
      'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=900&q=80', // Crispy corn tacos
      'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=900&q=80', // Stuffed burrito
      'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?auto=format&fit=crop&w=900&q=80', // Cheesy quesadilla
      'https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?auto=format&fit=crop&w=900&q=80'  // Mexican fiesta platter
    ]
  },
  {
    keywords: ['pancake', 'pancakes', 'pfannkuchen', 'eierkuchen', 'waffel', 'waffeln', 'waffles', 'crepe', 'crêpes', 'porridge', 'oatmeal', 'haferbrei', 'granola', 'müsli', 'french toast', 'arme ritter'],
    urls: [
      'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=900&q=80', // Fluffy berry pancakes
      'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=900&q=80', // Golden stack with maple syrup
      'https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=900&q=80', // Belgian waffles
      'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=900&q=80', // Berry porridge bowl
      'https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=900&q=80'  // French toast with berries
    ]
  },
  {
    keywords: ['suppe', 'soup', 'eintopf', 'stew', 'gulasch', 'goulash', 'ramen', 'pho', 'brühe', 'broth', 'minestrone'],
    urls: [
      'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=900&q=80', // Hearty warm soup
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=80', // Japanese ramen bowl
      'https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?auto=format&fit=crop&w=900&q=80', // Creamy pumpkin/tomato soup
      'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=900&q=80', // Steaming noodle soup
      'https://images.unsplash.com/photo-1578020190125-f4f7c18bc9cb?auto=format&fit=crop&w=900&q=80'  // Vegetable herb broth
    ]
  },
  {
    keywords: ['sushi', 'maki', 'sashimi', 'nigiri', 'dumpling', 'dumplings', 'gyoza', 'wok', 'stir fry', 'bratnudeln', 'pad thai'],
    urls: [
      'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=900&q=80', // Sushi set platter
      'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=900&q=80', // Fresh salmon maki
      'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=900&q=80', // Rainbow roll
      'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=900&q=80', // Steamed gyoza dumplings
      'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80'  // Stir-fried asian noodles
    ]
  },
  {
    keywords: ['schnitzel', 'steak', 'braten', 'roast', 'roulade', 'rouladen', 'hähnchen', 'huhn', 'chicken', 'entrecote', 'cordon bleu', 'grillhähnchen', 'bbq'],
    urls: [
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80', // Crisp golden schnitzel
      'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=900&q=80', // Prime beef steak
      'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=80', // Roast chicken
      'https://images.unsplash.com/photo-1588347818036-558601350bc4?auto=format&fit=crop&w=900&q=80', // Grilled meat plate
      'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=900&q=80'  // BBQ steaks
    ]
  },
  {
    keywords: ['risotto', 'pilze', 'steinpilz', 'steinpilze', 'champignons', 'mushroom', 'mushrooms', 'trüffel', 'truffle'],
    urls: [
      'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=900&q=80', // Creamy parmesan risotto
      'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?auto=format&fit=crop&w=900&q=80', // Wild mushroom risotto
      'https://images.unsplash.com/photo-1539136788836-5699e78bfc75?auto=format&fit=crop&w=900&q=80', // Sautéed mushrooms & rice
      'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=900&q=80'  // Gourmet truffle risotto
    ]
  },
  {
    keywords: ['rührei', 'spiegelei', 'omelett', 'omelette', 'shakshuka', 'eggs', 'egg', 'eier', 'benedict'],
    urls: [
      'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=80', // Eggs benedict
      'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=900&q=80', // Shakshuka skillet
      'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=900&q=80', // Fluffy scrambled eggs
      'https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=900&q=80'  // Sunny side up breakfast
    ]
  },
  {
    keywords: ['brot', 'bread', 'sandwich', 'toast', 'bagel', 'stulle', 'panini', 'avocadotoast', 'avocado toast', 'grilled cheese'],
    urls: [
      'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=900&q=80', // Artisan crusty sourdough
      'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=80', // Melted grilled cheese
      'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80', // Toasted panini
      'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?auto=format&fit=crop&w=900&q=80', // Loaded avocado toast
      'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=80'
    ]
  },
  {
    keywords: ['kuchen', 'cake', 'torte', 'muffin', 'muffins', 'dessert', 'nachtisch', 'brownie', 'brownies', 'tiramisu', 'tarte', 'pie', 'cheesecake', 'käsekuchen'],
    urls: [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80', // Chocolate fudge cake
      'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=900&q=80', // Berry tart
      'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=900&q=80', // Tiramisu
      'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=80', // Warm chocolate brownies
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80'  // Apple pie / Tart
    ]
  }
];

export const GENERAL_CULINARY_POOL: string[] = [
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=900&q=80'
];

// ---------------------------------------------------------------------------
// Text helpers
// ---------------------------------------------------------------------------

/** Lowercase, fold umlauts/accents and strip punctuation so spellings compare reliably. */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

// Filler words that say nothing about what the dish looks like
const STOPWORDS = new Set([
  'mit', 'und', 'oder', 'an', 'auf', 'in', 'im', 'vom', 'von', 'zum', 'zur', 'der', 'die', 'das', 'dem', 'den',
  'ein', 'eine', 'nach', 'art', 'with', 'and', 'or', 'the', 'of', 'on', 'a', 'al', 'alla', 'la', 'le', 'de', 'di',
  'style', 'hausgemacht', 'homemade', 'frisch', 'fresh', 'lecker', 'schnell', 'einfach', 'easy'
]);

// Common misspellings of dish names (normalized form -> correct form)
const SPELLING_FIXES: Record<string, string> = {
  ceaser: 'caesar', cesar: 'caesar', ceasar: 'caesar', caeser: 'caesar', cesars: 'caesar', caesars: 'caesar',
  spagetti: 'spaghetti', spaghettis: 'spaghetti', spagettis: 'spaghetti',
  bolognaise: 'bolognese', bolognesse: 'bolognese', bolognes: 'bolognese',
  carbonarra: 'carbonara', lasange: 'lasagne', lazagne: 'lasagne', lasagna: 'lasagne',
  risoto: 'risotto', gnochi: 'gnocchi', tortelini: 'tortellini', tiramissu: 'tiramisu',
  quesedilla: 'quesadilla', quesadila: 'quesadilla', burito: 'burrito', enchillada: 'enchilada',
  schnitzl: 'schnitzel', gulash: 'gulasch', brokoli: 'brokkoli', zuccini: 'zucchini', zuchini: 'zucchini',
  guacamolee: 'guacamole', shakshouka: 'shakshuka', chakchouka: 'shakshuka', humus: 'hummus',
  pancackes: 'pancakes', pankakes: 'pancakes', omlett: 'omelett', omelet: 'omelette'
};

// German -> English words (normalized keys) so English sources (TheMealDB, Commons) understand the dish
const GERMAN_TO_ENGLISH: Record<string, string> = {
  nudel: 'pasta', nudeln: 'pasta', teigwaren: 'pasta',
  lachs: 'salmon', fisch: 'fish', forelle: 'trout', thunfisch: 'tuna', kabeljau: 'cod', garnelen: 'shrimp',
  meeresfruechte: 'seafood', muscheln: 'mussels',
  haehnchen: 'chicken', huhn: 'chicken', haehnchenbrust: 'chicken breast', pute: 'turkey', ente: 'duck',
  rind: 'beef', rindfleisch: 'beef', rinderbraten: 'roast beef', schwein: 'pork', schweinefleisch: 'pork',
  hackfleisch: 'minced meat', lamm: 'lamb', wurst: 'sausage', wuerstchen: 'sausages', speck: 'bacon',
  suppe: 'soup', eintopf: 'stew', bruehe: 'broth', gulasch: 'goulash',
  salat: 'salad', gemuese: 'vegetables', kartoffel: 'potato', kartoffeln: 'potatoes', kartoffelsalat: 'potato salad',
  bratkartoffeln: 'fried potatoes', pommes: 'fries', reis: 'rice', gebratener: 'fried', gebratene: 'fried',
  gebraten: 'fried', gegrillt: 'grilled', gegrillter: 'grilled', ueberbacken: 'gratin', auflauf: 'casserole',
  kuerbis: 'pumpkin', tomate: 'tomato', tomaten: 'tomato', spinat: 'spinach', pilze: 'mushrooms',
  champignons: 'mushrooms', paprika: 'bell pepper', zwiebel: 'onion', zwiebeln: 'onions', knoblauch: 'garlic',
  kaese: 'cheese', ei: 'egg', eier: 'eggs', ruehrei: 'scrambled eggs', spiegelei: 'fried egg',
  omelett: 'omelette', brot: 'bread', broetchen: 'bread rolls', kuchen: 'cake', torte: 'cake',
  kaesekuchen: 'cheesecake', apfelkuchen: 'apple pie', schokolade: 'chocolate', pfannkuchen: 'pancakes',
  eierkuchen: 'pancakes', waffeln: 'waffles', fruehstueck: 'breakfast', kichererbsen: 'chickpeas',
  linsen: 'lentils', bohnen: 'beans', erbsen: 'peas', blumenkohl: 'cauliflower', brokkoli: 'broccoli',
  kohl: 'cabbage', rotkohl: 'red cabbage', sauerkraut: 'sauerkraut', knoedel: 'dumplings', kloesse: 'dumplings',
  spaetzle: 'spaetzle', kaesespaetzle: 'cheese spaetzle', maultaschen: 'maultaschen', frikadellen: 'meatballs',
  buletten: 'meatballs', fleischbaellchen: 'meatballs', hackbraten: 'meatloaf', braten: 'roast',
  bratnudeln: 'fried noodles', gebratenereis: 'fried rice', scharf: 'spicy', suess: 'sweet'
};

function toTokens(text: string): string[] {
  return normalizeText(text).split(' ').filter(Boolean);
}

/** Damerau-Levenshtein distance (optimal string alignment), enough for short dish words. */
function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > 2) return 3;
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[a.length][b.length];
}

/** Allowed typos for a word of this length */
function typoTolerance(word: string): number {
  if (word.length >= 8) return 2;
  if (word.length >= 5) return 1;
  return 0;
}

// Every word the finder knows, used to auto-correct small typos ("spagheti", "risottto")
let knownVocabulary: string[] | null = null;
function getVocabulary(): string[] {
  if (!knownVocabulary) {
    const words = new Set<string>();
    for (const collection of CULINARY_COLLECTIONS) {
      for (const k of collection.keywords) toTokens(k).forEach((t) => words.add(t));
    }
    Object.keys(GERMAN_TO_ENGLISH).forEach((w) => words.add(w));
    Object.values(GERMAN_TO_ENGLISH).forEach((w) => toTokens(w).forEach((t) => words.add(t)));
    Object.values(SPELLING_FIXES).forEach((w) => words.add(w));
    knownVocabulary = Array.from(words).filter((w) => w.length >= 4);
  }
  return knownVocabulary;
}

function correctToken(token: string): string {
  if (SPELLING_FIXES[token]) return SPELLING_FIXES[token];
  const tolerance = typoTolerance(token);
  if (tolerance === 0) return token;
  const vocabulary = getVocabulary();
  if (vocabulary.includes(token)) return token;
  let best = token;
  let bestDistance = tolerance + 1;
  for (const word of vocabulary) {
    const distance = editDistance(token, word);
    if (distance < bestDistance) {
      best = word;
      bestDistance = distance;
    }
  }
  return best;
}

/** Translate one German token, including compounds whose last part is known ("kuerbissuppe" -> "pumpkin soup"). */
function translateToken(token: string): string {
  if (GERMAN_TO_ENGLISH[token]) return GERMAN_TO_ENGLISH[token];
  for (let split = 3; split <= token.length - 4; split++) {
    const head = token.slice(split);
    if (GERMAN_TO_ENGLISH[head]) {
      const modifier = GERMAN_TO_ENGLISH[token.slice(0, split)];
      return modifier ? `${modifier} ${GERMAN_TO_ENGLISH[head]}` : GERMAN_TO_ENGLISH[head];
    }
  }
  return token;
}

export interface DishQuery {
  /** Corrected dish name in its original language, e.g. "caesar salad" */
  original: string;
  /** English version for English-language sources */
  english: string;
  /** Meaningful words from both versions, used to judge whether a result fits */
  keywords: string[];
}

export function parseDishQuery(dishName: string): DishQuery {
  const corrected = toTokens(dishName)
    .filter((t) => !STOPWORDS.has(t))
    .map(correctToken);
  const englishTokens = corrected.flatMap((t) => toTokens(translateToken(t)));
  const keywords = Array.from(new Set([...corrected, ...englishTokens])).filter((t) => t.length >= 3);
  return {
    original: corrected.join(' '),
    english: englishTokens.join(' '),
    keywords
  };
}

/** Does a result word stand for the query word? Exact, compound part (>=4 chars) or a small typo. */
function wordsMatch(queryWord: string, titleWord: string): boolean {
  if (queryWord === titleWord) return true;
  if (queryWord.length >= 4 && titleWord.length > queryWord.length && titleWord.endsWith(queryWord)) return true;
  if (queryWord.length >= 4 && titleWord.length > queryWord.length && titleWord.startsWith(queryWord)) return true;
  const tolerance = Math.min(typoTolerance(queryWord), typoTolerance(titleWord));
  return tolerance > 0 && editDistance(queryWord, titleWord) <= tolerance;
}

/**
 * How well a result title fits the dish (0..1): share of the dish's words found in the title,
 * checked separately for the original and the English wording, best of both.
 */
export function relevanceScore(title: string, query: DishQuery): number {
  const titleWords = toTokens(title).filter((t) => !STOPWORDS.has(t));
  if (titleWords.length === 0) return 0;
  const scoreFor = (phrase: string) => {
    const words = toTokens(phrase).filter((t) => t.length >= 3);
    if (words.length === 0) return 0;
    const hits = words.filter((w) => titleWords.some((tw) => wordsMatch(w, tw))).length;
    return hits / words.length;
  };
  return Math.max(scoreFor(query.original), scoreFor(query.english));
}

// ---------------------------------------------------------------------------
// Image sources
// ---------------------------------------------------------------------------

interface ImageCandidate {
  url: string;
  /** 0..1 relevance of the image's title/description to the dish */
  score: number;
  /** Tie-breaker between sources with equal relevance */
  sourceWeight: number;
}

const REQUEST_TIMEOUT_MS = 7000;

async function fetchJson(url: string): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Lead images of matching Wikipedia articles, e.g. the "Caesar salad" article photo. */
async function getWikipediaImages(lang: 'de' | 'en', searchText: string, query: DishQuery): Promise<ImageCandidate[]> {
  if (!searchText) return [];
  const url =
    `https://${lang}.wikipedia.org/w/api.php?action=query&generator=search` +
    `&gsrsearch=${encodeURIComponent(searchText)}&gsrlimit=6&prop=pageimages&piprop=thumbnail` +
    `&pithumbsize=800&format=json&origin=*`;
  const data = await fetchJson(url);
  const pages: any[] = Object.values(data?.query?.pages || {});
  return pages
    .filter((page) => page?.thumbnail?.source)
    .map((page) => ({
      url: page.thumbnail.source as string,
      score: relevanceScore(page.title || '', query),
      // Wikipedia ranks its best hit first; keep that order as a tie-breaker
      sourceWeight: 3 - (page.index || 1) * 0.1
    }))
    .filter((c) => c.score > 0);
}

/** Photos from Wikimedia Commons whose file name describes the dish. */
async function getCommonsImages(searchText: string, query: DishQuery): Promise<ImageCandidate[]> {
  if (!searchText) return [];
  const url =
    `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6` +
    `&gsrsearch=${encodeURIComponent(`${searchText} filetype:bitmap`)}&gsrlimit=20` +
    `&prop=imageinfo&iiprop=url|mime&iiurlwidth=800&format=json&origin=*`;
  const data = await fetchJson(url);
  const pages: any[] = Object.values(data?.query?.pages || {});
  return pages
    .map((page) => {
      const info = page?.imageinfo?.[0];
      const fileName = String(page?.title || '').replace(/^File:/i, '').replace(/\.[a-z0-9]+$/i, '');
      return {
        url: (info?.thumburl || info?.url || '') as string,
        mime: (info?.mime || '') as string,
        score: relevanceScore(fileName, query),
        sourceWeight: 2 - (page?.index || 1) * 0.01
      };
    })
    .filter((c) => c.url && /^image\/(jpeg|png|webp)$/.test(c.mime) && c.score > 0)
    .map(({ url, score, sourceWeight }) => ({ url, score, sourceWeight }));
}

/** Recipe photos from TheMealDB (English dish names only). */
async function getTheMealDbImages(query: DishQuery): Promise<ImageCandidate[]> {
  const searches = [query.english, ...toTokens(query.english).filter((t) => t.length >= 4).slice(0, 2)];
  const seen = new Set<string>();
  const results: ImageCandidate[] = [];
  for (const term of Array.from(new Set(searches)).filter(Boolean)) {
    const data = await fetchJson(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(term)}`);
    for (const meal of data?.meals || []) {
      const url = meal?.strMealThumb;
      if (typeof url !== 'string' || !url.startsWith('http') || seen.has(url)) continue;
      seen.add(url);
      const score = relevanceScore(meal.strMeal || '', query);
      if (score > 0) results.push({ url, score, sourceWeight: 2 });
    }
    // The full dish name already found good matches, no need for the broader single-word searches
    if (results.some((r) => r.score >= 1)) break;
  }
  return results;
}

/** Hand-picked photos for broad dish categories ("salad", "curry", ...). */
function getCuratedImages(query: DishQuery): ImageCandidate[] {
  const text = ` ${query.original} ${query.english} `;
  const words = new Set(query.keywords);
  const results: ImageCandidate[] = [];
  for (const collection of CULINARY_COLLECTIONS) {
    const matches = collection.keywords.some((keyword) => {
      const k = normalizeText(keyword);
      if (k.includes(' ')) return text.includes(` ${k} `);
      // German compounds carry their meaning at the end: "nudelsalat" is a salad
      return Array.from(words).some((w) => w === k || (k.length >= 4 && w.endsWith(k)));
    });
    if (matches) {
      // Category photos are generic, so rank them below photos of the exact dish
      collection.urls.forEach((url, i) => results.push({ url, score: 0.5, sourceWeight: 1 - i * 0.01 }));
    }
  }
  return results;
}

// In-memory cache for search queries so cycling through images is instantaneous
const optionsCache = new Map<string, string[]>();

/**
 * Returns alternative food images for a dish name, best match first.
 * Only images whose title actually fits the dish are returned; the generic food
 * pool is used solely when nothing matching was found at all.
 */
export async function getFoodImageOptions(dishName: string): Promise<string[]> {
  const query = parseDishQuery(dishName);
  if (!query.original) {
    return GENERAL_CULINARY_POOL;
  }

  const cacheKey = query.original;
  const cached = optionsCache.get(cacheKey);
  if (cached && cached.length > 0) return cached;

  const englishDiffers = query.english && query.english !== query.original;
  const results = await Promise.allSettled([
    getWikipediaImages('de', query.original, query),
    getWikipediaImages('en', query.english || query.original, query),
    getCommonsImages(query.english || query.original, query),
    englishDiffers ? getCommonsImages(query.original, query) : Promise.resolve([]),
    getTheMealDbImages(query)
  ]);

  const candidates: ImageCandidate[] = [...getCuratedImages(query)];
  for (const result of results) {
    if (result.status === 'fulfilled') candidates.push(...result.value);
  }

  // Best relevance first, then source quality; keep each URL once
  candidates.sort((a, b) => b.score - a.score || b.sourceWeight - a.sourceWeight);
  const ranked = Array.from(new Set(candidates.map((c) => c.url)));

  const finalOptions = ranked.length > 0 ? ranked : GENERAL_CULINARY_POOL;
  // Don't cache the fallback: the sources may just have been unreachable
  if (ranked.length > 0) optionsCache.set(cacheKey, finalOptions);
  return finalOptions;
}

/**
 * Cycles to the next photo candidate for the dish.
 * Guarantees that every call returns a DIFFERENT picture than currentUrl.
 */
export async function getNextFoodImage(dishName: string, currentUrl?: string): Promise<string> {
  const options = await getFoodImageOptions(dishName);
  if (!options || options.length === 0) {
    return GENERAL_CULINARY_POOL[0];
  }

  if (!currentUrl) {
    return options[0];
  }

  const cleanCurrent = currentUrl.trim();
  const currentIndex = options.findIndex((url) => url === cleanCurrent);

  if (currentIndex === -1) {
    // Current url is not in the options array: return first option if different, or second
    return options[0] !== cleanCurrent ? options[0] : (options[1] || options[0]);
  }

  // Rotate to the next image in the options list
  const nextIndex = (currentIndex + 1) % options.length;
  return options[nextIndex];
}

/**
 * Finds the first fitting food image for a dish name
 */
export async function autoFindFoodImage(dishName: string): Promise<string> {
  return getNextFoodImage(dishName);
}

// Convert uploaded file from iPhone / iPad Camera to optimized Data URL
export function processUploadedImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Resize image to max 900px width/height for fast loading & smooth storage
        const canvas = document.createElement('canvas');
        const maxDim = 900;
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

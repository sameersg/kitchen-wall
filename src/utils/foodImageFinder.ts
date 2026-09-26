// Automatic food image finder & client-side image resizer/uploader
// Provides rich multi-image candidate collections with instant rotation

export interface CulinaryCollection {
  keywords: string[];
  urls: string[];
}

export const CULINARY_COLLECTIONS: CulinaryCollection[] = [
  {
    keywords: ['pasta', 'spaghetti', 'nudel', 'carbonara', 'bolognese', 'lasagne', 'penne', 'tagliatelle', 'pesto', 'ravioli', 'gnocchi', 'tortellini'],
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
    keywords: ['pizza', 'calzone', 'margherita', 'prosciutto', 'salami', 'flammkuchen'],
    urls: [
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80', // Wood-fired pizza
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=80', // Margherita fresh basil
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80', // Pepperoni slice
      'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=900&q=80', // Rustic Italian pizza
      'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=900&q=80'  // Crispy thin crust
    ]
  },
  {
    keywords: ['curry', 'indisch', 'thai', 'kokos', 'tikka', 'masala', 'dal', 'korma', 'butter chicken'],
    urls: [
      'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=900&q=80', // Vibrant Thai red curry
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80', // Chicken tikka masala
      'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=900&q=80', // Indian dal with rice
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=900&q=80', // Green curry with coconut
      'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=900&q=80'  // Creamy paneer butter curry
    ]
  },
  {
    keywords: ['bowl', 'quinoa', 'kichererbsen', 'avocado', 'veggie', 'vegan', 'gesund', 'salat', 'caesar', 'dressing'],
    urls: [
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80', // Colorful Buddha bowl
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80', // Fresh garden salad
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80', // Quinoa avocado bowl
      'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=900&q=80', // Mediterranean bowl
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=900&q=80'  // Crispy salad plate
    ]
  },
  {
    keywords: ['lachs', 'fisch', 'forelle', 'meeresfrüchte', 'garnelen', 'shrimp', 'dorade', 'kabeljau', 'zander', 'salmon'],
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
    keywords: ['taco', 'burrito', 'fajita', 'mexican', 'tortilla', 'quesadilla', 'chili', 'enchilada', 'nachos'],
    urls: [
      'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=900&q=80', // Street tacos
      'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=900&q=80', // Crispy corn tacos
      'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=900&q=80', // Stuffed burrito
      'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?auto=format&fit=crop&w=900&q=80', // Cheesy quesadilla
      'https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?auto=format&fit=crop&w=900&q=80'  // Mexican fiesta platter
    ]
  },
  {
    keywords: ['pancake', 'pfannkuchen', 'waffel', 'crepe', 'frühstück', 'brunch', 'beeren', 'müsli', 'porridge', 'oatmeal', 'granola', 'french toast'],
    urls: [
      'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=900&q=80', // Fluffy berry pancakes
      'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=900&q=80', // Golden stack with maple syrup
      'https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=900&q=80', // Belgian waffles
      'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=900&q=80', // Berry porridge bowl
      'https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=900&q=80'  // French toast with berries
    ]
  },
  {
    keywords: ['suppe', 'eintopf', 'gulasch', 'ramen', 'pho', 'brühe', 'kürbissuppe', 'tomatensuppe', 'kartoffelsuppe'],
    urls: [
      'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=900&q=80', // Hearty warm soup
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=80', // Japanese ramen bowl
      'https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?auto=format&fit=crop&w=900&q=80', // Creamy pumpkin/tomato soup
      'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=900&q=80', // Steaming noodle soup
      'https://images.unsplash.com/photo-1578020190125-f4f7c18bc9cb?auto=format&fit=crop&w=900&q=80'  // Vegetable herb broth
    ]
  },
  {
    keywords: ['sushi', 'maki', 'sashimi', 'asiatisch', 'japanisch', 'nigiri', 'dumpling', 'gyoza', 'wok'],
    urls: [
      'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=900&q=80', // Sushi set platter
      'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=900&q=80', // Fresh salmon maki
      'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=900&q=80', // Rainbow roll
      'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=900&q=80', // Steamed gyoza dumplings
      'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80'  // Stir-fried asian noodles
    ]
  },
  {
    keywords: ['schnitzel', 'steak', 'fleisch', 'braten', 'roulade', 'hähnchen', 'chicken', 'rind', 'schwein', 'entrecote', 'filet', 'cordon bleu'],
    urls: [
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80', // Crisp golden schnitzel
      'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=900&q=80', // Prime beef steak
      'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=80', // Roast chicken
      'https://images.unsplash.com/photo-1588347818036-558601350bc4?auto=format&fit=crop&w=900&q=80', // Grilled meat plate
      'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=900&q=80'  // BBQ steaks
    ]
  },
  {
    keywords: ['risotto', 'pilz', 'steinpilz', 'champignon', 'trüffel'],
    urls: [
      'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=900&q=80', // Creamy parmesan risotto
      'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?auto=format&fit=crop&w=900&q=80', // Wild mushroom risotto
      'https://images.unsplash.com/photo-1539136788836-5699e78bfc75?auto=format&fit=crop&w=900&q=80', // Sautéed mushrooms & rice
      'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=900&q=80'  // Gourmet truffle risotto
    ]
  },
  {
    keywords: ['ei', 'rührei', 'spiegelei', 'omelett', 'shakshuka', 'eggs'],
    urls: [
      'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=80', // Eggs benedict
      'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=900&q=80', // Shakshuka skillet
      'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=900&q=80', // Fluffy scrambled eggs
      'https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=900&q=80'  // Sunny side up breakfast
    ]
  },
  {
    keywords: ['brot', 'sandwich', 'toast', 'bagel', 'stulle', 'panini', 'avocadotoast'],
    urls: [
      'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=900&q=80', // Artisan crusty sourdough
      'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=80', // Melted grilled cheese
      'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80', // Toasted panini
      'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?auto=format&fit=crop&w=900&q=80', // Loaded avocado toast
      'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=80'
    ]
  },
  {
    keywords: ['kuchen', 'torte', 'muffin', 'dessert', 'schokolade', 'brownie', 'tiramisu', 'süß'],
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

const GERMAN_TO_ENGLISH_MAP: Record<string, string> = {
  pasta: 'pasta',
  nudel: 'pasta',
  nudeln: 'pasta',
  spaghetti: 'pasta',
  lasagne: 'lasagna',
  carbonara: 'pasta',
  bolognese: 'bolognese',
  lachs: 'salmon',
  fisch: 'fish',
  garnelen: 'shrimp',
  meeresfrüchte: 'seafood',
  hähnchen: 'chicken',
  huhn: 'chicken',
  chicken: 'chicken',
  rind: 'beef',
  rinderbraten: 'beef',
  gulasch: 'beef',
  steak: 'steak',
  schwein: 'pork',
  suppe: 'soup',
  eintopf: 'stew',
  kürbissuppe: 'soup',
  tomatensuppe: 'soup',
  salat: 'salad',
  curry: 'curry',
  pizza: 'pizza',
  burger: 'burger',
  torte: 'cake',
  kuchen: 'cake',
  schokolade: 'chocolate',
  pancakes: 'pancake',
  pfannkuchen: 'pancake',
  waffeln: 'waffles',
  kartoffel: 'potato',
  kartoffeln: 'potato',
  reis: 'rice',
  risotto: 'risotto',
  ei: 'egg',
  eier: 'egg',
  omelett: 'omelette',
  frühstück: 'breakfast'
};

async function getTheMealDbImages(query: string): Promise<string[]> {
  const lower = query.toLowerCase();
  let searchWord = '';
  for (const [de, en] of Object.entries(GERMAN_TO_ENGLISH_MAP)) {
    if (lower.includes(de)) {
      searchWord = en;
      break;
    }
  }
  if (!searchWord) {
    searchWord = lower.split(/[\s,.-]+/)[0] || '';
  }
  if (!searchWord || searchWord.length < 3) return [];

  try {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(searchWord)}`);
    if (!res.ok) return [];
    const data = await res.json();
    if (data && Array.isArray(data.meals)) {
      return data.meals
        .map((m: any) => m.strMealThumb)
        .filter((url: any) => typeof url === 'string' && url.startsWith('http'));
    }
  } catch {
    // ignore
  }
  return [];
}

async function getWikipediaImages(query: string): Promise<string[]> {
  if (!query.trim()) return [];
  try {
    const wikiUrl = `https://de.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      query.trim()
    )}&gsrlimit=8&prop=pageimages&pithumbsize=800&format=json&origin=*`;
    const res = await fetch(wikiUrl);
    if (!res.ok) return [];
    const data = await res.json();
    const pages = data?.query?.pages;
    if (pages) {
      const urls: string[] = [];
      for (const page of Object.values(pages) as any[]) {
        if (page?.thumbnail?.source) {
          urls.push(page.thumbnail.source);
        }
      }
      return urls;
    }
  } catch {
    // ignore
  }
  return [];
}

// In-memory cache for search queries so cycling through images is instantaneous
const optionsCache = new Map<string, string[]>();

/**
 * Returns an array of alternative food images matching the given dish name.
 * Combines TheMealDB, curated Unsplash galleries, Wikipedia and general high-res food photos.
 */
export async function getFoodImageOptions(dishName: string): Promise<string[]> {
  const query = dishName.trim().toLowerCase();
  if (!query) {
    return GENERAL_CULINARY_POOL;
  }

  if (optionsCache.has(query)) {
    const cached = optionsCache.get(query);
    if (cached && cached.length > 0) return cached;
  }

  // 1. Gather Curated match
  const curatedMatches: string[] = [];
  for (const collection of CULINARY_COLLECTIONS) {
    if (collection.keywords.some((k) => query.includes(k))) {
      curatedMatches.push(...collection.urls);
    }
  }

  // 2. Fetch TheMealDB and Wikipedia in parallel (client-side)
  let mealDbImages: string[] = [];
  let wikiImages: string[] = [];
  try {
    const results = await Promise.allSettled([
      getTheMealDbImages(query),
      getWikipediaImages(query)
    ]);
    if (results[0].status === 'fulfilled') mealDbImages = results[0].value;
    if (results[1].status === 'fulfilled') wikiImages = results[1].value;
  } catch {
    // ignore
  }

  // Interleave and deduplicate results
  const combined = Array.from(
    new Set([
      ...curatedMatches,
      ...mealDbImages,
      ...wikiImages,
      ...GENERAL_CULINARY_POOL
    ])
  );

  const finalOptions = combined.length > 0 ? combined : GENERAL_CULINARY_POOL;
  optionsCache.set(query, finalOptions);
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

import type { NuvemshopProduct, Product, GarmentCategory } from "@/types";

const STORE_ID = process.env.NUVEMSHOP_STORE_ID || "112162";
const API_BASE = `https://api.tiendanube.com/v1/${STORE_ID}`;

function getToken(): string {
  const token = process.env.NUVEMSHOP_ACCESS_TOKEN;
  if (!token) throw new Error("NUVEMSHOP_ACCESS_TOKEN não configurado");
  return token;
}

const CATEGORY_MAP: Record<number, GarmentCategory> = {};
let categoryMapLoaded = false;

export async function loadCategoryMap(): Promise<void> {
  if (categoryMapLoaded) return;

  const res = await fetch(`${API_BASE}/categories`, {
    headers: {
      Authentication: `bearer ${getToken()}`,
      "Content-Type": "application/json",
      "User-Agent": "VirtualTryOn/1.0",
    },
  });

  if (!res.ok) return;

  const categories = await res.json();
  // Order matters: shoes before bottoms (since "calçado" contains "calça")
  const orderedKeywords: Array<[GarmentCategory, string[]]> = [
    ["tops", ["camis", "blus", "top", "moleton", "jaqueta", "casaco", "camisa", "camiseta", "regata", "cropped", "polo", "blazer", "colete", "sueter", "suéter", "fitness", "tech", "oversize", "manga"]],
    ["shoes", ["calçado", "calcado", "tênis", "tenis", "sapato", "sandal", "bota", "chinelo", "alpargata"]],
    ["bottoms", ["calça", "calca", "short", "saia", "bermuda", "legging", "jeans"]],
  ];

  for (const cat of categories) {
    const name = (cat.name?.pt || "").toLowerCase();
    for (const [garmentCat, kws] of orderedKeywords) {
      if (kws.some((kw) => name.includes(kw))) {
        CATEGORY_MAP[cat.id] = garmentCat;
        break;
      }
    }
  }

  categoryMapLoaded = true;
}

// Blacklist: produtos que NÃO são roupas/calçados (acessórios, cosméticos, etc.)
const BLACKLIST_RE = /spray|impermeabilizante|pomada|prendedor|cera|gel|shampoo|condicionador|perfume|desodorante|hidratante|protetor|creme|óleo|oleo|escova|pente|acessório|acessorio|carteira|bolsa|mochila|necessaire|cinto|colar|pulseira|anel|brinco|óculos|oculos|relógio|relogio|boné|bone|gorro|chapéu|chapeu|meia|cueca|luva|gravata|lenço|lenco|toalha|máscara|mascara|limpeza|removedor|cola|graxa|tinta|cadarço|cadarco|palmilha|kit\b|combo\b|sunga|quadro|chaveiro|pochete|faixa|tiara|presilha|piercing|corrente|pingente|aliança|alianca|broche|cachecol|loção|locao|sabonete|balm|serum|sérum|talco|mousse|esfoliante|tônico|tonico|esmalte|batom|maquiagem|unha|depilação|depilacao|barbear|navalha|gilete|renova solado|brilho expresso|limpa couro|limpa tenis|limpa tênis|muss plus|solado|lustro|engraxe|polimento|restaurador|selante|condicionador de couro|case cap|vale presente|frete|outlet\b|taxa/i;

const TOP_RE = /camis|blus|top|moleton|jaqueta|casaco|regata|cropped|polo|blazer|colete|sueter|suéter|fitness|tech|oversize|manga/i;
const SHOE_RE = /calçado|calcado|tênis|tenis|sapato|sandal|bota|chinelo|alpargata/i;
const BOTTOM_RE = /calça|calca|short|saia|bermuda|legging|jeans/i;

function matchKeywords(text: string): GarmentCategory | null {
  if (TOP_RE.test(text)) return "tops";
  // Check shoes BEFORE bottoms — "calçados" contains "calça"
  if (SHOE_RE.test(text)) return "shoes";
  if (BOTTOM_RE.test(text)) return "bottoms";
  return null;
}

function detectCategory(product: NuvemshopProduct): GarmentCategory | null {
  // Check CATEGORY_MAP first
  for (const cat of product.categories) {
    if (CATEGORY_MAP[cat.id]) return CATEGORY_MAP[cat.id];
  }

  // Check category names directly (handles categories not in the map)
  for (const cat of product.categories) {
    const catName = (cat.name?.pt || "").toLowerCase();
    const match = matchKeywords(catName);
    if (match) return match;
  }

  // Fallback: product name + description
  const name = (product.name?.pt || "").toLowerCase();
  const desc = (product.description?.pt || "").toLowerCase();
  const text = `${name} ${desc}`;

  return matchKeywords(text);
}

function mapProduct(p: NuvemshopProduct, category: GarmentCategory): Product | null {
  // Price can be null at product level — fall back to first variant
  let price = p.price ? parseFloat(p.price) : 0;
  let promoPrice = p.promotional_price ? parseFloat(p.promotional_price) : null;

  if (!price && p.variants?.length) {
    const v = p.variants[0];
    price = v.price ? parseFloat(v.price) : 0;
    if (!promoPrice && v.promotional_price) {
      promoPrice = parseFloat(v.promotional_price);
    }
  }

  // Skip products with no valid price
  if (!price && (!promoPrice || promoPrice <= 0)) return null;

  return {
    id: p.id,
    name: p.name?.pt || "",
    price: price || (promoPrice ?? 0),
    promoPrice: promoPrice && promoPrice > 0 && promoPrice < price ? promoPrice : null,
    image: p.images[0]?.src || "",
    category,
    nuvemshopUrl: `https://paradisemultimarcas.lojavirtualnuvem.com.br/productos/${p.id}`,
  };
}

async function fetchPage(apiPage: number, perPage: number): Promise<{ products: NuvemshopProduct[]; hasMore: boolean }> {
  const res = await fetch(
    `${API_BASE}/products?page=${apiPage}&per_page=${perPage}&published=true&sort_by=best-selling`,
    {
      headers: {
        Authentication: `bearer ${getToken()}`,
        "Content-Type": "application/json",
        "User-Agent": "VirtualTryOn/1.0",
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error(`Nuvemshop API error: ${res.status}`);
  }

  const products: NuvemshopProduct[] = await res.json();
  const linkHeader = res.headers.get("Link") || "";
  const hasMore = linkHeader.includes('rel="next"');

  return { products, hasMore };
}

// Cache all filtered products in memory to avoid repeated API calls
let cachedProducts: Product[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function loadAllProducts(): Promise<Product[]> {
  if (cachedProducts && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cachedProducts;
  }

  await loadCategoryMap();

  const allProducts: Product[] = [];
  let apiPage = 1;
  let hasMore = true;
  const PER_PAGE = 200; // Nuvemshop max
  const MAX_PAGES = 10; // Safety limit

  while (hasMore && apiPage <= MAX_PAGES) {
    const result = await fetchPage(apiPage, PER_PAGE);

    for (const p of result.products) {
      if (!p.images?.length) continue;

      // Excluir produtos que não são roupas/calçados (acessórios, cosméticos, etc.)
      const productName = (p.name?.pt || "").toLowerCase();
      if (BLACKLIST_RE.test(productName)) continue;

      const category = detectCategory(p);
      if (!category) continue;
      const mapped = mapProduct(p, category);
      if (mapped) allProducts.push(mapped);
    }

    hasMore = result.hasMore;
    apiPage++;
  }

  cachedProducts = allProducts;
  cacheTimestamp = Date.now();

  return allProducts;
}

export async function getProducts(
  filterCategory?: GarmentCategory,
  page = 1,
  perPage = 24,
  search?: string
): Promise<{ products: Product[]; hasMore: boolean }> {
  const allProducts = await loadAllProducts();

  // Filter by category if needed
  let filtered = filterCategory
    ? allProducts.filter((p) => p.category === filterCategory)
    : allProducts;

  // Filter by search term
  if (search) {
    const term = search.toLowerCase().trim();
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(term));
  }

  // Paginate
  const start = (page - 1) * perPage;
  const end = start + perPage;
  const products = filtered.slice(start, end);
  const hasMore = end < filtered.length;

  return { products, hasMore };
}

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

export async function getProducts(
  filterCategory?: GarmentCategory,
  page = 1,
  perPage = 20
): Promise<{ products: Product[]; hasMore: boolean }> {
  await loadCategoryMap();

  const res = await fetch(
    `${API_BASE}/products?page=${page}&per_page=${perPage}&published=true`,
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

  const raw: NuvemshopProduct[] = await res.json();
  const linkHeader = res.headers.get("Link") || "";
  const hasMore = linkHeader.includes('rel="next"');

  const products: Product[] = [];
  for (const p of raw) {
    if (!p.images.length) continue;
    const category = detectCategory(p);
    if (!category) continue;
    if (filterCategory && category !== filterCategory) continue;
    const mapped = mapProduct(p, category);
    if (mapped) products.push(mapped);
  }

  return { products, hasMore };
}

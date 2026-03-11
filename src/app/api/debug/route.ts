import { NextResponse } from "next/server";

const STORE_ID = process.env.NUVEMSHOP_STORE_ID || "112162";
const API_BASE = `https://api.tiendanube.com/v1/${STORE_ID}`;

function getToken(): string {
  const token = process.env.NUVEMSHOP_ACCESS_TOKEN;
  if (!token) throw new Error("NUVEMSHOP_ACCESS_TOKEN not set");
  return token;
}

export async function GET() {
  const debug: Record<string, unknown> = {};

  try {
    debug.storeId = STORE_ID;
    debug.hasToken = !!process.env.NUVEMSHOP_ACCESS_TOKEN;

    // Fetch products
    const prodRes = await fetch(
      `${API_BASE}/products?page=1&per_page=5&published=true`,
      {
        headers: {
          Authentication: `bearer ${getToken()}`,
          "Content-Type": "application/json",
          "User-Agent": "VirtualTryOn/1.0",
        },
      }
    );

    debug.productsStatus = prodRes.status;

    if (!prodRes.ok) {
      debug.productsError = await prodRes.text();
      return NextResponse.json(debug);
    }

    const products = await prodRes.json();
    debug.totalProducts = products.length;

    const topKeywords = /camis|blus|top|moleton|jaqueta|casaco|regata|cropped|polo|blazer|colete|sueter|suéter|fitness|tech/i;
    const bottomKeywords = /calça|calca|short|saia|bermuda|legging|jeans/i;
    const shoeKeywords = /calçado|calcado|tênis|tenis|sapato|sandal|bota|chinelo/i;

    debug.products = products.slice(0, 5).map((p: Record<string, unknown>) => {
      const name = ((p.name as Record<string, string>)?.pt || "").toLowerCase();
      const cats = ((p.categories as Array<{ id: number; name: { pt: string } }>) || []).map(
        (c) => ({ id: c.id, name: c.name?.pt })
      );
      const hasImages = ((p.images as Array<unknown>) || []).length > 0;
      const price = p.price;
      const variants = ((p.variants as Array<{ price: string }>) || []).slice(0, 2).map((v) => ({
        price: v.price,
      }));

      return {
        id: p.id,
        name,
        cats,
        hasImages,
        price,
        variants,
        matchesTop: topKeywords.test(name),
        matchesBottom: bottomKeywords.test(name),
        matchesShoe: shoeKeywords.test(name),
      };
    });
  } catch (err) {
    debug.error = err instanceof Error ? err.message : String(err);
  }

  return NextResponse.json(debug);
}

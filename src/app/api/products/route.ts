import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/nuvemshop";
import type { GarmentCategory } from "@/types";

const VALID_CATEGORIES: GarmentCategory[] = ["tops", "bottoms", "shoes", "overlays"];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const category = searchParams.get("category") as GarmentCategory | null;
    const page = parseInt(searchParams.get("page") || "1", 10);

    if (category && !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: "Categoria inválida. Use: tops, bottoms, shoes" },
        { status: 400 }
      );
    }

    const search = searchParams.get("search") || undefined;
    const result = await getProducts(category || undefined, page, 24, search);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Products error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar produtos" },
      { status: 500 }
    );
  }
}

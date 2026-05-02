import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export interface ReviewFiltersResponse {
  types: string[];
  categories: string[];
  countries: string[];
  cities: string[];
}

export async function GET() {
  try {
    const profiles = await db.profiles.findMany({
      select: {
        type: true,
        categories: true,
        address: {
          select: {
            country: true,
            city: true,
          },
        },
      },
    });

    const typesSet = new Set<string>();
    const categoriesSet = new Set<string>();
    const countriesSet = new Set<string>();
    const citiesSet = new Set<string>();

    profiles.forEach((p) => {
      p.type.forEach((t) => typesSet.add(t));
      p.categories.forEach((c) => categoriesSet.add(c));
      
      if (p.address) {
        if (p.address.country) countriesSet.add(p.address.country);
        if (p.address.city) citiesSet.add(p.address.city);
      }
    });

    const response: ReviewFiltersResponse = {
      types: Array.from(typesSet).sort(),
      categories: Array.from(categoriesSet).sort(),
      countries: Array.from(countriesSet).sort(),
      cities: Array.from(citiesSet).sort(),
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("[/api/novo/reviews/filters] Erro ao buscar filtros:", error);
    return NextResponse.json(
      { error: "Falha ao buscar filtros." },
      { status: 500 }
    );
  }
}

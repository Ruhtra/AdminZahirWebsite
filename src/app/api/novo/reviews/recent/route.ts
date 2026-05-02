import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export interface ReviewProfileDTO {
  id: string;
  name: string;
  resume: string | null;
  informations: string | null;
  imageUrl: string | null;
  movie: string | null;
  type: string[];
  categories: string[];
  telephones: {
    whatsapp: string[];
    telephone: string[];
  };
  local: {
    cep: string | null;
    uf: string | null;
    country: string;
    city: string | null;
    neighborhood: string | null;
    street: string | null;
    number: string | null;
    complement: string | null;
  } | null;
  promotion: {
    active: boolean;
    title: string | null;
    description: string | null;
  };
  createdAt: string; // ISO 8601
}

export async function GET() {
  try {
    const profiles = await db.profiles.findMany({
      include: {
        address: true,
        promotion: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    const data: ReviewProfileDTO[] = profiles.map((p) => ({
      id: p.id,
      name: p.name,
      resume: p.resume ?? null,
      informations: p.informations ?? null,
      imageUrl: p.imageUrl ?? null,
      movie: p.movie ? p.movie.trim().replace(/\/embed\/?(?:\?.*)?$/i, "") : null,
      type: p.type,
      categories: p.categories,
      telephones: {
        whatsapp: p.telephonesWhatsapp,
        telephone: p.telephonesPhone,
      },
      local: p.address
        ? {
            cep: p.address.cep ?? null,
            uf: p.address.uf ?? null,
            country: p.address.country,
            city: p.address.city ?? null,
            neighborhood: p.address.neighborhood ?? null,
            street: p.address.street ?? null,
            number: p.address.number ?? null,
            complement: p.address.complement ?? null,
          }
        : null,
      promotion: {
        active: p.promotionActive,
        title: p.promotion?.title ?? null,
        description: p.promotion?.description ?? null,
      },
      createdAt: p.createdAt.toISOString(),
    }));

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("[/api/novo/reviews/recent] Erro ao buscar reviews recentes:", error);
    return NextResponse.json(
      { error: "Falha ao buscar reviews recentes." },
      { status: 500 }
    );
  }
}

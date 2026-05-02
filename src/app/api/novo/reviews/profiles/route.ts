import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────────────────────────
// DTO — shape entregue ao novo front-end (Zahir.02.05)
// Campos alinhados com o que ReviewsPageClient/VideoCard consomem.
// ─────────────────────────────────────────────────────────────────────────────

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

export interface ReviewProfilesResponse {
  data: ReviewProfileDTO[];
  total: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/novo/reviews/profiles
//
// Retorna todos os profiles cadastrados.
// Pensado para o infinite-scroll do front-end: retorna o conjunto completo
// de uma vez para que o cliente possa filtrar/paginar localmente sem
// requisições extras ao rolar a tela. Quando o volume de dados crescer,
// adicionar query params ?page=&limit= aqui sem quebrar o front.
// ─────────────────────────────────────────────────────────────────────────────

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
    });

    const data: ReviewProfileDTO[] = profiles.map((p) => ({
      id: p.id,
      name: p.name,
      resume: p.resume ?? null,
      informations: p.informations ?? null,
      imageUrl: p.imageUrl ?? null,
      movie: p.movie ?? null,
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

    const response: ReviewProfilesResponse = {
      data,
      total: data.length,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        // Cache de 60 s no CDN — revalidar manualmente via on-demand ISR
        // quando os dados mudarem no admin.
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("[/api/novo/reviews/profiles] Erro ao buscar profiles:", error);
    return NextResponse.json(
      { error: "Falha ao buscar profiles." },
      { status: 500 }
    );
  }
}

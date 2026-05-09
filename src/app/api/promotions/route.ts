/**
 * GET /api/promotions
 *
 * Retorna a lista de promoções em destaque cadastradas no sistema.
 *
 * @status STUB — A estrutura de banco (PromotionHighlight) ainda não foi
 * implementada. Por ora retorna sempre uma lista vazia (200 + []).
 *
 * @future Quando a tabela `PromotionHighlight` for criada no Prisma:
 *   1. Adicionar include de Promotion + Profile no query
 *   2. Mapear os registros para GetPromotionDTO[]
 *   3. Remover o return de lista vazia abaixo
 *
 * DTO esperado pelo front-end: GetPromotionDTO (ver comentário abaixo)
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// ── DTO espelhado no front-end (lib/types/promotions.ts) ──────────────────────
export interface GetPromotionDTO {
  id: string;
  title: string;
  description: string | null;
  /** URL pública da imagem da promoção (banner/thumb) */
  imageUrl: string | null;
  /** Desconto percentual, ex: 20 = 20% OFF */
  discountPercentage: number | null;
  active: boolean;
  profile: {
    id: string;
    name: string;
    imageUrl: string | null;
    /** Tipo do estabelecimento, ex: ["Restaurante", "Bar"] */
    type: string[];
    local: {
      city: string | null;
      uf: string | null;
      country: string;
    } | null;
  };
  createdAt: string;
}

export async function GET() {
  
  try {

    const highlights = await db.promotion.findMany({
      where: {
        isHighlight: true,
        Profiles: {
          promotionActive: true,
        },
      },
      include: {
        Profiles: {
          include: {
            address: true,
          },
        },
      },
      take: 4, // Limite de 4 como solicitado
    });

    const response: GetPromotionDTO[] = highlights.map((h) => ({
      id: h.id,
      title: h.title ?? "",
      description: h.description ?? null,
      imageUrl: h.Profiles?.imageUrl ?? null, // Usa a foto do perfil como solicitado
      discountPercentage: null, // Conforme pedido, o desconto vai no título
      active: h.Profiles?.promotionActive ?? true,
      profile: {
        id: h.Profiles?.id ?? "",
        name: h.Profiles?.name ?? "",
        imageUrl: h.Profiles?.imageUrl ?? null,
        type: h.Profiles?.type ?? [],
        local: h.Profiles?.address ? {
          city: h.Profiles.address.city,
          uf: h.Profiles.address.uf,
          country: h.Profiles.address.country,
        } : null,
      },
      createdAt: h.Profiles?.createdAt.toISOString() ?? new Date().toISOString(),
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to fetch promotions:", error);
    return NextResponse.json(
      { error: "Failed to fetch promotions" },
      { status: 500 }
    );
  }
}

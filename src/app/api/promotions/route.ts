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

// ── DTO espelhado no front-end (lib/types/promotions.ts) ──────────────────────
export interface GetPromotionDTO {
  id: string;
  title: string;
  description: string | null;
  /** URL pública da imagem da promoção (banner/thumb) */
  imageUrl: string | null;
  /** Desconto percentual, ex: 20 = 20% OFF */
  discountPercentage: number | null;
  /** Validade da promoção em ISO 8601 */
  validUntil: string | null;
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
    // TODO: quando a tabela PromotionHighlight existir no banco, substituir por:
    //
    // const promotions = await db.promotionHighlight.findMany({
    //   where: { active: true },
    //   include: {
    //     promotion: {
    //       include: {
    //         profile: { include: { address: true } },
    //       },
    //     },
    //   },
    //   orderBy: { createdAt: "desc" },
    // });
    //
    // const response: GetPromotionDTO[] = promotions.map((e) => ({ ... }));
    // return NextResponse.json(response);

    // Retorna lista vazia enquanto a estrutura não está pronta no banco
    const response: GetPromotionDTO[] = [];
    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to fetch promotions:", error);
    return NextResponse.json(
      { error: "Failed to fetch promotions" },
      { status: 500 }
    );
  }
}

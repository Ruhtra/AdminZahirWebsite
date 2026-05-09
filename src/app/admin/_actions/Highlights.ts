"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function toggleHighlight(promotionId: string, active: boolean) {
  try {
    if (active) {
      const highlightsCount = await db.promotion.count({
        where: { isHighlight: true }
      });
      if (highlightsCount >= 4) {
        return { error: "Limite de 4 destaques atingido. Desative outro antes." };
      }
    }

    await db.promotion.update({
      where: { id: promotionId },
      data: { isHighlight: active }
    });

    revalidatePath("/admin/homepage");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Falha ao atualizar destaque." };
  }
}

export async function getPromotionsForHighlight() {
  try {
    const promotions = await db.promotion.findMany({
      where: {
        Profiles: {
          promotionActive: true
        }
      },
      include: {
        Profiles: true
      }
    });
    return promotions;
  } catch (error) {
    console.error(error);
    return [];
  }
}

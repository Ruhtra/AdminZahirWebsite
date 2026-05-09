"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getLatestFollowers() {
  try {
    const follower = await db.followers.findFirst({
      orderBy: {
        createdAt: "desc",
      },
    });
    return { data: follower };
  } catch (error) {
    console.error("Erro ao buscar seguidores:", error);
    return { error: "Falha ao buscar seguidores" };
  }
}

export async function addFollowersRecord({
  instagram,
  tiktok,
  youtube,
}: {
  instagram: number;
  tiktok: number;
  youtube: number;
}) {
  try {
    const total = instagram + tiktok + youtube;

    await db.followers.create({
      data: {
        instagram,
        tiktok,
        youtube,
        total,
        createdAt: new Date(),
      },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Erro ao adicionar histórico de seguidores:", error);
    return { error: "Falha ao atualizar seguidores" };
  }
}

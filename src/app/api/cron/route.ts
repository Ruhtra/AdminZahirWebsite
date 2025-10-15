import { NextResponse } from "next/server";
import { SocialMediaFollowers } from "./mypackage";
import { db } from "@/lib/db";

export async function GET() {


  // Função para chamar o gerenciamento de seguidores

  try {
    console.log('loading...');
    const socialMediaFollowers = new SocialMediaFollowers({
      instagram: 'dozahir',    // Instagram Username
      tiktok: 'dozahir',       // TikTok Username
      youtube: 'dozahir',      // YouTube Username
      sumTotal: true           // Se quiser a soma total de seguidores
    });

    const followers = await socialMediaFollowers.getFollowers();

    await db.followers.create({
      data: {
        instagram: followers.instagram,
        tiktok: followers.tiktok,
        youtube: followers.youtube,
        total: followers.total,
        createdAt: new Date()
      }
    })

    // console.log(`Seguidores no Instagram: ${followers.instagram || 0}`);
    // console.log(`Seguidores no TikTok: ${followers.tiktok || 0}`);
    // console.log(`Seguidores no YouTube: ${followers.youtube || 0}`);
    // console.log(`Total de seguidores: ${followers.total || 0}`);

    return NextResponse.json({ followers });
  } catch (error) {
    console.error('Erro ao calcular seguidores:', error);
    return NextResponse.json({ error: 'Erro ao calcular seguidores' }, { status: 500 });

  }

}

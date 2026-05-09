"use server";

import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export interface GetAllHomePageDTO {
  order: number;
  profile: {
    _id: string;
    name: string;
    category: {
      type: string[];
    };
    picture?: string;
    promotion?: {
      active: boolean;
      title?: string;
      description?: string;
    };
    createdAt: Date;
    local?: {
      cep?: string;
      uf?: string;
      country: string;
      city?: string;
      neighborhood?: string;
      street?: string;
      number?: string;
      // lat: number;
      // lng: number;
      complement?: string;
    };
  };
}

export async function GET() {
  try {
    const highlights = await db.promotion.findMany({
      where: {
        isHighlight: true,
      },
      include: {
        Profiles: {
          include: {
            address: true,
          },
        },
      },
    });

    // Mapeamos para o mesmo DTO para manter compatibilidade com o front-end atual
    const response: GetAllHomePageDTO[] = highlights.map((h, index) => {
      return {
        order: index,
        profile: {
          _id: h.profilesId!,
          category: {
            type: h.Profiles?.type ?? [],
          },
          picture: h.Profiles?.imageUrl ?? undefined,
          createdAt: h.Profiles?.createdAt ?? new Date(),
          name: h.Profiles?.name ?? "",
          promotion: {
            active: h.Profiles?.promotionActive ?? true,
            description: h.description ?? undefined,
            title: h.title ?? undefined,
          },
          local: h.Profiles?.address
            ? {
              cep: h.Profiles.address.cep ?? undefined,
              uf: h.Profiles.address.uf ?? undefined,
              country: h.Profiles.address.country,
              city: h.Profiles.address.city ?? undefined,
              neighborhood: h.Profiles.address.neighborhood ?? undefined,
              street: h.Profiles.address.street ?? undefined,
              number: h.Profiles.address.number ?? undefined,
              complement: h.Profiles.address.complement ?? undefined,
            }
            : undefined,
        },
      };
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to fetch homepage highlights:", error);
    return NextResponse.json(
      { error: "Failed to fetch homepage highlights" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    // Validar payload
    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: "Invalid payload: expected array" },
        { status: 400 }
      );
    }

    if (body.length > 4) {
      return NextResponse.json(
        { error: "Maximum 4 highlights allowed" },
        { status: 400 }
      );
    }

    // 1. Resetar todos os destaques atuais
    await db.promotion.updateMany({
      where: { isHighlight: true },
      data: { isHighlight: false }
    });

    // 2. Ativar os novos destaques
    const profileIds = body.map((item: { profileId: string }) => item.profileId);
    
    if (profileIds.length > 0) {
      await db.promotion.updateMany({
        where: {
          profilesId: { in: profileIds }
        },
        data: { isHighlight: true }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update highlights:", error);
    return NextResponse.json(
      { error: "Failed to update highlights" },
      { status: 500 }
    );
  }
}

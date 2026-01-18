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
    const homePage = await db.homePage.findMany({
      include: {
        profile: {
          include: {
            address: true,
            promotion: true,
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });

    const response: GetAllHomePageDTO[] = homePage.map((e) => {
      return {
        order: e.order,
        profile: {
          _id: e.profileId,
          category: {
            type: e.profile.type,
          },
          picture: e.profile.imageUrl ?? undefined,
          createdAt: e.profile.createdAt,
          name: e.profile.name,
          promotion: e.profile.promotion
            ? {
              active: e.profile.promotionActive,
              description: e.profile.promotion.description ?? undefined,
              title: e.profile.promotion.title ?? undefined,
            }
            : undefined,
          local: e.profile.address
            ? {
              cep: e.profile.address.cep ?? undefined,
              uf: e.profile.address.uf ?? undefined,
              country: e.profile.address.country,
              city: e.profile.address.city ?? undefined,
              neighborhood: e.profile.address.neighborhood ?? undefined,
              street: e.profile.address.street ?? undefined,
              number: e.profile.address.number ?? undefined,
              // lat: e.profile.address.lat,
              // lng: e.profile.address.lng,
              complement: e.profile.address.complement ?? undefined,
            }
            : undefined,
        },
      };
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to fetch homepage:", error);
    return NextResponse.json(
      { error: "Failed to fetch homepage" },
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

    if (body.length > 10) {
      return NextResponse.json(
        { error: "Maximum 10 profiles allowed" },
        { status: 400 }
      );
    }

    // Deletar todos os registros existentes
    await db.homePage.deleteMany({});

    // Criar novos registros
    if (body.length > 0) {
      await db.homePage.createMany({
        data: body.map((item: { profileId: string; order: number }) => ({
          profileId: item.profileId,
          order: item.order,
        })),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update homepage:", error);
    return NextResponse.json(
      { error: "Failed to update homepage" },
      { status: 500 }
    );
  }
}

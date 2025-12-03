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
    promotion?: {
      active: boolean;
      title?: string;
      description?: string;
    };
    createdAt: Date;
    local?: {
      cep?: string;
      uf: string;
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
    });

    const response: GetAllHomePageDTO[] = homePage.map((e) => {
      return {
        order: e.order,
        profile: {
          _id: e.id,
          category: {
            type: e.profile.type,
          },
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
              uf: e.profile.address.uf,
              country: e.profile.address.uf,
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
    console.error("Failed to fetch texts:", error);
    return NextResponse.json(
      { error: "Failed to fetch texts" },
      { status: 500 }
    );
  }
}

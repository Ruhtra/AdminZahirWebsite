"use server";

import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export interface GetAllRecentsDTO {
  _id: string;
  name: string;
  resume?: string;
  informations?: string;
  movie?: string;
  category: {
    type: string[];
    categories: string[];
  };
  promotion?: {
    active: boolean;
    title?: string;
    description?: string;
  };
  telephones: {
    whatsapp: string[];
    telephone: string[];
  };
  createdAt: Date;
  local?: {
    cep: string;
    uf: string;
    city: string;
    neighborhood: string;
    street: string;
    number: string;
    lat: number;
    lng: number;
    complement?: string;
  };
  picture?: string;
}
export async function GET() {
  try {
    const profiles = await db.profiles.findMany({
      where: {
        movie: {
          not: null,
        },
      },
      include: {
        address: true,
        promotion: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 4,
    });

    const response: GetAllRecentsDTO[] = profiles.map((data) => {
      return {
        _id: data.id,
        name: data.name,
        category: {
          categories: data.categories,
          type: data.type,
        },
        picture: data.imageUrl ?? undefined,
        telephones: {
          whatsapp: data.telephonesWhatsapp,
          telephone: data.telephonesPhone,
        },
        informations: data.informations ?? undefined,
        resume: data.resume ?? undefined,
        movie: data.movie ?? undefined,
        local: data.address
          ? {
              cep: data.address.cep,
              uf: data.address.uf,
              city: data.address.city,
              neighborhood: data.address.neighborhood,
              street: data.address.street,
              number: data.address.number,
              lat: data.address.lat,
              lng: data.address.lng,
              complement: data.address.complement ?? undefined,
            }
          : undefined,
        promotion: {
          active: data.promotionActive,
          description: data.promotion?.description ?? undefined,
          title: data.promotion?.title ?? undefined,
        },
        createdAt: data.createdAt,
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

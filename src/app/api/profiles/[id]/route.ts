import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { GetAllProfilesDTO } from "../route";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const param = await params;
    const id = await param.id;

    const profile = await db.profiles.findUnique({
      where: { id: id },
      include: {
        address: true,
        promotion: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Porifle not found" }, { status: 404 });
    }

    const response: GetAllProfilesDTO = {
      _id: profile.id,
      name: profile.name,
      category: {
        categories: profile.categories,
        type: profile.type,
      },
      picture: profile.imageUrl ?? undefined,
      telephones: {
        whatsapp: profile.telephonesWhatsapp,
        telephone: profile.telephonesPhone,
      },
      informations: profile.informations ?? undefined,
      resume: profile.resume ?? undefined,
      movie: profile.movie ?? undefined,
      local: profile.address
        ? {
          cep: profile.address.cep ?? undefined,
          uf: profile.address.uf,
          country: profile.address.country,
          city: profile.address.city ?? undefined,
          neighborhood: profile.address.neighborhood ?? undefined,
          street: profile.address.street ?? undefined,
          number: profile.address.number ?? undefined,
          // lat: profile.address.lat,
          // lng: profile.address.lng,
          complement: profile.address.complement ?? undefined,
        }
        : undefined,
      promotion: {
        active: profile.promotionActive,
        description: profile.promotion?.description ?? undefined,
        title: profile.promotion?.title ?? undefined,
      },
      createdAt: profile.createdAt,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

"use server";

import { z } from "zod";
import { createProfileSchema } from "./profile.schema";
import { getLocaleByCep } from "@/lib/locale";
import { db } from "@/lib/db";

export async function CreateProfile({
  data,
}: {
  data: z.infer<typeof createProfileSchema>;
}) {
  const parseProfile = createProfileSchema.safeParse(data);

  //TO-DO: Optmizing promise all for valids datas in database

  if (!parseProfile.success) return { error: "Invalid data" };
  const profile = parseProfile.data;

  if (profile.activeAddress) {
    try {
      var lat_log = await getLocaleByCep(profile.local.cep);
    } catch {
      return { error: "Não foi possivel obter a localidade especificada!" };
    }
  }

  console.log("exportei lat lng");
  console.log(lat_log);

  await db.profiles.create({
    data: {
      address: profile.activeAddress
        ? {
            create: {
              cep: profile.local.cep,
              city: profile.local.city,
              neighborhood: profile.local.neighborhood,
              number: profile.local.number,
              street: profile.local.street,
              uf: profile.local.uf,
              complement: profile.local.complement,
              lat: lat_log.lat,
              lng: lat_log.lng,
            },
          }
        : undefined,
      createdAt: new Date(),
      name: profile.name,
      type: profile.type,
      categories: profile.categories,
      // imageUrl: "anyimage", // TODO
      informations: profile.informations,
      movie: profile.movie,

      promotionActive: profile.activePromotion,
      promotion: {
        create: {
          description: profile.promotion.description,
          title: profile.promotion.title,
        },
      },
      resume: profile.resume,
      telephonesPhone: profile.telephones
        .filter((e) => e.type == "phone")
        .map((e) => e.number),
      telephonesWhatsapp: profile.telephones
        .filter((e) => e.type == "whatsapp")
        .map((e) => e.number),
    },
  });

  return { success: "Profile Created success!" };
}

export async function UpdateProfile({
  idProfile,
  data,
}: {
  idProfile: string;
  data: z.infer<typeof createProfileSchema>;
}) {
  const parseProfile = createProfileSchema.safeParse(data);

  //TO-DO: Optmizing promise all for valids datas in database

  if (!parseProfile.success) return { error: "Invalid data" };
  const profile = parseProfile.data;

  const profileExists = await db.profiles.findUnique({
    where: {
      id: idProfile,
    },
    include: {
      address: true,
      promotion: true,
    },
  });
  if (!profileExists) return { error: "Profile not found" };

  if (profileExists.address && !profile.activeAddress) {
    await db.address.delete({
      where: {
        id: profileExists.address.id,
      },
    });
  }

  if (profile.activeAddress) {
    try {
      var lat_log = await getLocaleByCep(profile.local.cep);
    } catch {
      return { error: "Não foi possivel obter a localidade especificada!" };
    }
  }

  await db.profiles.update({
    where: {
      id: idProfile,
    },
    data: {
      address: profile.activeAddress
        ? {
            upsert: {
              create: {
                cep: profile.local.cep,
                city: profile.local.city,
                neighborhood: profile.local.neighborhood,
                number: profile.local.number,
                street: profile.local.street,
                uf: profile.local.uf,
                complement: profile.local.complement,
                lat: lat_log.lat,
                lng: lat_log.lng,
              },
              update: {
                cep: profile.local.cep,
                city: profile.local.city,
                neighborhood: profile.local.neighborhood,
                number: profile.local.number,
                street: profile.local.street,
                uf: profile.local.uf,
                complement: profile.local.complement,
                lat: lat_log.lat,
                lng: lat_log.lng,
              },
            },
          }
        : undefined,
      name: profile.name,
      type: profile.type,
      categories: profile.categories,
      // imageUrl //TODO
      informations: profile.informations,
      movie: profile.movie,
      promotionActive: profile.activePromotion,
      promotion: {
        update: {
          description: profile.promotion.description,
          title: profile.promotion.title,
        },
      },
      resume: profile.resume,
      telephonesPhone: profile.telephones
        .filter((e) => e.type == "phone")
        .map((e) => e.number),
      telephonesWhatsapp: profile.telephones
        .filter((e) => e.type == "whatsapp")
        .map((e) => e.number),
    },
  });

  return { success: "Profile Updated success!" };
}

export async function deleteProfile({ idProfile }: { idProfile: string }) {
  const profileExists = await db.profiles.findUnique({
    where: {
      id: idProfile,
    },
  });
  if (!profileExists) return { error: "Profile not found" };

  await db.profiles.delete({
    where: {
      id: idProfile,
    },
  });

  return { success: "Profile Updated success!" };
}

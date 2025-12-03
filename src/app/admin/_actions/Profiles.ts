"use server";

import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { createProfileSchema } from "./profile.schema";
import { db } from "@/lib/db";
import cuid from "cuid";

export async function CreateProfile({
  data,
}: {
  data: z.infer<typeof createProfileSchema>;
}) {
  const parseProfile = createProfileSchema.safeParse(data);

  //TO-DO: Optmizing promise all for valids datas in database

  if (!parseProfile.success) return { error: "Invalid data" };
  const profile = parseProfile.data;

  // let lat_log;

  // if (profile.activeAddress) {
  //   try {
  //     lat_log = await getLocaleByCep(profile.local.cep);
  //   } catch {
  //     return { error: "Não foi possivel obter a localidade especificada!" };
  //   }
  // }

  let imgUrl;
  let imageName;
  const id = cuid();

  if (profile.picture) {
    try {
      imageName = `${id}.${profile.picture.name.split(".").pop()}`; // Tratamento do nome da imagem

      const res = await supabase.storage
        .from("profileImages")
        .upload(imageName, profile.picture, {
          cacheControl: "3600",
          upsert: true,
        });

      if (res.error) throw res.error;

      imgUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${res.data.fullPath}`; // Usando variável de ambiente
    } catch (error) {
      console.error(error);
      return { error: "Não foi possível fazer upload de imagem" };
    }
  }

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
            country: profile.local.country,
            complement: profile.local.complement,
            // lat: lat_log.lat,
            // lng: lat_log.lng,
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
      imageName: imageName ? imageName : null,
      imageUrl: imgUrl ? imgUrl : null,
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

  if (!parseProfile.success) return { error: "Invalid data" };
  const profile = parseProfile.data;

  console.log(profile.picture);

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

  // let lat_log;
  // if (profile.activeAddress) {
  //   try {
  //     lat_log = await getLocaleByCep(profile.local.cep);
  //   } catch {
  //     return { error: "Não foi possivel obter a localidade especificada!" };
  //   }
  // }

  let imgUrl: string | undefined;
  let imageName: string | undefined;

  if (profile.picture) {
    try {
      imageName = `${profileExists.id}.${profile.picture.name
        .split(".")
        .pop()}`; // Tratamento do nome da imagem
      console.log(imageName);
      const res = await supabase.storage
        .from("profileImages")
        .upload(imageName, profile.picture, {
          cacheControl: "3600",
          upsert: true,
        });

      console.log(res);

      if (res.error) throw res.error;

      imgUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${res.data.fullPath}`; // Usando variável de ambiente
    } catch (error) {
      console.error(error);
      return { error: "Não foi possível fazer upload de imagem" };
    }
  } else {
    // Verificar se existe imagem no bucket e deletar

    if (profileExists.imageName) {

      const existingImage = `${profileExists.imageName}`;

      try {
        await supabase.storage.from("profileImages").remove([existingImage]);
      } catch (error) {
        console.error("Erro ao deletar imagem existente:", error);
        return { error: "Erro ao deletar imagem existente" };
      }
    }
  }

  try {
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
                country: profile.local.country,
                complement: profile.local.complement,
                // lat: lat_log.lat,
                // lng: lat_log.lng,
              },
              update: {
                cep: profile.local.cep,
                city: profile.local.city,
                neighborhood: profile.local.neighborhood,
                number: profile.local.number,
                street: profile.local.street,
                uf: profile.local.uf,
                country: profile.local.country,
                complement: profile.local.complement,
                // lat: lat_log.lat,
                // lng: lat_log.lng,
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
          upsert: {
            create: {
              description: profile.promotion.description,
              title: profile.promotion.title,
            },
            update: {
              description: profile.promotion.description,
              title: profile.promotion.title,
            },
          },
        },
        resume: profile.resume,
        telephonesPhone: profile.telephones
          .filter((e) => e.type == "phone")
          .map((e) => e.number),
        telephonesWhatsapp: profile.telephones
          .filter((e) => e.type == "whatsapp")
          .map((e) => e.number),

        imageName: imageName ? imageName : null,
        imageUrl: imgUrl ? imgUrl : null,
      },
    });
  } catch (error) {
    // if () {
    //   try {
    //     const existingImage = `profileImages/${user.imageName}`;
    //     await supabase.storage.from("profileImages").remove([existingImage]);
    //   } catch (error) {
    //     console.error("Erro ao deletar imagem existente:", error);
    //     return { error: "Erro ao deletar imagem existente" };
    //   }
    // }
    throw error;
  }

  return { success: "Profile Updated success!" };
}

export async function deleteProfile({ idProfile }: { idProfile: string }) {
  const profileExists = await db.profiles.findUnique({
    where: {
      id: idProfile,
    },
  });
  if (!profileExists) return { error: "Profile not found" };

  if (profileExists.imageName) {
    try {
      const existingImage = `${profileExists.imageName}`;
      await supabase.storage.from("profileImages").remove([existingImage]);
    } catch (error) {
      console.error("Erro ao deletar imagem existente:", error);
      return { error: "Erro ao deletar imagem existente" };
    }
  }

  await db.profiles.delete({
    where: {
      id: idProfile,
    },
  });

  return { success: "Profile Deleted success!" };
}

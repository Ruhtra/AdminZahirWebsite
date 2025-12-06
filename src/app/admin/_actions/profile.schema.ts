import { z } from "zod";

const localSchema = z.object({
  cep: z
    .string()
    .optional()
    .refine(
      (value) =>
        value === undefined || value.length === 0 || value.length === 8,
      {
        message: "CEP deve ter 8 caracteres ou ser deixado em branco",
      }
    ),

  uf: z.string().min(1).optional(),
  country: z.string().min(1),
  city: z
    .string()
    // .min(1, "Cidade é obrigatória")
    .max(100, "Cidade deve ter no máximo 100 caracteres")
    .optional(),
  neighborhood: z
    .string()
    // .min(1, "Bairro é obrigatório")
    .max(100, "Bairro deve ter no máximo 100 caracteres")
    .optional(),
  street: z
    .string()
    // .min(1, "Rua é obrigatória")
    .max(100, "Rua deve ter no máximo 100 caracteres")
    .optional(),
  number: z
    .string()
    // .min(1, "Número é obrigatório")
    .max(10, "Número deve ter no máximo 10 caracteres")
    .optional(),
  complement: z
    .string()
    .max(250, "Complemento deve ter no máximo 250 caracteres")
    .optional(),
});

export const createProfileSchema = z
  .discriminatedUnion("activeAddress", [
    z.object({
      activeAddress: z.literal(true),
      local: localSchema, // Quando ativo, endereço é obrigatório
    }),
    z.object({
      activeAddress: z.literal(false),
    }),
  ])
  .and(
    z.object({
      name: z
        .string()
        .min(1, "Nome é obrigatório")
        .max(100, "Nome deve ter no máximo 100 caracteres"),
      picture: z.optional(
        z
          .instanceof(File)
          .refine(
            (file) => file.size <= 5000000,
            `Tamanho máximo do arquivo é 5MB.`
          )
      ),
      resume: z
        .string()
        .max(500, "Resumo deve ter no máximo 500 caracteres")
        .optional(),
      informations: z
        .string()
        .max(250, "Informações devem ter no máximo 250 caracteres")
        .optional(),
      telephones: z.array(
        z.object({
          type: z.enum(["whatsapp", "phone"]),
          number: z.string().min(1, "Número de telefone é obrigatório"),
        })
      ),
      movie: z
        .string()
        .optional()
        .transform((url) => {
          if (!url || url.trim() === "") return ""; // permite vazio

          let cleanUrl = url.split("?")[0];
          cleanUrl = cleanUrl.replace(/\/$/, "");

          // if (!cleanUrl.endsWith("/embed")) {
          //   cleanUrl += "/embed";
          // }

          return cleanUrl;
        })
        .refine((url) => url === "" || url.endsWith("/embed"), {
          message: "A URL deve terminar com /embed",
        }),

      activePromotion: z.boolean(),
      promotion: z.object({
        title: z
          .string()
          .max(20, "Título da promoção deve ter no máximo 20 caracteres"),
        description: z
          .string()
          .max(250, "Descrição da promoção deve ter no máximo 250 caracteres"),
      }),
      categories: z.array(z.string()),
      type: z.array(z.string()),
    })
  )
  .refine(
    (data) => {
      if (data.activePromotion) {
        return data.promotion.title.length > 0;
      }
      return true;
    },
    {
      message: "Título da promoção é obrigatório quando a promoção está ativa",
      path: ["promotion", "title"],
    }
  )
  .refine(
    (data) => {
      if (data.activePromotion) {
        return data.promotion.description.length > 0;
      }
      return true;
    },
    {
      message:
        "Descrição da promoção é obrigatória quando a promoção está ativa",
      path: ["promotion", "description"],
    }
  );

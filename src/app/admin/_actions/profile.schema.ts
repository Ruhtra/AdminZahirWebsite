import { z } from "zod";

const localSchema = z.object({
  cep: z.string().length(8, "CEP deve ter 8 caracteres"),
  uf: z.enum([
    "AC",
    "AL",
    "AM",
    "AP",
    "BA",
    "CE",
    "DF",
    "ES",
    "GO",
    "MA",
    "MG",
    "MS",
    "MT",
    "PA",
    "PB",
    "PE",
    "PI",
    "PR",
    "RJ",
    "RN",
    "RO",
    "RR",
    "RS",
    "SC",
    "SE",
    "SP",
    "TO",
  ]),
  city: z
    .string()
    .min(1, "Cidade é obrigatória")
    .max(100, "Cidade deve ter no máximo 100 caracteres"),
  neighborhood: z
    .string()
    .min(1, "Bairro é obrigatório")
    .max(100, "Bairro deve ter no máximo 100 caracteres"),
  street: z
    .string()
    .min(1, "Rua é obrigatória")
    .max(100, "Rua deve ter no máximo 100 caracteres"),
  number: z
    .string()
    .min(1, "Número é obrigatório")
    .max(10, "Número deve ter no máximo 10 caracteres"),
  complement: z
    .string()
    .max(250, "Complemento deve ter no máximo 250 caracteres")
    .optional(),
});

export const createProfileSchema = z
  .object({
    name: z
      .string()
      .min(1, "Nome é obrigatório")
      .max(100, "Nome deve ter no máximo 100 caracteres"),
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
    activeAddress: z.boolean(),
    local: z.union([z.object({}).optional(), localSchema]).optional(),
    movie: z.string().optional(),
    activePromotion: z.boolean(),
    promotion: z.object({
      title: z
        .string()
        .max(20, "Título da promoção deve ter no máximo 20 caracteres"),
      description: z
        .string()
        .max(250, "Descrição da promoção deve ter no máximo 250 caracteres"),
    }),
  })
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
  )
  .superRefine((data, ctx) => {
    if (data.activeAddress) {
      if (!data.local || typeof data.local !== "object") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Endereço é obrigatório quando está ativo",
          path: ["local"],
        });
      } else {
        Object.entries(localSchema.shape).forEach(([key, schema]) => {
          const result = schema.safeParse(
            data.local ? data.local[key as keyof typeof data.local] : undefined
          );
          if (!result.success) {
            result.error.issues.forEach((issue) => {
              ctx.addIssue({
                ...issue,
                path: ["local", key],
              });
            });
          }
        });
      }
    }
  });

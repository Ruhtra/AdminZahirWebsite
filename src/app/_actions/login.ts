"use server";
import { z } from "zod";
import { formSchema } from "./login.schema";

export async function login(
  data: z.infer<typeof formSchema>
): Promise<
  | { error: string; success?: undefined }
  | { success: boolean; error?: undefined }
> {
  try {
    const result = formSchema.safeParse(data);
    if (!result.success) {
      return { error: "Dados Inválidos" };
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (
      result.data.email.toLowerCase() ==
      "administrador@2025.com".toLocaleLowerCase()
    ) {
      if (result.data.password == "192837465") return { success: true };
    }
    return { error: "Credenciais inválidas" };
  } catch {
    return { error: "Erro interno, contate o suporte" };
  }
}

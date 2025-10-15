// Mock CEP API for testing
// Replace with your actual CEP lookup implementation

import { getLocalByCep_viacep } from "@/lib/locale"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const cep = searchParams.get("cep")

  if (!cep) {
    return Response.json({ error: "CEP is required" }, { status: 400 })
  }

  const cleanCep = cep.replace(/\D/g, "")

  try {
    const data = await getLocalByCep_viacep(cleanCep);

    return Response.json({
      logradouro: data.logradouro,
      bairro: data.bairro,
      localidade: data.localidade,
      uf: data.uf,
      cep: data.cep,
      pais: "Brasil",
    })

  } catch (error) {
    // Verifica se o erro é específico de CEP não encontrado
    if (error instanceof Error && error.message.includes("Não foi possivel encontrar o cep específicado")) {
      return Response.json({ error: "CEP not found" }, { status: 404 })
    }

    return Response.json({ error: "Error fetching CEP data" }, { status: 500 })
  }
}
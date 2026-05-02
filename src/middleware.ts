import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Lista de origens permitidas
const allowedOrigins = [
  "https://www.sitedozahir.com",
  "https://sitedozahir.com",
  "http://localhost:3000",
  "http://localhost:3001",
];

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin");

  // Se a origem estiver na lista ou for permitida, configuramos os headers
  const isAllowedOrigin = origin && allowedOrigins.includes(origin);

  // Criamos a resposta base
  const response = NextResponse.next();

  if (isAllowedOrigin) {
    response.headers.set("Access-Control-Allow-Origin", origin!);
  } else if (!origin) {
    // Para requisições que não vêm de browser (como ferramentas de teste)
    response.headers.set("Access-Control-Allow-Origin", "*");
  }

  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS,PATCH"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  // Trata a requisição de Preflight (OPTIONS)
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: response.headers,
    });
  }

  return response;
}

// Aplica o middleware apenas para as rotas de API
export const config = {
  matcher: "/api/:path*",
};

"use server";

import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export interface GetAllRecentsDTO {
  _id: string;
}
export async function GET() {
  try {
    const response = {
      _id: "!23",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to fetch texts:", error);
    return NextResponse.json(
      { error: "Failed to fetch texts" },
      { status: 500 }
    );
  }
}

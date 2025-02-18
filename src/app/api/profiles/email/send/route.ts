"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

const getAllFollowersSchema = z.object({
  _id: z.string(),
});

type SendEmailDTO = z.infer<typeof getAllFollowersSchema>;

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const parsedData: SendEmailDTO = getAllFollowersSchema.parse(data);
    const { _id } = parsedData;

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error) {
    console.error("Failed to process POST request:", error);
    return NextResponse.json(
      { error: "Failed to process POST request" },
      { status: 500 }
    );
  }
}

"use server";

import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export interface GetAllFollowersDTO {
  _id: string;
  instagram: number;
  tiktok: number;
  youtube: number;

  total: number;
  createAt: Date;
}
export async function GET() {
  try {
    const follower = await db.followers.findFirst({
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!follower) {
      return NextResponse.json(
        { error: "No followers found" },
        { status: 404 }
      );
    }

    const response: GetAllFollowersDTO = {
      _id: follower.id,
      instagram: follower.instagram,
      tiktok: follower.tiktok,
      youtube: follower.youtube,
      total: follower.total,
      createAt: follower.createdAt,
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

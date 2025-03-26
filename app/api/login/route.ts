import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from '@prisma/extension-accelerate'
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
const prisma = new PrismaClient().$extends(withAccelerate())

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return new Response("Missing required fields", { status: 400 });
    }
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      return new Response("Email or password is not correct", { status: 404 });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return new Response("Email or password is not correct", { status: 400 });
    }
    if (!process.env.JWT_SECRET) {
      return new Response("Internal server error", { status: 500 });
    }
    const token: string = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    return new Response(
      JSON.stringify({ message: "User logged in successfully", token }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.log(err);
    return new Response("Failed to login user", { status: 500 });
  }
}
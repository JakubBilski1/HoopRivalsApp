import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from '@prisma/extension-accelerate'
import bcrypt from "bcrypt";
const prisma = new PrismaClient().$extends(withAccelerate())

export async function POST(request: NextRequest) {
  try {
    const { nickname, email, password } = await request.json();
    console.log(nickname, email, password)
    if (!nickname || !email || !password) {
      return new Response("Missing required fields", { status: 400 });
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return new Response("Invalid email", { status: 400 });
    }
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return new Response(
        "Password must be 8 characters long and contain number, lowercase, uppercase, and special character",
        { status: 400 }
      );
    }
    const hashedPassword: string = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        nickname,
        email,
        password: hashedPassword,
      },
    });
    return new Response("User registered successfully", { status: 201 });
  } catch (err) {
    console.log(err)
    return new Response("Failed to register user", { status: 500 });
  }
}
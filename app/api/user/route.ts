import { Token } from "@/types/User";
import { verifyJWT } from "@/utils/verifyJWT";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import bcrypt from "bcrypt";
import { imageFileToBase64 } from "@/utils/usables";
const prisma = new PrismaClient().$extends(withAccelerate());

export const GET = async (req: NextRequest) => {
  const authorizationHeader = req.headers.get("Authorization");

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return new Response("Unauthorized: No token provided", { status: 401 });
  }

  const token = authorizationHeader.split(" ")[1];
  try {
    const verify = await verifyJWT(token);
    if (verify.status === 200) {
      const decoded = jwt.decode(token) as Token;
      const id = decoded.id;
      const user = await prisma.user.findUnique({
        where: {
          id,
        },
      });
      console.log('userget token', token)
      console.log('userget user', user);
      return new Response(JSON.stringify(user), { status: 200 });
    } else {
      return new Response("Unauthorized", { status: 401 });
    }
  } catch (err) {
    console.log(err);
  }
};

export const PUT = async (req: NextRequest) => {
  const { token, userData } = await req.json();
  const { nickname, email, password, name, surname, avatar } = userData;
  console.log('userData', userData);
  try {
    const verify = await verifyJWT(token);
    if (verify.status === 200) {
      const decoded = jwt.decode(token) as Token;
      const id = decoded.id;
      if (!nickname || !email) {
        return new Response("Missing required fields", { status: 400 });
      }
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        return new Response("Invalid email", { status: 400 });
      }
      // Since the avatar is already a base64 string from the frontend, we use it directly.
      const avatarUrl = avatar ? avatar : null;
      
      if (password) {
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
        if (!passwordRegex.test(password)) {
          return new Response(
            "Password must be 8 characters long and contain number, lowercase, uppercase, and special character",
            { status: 400 }
          );
        }
        const hashedPassword: string = await bcrypt.hash(password, 10);
        const updatedUser = await prisma.user.update({
          where: { id },
          data: {
            nickname,
            email,
            password: hashedPassword,
            name,
            surname,
            avatarUrl,
          },
        });
        return new Response(JSON.stringify(updatedUser), { status: 200 });
      }
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          nickname,
          email,
          name,
          surname,
          avatarUrl,
        },
      });
      return new Response(JSON.stringify(updatedUser), { status: 200 });
    } else {
      return new Response("Unauthorized", { status: 401 });
    }
  } catch (err) {
    console.log(err);
    return new Response("Internal server error", { status: 500 });
  }
};

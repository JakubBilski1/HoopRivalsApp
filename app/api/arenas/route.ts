import { Token } from "@/types/User";
import { verifyJWT } from "@/utils/verifyJWT";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
const prisma = new PrismaClient().$extends(withAccelerate());

async function imageFileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  return base64;
}

export const POST = async (req: NextRequest) => {
  try {
    const formData = await req.formData();

    // Extract the values from FormData
    const token = req.cookies.get("hoop-rivals-auth-token")?.value;
    if (!token) {
      return new Response("Unauthorized: No token provided", { status: 401 });
    }
    const name = formData.get("name")?.toString() || "";
    const location = formData.get("location")?.toString() || "";
    const imageFile = formData.get("image");

    const verify = await verifyJWT(token);
    if (verify.status !== 200) {
      return new Response("Unauthorized", { status: 401 });
    }
    let readyImage = "";
    if (imageFile instanceof File) {
      readyImage = await imageFileToBase64(imageFile);
    }

    await prisma.arena.create({
      data: {
        name,
        location,
        imageUrl: readyImage,
      },
    });

    // Continue processing the rest of the data and respond accordingly
    return new Response(
      JSON.stringify({ message: "Arena added successfully", name, location }),
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return new Response("Error processing request", { status: 500 });
  }
};

export const GET = async (req: NextRequest) => {
  const token = req.cookies.get("hoop-rivals-auth-token")?.value;
  if (!token) {
    return new Response("Unauthorized: No token provided", { status: 401 });
  }
  try {
    const verify = await verifyJWT(token);
    if (verify.status !== 200) {
      return new Response("Unauthorized", { status: 401 });
    }
    const arenas = await prisma.arena.findMany();
    return new Response(JSON.stringify(arenas), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Internal Server Error", { status: 500 });
  }
};

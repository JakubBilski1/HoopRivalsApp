import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET || 'secret'

export const verifyJWT = async (token: string) => {
  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }
  try {
    if (!secret) {
      return new Response("Internal server error", { status: 500 });
    }
    const decoded = jwt.verify(token, secret);
    return new Response(JSON.stringify(decoded), { status: 200 });
  } catch (err) {
    console.log(err)
    return new Response("Unauthorized", { status: 401 });
  }
};
import { NextRequest } from "next/server";

export function GET(
  request: NextRequest,
) {
  return new Response("Not implemented", { status: 501 });
}
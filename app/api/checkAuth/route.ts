import { verifyJWT } from '@/utils/verifyJWT'
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

export const POST = async (req: NextRequest) => {
  const { token } = await req.json()
  try {
    const verify = await verifyJWT(token)
    if(verify.status === 200) {
      return new Response(JSON.stringify(jwt.decode(token)), { status: 200 });
    }else{
        return new Response("Unauthorized", { status: 401 });
    }
  }catch(err) {
    console.log(err)
  }
};
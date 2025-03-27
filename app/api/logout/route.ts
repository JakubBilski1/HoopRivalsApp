import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Wylogowano pomyślnie.' }, { status: 200 });
  response.cookies.set('hoop-rivals-auth-token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });
  return response;
}
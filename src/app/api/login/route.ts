import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    
    // الرقم السري الموحد
    if (password === 'sanwy123') {
      const response = NextResponse.json({ success: true });
      response.cookies.set('servant_auth', 'authenticated', { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      });
      return response;
    }
    
    return NextResponse.json({ success: false, message: 'Invalid password' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

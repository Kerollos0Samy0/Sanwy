import { NextResponse } from 'next/server';

const ADMIN_PASSWORDS = ['admin123', 'admin2026', 'sanwyAdmin', 'sanwyadmin'];
const SERVANT_PASSWORDS = ['sanwy123'];

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    const trimmed = (password || '').trim();

    const envAdmin = process.env.ADMIN_PASSWORD;
    const envServant = process.env.SERVANT_PASSWORD;

    let role: 'admin' | 'servant' | null = null;

    if ((envAdmin && trimmed === envAdmin) || ADMIN_PASSWORDS.includes(trimmed)) {
      role = 'admin';
    } else if ((envServant && trimmed === envServant) || SERVANT_PASSWORDS.includes(trimmed)) {
      role = 'servant';
    }

    if (role) {
      const response = NextResponse.json({ success: true, role });
      
      // Cookie for overall authentication (used by middleware)
      response.cookies.set('servant_auth', 'authenticated', { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      });

      // Cookie for role distinction (admin vs servant)
      response.cookies.set('auth_role', role, { 
        httpOnly: false, 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30,
        path: '/'
      });

      return response;
    }
    
    return NextResponse.json({ success: false, message: 'الرقم السري غير صحيح!' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'تم تسجيل الخروج بنجاح' });
  response.cookies.delete('servant_auth');
  response.cookies.delete('auth_role');
  return response;
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cookieStore = await cookies();
  const auth = cookieStore.get('servant_auth');
  const role = cookieStore.get('auth_role');

  if (auth && auth.value === 'authenticated') {
    return NextResponse.json({
      authenticated: true,
      role: role?.value === 'admin' ? 'admin' : 'servant'
    });
  }

  return NextResponse.json({ authenticated: false, role: null });
}

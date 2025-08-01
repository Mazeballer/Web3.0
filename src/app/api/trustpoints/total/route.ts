import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const FILTER_REASONS = [
  'Lending funds ≥ 30 days',
  'Consistent lending over 3 months',
  'No withdrawal from lending pool ≥ 60 days',
  'Early withdrawal from lending pool',
  'Reliable lending record',
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  if (!email) {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  }

  // find user + trustPoints
  const user = await prisma.user.findUnique({
    where: { email },
    include: { trustPoints: true },
  });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // filter to only our five reasons
  const pts = user.trustPoints
    .filter((tp) => FILTER_REASONS.includes(tp.reason))
    .reduce((sum, tp) => {
      const delta = tp.status === 'punishment' ? -tp.points : tp.points;
      return sum + delta;
    }, 0);

  return NextResponse.json({ totalPoints: pts });
}

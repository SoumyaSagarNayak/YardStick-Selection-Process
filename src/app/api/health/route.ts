import { NextResponse } from 'next/server';
import { corsHeaders, handleCors } from '@/lib/cors';

export async function GET(request: Request) {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  return NextResponse.json(
    { status: 'ok' },
    { headers: corsHeaders() }
  );
}

export async function OPTIONS(request: Request) {
  return handleCors(request);
}
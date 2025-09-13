import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware';
import { supabaseAdmin } from '@/lib/supabase';
import { corsHeaders, handleCors } from '@/lib/cors';

interface RouteParams {
  params: { slug: string };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const user = requireAdmin(request);
    const { slug } = params;

    // Verify the admin belongs to the tenant they're trying to upgrade
    if (user.tenant_slug !== slug) {
      return NextResponse.json(
        { error: 'You can only upgrade your own tenant' },
        { status: 403, headers: corsHeaders() }
      );
    }

    const { data: tenant, error } = await supabaseAdmin
      .from('tenants')
      .update({
        subscription_plan: 'pro',
        updated_at: new Date().toISOString()
      })
      .eq('slug', slug)
      .select('id, slug, name, subscription_plan')
      .single();

    if (error || !tenant) {
      return NextResponse.json(
        { error: 'Tenant not found or upgrade failed' },
        { status: 404, headers: corsHeaders() }
      );
    }

    return NextResponse.json(
      {
        message: 'Tenant upgraded to Pro successfully',
        tenant
      },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Upgrade tenant error:', error);
    let status = 500;
    let message = 'Internal server error';

    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        status = 401;
        message = error.message;
      } else if (error.message === 'Admin access required') {
        status = 403;
        message = error.message;
      }
    }

    return NextResponse.json(
      { error: message },
      { status, headers: corsHeaders() }
    );
  }
}

export async function OPTIONS(request: Request) {
  return handleCors(request);
}
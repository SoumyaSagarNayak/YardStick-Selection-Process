import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { supabaseAdmin } from '@/lib/supabase';
import { corsHeaders, handleCors } from '@/lib/cors';

export async function GET(request: NextRequest) {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const user = requireAuth(request);

    const { data: notes, error } = await supabaseAdmin
      .from('notes')
      .select('id, title, content, created_at, updated_at')
      .eq('tenant_id', user.tenant_id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json(notes || [], { headers: corsHeaders() });
  } catch (error) {
    console.error('Get notes error:', error);
    const status = error instanceof Error && error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status, headers: corsHeaders() }
    );
  }
}

export async function POST(request: NextRequest) {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const user = requireAuth(request);
    const { title, content } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Check subscription limits
    const { data: tenant } = await supabaseAdmin
      .from('tenants')
      .select('subscription_plan')
      .eq('id', user.tenant_id)
      .single();

    if (tenant?.subscription_plan === 'free') {
      const { count } = await supabaseAdmin
        .from('notes')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', user.tenant_id);

      if (count && count >= 3) {
        return NextResponse.json(
          { error: 'Free plan limited to 3 notes. Upgrade to Pro for unlimited notes.' },
          { status: 403, headers: corsHeaders() }
        );
      }
    }

    const { data: note, error } = await supabaseAdmin
      .from('notes')
      .insert({
        tenant_id: user.tenant_id,
        user_id: user.id,
        title,
        content: content || ''
      })
      .select('id, title, content, created_at, updated_at')
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(note, { status: 201, headers: corsHeaders() });
  } catch (error) {
    console.error('Create note error:', error);
    const status = error instanceof Error && error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status, headers: corsHeaders() }
    );
  }
}

export async function OPTIONS(request: Request) {
  return handleCors(request);
}
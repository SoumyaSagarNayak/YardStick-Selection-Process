import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { supabaseAdmin } from '@/lib/supabase';
import { corsHeaders, handleCors } from '@/lib/cors';

interface RouteParams {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const user = requireAuth(request);
    const { id } = params;

    const { data: note, error } = await supabaseAdmin
      .from('notes')
      .select('id, title, content, created_at, updated_at')
      .eq('id', id)
      .eq('tenant_id', user.tenant_id)
      .single();

    if (error || !note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404, headers: corsHeaders() }
      );
    }

    return NextResponse.json(note, { headers: corsHeaders() });
  } catch (error) {
    console.error('Get note error:', error);
    const status = error instanceof Error && error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status, headers: corsHeaders() }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const user = requireAuth(request);
    const { id } = params;
    const { title, content } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const { data: note, error } = await supabaseAdmin
      .from('notes')
      .update({
        title,
        content: content || '',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('tenant_id', user.tenant_id)
      .select('id, title, content, created_at, updated_at')
      .single();

    if (error || !note) {
      return NextResponse.json(
        { error: 'Note not found or update failed' },
        { status: 404, headers: corsHeaders() }
      );
    }

    return NextResponse.json(note, { headers: corsHeaders() });
  } catch (error) {
    console.error('Update note error:', error);
    const status = error instanceof Error && error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status, headers: corsHeaders() }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const user = requireAuth(request);
    const { id } = params;

    const { error } = await supabaseAdmin
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('tenant_id', user.tenant_id);

    if (error) {
      return NextResponse.json(
        { error: 'Note not found or delete failed' },
        { status: 404, headers: corsHeaders() }
      );
    }

    return NextResponse.json(
      { message: 'Note deleted successfully' },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Delete note error:', error);
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
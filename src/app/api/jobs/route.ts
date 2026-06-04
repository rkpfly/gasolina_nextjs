import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/database/db';

// Helper to simulate future middleware auth
// Middleware will eventually set this header if the user is a verified admin
const checkIsAdmin = (req: NextRequest) => req.headers.get('x-admin-role') === 'true';

// ─── GET: Fetch Jobs with Pagination ─────────────────────────────────────────

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  
  // Pagination params
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.max(1, parseInt(searchParams.get('limit') || '10', 10));
  const offset = (page - 1) * limit;

  // Check auth
  const isAdmin = checkIsAdmin(req);

  try {
    let jobs, totalCountRes;

    // Users only see 'active' jobs. Admins see everything.
    if (isAdmin) {
      jobs = await pool.query(
        `
        SELECT * FROM jobs
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
        `,
        [limit, offset]
      );
      totalCountRes = await pool.query(`SELECT COUNT(*) FROM jobs`);
    } else {
      jobs = await pool.query(
        `
        SELECT * FROM jobs 
        WHERE status = 'active' 
        ORDER BY created_at DESC 
        LIMIT $1 OFFSET $2
        `,
        [limit, offset]
      );
      totalCountRes = await pool.query(`SELECT COUNT(*) FROM jobs WHERE status = 'active'`);
    }

    const totalCount = parseInt(totalCountRes.rows[0].count, 10);

    return NextResponse.json({
      data: jobs.rows,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      }
    });
  } catch (err) {
    console.error('[GET /api/jobs]', err);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

// ─── POST: Create a New Job ──────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!checkIsAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    
    // Wrap the TipTap HTML string in a JSON object
    const jsonContent = JSON.stringify({ html: body.content });

    const result = await pool.query(
      `
      INSERT INTO jobs (
        slug,
        designation,
        department,
        experience_min,
        experience_max,
        experience_label,
        employment_type,
        location,
        content,
        status,
        open_date,
        closing_date
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,$11,$12
      )
      RETURNING *;
      `,
      [
        body.slug,
        body.designation,
        body.department,
        body.experience_min || 0,
        body.experience_max || 0,
        body.experience_label,
        body.employment_type || 'full_time',
        body.location,
        jsonContent,
        body.status || 'draft',
        body.open_date || null,
        body.closing_date || null,
      ]
    );

    return NextResponse.json(result.rows[0], {
      status: 201,
    });
  } catch (err: any) {
    console.error('[POST /api/jobs]', err);
    if (err.code === '23505') return NextResponse.json({ error: 'Job slug must be unique' }, { status: 409 });
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}

// ─── PATCH: Update an Existing Job ───────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  if (!checkIsAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { job_id, ...updates } = body;

    if (!job_id) return NextResponse.json({ error: 'job_id is required' }, { status: 400 });

    // Pre-format the content if it's being updated
    const jsonContent = updates.content ? JSON.stringify({ html: updates.content }) : null;

    const result = await pool.query(
      `
      UPDATE jobs SET
        slug = COALESCE($1, slug),
        designation = COALESCE($2, designation),
        department = COALESCE($3, department),
        experience_min = COALESCE($4, experience_min),
        experience_max = COALESCE($5, experience_max),
        experience_label = COALESCE($6, experience_label),
        employment_type = COALESCE($7, employment_type),
        location = COALESCE($8, location),
        content = COALESCE($9::jsonb, content),
        status = COALESCE($10, status),
        open_date = COALESCE($11, open_date),
        closing_date = COALESCE($12, closing_date),
        updated_at = CURRENT_TIMESTAMP
      WHERE job_id = $13
      RETURNING *;
      `,
      [
        updates.slug ?? null,
        updates.designation ?? null,
        updates.department ?? null,
        updates.experience_min ?? null,
        updates.experience_max ?? null,
        updates.experience_label ?? null,
        updates.employment_type ?? null,
        updates.location ?? null,
        jsonContent,
        updates.status ?? null,
        updates.open_date ?? null,
        updates.closing_date ?? null,
        job_id,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    console.error('[PATCH /api/jobs]', err);
    if (err.code === '23505') return NextResponse.json({ error: 'Job slug must be unique' }, { status: 409 });
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
  }
}
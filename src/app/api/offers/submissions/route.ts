import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/db';
import { uploadToCRM } from '@/lib/crm/upload';
import { pushLeadToZoho } from '@/lib/zoho';

const MAX_PROOF_SIZE = 8 * 1024 * 1024; // 8MB
const ALLOWED_PROOF_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'];

// ─── POST: Store a submission for a fixed offer (birthday, hens, ...) ──────────
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const offer_key = formData.get('offer_key') as string | null;
    const name = formData.get('name') as string | null;
    const email = formData.get('email') as string | null;
    const phone = formData.get('phone') as string | null;

    if (!offer_key || !name || !email || !phone) {
      return NextResponse.json(
        { error: 'offer_key, name, email and phone are required' },
        { status: 400 }
      );
    }

    // ── Proof of birthday (or any offer-specific media) — OPTIONAL ───────────
    // When no file is attached, proofUrl stays null and is stored as
    // payload.proof_url = null. Validation below only applies if a file IS sent.
    const proofFile = formData.get('proofFile') as File | null;
    let proofUrl: string | null = null;

    if (proofFile && proofFile.size > 0) {
      if (proofFile.size > MAX_PROOF_SIZE) {
        return NextResponse.json({ error: 'Proof file must be under 8MB' }, { status: 400 });
      }
      if (!ALLOWED_PROOF_TYPES.includes(proofFile.type)) {
        return NextResponse.json(
          { error: 'Proof must be an image (JPG, PNG, WEBP, HEIC) or PDF' },
          { status: 400 }
        );
      }
      try {
        proofUrl = await uploadToCRM(proofFile, `offer-submissions/${offer_key}`);
      } catch (uploadError: any) {
        return NextResponse.json({ error: uploadError.message }, { status: 502 });
      }
    }

    // ── Full submission payload (kept flexible so other offers can reuse it) ─
    const payload: Record<string, any> = {
      name,
      email,
      phone,
      dob: (formData.get('dob') as string) || null,
      gender: (formData.get('gender') as string) || null,
      celebration_date: (formData.get('celebration_date') as string) || null,
      group_size: (formData.get('group_size') as string) || null,
      booth_interest: (formData.get('booth_interest') as string) || null,
      proof_url: proofUrl,
      source_url: (formData.get('source_url') as string) || null,
    };

    const sql = `
      INSERT INTO offer_submissions (offer_key, email, phone, payload)
      VALUES ($1, $2, $3, $4)
      RETURNING id, submitted_at;
    `;
    const result = await query(sql, [offer_key, email, phone, JSON.stringify(payload)]);

    // Best-effort push to Zoho CRM as a Lead (no-op if not configured).
    await pushLeadToZoho({
      lastName: name,
      email,
      phone,
      leadSource: `Offer: ${offer_key}`,
      description: [
        `Offer: ${offer_key}`,
        payload.dob ? `DOB: ${payload.dob}` : null,
        payload.gender ? `Gender: ${payload.gender}` : null,
        payload.celebration_date ? `Celebration: ${payload.celebration_date}` : null,
        payload.source_url ? `Source: ${payload.source_url}` : null,
      ].filter(Boolean).join(' | '),
    });

    return NextResponse.json({ success: true, ...result.rows[0] });
  } catch (error) {
    console.error('[POST /api/offers/submissions]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Request failed' },
      { status: 500 }
    );
  }
}

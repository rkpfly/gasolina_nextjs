import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// Ensure you add EXPRESS_API_URL to your Next.js .env file
// e.g., EXPRESS_API_URL=https://147.79.70.30.nip.io:8990/api/job-applications
const EXPRESS_UPLOAD_URL = `${process.env.EXPRESS_API_URL || 'https://147.79.70.30.nip.io:8990/api/job-applications'}`;

export async function POST(req: NextRequest) {
  try {
    // 1. Parse the incoming form data from the frontend
    const formData = await req.formData();
    
    const jobId = formData.get('jobId') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string || '';
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const resumeFile = formData.get('resume') as File;

    if (!jobId || !firstName || !email || !phone || !resumeFile) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 2. Prepare data to forward to your Express VPS
    const expressFormData = new FormData();
    expressFormData.append('resume', resumeFile);
    expressFormData.append('jobId', jobId);

    // 3. Send file to Express Server
    const uploadRes = await fetch(`${EXPRESS_UPLOAD_URL}/upload?jobId=${jobId}`, {
        method: 'POST',
        body: expressFormData,
    });

    if (!uploadRes.ok) {
      const errorData = await uploadRes.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to upload resume to media server');
    }

    const uploadData = await uploadRes.json();
    const resumeUrl = uploadData.resume.url;

    // 4. Save the complete record to Neon DB
    // Schema-qualified: Neon HTTP driver is stateless, so we can't pin
    // search_path per-connection. This clone writes to the "gasolina" schema.
    const result = await sql`
      INSERT INTO gasolina.job_applications (
        job_id, first_name, last_name, email, phone, resume_url
      ) VALUES (
        ${parseInt(jobId, 10)}, ${firstName}, ${lastName}, ${email}, ${phone}, ${resumeUrl}
      )
      RETURNING id;
    `;

    return NextResponse.json({ 
      success: true, 
      applicationId: result[0].id,
      message: 'Application submitted successfully' 
    });

  } catch (error: any) {
    console.error('[POST /api/applications]', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' }, 
      { status: 500 }
    );
  }
}
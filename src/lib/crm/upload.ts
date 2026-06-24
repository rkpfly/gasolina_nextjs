import 'server-only';

// Forwards a file to the CRM media backend and returns its public URL.
// Mirrors the upload forwarding in /api/admin/upload (same CRM_API_URL / secret).
const CRM_UPLOAD_URL = process.env.CRM_API_URL
  ? `${process.env.CRM_API_URL}/api/media`
  : 'http://localhost:9000/api/media';

/**
 * Upload `file` under `folder` (e.g. "offer-submissions/birthday").
 * Throws on failure so callers can surface a 502 — never returns an empty URL.
 */
export async function uploadToCRM(file: File, folder = 'uploads'): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  form.append('folder', folder);

  const res = await fetch(CRM_UPLOAD_URL, {
    method: 'POST',
    body: form,
    headers: {
      // Forward auth to the CRM backend if configured
      ...(process.env.CRM_API_SECRET && {
        Authorization: `Bearer ${process.env.CRM_API_SECRET}`,
      }),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `CRM upload failed (${res.status})`);
  }

  const data = await res.json().catch(() => ({}));
  const url = data.file?.url ?? data.url ?? null;
  if (!url) throw new Error('CRM did not return a file URL');
  return url;
}

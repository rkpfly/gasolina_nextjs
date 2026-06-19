/**
 * Seed script — inserts "Birthday" and "Hens" offers into the offers table.
 *
 * Run from the client/ directory:
 *   node --env-file=.env.local scripts/seed-offers.mjs
 *
 * Safe to re-run: rows are matched on the unique `slug` and skipped if they
 * already exist (ON CONFLICT (slug) DO NOTHING).
 */
import pg from 'pg';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('✖ DATABASE_URL is not set. Run with: node --env-file=.env.local scripts/seed-offers.mjs');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

// ─── Tiptap document helpers (matches what the admin rich-text editor stores) ──
const text = (value, marks) => (marks ? { type: 'text', text: value, marks } : { type: 'text', text: value });
const bold = [{ type: 'bold' }];
const paragraph = (...children) => ({ type: 'paragraph', content: children.length ? children : undefined });
const heading = (level, value) => ({ type: 'heading', attrs: { level }, content: [text(value)] });
const listItem = (value) => ({ type: 'listItem', content: [paragraph(text(value))] });
const bulletList = (items) => ({ type: 'bulletList', content: items.map(listItem) });
const orderedList = (items) => ({ type: 'orderedList', content: items.map(listItem) });
const doc = (...content) => JSON.stringify({ type: 'doc', content });

// One year out — gives the offers a sensible default shelf life.
const EXPIRY = '2026-12-31T23:59:59.000Z';
const START = new Date().toISOString();

// ─── Offer definitions ─────────────────────────────────────────────────────────
const offers = [
  {
    slug: 'birthday-bash',
    offer_title: 'Birthday Bash Package',
    short_description:
      'Celebrate your birthday on the Dami Club floor — free entry for the birthday star, a reserved booth for the crew, and a bottle on the house for groups of 10+.',
    thumbnail_url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=1200&auto=format&fit=crop',
    category: 'Birthday',
    offer_type: 'Access',
    offer_code: 'DAMIBDAY',
    is_active: true,
    is_featured: true,
    priority: 5,
    tags: ['birthday', 'celebration', 'booths', 'groups'],
    seo: {
      title: 'Birthday Parties at Dami Club | Melbourne',
      description:
        'Throw your birthday party at Dami Club. Free birthday entry, reserved booths and a complimentary bottle for groups of 10+. Every Friday at The Loft.',
    },
    description: doc(
      paragraph(
        text('Make it a night to remember. '),
        text('Bring your people to Dami Club', bold),
        text(' and we will roll out the lime carpet for the birthday star — reserved space on the floor, priority entry, and a vibe built for celebrating.')
      ),
      paragraph(text('What you get:', bold)),
      bulletList([
        'Free entry for the birthday guest of honour',
        'A reserved booth / area for your group',
        'A complimentary bottle on the house for groups of 10 or more',
        'Priority door access — skip the general line',
        'A birthday shout-out from the booth',
      ])
    ),
    how_to_redeem: doc(
      orderedList([
        'Reserve at least 48 hours ahead via the Request VIP form or DM us on Instagram.',
        'Quote the code DAMIBDAY and your birthday date.',
        'Bring valid ID for the birthday guest — entry perk applies to them.',
        'Roll up on the night and check in with the host at the door.',
      ])
    ),
    terms_and_conditions: doc(
      bulletList([
        'Valid on Friday Dami Club nights only, subject to availability.',
        'Complimentary bottle requires a minimum group of 10 paying guests.',
        'Birthday must fall within 7 days of the booked night.',
        'Standard venue entry conditions, dress code and 18+ ID checks apply.',
        'Management reserves the right to vary or withdraw this offer at any time.',
      ])
    ),
  },
  {
    slug: 'hens-night',
    offer_title: 'Hens Night Out',
    short_description:
      'Send her off in style. Skip-the-line entry for the hens party, a reserved area, and a welcome bottle of bubbles for groups of 8+.',
    thumbnail_url: 'https://images.unsplash.com/photo-1496843916299-590492c751f4?q=80&w=1200&auto=format&fit=crop',
    category: 'Hens',
    offer_type: 'Access',
    offer_code: 'DAMIHENS',
    is_active: true,
    is_featured: false,
    priority: 4,
    tags: ['hens', 'celebration', 'girls-night', 'bubbles'],
    seo: {
      title: 'Hens Nights at Dami Club | Melbourne',
      description:
        'Plan the hens party at Dami Club. Skip-the-line entry, a reserved area and a welcome bottle of bubbles for groups of 8+. Every Friday at The Loft.',
    },
    description: doc(
      paragraph(
        text('The last night of freedom, done properly. '),
        text('Dami Club has the hens covered', bold),
        text(' with a reserved spot, bubbles on arrival, and a dance floor that does not stop.')
      ),
      paragraph(text('What you get:', bold)),
      bulletList([
        'Skip-the-line entry for the whole hens party',
        'A reserved area to base the celebration',
        'A welcome bottle of bubbles for groups of 8 or more',
        'A dedicated host to get you settled',
        'A floor of Nepali bangers, R&B and hip hop all night',
      ])
    ),
    how_to_redeem: doc(
      orderedList([
        'Book at least 48 hours ahead via the Request VIP form or DM us on Instagram.',
        'Quote the code DAMIHENS and your group size.',
        'Arrive together and check in with the host at the door.',
        'Show valid 18+ ID for every guest.',
      ])
    ),
    terms_and_conditions: doc(
      bulletList([
        'Valid on Friday Dami Club nights only, subject to availability.',
        'Welcome bubbles require a minimum group of 8 paying guests.',
        'Reserved area held until 11:00 PM unless arranged otherwise.',
        'Standard venue entry conditions, dress code and 18+ ID checks apply.',
        'Management reserves the right to vary or withdraw this offer at any time.',
      ])
    ),
  },
];

// Column order mirrors the admin POST /api/admin/offers insert exactly.
const INSERT_SQL = `
  INSERT INTO offers (
    thumbnail_url, offer_title, short_description, expiry_date, start_date,
    offer_code, description, how_to_redeem, terms_and_conditions, offer_type,
    is_active, is_featured, category, tags, sponsor_name, sponsor_logo_url,
    sponsor_website, background_color, text_color, priority, max_redemptions,
    redemption_limit_per_user, external_link, slug, seo
  ) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
    $17, $18, $19, $20, $21, $22, $23, $24, $25
  )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id, slug, offer_title;
`;

async function seed() {
  let inserted = 0;
  let skipped = 0;

  for (const o of offers) {
    const values = [
      o.thumbnail_url,            // $1  thumbnail_url
      o.offer_title,              // $2  offer_title
      o.short_description,        // $3  short_description
      EXPIRY,                     // $4  expiry_date
      START,                      // $5  start_date
      o.offer_code,               // $6  offer_code
      o.description,              // $7  description (Tiptap JSON string)
      o.how_to_redeem,            // $8  how_to_redeem
      o.terms_and_conditions,     // $9  terms_and_conditions
      o.offer_type,               // $10 offer_type
      o.is_active,                // $11 is_active
      o.is_featured,              // $12 is_featured
      o.category,                 // $13 category
      o.tags,                     // $14 tags (text[])
      null,                       // $15 sponsor_name
      null,                       // $16 sponsor_logo_url
      null,                       // $17 sponsor_website
      null,                       // $18 background_color
      null,                       // $19 text_color
      o.priority,                 // $20 priority
      null,                       // $21 max_redemptions
      1,                          // $22 redemption_limit_per_user
      null,                       // $23 external_link
      o.slug,                     // $24 slug
      JSON.stringify(o.seo),      // $25 seo (jsonb)
    ];

    const result = await pool.query(INSERT_SQL, values);
    if (result.rowCount > 0) {
      inserted++;
      console.log(`✔ inserted  ${result.rows[0].slug.padEnd(16)} (${result.rows[0].offer_title})`);
    } else {
      skipped++;
      console.log(`• skipped   ${o.slug.padEnd(16)} (already exists)`);
    }
  }

  console.log(`\nDone — ${inserted} inserted, ${skipped} skipped.`);
}

seed()
  .catch((err) => {
    console.error('✖ Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());

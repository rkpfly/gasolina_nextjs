import { query } from '@/lib/database/db';
import { notFound } from 'next/navigation';
import BackButton from './BackButton';
import BlogContent from './BlogContent';

// Revalidate the page cache every 60 seconds
export const revalidate = 60;

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const { rows } = await query(
        'SELECT * FROM blog_posts WHERE slug = $1 AND published = true',
        [slug]
    );

    if (rows.length === 0) {
        notFound();
    }

    const post = rows[0];

    const formattedDate = new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
        month: 'long',
        day: '2-digit',
        year: 'numeric',
    });

    return (
        <main className="w-full bg-brand-white min-h-screen">

            {/* HERO SECTION */}
            <section className="relative w-full h-[16svh] min-h-[400px] bg-brand-black">
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/40 to-transparent"></div>

                <div className="absolute inset-0 flex flex-col justify-end items-center text-center p-8 md:p-16 z-20 max-w-5xl mx-auto">
                    <div className="flex gap-3 mb-6">
                        {post.tags?.map((tag: string) => (
                            <span key={tag} className="bg-brand-accent text-brand-white px-4 py-1.5 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] rounded-full shadow-lg">
                                {tag}
                            </span>
                        ))}
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl leading-[1.1] font-display font-extrabold uppercase tracking-tighter text-brand-white mb-6">
                        {post.title}
                    </h1>

                    <div className="flex items-center gap-4 text-xs font-bold tracking-[0.2em] uppercase text-brand-white/80">
                        <span>{formattedDate}</span>
                        {post.author && (
                            <>
                                <span>•</span>
                                <span>By {post.author}</span>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* ARTICLE CONTENT SECTION */}
            <section className="py-20 px-6 md:px-12 bg-brand-white">
                <div className="max-w-3xl mx-auto">

                    {post.excerpt && (
                        <p className="text-xl md:text-2xl font-medium text-brand-gray leading-relaxed mb-12 pb-12 border-b border-brand-border">
                            {post.excerpt}
                        </p>
                    )}

                    {/* BlogContent handles TipTap (needs browser APIs) — kept client-side */}
                    <BlogContent content={post.content} />
                </div>
            </section>

            {/* BACK TO JOURNAL CTA */}
            <section className="py-20 border-t border-brand-border bg-brand-offwhite text-center">
                <BackButton />
            </section>

        </main>
    );
}
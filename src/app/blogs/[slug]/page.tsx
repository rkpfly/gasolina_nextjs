import { query } from '@/lib/database/db';
import { notFound } from 'next/navigation';
import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import BackButton from './BackButton';

// Revalidate the page cache every 60 seconds
export const revalidate = 60; 

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // 1. Fetch the specific post from the database using the slug
    const { rows } = await query(
        'SELECT * FROM blog_posts WHERE slug = $1 AND published = true',
        [slug]
    );

    // 2. If no post is found, trigger Next.js 404 page
    if (rows.length === 0) {
        notFound();
    }

    const post = rows[0];

    // 3. Convert TipTap JSON to HTML securely on the server
    // We pass the exact extensions you used in your Admin Editor so it renders perfectly
    const htmlContent = post.content ? generateHTML(post.content, [
        StarterKit,
        Image,
        Link,
        Underline,
        TextAlign.configure({ types: ['heading', 'paragraph'] })
    ]) : '';

    // 4. Format the publication date
    const formattedDate = new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
        month: 'long', 
        day: '2-digit', 
        year: 'numeric'
    });

    return (
        <main className="w-full bg-brand-white min-h-screen">
            
            {/* HERO SECTION */}
            <section className="relative w-full h-[16svh] min-h-[400px] bg-brand-black">
                {/* {post.cover_image && (
                    <img 
                        src={post.cover_image} 
                        alt={post.title} 
                        className="absolute inset-0 w-full h-full object-cover filter grayscale-[20%] opacity-70"
                    />
                )} */}
                {/* Cinematic Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/40 to-transparent"></div>
                
                {/* Title Container */}
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
                    
                    {/* Excerpt/Lead Paragraph */}
                    {post.excerpt && (
                        <p className="text-xl md:text-2xl font-medium text-brand-gray leading-relaxed mb-12 pb-12 border-b border-brand-border">
                            {post.excerpt}
                        </p>
                    )}

                    {/* Rich Text Body */}
                    {/* We use Tailwind arbitrary variants ([&>element]) to style the raw HTML injected by TipTap without needing external CSS files */}
                    <div 
                        className="
                            text-brand-black text-base md:text-lg leading-relaxed
                            [&>p]:mb-6 [&>p]:text-brand-gray
                            [&>h1]:text-4xl [&>h1]:font-display [&>h1]:font-bold [&>h1]:uppercase [&>h1]:tracking-tighter [&>h1]:mt-12 [&>h1]:mb-6
                            [&>h2]:text-3xl [&>h2]:font-display [&>h2]:font-bold [&>h2]:uppercase [&>h2]:tracking-tighter [&>h2]:mt-10 [&>h2]:mb-4
                            [&>h3]:text-2xl [&>h3]:font-display [&>h3]:font-bold [&>h3]:uppercase [&>h3]:tracking-tighter [&>h3]:mt-8 [&>h3]:mb-4
                            [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-6 [&>ul>li]:mb-2 [&>ul>li]:text-brand-gray
                            [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-6 [&>ol>li]:mb-2 [&>ol>li]:text-brand-gray
                            [&>blockquote]:border-l-4 [&>blockquote]:border-brand-accent [&>blockquote]:pl-6 [&>blockquote]:italic [&>blockquote]:text-xl [&>blockquote]:my-8
                            [&>img]:w-full [&>img]:rounded-xl [&>img]:my-10
                            [&>a]:text-brand-accent [&>a]:underline [&>a]:underline-offset-4 hover:[&>a]:text-brand-black
                            
                            {/* NEW: Code Block Styling */}
                            [&>pre]:bg-gray-100 [&>pre]:p-4 [&>pre]:rounded-xl [&>pre]:overflow-x-auto [&>pre]:my-6
                            [&>pre>code]:bg-transparent [&>pre>code]:p-0 [&>pre>code]:text-sm [&>pre>code]:font-mono [&>pre>code]:text-brand-black
                            [&>p>code]:bg-gray-100 [&>p>code]:px-1.5 [&>p>code]:py-0.5 [&>p>code]:rounded-md [&>p>code]:font-mono [&>p>code]:text-sm
                        "
                        dangerouslySetInnerHTML={{ __html: htmlContent }}
                    />
                </div>
            </section>

            {/* BACK TO JOURNAL CTA */}
            <section className="py-20 border-t border-brand-border bg-brand-offwhite text-center">
                <BackButton />
            </section>

        </main>
    );
}
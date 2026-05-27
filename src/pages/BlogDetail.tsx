import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, ArrowLeft, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useBlog } from "@/hooks/useBlogs";
import { Helmet } from "react-helmet-async";
import { SITE_NAME, SITE_ORIGIN, absoluteUrl, truncateMetaDescription, truncateTitle } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import { buildBlogPostingJsonLd, buildBreadcrumbJsonLdFromTrail } from "@/lib/schema";

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: post, isLoading } = useBlog(id);

  useEffect(() => {
    if (!isLoading && id && !post) navigate("/blog");
  }, [id, post, isLoading, navigate]);

  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </PageTransition>
    );
  }

  if (!post) return null;

  const pageUrl = `${SITE_ORIGIN}/blog/${post.id}`;
  const pageTitle = truncateTitle(`${post.title} | ${SITE_NAME}`);
  const metaDescription = truncateMetaDescription(post.excerpt);
  const ogImage = absoluteUrl(post.image);
  const articleLd = buildBlogPostingJsonLd({
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
    image: ogImage,
    date: post.date,
    category: post.category,
    readTime: post.readTime,
  });
  const breadcrumbLd = buildBreadcrumbJsonLdFromTrail([
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: post.title, path: `/blog/${post.id}` },
  ]);

  return (
    <PageTransition>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={`${post.category}, safari, Kenya, Tanzania, Uganda, Rwanda, East Africa tourism`} />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={pageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={ogImage} />
        <link rel="canonical" href={pageUrl} />
      </Helmet>
      <JsonLd data={[articleLd, breadcrumbLd]} />
      <div className="min-h-screen">
        <Navbar />
        <main>
          <section className="relative pt-32 pb-20 bg-white text-foreground">
            <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
              <button
                className="flex items-center gap-2 text-accent font-semibold mb-6 hover:underline"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <div className="max-w-3xl mx-auto bg-white">
                <img src={post.image} alt={post.title} className="w-full rounded-3xl mb-6 object-cover max-h-[520px]" />
                <div className="flex items-center gap-3 text-xs mb-2 text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {post.date}
                  </span>
                  {post.readTime && <span>{post.readTime}</span>}
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-4">{post.title}</h1>
                <p className="text-lg text-muted-foreground mb-8">{post.excerpt}</p>
                <div
                  className="prose prose-lg max-w-none text-foreground prose-headings:font-playfair prose-headings:text-primary prose-a:text-accent prose-p:leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default BlogDetail;

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import { Link } from "react-router-dom";
import { Calendar, ArrowRight } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useBlogs } from "@/hooks/useBlogs";
import PageHero from "@/components/layout/PageHero";
import { Skeleton } from "@/components/ui/skeleton";

const Blog = () => {
  const { ref, isVisible } = useScrollAnimation();
  const { data: posts = [], isLoading } = useBlogs();

  // Skeleton loader for blog cards
  const BlogSkeleton = () => (
    <div className="bg-card rounded-2xl overflow-hidden border border-border">
      <div className="aspect-video">
        <Skeleton className="w-full h-full" />
      </div>
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );

  return (
    <PageTransition>
      <div className="min-h-screen">
        <Navbar />
        <main>
          <PageHero
            eyebrow="Our Blog"
            title="News & Stories"
            description="Travel tips, safari stories, and the latest news from Tambua Africa."
            imageSrc="/images/game drives.webp"
            imageAlt="Kenya safari game drive"
          />

          <section className="section-padding bg-background" ref={ref}>
            <div className="container-wide mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                  <>
                    <BlogSkeleton />
                    <BlogSkeleton />
                    <BlogSkeleton />
                  </>
                ) : posts.length === 0 ? (
                  <p className="col-span-full text-center text-muted-foreground py-16">
                    No blog posts are published yet.
                  </p>
                ) : (
                  posts.map((post, index) => (
                    <article
                      key={post.id}
                      className={`group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-lg transition-all duration-500 ${
                        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                      }`}
                      style={{ transitionDelay: `${index * 100}ms` }}
                    >
                      <div className="relative aspect-video overflow-hidden">
                        <Link to={`/blog/${post.id}`}>
                          <OptimizedImage
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </Link>
                      </div>
                      <div className="p-5 space-y-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {post.date}
                          </div>
                          <span>{post.readTime}</span>
                        </div>
                        <h3 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors leading-snug">
                          {post.title}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {post.excerpt}
                        </p>
                        <Link to={`/blog/${post.id}`} className="flex items-center gap-1 text-sm font-semibold text-accent hover:gap-2 transition-all">
                          Read More <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Blog;

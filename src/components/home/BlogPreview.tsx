import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useBlogs } from "@/hooks/useBlogs";

const BlogPreview = () => {
  const { ref, isVisible } = useScrollAnimation();
  const { data: posts = [] } = useBlogs();

  return (
    <section className="section-padding bg-background" ref={ref}>
      <div className="container-wide mx-auto">
        <div className="text-center mb-12">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">Our Blog</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-2">Latest News & Stories</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
          {posts.map((post, index) => (
            <article
              key={post.id}
              className={`group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-lg transition-all duration-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  {post.date}
                </div>
                <h3 className="font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                  {post.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{post.excerpt}</p>
                <Link
                  to={`/blog/${post.id}`}
                  className="flex items-center gap-1 text-sm font-semibold text-accent hover:gap-2 transition-all"
                >
                  Read More <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogPreview;

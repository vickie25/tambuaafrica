import { useState } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { testimonials } from "@/data/testimonials";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import SectionHeader from "@/components/layout/SectionHeader";

const TestimonialsSection = () => {
  const [current, setCurrent] = useState(0);
  const { ref, isVisible } = useScrollAnimation();

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  const t = testimonials[current];
  const initials = t.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <section className="section-padding section-alt" ref={ref}>
      <div className="container-wide mx-auto">
        <SectionHeader eyebrow="Testimonials" title="What Our Clients Say" />

        <div
          className={`max-w-3xl mx-auto text-center transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <Quote className="w-12 h-12 text-accent/30 mx-auto mb-6" />
          <p className="text-lg sm:text-xl text-foreground leading-relaxed mb-8 min-h-[100px]">
            "{t.quote}"
          </p>
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center bg-accent/10 border-2 border-accent text-accent font-bold text-xl select-none">
              {t.avatar ? (
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = "none";
                    const fallback = target.nextElementSibling as HTMLSpanElement | null;
                    if (fallback) fallback.style.display = "flex";
                  }}
                />
              ) : null}
              <span
                className="w-full h-full items-center justify-center"
                style={{ display: t.avatar ? "none" : "flex" }}
              >
                {initials}
              </span>
            </div>
            <div className="text-left">
              <div className="font-bold text-foreground">{t.name}</div>
              <div className="text-sm text-muted-foreground">{t.title}</div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-1 mb-8">
            {Array.from({ length: t.rating }).map((_, i) => (
              <Star key={i} className="w-5 h-5 text-accent fill-current" />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    i === current ? "bg-accent" : "bg-border"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

import type { ReactNode } from "react";
import OptimizedImage from "@/components/ui/optimized-image";

export type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  imageSrc: string;
  imageAlt: string;
  fallbackSrc?: string;
  align?: "center" | "left";
  breadcrumb?: ReactNode;
  children?: ReactNode;
};

const PageHero = ({
  eyebrow,
  title,
  description,
  imageSrc,
  imageAlt,
  fallbackSrc,
  align = "center",
  breadcrumb,
  children,
}: PageHeroProps) => {
  const isCenter = align === "center";

  return (
    <section className="page-hero relative overflow-hidden bg-primary text-primary-foreground">
      <div className="absolute inset-0 z-0">
        <OptimizedImage
          src={imageSrc}
          fallbackSrc={fallbackSrc}
          alt={imageAlt}
          className="h-full w-full object-cover"
          priority
          width={1920}
          height={900}
          quality={80}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/75 via-primary/85 to-primary" aria-hidden />
      </div>

      <div
        className={`container-wide relative z-10 mx-auto px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-32 lg:px-8 lg:pb-24 lg:pt-36 ${
          isCenter ? "max-w-3xl text-center" : "max-w-4xl text-left"
        }`}
      >
        {breadcrumb ? <div className="mb-4 text-sm text-primary-foreground/80">{breadcrumb}</div> : null}
        {eyebrow ? <p className="eyebrow text-accent">{eyebrow}</p> : null}
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        {description ? (
          <p
            className={`mt-4 text-lg leading-relaxed text-primary-foreground/85 text-pretty sm:text-xl ${
              isCenter ? "mx-auto" : ""
            } max-w-2xl`}
          >
            {description}
          </p>
        ) : null}
        {children ? <div className={`mt-8 ${isCenter ? "flex justify-center" : ""}`}>{children}</div> : null}
      </div>
    </section>
  );
};

export default PageHero;

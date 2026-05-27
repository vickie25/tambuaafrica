import type { ReactNode } from "react";

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  action?: ReactNode;
  className?: string;
};

const SectionHeader = ({
  eyebrow,
  title,
  description,
  align = "center",
  action,
  className = "",
}: SectionHeaderProps) => {
  const isCenter = align === "center";

  if (action && !isCenter) {
    return (
      <div className={`mb-10 flex flex-col gap-4 sm:mb-12 lg:flex-row lg:items-end lg:justify-between ${className}`}>
        <div className="max-w-2xl">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="section-title mt-2">{title}</h2>
          {description ? <p className="section-lead mt-3">{description}</p> : null}
        </div>
        <div className="shrink-0">{action}</div>
      </div>
    );
  }

  return (
    <div
      className={`mb-10 sm:mb-12 ${isCenter ? "mx-auto max-w-3xl text-center" : "max-w-2xl text-left"} ${className}`}
    >
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="section-title mt-2">{title}</h2>
      {description ? (
        <p className={`section-lead mt-3 ${isCenter ? "mx-auto" : ""}`}>{description}</p>
      ) : null}
      {action ? <div className={`mt-6 ${isCenter ? "flex justify-center" : ""}`}>{action}</div> : null}
    </div>
  );
};

export default SectionHeader;

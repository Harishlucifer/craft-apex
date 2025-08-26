import { type ReactNode } from "react";

export function Card({
  title,
  children,
  href,
  className = "",
}: {
  title: string;
  children: ReactNode;
  href?: string;
  className?: string;
}) {
  const cardContent = (
    <>
      <h2 className="mb-3 text-2xl font-semibold">
        {title}{" "}
        {href && (
          <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
            -&gt;
          </span>
        )}
      </h2>
      <p className="m-0 max-w-[30ch] text-sm opacity-70">
        {children}
      </p>
    </>
  );

  const baseClasses = `group rounded-lg border border-gray-200 px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-50 ${className}`;

  if (href) {
    return (
      <a
        className={baseClasses}
        href={href}
        rel="noopener noreferrer"
        target="_blank"
      >
        {cardContent}
      </a>
    );
  }

  return (
    <div className={baseClasses}>
      {cardContent}
    </div>
  );
}

"use client";

import type { CSSProperties, ElementType, ReactNode } from "react";
import { useInView } from "@/lib/client/hooks";

export default function Reveal({
  as: Tag = "div",
  className = "",
  delay = 0,
  children,
  id,
}: {
  as?: ElementType;
  className?: string;
  delay?: number;
  children: ReactNode;
  id?: string;
}) {
  const [ref, inView] = useInView<HTMLElement>({ threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
  return (
    <Tag
      ref={ref}
      id={id}
      className={`reveal ${inView ? "is-visible" : ""} ${className}`}
      style={{ "--reveal-delay": `${delay}s` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}

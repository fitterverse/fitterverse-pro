// src/components/ui/Card.tsx
import React from "react";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export default function Card({ className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-800 bg-slate-900 p-6 ${className}`}
      {...props}
    />
  );
}

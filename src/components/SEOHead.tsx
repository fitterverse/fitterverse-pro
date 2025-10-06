// src/components/SEOHead.tsx
import React from "react";
import { Helmet } from "react-helmet-async";

type Props = {
  title: string;
  description?: string;
  canonical?: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
};

export default function SEOHead({
  title,
  description = "Fitterverse — research-backed guides on habits, fitness, nutrition, sleep, and more.",
  canonical,
  image,
  type = "website",
  publishedTime,
  modifiedTime,
}: Props) {
  const url = canonical?.replace(/\/+$/, "") || undefined;
  const defaultImage = "https://fitterverse.in/images/dashboard.jpg";
  const ogImage = image || defaultImage;

  return (
    <Helmet prioritizeSeoTags>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {url && <link rel="canonical" href={url} />}

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      {url && <meta property="og:url" content={url} />}
      <meta property="og:type" content={type} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta
        name="twitter:card"
        content={ogImage ? "summary_large_image" : "summary"}
      />
      <meta name="twitter:title" content={title} />
      {description && (
        <meta name="twitter:description" content={description} />
      )}
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {/* Article extras */}
      {type === "article" && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === "article" && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
    </Helmet>
  );
}

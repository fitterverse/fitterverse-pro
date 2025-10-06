// src/components/Seo/ProductSchemas.tsx
import React from "react";
import { Helmet } from "react-helmet-async";

type OrgProps = {
  name: string;
  url: string;
  logo?: string;
  sameAs?: string[];
};

type ProductSchemasProps = {
  org?: OrgProps;
  website?: { url: string };
  softwareApp: {
    name: string;
    url: string;
    operatingSystems?: string[]; // e.g. ["Web","Android","iOS"]
    applicationCategory?: string; // e.g. "HealthApplication"
    offers?: { price?: string; priceCurrency?: string; availability?: string };
    aggregateRating?: { ratingValue: number; ratingCount: number };
  };
};

export default function ProductSchemas({ org, website, softwareApp }: ProductSchemasProps) {
  const scripts: any[] = [];

  if (org) {
    scripts.push({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: org.name,
      url: org.url,
      logo: org.logo,
      sameAs: org.sameAs ?? [],
    });
  }

  if (website) {
    scripts.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      url: website.url,
      potentialAction: {
        "@type": "SearchAction",
        target: `${website.url.replace(/\/+$/,"")}/search?q={query}`,
        "query-input": "required name=query",
      },
    });
  }

  scripts.push({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: softwareApp.name,
    url: softwareApp.url,
    operatingSystem: (softwareApp.operatingSystems ?? ["Web"]).join(", "),
    applicationCategory: softwareApp.applicationCategory ?? "HealthApplication",
    offers: softwareApp.offers
      ? {
          "@type": "Offer",
          price: softwareApp.offers.price ?? "0",
          priceCurrency: softwareApp.offers.priceCurrency ?? "INR",
          availability:
            softwareApp.offers.availability ?? "https://schema.org/InStock",
        }
      : undefined,
    aggregateRating: softwareApp.aggregateRating
      ? {
          "@type": "AggregateRating",
          ratingValue: String(softwareApp.aggregateRating.ratingValue),
          ratingCount: String(softwareApp.aggregateRating.ratingCount),
        }
      : undefined,
  });

  return (
    <Helmet>
      {scripts.map((obj, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(obj)}
        </script>
      ))}
    </Helmet>
  );
}

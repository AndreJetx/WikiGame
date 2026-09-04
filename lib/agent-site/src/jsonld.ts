import { GITHUB_URL, SITE_DESCRIPTION, SITE_NAME, SITE_ORIGIN } from "./constants.js";

export function homepageJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: SITE_NAME,
        applicationCategory: "ReferenceApplication",
        operatingSystem: "Web",
        url: `${SITE_ORIGIN}/`,
        description: SITE_DESCRIPTION,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
      {
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_ORIGIN,
        description: SITE_DESCRIPTION,
        sameAs: [GITHUB_URL],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "community support",
          url: `${SITE_ORIGIN}/contact`,
        },
        address: {
          "@type": "PostalAddress",
          addressCountry: "BR",
        },
      },
    ],
  };
}

export function homepageJsonLdScript(): string {
  return JSON.stringify(homepageJsonLd());
}

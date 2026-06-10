import type { Profile } from "@/lib/content/types";

/** Builds the schema.org/Person JSON-LD object from the shared profile data. */
export function buildPersonJsonLd(profile: Profile) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.role,
    description: profile.about,
    url: "https://egormzln.ru",
    sameAs: profile.contacts
      .filter((contact) => contact.url !== null)
      .map((contact) => contact.url),
    knowsAbout: profile.skills,
    worksFor: {
      "@type": "Organization",
      name: profile.experience[0]?.company,
    },
  };
}

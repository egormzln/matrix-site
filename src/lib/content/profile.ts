import type { Profile } from "./types";

/**
 * Single source of truth for all site content.
 * Consumed by the server-rendered SEO markup, JSON-LD and the terminal commands.
 */
export const profile: Profile = {
  name: "Egor Mizyulin",
  role: "Software Engineer",
  about: "Ambitious tech builder turning ideas into production-ready products. Driven by AI, coding, and startups 🚀",
  skills: [
    "AI / LLM",
    "TypeScript",
    "React / Next.js",
    "Flutter / dart",
    "Swift / iOS",
    "Python",
    "FastAPI",
    "PostgreSQL",
    "Docker",
  ],
  projects: [
    {
      id: "dynamic-pricing",
      name: "dynamic-pricing",
      description: "Dynamic pricing engine for e-commerce.",
      url: "https://github.com/egormzln/dynamic-pricing",
      flagship: true,
    }
  ],
  experience: [
    {
      role: "Software Engineer",
      company: "Gold Apple",
      employment: "Full-time",
      start: "Jan 2025",
      end: null,
    },
    {
      role: "Software Engineer",
      company: "Galament Software",
      employment: "Full-time",
      start: "Jun 2023",
      end: "Jan 2025",
    },
  ],
  contacts: [
    {
      id: "x",
      label: "X",
      url: "https://x.com/yetmzln",
      handle: "@yetmzln",
    },
    {
      id: "github",
      label: "GitHub",
      url: "https://github.com/egormzln",
      handle: "@egormzln",
    },
    {
      id: "telegram",
      label: "Telegram",
      url: "https://t.me/egormzln",
      handle: "@egormzln",
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/egor-mizyulin",
      handle: "egor-mizyulin",
    }
  ],
  resumeUrl: "https://docs.google.com/document/d/1_9jRStmvK-Lhpn_v-nNv-0JLSa060NgqaImirIczae4/edit?usp=sharing",
};

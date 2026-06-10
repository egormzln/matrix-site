export interface Project {
  /** Slug used by `open <id>` and autocomplete. */
  id: string;
  name: string;
  description: string;
  url?: string;
  flagship?: boolean;
}

export interface ExperienceEntry {
  role: string;
  company: string;
  employment: string;
  start: string;
  end: string | null;
}

export interface ContactLink {
  id: string;
  label: string;
  url: string | null;
  handle: string;
  placeholder?: boolean;
}

export interface Profile {
  name: string;
  role: string;
  about: string;
  skills: string[];
  projects: Project[];
  experience: ExperienceEntry[];
  contacts: ContactLink[];
  resumeUrl: string;
}

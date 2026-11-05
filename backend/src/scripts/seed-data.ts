/**
 * Starter content, taken from the site template.
 * Anything marked [Placeholder] (and every article body) must be replaced with real,
 * verified information in the admin dashboard before launch.
 */
const P = "[Placeholder]";
export const OWNER = "AJENEZA M. Thierry";

export const settings = {
  siteTitle: OWNER,
  titleTemplate: `%s | ${OWNER}`,
  tagline: "Ideas · Innovation · Impact",
  heroKicker: "A personal portfolio & journal",
  heroTitle: "Ideas that shape us.",
  heroHighlight: "Work that moves us.",
  heroLede: `I am ${OWNER}, a journalist, author, software developer and technology enthusiast, and Co-Founder of OrLabs Tech Industries. This is where my work, writing and evolving ideas come together.`,
  heroCaption: "Curious by nature. Building with purpose.",
  heroQuote: "Exploring ideas. Building solutions. Telling stories. Creating impact.",
  description: `${OWNER}: journalist, author, software developer and Co-Founder of OrLabs Tech Industries.`,
  contactEmail: "ajeneza22@gmail.com",
  socialLinks: [{ platform: "Instagram", url: "https://www.instagram.com/orlabs_tech_industries/" }],
  now: {
    building: `${P} What I am currently building.`,
    learning: `${P} What I am learning right now.`,
    reading: `${P} What I am reading.`,
    interests: `${P} Current interests.`,
    activities: `${P} Ongoing professional activities.`,
    updatedAt: new Date(),
  },
};

export const profile = {
  name: OWNER,
  headline: "a journalist, author, software developer and technology enthusiast, and Co-Founder of OrLabs Tech Industries.",
  roles: ["Journalist & commentator", "Author & writer", "Developer & technologist", "Co-Founder & entrepreneur", "Leader & public speaker", "Lifelong learner"],
  shortBio:
    "My interests sit at the intersection of technology, society, storytelling and human development. I enjoy understanding how the world works, asking difficult questions and exploring how knowledge can become meaningful action.\n\n" +
    "Through writing and journalism, I examine the ideas shaping our communities. Through software and technology, I explore ways to solve practical problems. Through literature, I reflect on philosophy, psychology and the human experience.\n\n" +
    "I am also building in the world of entrepreneurship as Co-Founder of OrLabs Tech Industries, a software engineering company focused on creating useful digital solutions.",
  fullBio: `${P} The full professional biography goes here (Admin → Biography). It supports Markdown.`,
  story: `${P} My story: where it started, what shaped me and why I do this work.`,
  education: [{ institution: `${P} Institution`, qualification: `${P} Qualification`, period: "20XX – 20XX", notes: "" }],
  journey: `${P} Professional journey across journalism, writing, software and entrepreneurship.`,
  careerInterests: ["Technology and innovation", "African affairs and governance", "Literature and philosophy", "Entrepreneurship"],
  philosophy: "I believe ideas matter most when we have the courage to question them, and the discipline to turn them into something useful.",
  vision: `${P} Vision statement.`,
  mission:
    "To use technology, journalism, literature and entrepreneurship to explore important ideas, communicate knowledge, develop innovative solutions and contribute to African development.",
  skills: [
    { group: "Technology", items: ["Full-stack development", "Web applications", "Mobile applications", "Artificial intelligence", "Cloud computing"] },
    { group: "Communication", items: ["Journalism", "Editorial writing", "Public speaking"] },
    { group: "Leadership", items: ["Mentorship", "Entrepreneurship", "Community development"] },
  ],
  languages: [{ name: `${P} Language`, level: "Native" }],
  aspirations: `${P} Future aspirations.`,
  leadershipBio: `${P} Leadership biography: how I approach leadership, mentorship and community work.`,
  speakingTopics: [
    { title: "Public Speaking", description: "Sharing ideas on technology, leadership, innovation and African development." },
    { title: "Community & Mentorship", description: "Learning with others, supporting young people and contributing to community initiatives." },
    { title: "Youth & Innovation", description: "Exploring opportunities to build skills, create solutions and widen access to knowledge." },
    { title: "Artificial Intelligence and the Future", description: "What AI changes, what it does not, and how to prepare." },
    { title: "Entrepreneurship and Digital Transformation", description: "Building companies that modernise how organisations work." },
  ],
  location: "Kigali, Rwanda",
  email: "ajeneza22@gmail.com",
};

export const categories = [
  ...["Africa & Development", "Politics & Governance", "Media & Society", "Pan-African Perspectives", "International Relations", "Current Affairs", "Opinion", "Interviews"].map(
    (name, order) => ({ name, section: "journalism", order }),
  ),
  ...[
    ["Technology", "Software, AI and innovation"],
    ["Africa", "African development and affairs"],
    ["Philosophy", "Ideas, ethics and society"],
    ["Leadership", "Leadership lessons"],
    ["Psychology", "Human behavior"],
    ["Politics", "Political perspectives"],
    ["Entrepreneurship", "Startups and business"],
    ["Personal Reflections", "Experiences and opinions"],
  ].map(([name, description], order) => ({ name, description, section: "blog", order })),
];

const body =
  `${P} This is placeholder text so the article template can be reviewed. Replace it with the real piece from the admin dashboard.\n\n` +
  "## A section heading\n\nEditorial pages are set for comfortable reading: a measured line length, generous leading and clear hierarchy.\n\n" +
  "> A pull quote looks like this.\n\n- Lists are supported\n- So are [links](https://example.com)\n";

export const articles = [
  { section: "journalism", category: "Africa & Development", featured: true, title: "The questions we ask about Africa's future matter.", excerpt: "Exploring the relationship between public leadership, innovation and the choices that shape the continent's next chapter.", body },
  { section: "journalism", category: "Politics & Governance", title: "Leadership is measured by the future it makes possible.", excerpt: "Ideas on responsibility, institutions and public service.", body },
  { section: "journalism", category: "Media & Society", title: "Why thoughtful journalism still matters.", excerpt: "On context, accountability and the value of informed citizens.", body },
  { section: "journalism", category: "Pan-African Perspectives", title: "Innovation begins with understanding our own challenges.", excerpt: "Connecting local realities with ambitious ideas.", body },
  { section: "blog", category: "Technology", title: "Beyond code: learning to think like a technologist.", excerpt: "Why mathematics, systems thinking and curiosity matter in a rapidly changing technical world.", body },
  { section: "blog", category: "Africa", title: "Building the future we want to inherit.", excerpt: "Reflections on innovation, responsibility and the role of young Africans in shaping tomorrow.", body },
  { section: "blog", category: "Philosophy", title: "The discipline of questioning what we believe.", excerpt: "On intellectual humility, independent thought and the value of examining our assumptions.", body },
  { section: "blog", category: "Leadership", title: "Leadership begins before the title.", excerpt: "A reflection on responsibility, service and the everyday choices that build trust.", body },
];

// Project entries from the template are concepts: keep them illustrative until replaced with verified work.
export const projects = [
  { title: "Ijuru Signal", categories: ["ai", "ml"], technologies: ["Machine Learning", "Data", "Python"], summary: "An environmental intelligence concept exploring how data and machine learning can support monitoring, analysis and informed decisions." },
  { title: "Echo Africa", categories: ["web"], technologies: ["React", "FastAPI", "MongoDB"], summary: "An African news and knowledge platform concept combining news discovery, contextual analysis and accessible information." },
  { title: "FixRwanda", categories: ["web"], technologies: ["Web App", "Mapping", "Node.js"], summary: "A civic reporting concept designed to help communities report local issues and follow the response process." },
  { title: "SME Management", categories: ["mobile"], technologies: ["Flutter", "MongoDB", "Business"], summary: "A practical management platform concept for neighborhood businesses, with stock, sales, debts and reporting tools." },
  { title: "AI & African Innovation", categories: ["research", "ai"], technologies: ["AI", "Research", "Learning"], summary: "Explorations of machine learning, emerging technologies and opportunities to solve locally relevant problems." },
  { title: "Web & Mobile Experiments", categories: ["web", "mobile"], technologies: ["React", "Node.js", "Mobile"], summary: "A selection of application concepts and development experiments focused on accessible digital experiences." },
].map((p, i) => ({
  ...p, devStatus: "planning", featured: i < 3, order: i,
  problem: `${P} Describe the problem this project addresses.`, description: `${P} Full project description, features and results.`,
}));

export const books = [
  { title: "On the Human Condition", subtitle: "Philosophy & Life", genre: "Writing & reflection", summary: "Reflections on existence, meaning, values and the questions that shape our lives." },
  { title: "The Mind & Society", subtitle: "Psychology & People", genre: "Writing & reflection", summary: "Explorations of human behavior, thought, relationships and society." },
  { title: "Notes from a Curious Mind", subtitle: "Essays & Reflections", genre: "Essays", kind: "essay", summary: "A collection of evolving ideas, observations and personal reflections." },
].map((b, i) => ({ ...b, publicationStatus: "in_progress", order: i, featured: i === 0, description: `${P} Full description, publication details and excerpts.` }));

export const ventures = [
  {
    title: "OrLabs Tech Industries",
    role: "Co-Founder",
    summary:
      "OrLabs Tech Industries is a software engineering company focused on designing and developing digital solutions. As Co-Founder, I am part of the journey of building a technology business, exploring ideas and creating products that respond to real needs.",
    description: "This space highlights the company's work and my entrepreneurial journey while keeping the company's own identity distinct.",
    mission: `${P} Company mission.`,
    vision: `${P} Company vision.`,
    services: ["Software Engineering", "Web & Mobile Apps", "Cloud Solutions", "AI & Data", "Digital Transformation"].map((title) => ({ title, description: "" })),
    collaboration: "Interested in working with OrLabs? Get in touch through the contact page.",
    website: "https://www.instagram.com/orlabs_tech_industries/",
    socialLinks: [{ platform: "Instagram", url: "https://www.instagram.com/orlabs_tech_industries/" }],
    featured: true,
  },
];

export const events = [
  { title: `${P} Sample speaking engagement`, type: "speaking", topic: "Technology and African Development", location: "Kigali, Rwanda", description: "Replace with a real event." },
];

export const timeline = [
  { title: `${P} Education milestone`, category: "education", date: new Date("2018-09-01"), description: "Replace with a real milestone." },
  { title: "Co-founded OrLabs Tech Industries", category: "company", date: new Date("2023-01-01"), description: `${P} Confirm the date and details.` },
];

export const research = [
  { title: `${P} A technical experiment`, kind: "experiment", abstract: "Sample abstract for a research note.", body },
];

export const reading = [
  { title: `${P} Recommended book`, author: "Author name", type: "book", note: "Why this book matters.", shelf: "recommended" },
];

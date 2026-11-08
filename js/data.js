/**
 * Sample resume data and default structure
 */
const DEFAULT_RESUME_DATA = {
  personal: {
    fullName: "Alex Morgan",
    jobTitle: "Senior Full-Stack Software Engineer",
    email: "alex.morgan@example.com",
    phone: "+1 (555) 382-9471",
    location: "San Francisco, CA",
    website: "https://alexmorgan.dev",
    linkedin: "linkedin.com/in/alexmorgan-dev",
    github: "github.com/alexmorgan-codes",
    twitter: "x.com/alexmorgan_dev",
    photoUrl: "", // Base64 or URL
    showPhoto: false
  },
  summary: "Results-driven Full-Stack Engineer with 6+ years of experience designing scalable web architectures, distributed microservices, and modern frontend user experiences. Proven track record of improving system performance by 40% and leading cross-functional engineering teams to ship high-impact SaaS products.",
  experience: [
    {
      id: "exp-1",
      title: "Senior Full-Stack Engineer",
      company: "Apex Cloud Technologies",
      location: "San Francisco, CA",
      startDate: "2022",
      endDate: "Present",
      current: true,
      description: "• Architected and deployed multi-tenant cloud dashboard serving 250,000+ monthly active users using React, Node.js, and PostgreSQL.\n• Reduced API latency by 42% by redesigning database indexing, caching strategies with Redis, and GraphQL query batches.\n• Mentored a team of 6 junior and mid-level developers, instituting automated CI/CD pipelines and comprehensive unit testing (92% coverage)."
    },
    {
      id: "exp-2",
      title: "Software Engineer",
      company: "Vanguard Digital Systems",
      location: "San Jose, CA",
      startDate: "2019",
      endDate: "2022",
      current: false,
      description: "• Built real-time analytics data pipelines processing over 10M events daily utilizing Kafka, Python, and AWS Lambda.\n• Collaborated closely with UX designers to develop reusable UI component libraries adopted across 8 distinct internal products.\n• Spearheaded the migration from a monolithic backend to containerized Docker microservices orchestrated on Kubernetes."
    },
    {
      id: "exp-3",
      title: "Frontend Developer",
      company: "Nexus Interactive",
      location: "Austin, TX",
      startDate: "2018",
      endDate: "2019",
      current: false,
      description: "• Developed responsive, cross-browser web interfaces adhering to WCAG 2.1 AA accessibility standards.\n• Integrated third-party payment gateways (Stripe, PayPal) resulting in a 15% increase in checkout conversions."
    }
  ],
  education: [
    {
      id: "edu-1",
      degree: "B.S. in Computer Science",
      school: "University of California, Berkeley",
      location: "Berkeley, CA",
      startDate: "2014",
      endDate: "2018",
      details: "Summa Cum Laude, GPA: 3.9/4.0. Dean's Honors List (All semesters)."
    }
  ],
  skills: [
    { category: "Languages", items: "JavaScript (ES6+), TypeScript, Python, HTML5, CSS3/Sass, SQL" },
    { category: "Frameworks & Libraries", items: "React, Next.js, Node.js, Express, Vue.js, Tailwind CSS" },
    { category: "Databases & Cloud", items: "PostgreSQL, MongoDB, Redis, AWS (S3, EC2, Lambda), Docker, Git" },
    { category: "Core Competencies", items: "System Architecture, REST & GraphQL APIs, CI/CD, Agile / Scrum" }
  ],
  projects: [
    {
      id: "proj-1",
      name: "Pulse Analytics Engine",
      tech: "React, TypeScript, Node.js, Redis, ClickHouse",
      link: "https://github.com/alexmorgan-codes/pulse-analytics",
      description: "High-performance web analytics platform providing sub-second query speeds across billions of user events with interactive customizable charting."
    },
    {
      id: "proj-2",
      name: "DevScribe AI Markdown Editor",
      tech: "Next.js, Tailwind CSS, WebAssembly, OpenAI API",
      link: "https://devscribe-editor.example.com",
      description: "Collaborative markdown notebook with real-time grammar assistance, contextual code completion, and instant static site deployment."
    }
  ],
  certifications: [
    {
      id: "cert-1",
      name: "AWS Certified Solutions Architect – Associate",
      issuer: "Amazon Web Services",
      date: "2023"
    },
    {
      id: "cert-2",
      name: "Meta Certified Frontend Developer",
      issuer: "Meta / Coursera",
      date: "2021"
    }
  ],
  languages: [
    { name: "English", level: "Native / Bilingual" },
    { name: "Spanish", level: "Professional Working Proficiency" },
    { name: "French", level: "Conversational" }
  ]
};

const EMPTY_RESUME_DATA = {
  personal: {
    fullName: "",
    jobTitle: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
    twitter: "",
    photoUrl: "",
    showPhoto: false
  },
  summary: "",
  experience: [],
  education: [],
  skills: [
    { category: "Technical Skills", items: "" },
    { category: "Soft Skills", items: "" }
  ],
  projects: [],
  certifications: [],
  languages: []
};

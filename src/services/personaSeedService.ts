
import { createPersona } from './personaService';

export const seedSamplePersonas = async () => {
  const samplePersonas = [
    {
      name: "Sarah Chen",
      description: "Senior Product Manager at a B2B SaaS company. Focuses on user experience and data-driven product decisions. Always looking for innovative solutions to complex user problems.",
      tagsOfInterest: ["product-management", "saas", "user-experience", "analytics", "b2b", "productivity"],
      linkedUserId: undefined,
      ideaCatalog: [],
      reviewQueue: [],
      conceptDocCatalog: [],
      conceptDocReviewQueue: [],
      lastReviewed: new Date().toISOString(),
      isActive: true
    },
    {
      name: "Alex Rodriguez", 
      description: "Technical Founder and CTO of an early-stage startup. Passionate about scalable architecture, developer tools, and emerging technologies. Values technical depth and practical implementation.",
      tagsOfInterest: ["technical", "startup", "architecture", "developer-tools", "scaling", "engineering"],
      linkedUserId: undefined,
      ideaCatalog: [],
      reviewQueue: [],
      conceptDocCatalog: [],
      conceptDocReviewQueue: [],
      lastReviewed: new Date().toISOString(),
      isActive: true
    },
    {
      name: "Maya Patel",
      description: "Marketing Director specializing in growth and customer acquisition. Expert in digital marketing, conversion optimization, and building brand awareness for tech companies.",
      tagsOfInterest: ["marketing", "growth", "customer-acquisition", "branding", "conversion", "digital-marketing"],
      linkedUserId: undefined,
      ideaCatalog: [],
      reviewQueue: [],
      conceptDocCatalog: [],
      conceptDocReviewQueue: [],
      lastReviewed: new Date().toISOString(),
      isActive: true
    },
    {
      name: "Jordan Kim",
      description: "Venture Capital Associate focused on early-stage investments. Evaluates market opportunities, business models, and founder-market fit. Interested in disruptive technologies and scalable businesses.",
      tagsOfInterest: ["venture-capital", "investment", "business-model", "market-analysis", "disruption", "scaling"],
      linkedUserId: undefined,
      ideaCatalog: [],
      reviewQueue: [],
      conceptDocCatalog: [],
      conceptDocReviewQueue: [],
      lastReviewed: new Date().toISOString(),
      isActive: true
    },
    {
      name: "Emma Thompson",
      description: "UX Designer with a background in behavioral psychology. Specializes in user research, interface design, and creating intuitive digital experiences. Values human-centered design principles.",
      tagsOfInterest: ["ux-design", "user-research", "psychology", "interface-design", "usability", "human-centered"],
      linkedUserId: undefined,
      ideaCatalog: [],
      reviewQueue: [],
      conceptDocCatalog: [],
      conceptDocReviewQueue: [],
      lastReviewed: new Date().toISOString(),
      isActive: true
    }
  ];

  try {
    const createdPersonas = [];
    for (const persona of samplePersonas) {
      const personaId = await createPersona(persona);
      createdPersonas.push({ id: personaId, ...persona });
    }
    return createdPersonas;
  } catch (error) {
    console.error('Error seeding sample personas:', error);
    throw error;
  }
};

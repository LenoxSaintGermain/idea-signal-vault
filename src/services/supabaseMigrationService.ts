
import { createIdea } from './supabaseService';
import { createPersona } from './supabasePersonaService';
import { mockIdeas } from '@/data/mockData';

export class SupabaseMigrationService {
  async seedMockIdeas(userId: string) {
    console.log('🚀 Starting Supabase idea seeding...');
    
    try {
      let successCount = 0;
      let failCount = 0;
      
      for (const idea of mockIdeas) {
        try {
          const { id, createdAt, ...ideaData } = idea;
          await createIdea(ideaData, userId);
          successCount++;
          console.log(`✅ Seeded idea: ${idea.headline || idea.title}`);
        } catch (error) {
          failCount++;
          console.error(`❌ Failed to seed idea: ${idea.headline || idea.title}`, error);
        }
      }
      
      console.log(`📊 Seeding complete: ${successCount} success, ${failCount} failed`);
      return { success: successCount > 0, successCount, failCount };
    } catch (error) {
      console.error('❌ Supabase idea seeding failed:', error);
      return { success: false, successCount: 0, failCount: mockIdeas.length };
    }
  }

  async seedSamplePersonas() {
    console.log('🚀 Starting Supabase persona seeding...');

    const samplePersonas = [
      {
        name: "Sarah Chen",
        description: "Senior Product Manager at a B2B SaaS company. Focuses on user experience and data-driven product decisions.",
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
        description: "Technical Founder and CTO of an early-stage startup. Passionate about scalable architecture and developer tools.",
        tagsOfInterest: ["technical", "startup", "architecture", "developer-tools", "scaling", "engineering"],
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
      let successCount = 0;
      let failCount = 0;
      
      for (const persona of samplePersonas) {
        try {
          const personaId = await createPersona(persona);
          successCount++;
          console.log(`✅ Seeded persona: ${persona.name}`);
        } catch (error) {
          failCount++;
          console.error(`❌ Failed to seed persona: ${persona.name}`, error);
        }
      }
      
      console.log(`📊 Persona seeding complete: ${successCount} success, ${failCount} failed`);
      return { success: successCount > 0, successCount, failCount };
    } catch (error) {
      console.error('❌ Supabase persona seeding failed:', error);
      return { success: false, successCount: 0, failCount: samplePersonas.length };
    }
  }
}

export const supabaseMigrationService = new SupabaseMigrationService();

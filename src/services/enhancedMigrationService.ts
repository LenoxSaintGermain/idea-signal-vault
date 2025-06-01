
import { createIdea } from './firestoreService';
import { createPersona } from './personaService';
import { mockIdeas } from '@/data/mockData';
import { firebaseDebugService } from './firebaseDebugService';
import { doc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export class EnhancedMigrationService {
  // Seed mock ideas with enhanced error handling
  async seedMockIdeas(userId: string, withRecovery: boolean = true) {
    console.log('🚀 Starting enhanced idea seeding...');
    
    if (withRecovery) {
      // Try recovery sequence first
      const recoverySuccess = await firebaseDebugService.performRecoverySequence();
      if (!recoverySuccess) {
        console.warn('⚠️ Recovery failed, attempting seeding anyway...');
      }
    }
    
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
          
          // Try alternative storage method
          try {
            const ideaDoc = doc(collection(db, 'ideas'));
            await setDoc(ideaDoc, {
              ...idea,
              authorId: userId,
              createdAt: serverTimestamp(),
              voteCount: 0,
              commentCount: 0,
              totalPoints: 0,
              isFeatured: false
            });
            successCount++;
            console.log(`✅ Seeded idea (alternative): ${idea.headline || idea.title}`);
          } catch (altError) {
            console.error(`❌ Alternative seeding also failed: ${idea.headline || idea.title}`, altError);
          }
        }
      }
      
      console.log(`📊 Seeding complete: ${successCount} success, ${failCount} failed`);
      return { success: successCount > 0, successCount, failCount };
    } catch (error) {
      console.error('❌ Enhanced idea seeding failed:', error);
      return { success: false, successCount: 0, failCount: mockIdeas.length };
    }
  }

  // Seed sample personas with enhanced error handling
  async seedSamplePersonas(withRecovery: boolean = true) {
    console.log('🚀 Starting enhanced persona seeding...');
    
    if (withRecovery) {
      const recoverySuccess = await firebaseDebugService.performRecoverySequence();
      if (!recoverySuccess) {
        console.warn('⚠️ Recovery failed, attempting seeding anyway...');
      }
    }

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
          
          // Try alternative storage method
          try {
            const personaDoc = doc(collection(db, 'personas'));
            await setDoc(personaDoc, {
              ...persona,
              createdAt: serverTimestamp()
            });
            successCount++;
            console.log(`✅ Seeded persona (alternative): ${persona.name}`);
          } catch (altError) {
            console.error(`❌ Alternative persona seeding failed: ${persona.name}`, altError);
          }
        }
      }
      
      console.log(`📊 Persona seeding complete: ${successCount} success, ${failCount} failed`);
      return { success: successCount > 0, successCount, failCount };
    } catch (error) {
      console.error('❌ Enhanced persona seeding failed:', error);
      return { success: false, successCount: 0, failCount: samplePersonas.length };
    }
  }

  // Test database connectivity before operations
  async testDatabaseConnectivity() {
    try {
      const testResult = await firebaseDebugService.testFirestoreConnection();
      return testResult;
    } catch (error) {
      console.error('❌ Database connectivity test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const enhancedMigrationService = new EnhancedMigrationService();

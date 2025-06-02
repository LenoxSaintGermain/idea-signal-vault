
import { mockIdeas } from '@/data/mockData';
import { createIdea } from './supabaseService';

export class MigrationService {
  async seedMockData(userId: string) {
    console.log('🚀 Starting Supabase mock data seeding...');
    
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
      return successCount > 0;
    } catch (error) {
      console.error('❌ Mock data seeding failed:', error);
      return false;
    }
  }
}

export const migrationService = new MigrationService();
export const seedMockData = (userId: string) => migrationService.seedMockData(userId);

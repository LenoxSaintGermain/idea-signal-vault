
import { createIdea } from './firestoreService';
import { mockIdeas } from '@/data/mockData';

export const seedMockData = async (userId: string) => {
  console.log('Starting data migration...');
  
  try {
    for (const idea of mockIdeas) {
      const { id, createdAt, ...ideaData } = idea;
      await createIdea(ideaData, userId);
      console.log(`Migrated idea: ${idea.headline || idea.title}`);
    }
    
    console.log('Data migration completed successfully!');
    return true;
  } catch (error) {
    console.error('Migration failed:', error);
    return false;
  }
};

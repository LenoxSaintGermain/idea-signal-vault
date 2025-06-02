
import { supabase } from '@/lib/supabase';
import { PersonaProfile } from '@/types/persona';
import { getAllPersonas } from './personaCRUD';

export const subscribeToPersonas = (callback: (personas: PersonaProfile[]) => void) => {
  const subscription = supabase
    .channel('personas_changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'personas' },
      async () => {
        const personas = await getAllPersonas();
        callback(personas);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
};

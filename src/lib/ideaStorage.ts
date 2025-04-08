import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { dbGet, dbSet } from './indexedDBStorage';

export interface IdeaStep {
  id: number;
  description: string;
  cost: number;
  completed: boolean;
}

export interface Idea {
  id: number;
  name: string;
  description?: string;
  totalCost: number;
  steps: IdeaStep[];
  createdAt: string;
  updatedAt: string;
  archived?: boolean; // Added archived property
  archivedDate?: string; // Added archivedDate property
}

const IDEAS_STORAGE_KEY = 'ideas_data';

// Empty array for ideas
const defaultIdeas: Idea[] = [];

// Salvar ideias no IndexedDB
export const saveIdeas = async (ideas: Idea[]) => {
  try {
    await dbSet('userData', IDEAS_STORAGE_KEY, ideas);
    return true;
  } catch (error) {
    console.error('Erro ao salvar ideias:', error);
    return false;
  }
};

// Obter ideias do IndexedDB, com fallback para localStorage
export const getIdeas = async (): Promise<Idea[]> => {
  try {
    // Tentar obter do IndexedDB
    const storedIdeas = await dbGet<Idea[]>('userData', IDEAS_STORAGE_KEY);
    
    if (storedIdeas) {
      return storedIdeas.map((idea: Idea) => ({
        ...idea,
        archived: idea.archived ?? false
      }));
    }
    
    // Fallback para localStorage (migração)
    const localStorageIdeas = localStorage.getItem('zenlife-ideas');
    if (localStorageIdeas) {
      const parsedIdeas = JSON.parse(localStorageIdeas);
      // Migrar dados do localStorage para IndexedDB
      await saveIdeas(parsedIdeas);
      // Remover do localStorage após migração (opcional)
      localStorage.removeItem('zenlife-ideas');
      
      return parsedIdeas.map((idea: Idea) => ({
        ...idea,
        archived: idea.archived ?? false
      }));
    }
    
    return defaultIdeas;
  } catch (error) {
    console.error('Erro ao obter ideias:', error);
    return defaultIdeas;
  }
};

// Hook customizado para gerenciar estado das ideias
export const useIdeas = () => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Carregar ideias do IndexedDB
  useEffect(() => {
    const loadIdeas = async () => {
      try {
        setLoading(true);
        const loadedIdeas = await getIdeas();
        setIdeas(loadedIdeas);
      } catch (error) {
        console.error('Erro ao carregar ideias:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar suas ideias",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadIdeas();
  }, [toast]);

  // Salvar ideias no IndexedDB sempre que mudar
  useEffect(() => {
    // Não salvar durante o carregamento inicial
    if (loading) return;
    
    const updateIdeas = async () => {
      try {
        const updatedIdeas = ideas.map(idea => {
          const totalCost = idea.steps.reduce((acc, step) => acc + step.cost, 0);
          return { 
            ...idea, 
            totalCost, 
            updatedAt: new Date().toISOString() 
          };
        });

        if (JSON.stringify(updatedIdeas) !== JSON.stringify(ideas)) {
          setIdeas(updatedIdeas);
        } else {
          await saveIdeas(ideas);
        }
      } catch (error) {
        console.error('Erro ao salvar ideias:', error);
      }
    };

    updateIdeas();
  }, [ideas, loading]);

  // Função para atualizar as ideias
  const updateIdeasWithSave = async (newIdeas: Idea[]) => {
    setIdeas(newIdeas);
    await saveIdeas(newIdeas);
  };

  return { 
    ideas, 
    setIdeas: updateIdeasWithSave,
    loading
  };
};

// Obter apenas ideias ativas (não arquivadas)
export const getActiveIdeas = async (): Promise<Idea[]> => {
  const ideas = await getIdeas();
  return ideas.filter(idea => !idea.archived);
};

// Obter apenas ideias arquivadas
export const getArchivedIdeas = async (): Promise<Idea[]> => {
  const ideas = await getIdeas();
  return ideas.filter(idea => idea.archived);
};

// Arquivar uma ideia
export const archiveIdea = async (ideaId: number, ideas: Idea[], setIdeas: (ideas: Idea[]) => Promise<void>) => {
  const updatedIdeas = ideas.map(idea => 
    idea.id === ideaId 
      ? { ...idea, archived: true, archivedDate: new Date().toISOString() }
      : idea
  );
  await setIdeas(updatedIdeas);
  return updatedIdeas;
};

// Restaurar uma ideia arquivada
export const restoreIdea = async (ideaId: number, ideas: Idea[], setIdeas: (ideas: Idea[]) => Promise<void>) => {
  const updatedIdeas = ideas.map(idea => 
    idea.id === ideaId 
      ? { ...idea, archived: false, archivedDate: undefined }
      : idea
  );
  await setIdeas(updatedIdeas);
  return updatedIdeas;
};

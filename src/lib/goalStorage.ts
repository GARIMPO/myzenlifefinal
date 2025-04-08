
import { useEffect, useState } from 'react';

export interface Goal {
  id: number;
  name: string;
  progress: number;
  category: string;
  description?: string;
  archived: boolean; // Changed from optional to required property
  archivedDate?: string; // Added archivedDate property
}

const GOALS_STORAGE_KEY = 'zenlife-goals';

// Empty array for goals
const defaultGoals: Goal[] = [];

// Salvar metas no localStorage
export const saveGoals = (goals: Goal[]) => {
  localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
};

// Obter metas do localStorage
export const getGoals = (): Goal[] => {
  const storedGoals = localStorage.getItem(GOALS_STORAGE_KEY);
  return storedGoals ? JSON.parse(storedGoals) : defaultGoals;
};

// Hook customizado para gerenciar estado das metas
export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>(getGoals());

  // Salva no localStorage sempre que as metas forem atualizadas
  useEffect(() => {
    saveGoals(goals);
  }, [goals]);

  return { goals, setGoals };
};

// Obter apenas metas ativas (não arquivadas)
export const getActiveGoals = (): Goal[] => {
  return getGoals().filter(goal => !goal.archived);
};

// Obter apenas metas arquivadas
export const getArchivedGoals = (): Goal[] => {
  return getGoals().filter(goal => goal.archived);
};

// Arquivar uma meta
export const archiveGoal = (goalId: number, goals: Goal[], setGoals: React.Dispatch<React.SetStateAction<Goal[]>>) => {
  const updatedGoals = goals.map(goal => 
    goal.id === goalId 
      ? { ...goal, archived: true, archivedDate: new Date().toISOString() }
      : goal
  );
  setGoals(updatedGoals);
  return updatedGoals;
};

// Restaurar uma meta arquivada
export const restoreGoal = (goalId: number, goals: Goal[], setGoals: React.Dispatch<React.SetStateAction<Goal[]>>) => {
  const updatedGoals = goals.map(goal => 
    goal.id === goalId 
      ? { ...goal, archived: false, archivedDate: undefined }
      : goal
  );
  setGoals(updatedGoals);
  return updatedGoals;
};


import { useEffect, useState } from 'react';

export interface Habit {
  id: number;
  name: string;
  completed: boolean;
  frequency: string;
  archived: boolean;
  category?: string; // Optional category
  description?: string; // Optional description
  startDate?: string; // Optional start date
  endDate?: string; // Optional end date
  neverEnding?: boolean; // Flag for habits that never end
  trackingType?: 'daily' | 'weekly' | 'monthly'; // Type of tracking
  trackingData?: { // Optional tracking data
    dates?: string[]; // Array of dates for daily tracking
    weekdays?: boolean[]; // Array of 7 booleans for weekly tracking (Sun-Sat)
    monthDays?: { [key: string]: boolean }; // Object with dates as keys for monthly tracking
  };
}

const HABITS_STORAGE_KEY = 'zenlife-habits';

// Empty array for habits
const defaultHabits: Habit[] = [];

// Salvar hábitos no localStorage
export const saveHabits = (habits: Habit[]) => {
  localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
};

// Obter hábitos do localStorage
export const getHabits = (): Habit[] => {
  const storedHabits = localStorage.getItem(HABITS_STORAGE_KEY);
  return storedHabits ? JSON.parse(storedHabits) : defaultHabits;
};

// Hook customizado para gerenciar estado dos hábitos
export const useHabits = () => {
  const [habits, setHabits] = useState<Habit[]>(getHabits());

  // Salva no localStorage sempre que os hábitos forem atualizados
  useEffect(() => {
    saveHabits(habits);
  }, [habits]);

  return { habits, setHabits };
};

// Arquivar um hábito
export const archiveHabit = (habitId: number, habits: Habit[], setHabits: React.Dispatch<React.SetStateAction<Habit[]>>) => {
  const updatedHabits = habits.map(habit => 
    habit.id === habitId 
      ? { ...habit, archived: true }
      : habit
  );
  setHabits(updatedHabits);
  return updatedHabits;
};

// Restaurar um hábito arquivado
export const restoreHabit = (habitId: number, habits: Habit[], setHabits: React.Dispatch<React.SetStateAction<Habit[]>>) => {
  const updatedHabits = habits.map(habit => 
    habit.id === habitId 
      ? { ...habit, archived: false }
      : habit
  );
  setHabits(updatedHabits);
  return updatedHabits;
};

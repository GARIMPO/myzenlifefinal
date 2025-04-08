
import { useEffect, useState } from 'react';

export interface Task {
  id: number;
  name: string;
  priority: 'alta' | 'média' | 'baixa';
  completed: boolean;
  dueDate?: string;
}

const TASKS_STORAGE_KEY = 'zenlife-tasks';

// Empty array for tasks
const defaultTasks: Task[] = [];

// Salvar tarefas no localStorage
export const saveTasks = (tasks: Task[]) => {
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
};

// Obter tarefas do localStorage
export const getTasks = (): Task[] => {
  const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
  return storedTasks ? JSON.parse(storedTasks) : defaultTasks;
};

// Hook customizado para gerenciar estado das tarefas
export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>(getTasks());

  // Salva no localStorage sempre que as tarefas forem atualizadas
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  return { tasks, setTasks };
};

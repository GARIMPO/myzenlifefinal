
import { useState, useEffect } from 'react';

export interface GratitudeEntry {
  id: number;
  text: string;
  date: string;
  archived: boolean;
}

const GRATITUDE_STORAGE_KEY = 'zenlife-gratitude';

// Empty array for gratitude entries
const defaultEntries: GratitudeEntry[] = [];

export const saveGratitudeEntries = (entries: GratitudeEntry[]) => {
  localStorage.setItem(GRATITUDE_STORAGE_KEY, JSON.stringify(entries));
};

export const getGratitudeEntries = (): GratitudeEntry[] => {
  const stored = localStorage.getItem(GRATITUDE_STORAGE_KEY);
  return stored ? JSON.parse(stored) : defaultEntries;
};

export const useGratitude = () => {
  const [entries, setEntries] = useState<GratitudeEntry[]>(getGratitudeEntries());

  useEffect(() => {
    saveGratitudeEntries(entries);
  }, [entries]);

  return { entries, setEntries };
};

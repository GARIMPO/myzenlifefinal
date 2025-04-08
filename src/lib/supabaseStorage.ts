import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

// Generic hook for handling localStorage data
export function useLocalStorage<T extends Record<string, any>>(
  key: string,
  defaultData: T
) {
  const [data, setData] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultData;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Save data to localStorage
  const saveData = async (newData: T) => {
    try {
      setLoading(true);
      
      // Store in localStorage
      localStorage.setItem(key, JSON.stringify(newData));
      
      setData(newData);
      setError(null);
      
      toast({
        title: "Dados salvos",
        description: "Suas alterações foram salvas com sucesso.",
      });
    } catch (err) {
      console.error(`Error saving data:`, err);
      setError(err as Error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar suas alterações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    saveData,
    refreshData: () => {
      const stored = localStorage.getItem(key);
      if (stored) {
        setData(JSON.parse(stored));
      }
    }
  };
}

// Specialized hooks for different features

// Hook for BMI calculator data
export interface BMICalculatorData {
  height: string;
  weight: string;
  age: string;
  gender: 'male' | 'female';
  goal: 'lose' | 'maintain' | 'gain';
  bmi_result: number | null;
  bmr_result: number | null;
  calorie_goal: number | null;
}

export const useBMICalculator = () => {
  const defaultData: BMICalculatorData = {
    height: '',
    weight: '',
    age: '',
    gender: 'male',
    goal: 'maintain',
    bmi_result: null,
    bmr_result: null,
    calorie_goal: null
  };
  
  return useLocalStorage<BMICalculatorData>('bmi-calculator', defaultData);
};

// Hook for QR Code data
export interface QRCodeData {
  qr_value: string;
  qr_image_url: string;
}

export const useQRCode = () => {
  const defaultData: QRCodeData = {
    qr_value: 'https://zenlife.app',
    qr_image_url: ''
  };
  
  return useLocalStorage<QRCodeData>('qr-code', defaultData);
};

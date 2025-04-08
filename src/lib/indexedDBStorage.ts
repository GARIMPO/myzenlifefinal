import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

// Nome do banco de dados IndexedDB
const DB_NAME = 'zenlife-db';
const DB_VERSION = 1;

// Solicitar armazenamento persistente para evitar que o navegador limpe os dados
export const requestPersistentStorage = async (): Promise<boolean> => {
  // Verificar se a API de armazenamento persistente está disponível
  if (!navigator.storage || !navigator.storage.persist) {
    console.warn('API de armazenamento persistente não está disponível neste navegador');
    return false;
  }

  try {
    // Verificar se já temos permissão de persistência
    const isPersisted = await navigator.storage.persisted();
    
    if (isPersisted) {
      console.log('Armazenamento já está configurado como persistente');
      return true;
    }
    
    // Solicitar persistência
    const persisted = await navigator.storage.persist();
    console.log(`Armazenamento persistente ${persisted ? 'concedido' : 'negado'}`);
    return persisted;
  } catch (error) {
    console.error('Erro ao solicitar armazenamento persistente:', error);
    return false;
  }
};

// Verificar o uso e a cota de armazenamento
export const checkStorageQuota = async (): Promise<{used: number, quota: number}> => {
  if (!navigator.storage || !navigator.storage.estimate) {
    return { used: 0, quota: 0 };
  }
  
  try {
    const estimate = await navigator.storage.estimate();
    const usedMB = Math.round((estimate.usage || 0) / (1024 * 1024));
    const quotaMB = Math.round((estimate.quota || 0) / (1024 * 1024));
    
    console.log(`Armazenamento usado: ${usedMB}MB de ${quotaMB}MB total`);
    return { 
      used: estimate.usage || 0, 
      quota: estimate.quota || 0 
    };
  } catch (error) {
    console.error('Erro ao verificar cota de armazenamento:', error);
    return { used: 0, quota: 0 };
  }
};

// Inicializa o banco de dados IndexedDB
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('Error opening IndexedDB:', event);
      reject('Não foi possível abrir o banco de dados');
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };
    
    // Executado quando o banco de dados precisa ser criado ou atualizado
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Cria stores para diferentes tipos de dados
      // Cada store é como uma tabela no banco de dados
      if (!db.objectStoreNames.contains('users')) {
        db.createObjectStore('users', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
      
      if (!db.objectStoreNames.contains('userData')) {
        db.createObjectStore('userData', { keyPath: 'key' });
      }
    };
  });
};

// Funções genéricas para manipular dados no IndexedDB
export const dbGet = async <T>(storeName: string, key: string): Promise<T | null> => {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      
      request.onerror = () => {
        reject(`Erro ao buscar dados de ${storeName}`);
      };
      
      request.onsuccess = () => {
        resolve(request.result ? request.result.data : null);
      };
    });
  } catch (error) {
    console.error(`Error getting data from IndexedDB:`, error);
    return null;
  }
};

export const dbSet = async <T>(storeName: string, key: string, data: T): Promise<void> => {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put({ key, data, updatedAt: new Date().toISOString() });
      
      request.onerror = () => {
        reject(`Erro ao salvar dados em ${storeName}`);
      };
      
      request.onsuccess = () => {
        resolve();
      };
    });
  } catch (error) {
    console.error(`Error setting data in IndexedDB:`, error);
    throw error;
  }
};

export const dbRemove = async (storeName: string, key: string): Promise<void> => {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      
      request.onerror = () => {
        reject(`Erro ao remover dados de ${storeName}`);
      };
      
      request.onsuccess = () => {
        resolve();
      };
    });
  } catch (error) {
    console.error(`Error removing data from IndexedDB:`, error);
    throw error;
  }
};

export const dbGetAll = async <T>(storeName: string): Promise<T[]> => {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onerror = () => {
        reject(`Erro ao buscar todos os dados de ${storeName}`);
      };
      
      request.onsuccess = () => {
        const results = request.result || [];
        resolve(results.map(item => item.data));
      };
    });
  } catch (error) {
    console.error(`Error getting all data from IndexedDB:`, error);
    return [];
  }
};

// Hook para usar IndexedDB com React
export function useIndexedDB<T>(storeName: string, key: string, defaultData: T) {
  const [data, setData] = useState<T>(defaultData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Carrega dados iniciais
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const storedData = await dbGet<T>('userData', `${storeName}_${key}`);
        
        if (storedData !== null) {
          setData(storedData);
        }
      } catch (err) {
        console.error(`Error loading data from IndexedDB:`, err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [storeName, key]);

  // Salva dados no IndexedDB
  const saveData = async (newData: T) => {
    try {
      setLoading(true);
      
      await dbSet('userData', `${storeName}_${key}`, newData);
      
      setData(newData);
      setError(null);
      
      toast({
        title: "Dados salvos",
        description: "Suas alterações foram salvas com sucesso.",
      });
    } catch (err) {
      console.error(`Error saving data to IndexedDB:`, err);
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
    refreshData: async () => {
      const storedData = await dbGet<T>('userData', `${storeName}_${key}`);
      if (storedData !== null) {
        setData(storedData);
      }
    }
  };
}

// Hooks especializados

// Hook para BMI calculator data
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
  
  return useIndexedDB<BMICalculatorData>('calculators', 'bmi', defaultData);
};

// Hook para QR Code data
export interface QRCodeData {
  qr_value: string;
  qr_image_url: string;
}

export const useQRCode = () => {
  const defaultData: QRCodeData = {
    qr_value: 'https://zenlife.app',
    qr_image_url: ''
  };
  
  return useIndexedDB<QRCodeData>('utilities', 'qrcode', defaultData);
};

// Interface para os dados de perfil do usuário
export interface UserProfileData {
  name: string;
  bio: string;
  dreams: string; // Campo para armazenar os sonhos do usuário
  photoUrl?: string;  // URL da foto em base64
  createdAt?: string;
  updatedAt?: string;
}

// Hook para gerenciar dados do perfil do usuário
export const useUserProfile = () => {
  const defaultData: UserProfileData = {
    name: '',
    bio: '',
    dreams: '',
    photoUrl: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  return useIndexedDB<UserProfileData>('profile', 'userInfo', defaultData);
};

// Interfaces para Lista de Compras
export interface ShoppingItem {
  id: string;
  name: string;
  price: number;
  checked?: boolean;
}

export interface ShoppingList {
  id: string;
  name: string;
  date: string;
  items: ShoppingItem[];
  total: number;
  isCompleted: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

// Hook para gerenciar listas de compras
export const useShoppingLists = () => {
  const [data, setData] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Carregar todas as listas de compras
  useEffect(() => {
    const loadLists = async () => {
      try {
        setLoading(true);
        const storedLists = await dbGet<ShoppingList[]>('userData', 'shopping_lists');
        
        if (storedLists) {
          setData(storedLists);
        } else {
          // Se não existir, inicializa com array vazio
          setData([]);
          // Salva o array vazio no banco de dados para criar o registro
          await dbSet('userData', 'shopping_lists', []);
        }
      } catch (err) {
        console.error('Erro ao carregar listas de compras:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    
    loadLists();
  }, []);

  // Adicionar nova lista de compras
  const addList = async (name: string) => {
    try {
      setLoading(true);
      
      const newList: ShoppingList = {
        id: Date.now().toString(),
        name,
        date: new Date().toISOString(),
        items: [],
        total: 0,
        isCompleted: false,
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const updatedLists = [...data, newList];
      await dbSet('userData', 'shopping_lists', updatedLists);
      setData(updatedLists);
      
      toast({
        title: "Lista criada",
        description: "Nova lista de compras criada com sucesso."
      });
      
      return newList;
    } catch (err) {
      console.error('Erro ao adicionar lista:', err);
      setError(err as Error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a lista de compras.",
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Adicionar item a uma lista
  const addItem = async (listId: string, item: Omit<ShoppingItem, 'id'>) => {
    try {
      setLoading(true);
      
      const updatedLists = data.map(list => {
        if (list.id === listId) {
          const newItem: ShoppingItem = {
            ...item,
            id: Date.now().toString(),
            checked: false
          };
          
          const newItems = [...list.items, newItem];
          const newTotal = newItems.reduce((sum, item) => sum + item.price, 0);
          
          return {
            ...list,
            items: newItems,
            total: newTotal,
            updatedAt: new Date().toISOString()
          };
        }
        return list;
      });
      
      await dbSet('userData', 'shopping_lists', updatedLists);
      setData(updatedLists);
    } catch (err) {
      console.error('Erro ao adicionar item:', err);
      setError(err as Error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o item à lista.",
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Editar item de uma lista
  const editItem = async (listId: string, itemId: string, updatedItem: Partial<ShoppingItem>) => {
    try {
      setLoading(true);
      
      const updatedLists = data.map(list => {
        if (list.id === listId) {
          const newItems = list.items.map(item => 
            item.id === itemId ? { ...item, ...updatedItem } : item
          );
          
          const newTotal = newItems.reduce((sum, item) => sum + item.price, 0);
          
          return {
            ...list,
            items: newItems,
            total: newTotal,
            updatedAt: new Date().toISOString()
          };
        }
        return list;
      });
      
      await dbSet('userData', 'shopping_lists', updatedLists);
      setData(updatedLists);
    } catch (err) {
      console.error('Erro ao editar item:', err);
      setError(err as Error);
      toast({
        title: "Erro",
        description: "Não foi possível editar o item.",
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Remover item de uma lista
  const removeItem = async (listId: string, itemId: string) => {
    try {
      setLoading(true);
      
      const updatedLists = data.map(list => {
        if (list.id === listId) {
          const newItems = list.items.filter(item => item.id !== itemId);
          const newTotal = newItems.reduce((sum, item) => sum + item.price, 0);
          
          return {
            ...list,
            items: newItems,
            total: newTotal,
            updatedAt: new Date().toISOString()
          };
        }
        return list;
      });
      
      await dbSet('userData', 'shopping_lists', updatedLists);
      setData(updatedLists);
    } catch (err) {
      console.error('Erro ao remover item:', err);
      setError(err as Error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o item da lista.",
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Finalizar lista de compras
  const completeList = async (listId: string) => {
    try {
      setLoading(true);
      
      const updatedLists = data.map(list => 
        list.id === listId 
          ? { ...list, isCompleted: true, updatedAt: new Date().toISOString() } 
          : list
      );
      
      await dbSet('userData', 'shopping_lists', updatedLists);
      setData(updatedLists);
      
      toast({
        title: "Lista finalizada",
        description: "A lista de compras foi finalizada com sucesso."
      });
    } catch (err) {
      console.error('Erro ao finalizar lista:', err);
      setError(err as Error);
      toast({
        title: "Erro",
        description: "Não foi possível finalizar a lista de compras.",
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Arquivar/desarquivar lista
  const toggleArchiveList = async (listId: string) => {
    try {
      setLoading(true);
      
      const updatedLists = data.map(list => {
        if (list.id === listId) {
          return { 
            ...list, 
            isArchived: !list.isArchived, 
            updatedAt: new Date().toISOString() 
          };
        }
        return list;
      });
      
      await dbSet('userData', 'shopping_lists', updatedLists);
      setData(updatedLists);
      
      const targetList = updatedLists.find(list => list.id === listId);
      toast({
        title: targetList?.isArchived ? "Lista arquivada" : "Lista restaurada",
        description: targetList?.isArchived 
          ? "A lista foi movida para o arquivo." 
          : "A lista foi restaurada com sucesso."
      });
    } catch (err) {
      console.error('Erro ao arquivar/restaurar lista:', err);
      setError(err as Error);
      toast({
        title: "Erro",
        description: "Não foi possível arquivar/restaurar a lista.",
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Excluir uma lista
  const deleteList = async (listId: string) => {
    try {
      setLoading(true);
      
      const updatedLists = data.filter(list => list.id !== listId);
      await dbSet('userData', 'shopping_lists', updatedLists);
      setData(updatedLists);
      
      toast({
        title: "Lista excluída",
        description: "A lista de compras foi excluída permanentemente."
      });
    } catch (err) {
      console.error('Erro ao excluir lista:', err);
      setError(err as Error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a lista de compras.",
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    lists: data,
    loading,
    error,
    addList,
    addItem,
    editItem,
    removeItem,
    completeList,
    toggleArchiveList,
    deleteList,
    refreshLists: async () => {
      const storedLists = await dbGet<ShoppingList[]>('userData', 'shopping_lists');
      if (storedLists) {
        setData(storedLists);
      }
    }
  };
}; 
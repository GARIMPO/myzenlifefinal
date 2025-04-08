
import { useEffect, useState } from 'react';

export interface FinanceTransaction {
  id: number;
  description: string;
  amount: number;
  date: string;
  category: string;
  type: 'income' | 'expense';
  isFixed: boolean;
  isArchived: boolean;
}

export interface FinanceSummary {
  balance: number;
  income: number;
  expenses: number;
  savings: number;
}

const FINANCES_STORAGE_KEY = 'zenlife-finances';

const getCurrentMonthStart = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
};

const getCurrentMonthEnd = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
};

// Transações padrão caso não exista nada no localStorage
const defaultTransactions: FinanceTransaction[] = [
  { 
    id: 1, 
    description: "Salário", 
    amount: 5000, 
    date: getCurrentMonthStart(), 
    category: "Trabalho",
    type: "income",
    isFixed: true,
    isArchived: false
  },
  { 
    id: 2, 
    description: "Aluguel", 
    amount: 1200, 
    date: getCurrentMonthStart(), 
    category: "Moradia",
    type: "expense",
    isFixed: true,
    isArchived: false
  },
  { 
    id: 3, 
    description: "Supermercado", 
    amount: 549.25, 
    date: "2023-10-15", 
    category: "Alimentação",
    type: "expense",
    isFixed: false,
    isArchived: false
  },
  { 
    id: 4, 
    description: "Economia mensal", 
    amount: 1500, 
    date: getCurrentMonthStart(), 
    category: "Economia",
    type: "income",
    isFixed: true,
    isArchived: false
  },
];

// Salvar transações no localStorage
export const saveTransactions = (transactions: FinanceTransaction[]) => {
  localStorage.setItem(FINANCES_STORAGE_KEY, JSON.stringify(transactions));
};

// Obter transações do localStorage
export const getTransactions = (): FinanceTransaction[] => {
  const storedTransactions = localStorage.getItem(FINANCES_STORAGE_KEY);
  return storedTransactions ? JSON.parse(storedTransactions) : defaultTransactions;
};

// Hook customizado para gerenciar estado das transações
export const useFinances = () => {
  const [transactions, setTransactions] = useState<FinanceTransaction[]>(getTransactions());

  // Salva no localStorage sempre que as transações forem atualizadas
  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  // Calcular resumo financeiro
  const calculateSummary = (): FinanceSummary => {
    const currentMonthStart = getCurrentMonthStart();
    const currentMonthEnd = getCurrentMonthEnd();
    
    // Filtrar transações do mês atual e não arquivadas
    const currentMonthTransactions = transactions.filter(
      t => !t.isArchived && 
      t.date >= currentMonthStart && 
      t.date <= currentMonthEnd
    );
    
    const income = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const savings = income - expenses;
    const balance = savings;  // Podemos ajustar isso depois se necessário
    
    return { balance, income, expenses, savings };
  };

  const addTransaction = (transaction: Omit<FinanceTransaction, 'id'>) => {
    const newId = transactions.length > 0 
      ? Math.max(...transactions.map(t => t.id)) + 1
      : 1;
    
    setTransactions([...transactions, { ...transaction, id: newId }]);
  };

  const updateTransaction = (updatedTransaction: FinanceTransaction) => {
    setTransactions(
      transactions.map(t => 
        t.id === updatedTransaction.id ? updatedTransaction : t
      )
    );
  };

  const deleteTransaction = (id: number) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const archiveTransaction = (id: number) => {
    setTransactions(
      transactions.map(t => 
        t.id === id ? { ...t, isArchived: true } : t
      )
    );
  };

  return { 
    transactions, 
    summary: calculateSummary(),
    addTransaction,
    updateTransaction,
    deleteTransaction,
    archiveTransaction
  };
};

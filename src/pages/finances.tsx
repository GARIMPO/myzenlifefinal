import { useState } from 'react';
import { ThemeProvider } from 'next-themes';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowDown, 
  ArrowUp, 
  BarChart3, 
  CircleDollarSign, 
  ListChecks,
  Plus, 
  Trash2, 
  Pencil, 
  Archive, 
  Target,
  ArchiveRestore
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { FinanceTransaction, useFinances } from '@/lib/financeStorage';

export default function Finances() {
  const { 
    transactions, 
    summary,
    addTransaction, 
    updateTransaction, 
    deleteTransaction, 
    archiveTransaction 
  } = useFinances();
  
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [isEditingTransaction, setIsEditingTransaction] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  
  const [newTransaction, setNewTransaction] = useState<Omit<FinanceTransaction, 'id'>>({
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    category: 'Outros',
    type: 'expense',
    isFixed: false,
    isArchived: false
  });

  const handleAddTransaction = () => {
    if (!newTransaction.description || newTransaction.amount <= 0) return;
    
    addTransaction(newTransaction);
    
    // Reset form
    setNewTransaction({
      description: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      category: 'Outros',
      type: 'expense',
      isFixed: false,
      isArchived: false
    });
    
    setIsAddingTransaction(false);
  };

  const handleUpdateTransaction = () => {
    if (isEditingTransaction === null) return;
    
    const transactionToUpdate = transactions.find(t => t.id === isEditingTransaction);
    if (!transactionToUpdate) return;
    
    updateTransaction({
      ...transactionToUpdate,
      ...newTransaction
    });
    
    setIsEditingTransaction(null);
  };

  const handleEditTransaction = (transaction: FinanceTransaction) => {
    setIsEditingTransaction(transaction.id);
    setNewTransaction({
      description: transaction.description,
      amount: transaction.amount,
      date: transaction.date,
      category: transaction.category,
      type: transaction.type,
      isFixed: transaction.isFixed,
      isArchived: transaction.isArchived
    });
  };
  
  // New function to restore an archived transaction
  const handleRestoreTransaction = (id: number) => {
    const transactionToRestore = transactions.find(t => t.id === id);
    if (!transactionToRestore) return;
    
    updateTransaction({
      ...transactionToRestore,
      isArchived: false
    });
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (activeTab === "all") return !transaction.isArchived;
    if (activeTab === "expenses") return transaction.type === "expense" && !transaction.isArchived;
    if (activeTab === "income") return transaction.type === "income" && !transaction.isArchived;
    if (activeTab === "fixed") return transaction.isFixed && !transaction.isArchived;
    if (activeTab === "archived") return transaction.isArchived;
    return true;
  });

  const categories = [
    "Alimentação", 
    "Moradia", 
    "Transporte", 
    "Saúde", 
    "Educação", 
    "Lazer", 
    "Trabalho", 
    "Economia", 
    "Outros"
  ];

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
      <div className="min-h-screen flex bg-background">
        <Sidebar />
        <main className="flex-1 ml-16 md:ml-64 p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold flex items-center">
                <CircleDollarSign className="mr-2 h-6 w-6" />
                Finanças
              </h1>
            </div>

            {/* Resumo Financeiro */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card-gradient rounded-xl p-4 border">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Saldo Total</h3>
                  <CircleDollarSign className="h-4 w-4 text-primary" />
                </div>
                <p className="text-2xl font-bold">R$ {summary.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="card-gradient rounded-xl p-4 border">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Receitas</h3>
                  <ArrowUp className="h-4 w-4 text-emerald-500" />
                </div>
                <p className="text-2xl font-bold">R$ {summary.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="card-gradient rounded-xl p-4 border">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Despesas</h3>
                  <BarChart3 className="h-4 w-4 text-rose-500" />
                </div>
                <p className="text-2xl font-bold">R$ {summary.expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="card-gradient rounded-xl p-4 border">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Economias</h3>
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <p className="text-2xl font-bold">R$ {summary.savings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>

            {/* Tabs e Lista de Transações */}
            <Tabs defaultValue="all" className="space-y-4" onValueChange={setActiveTab}>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <TabsList className="flex flex-wrap w-full md:w-auto mb-2 md:mb-0">
                  <TabsTrigger value="all">Todas</TabsTrigger>
                  <TabsTrigger value="expenses">Despesas</TabsTrigger>
                  <TabsTrigger value="income">Receitas</TabsTrigger>
                  <TabsTrigger value="fixed">Fixas</TabsTrigger>
                  <TabsTrigger value="archived">Arquivadas</TabsTrigger>
                </TabsList>
                <Button onClick={() => setIsAddingTransaction(true)} className="w-full md:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Transação
                </Button>
              </div>

              {/* Formulário para adicionar ou editar transação */}
              {(isAddingTransaction || isEditingTransaction !== null) && (
                <div className="card-gradient rounded-xl p-4 md:p-6 border">
                  <h3 className="text-lg font-medium mb-4">
                    {isEditingTransaction !== null ? "Editar Transação" : "Nova Transação"}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="description" className="text-sm font-medium">
                        Descrição
                      </label>
                      <Input
                        id="description"
                        value={newTransaction.description}
                        onChange={e => setNewTransaction({...newTransaction, description: e.target.value})}
                        placeholder="Ex: Aluguel, Supermercado, etc."
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="amount" className="text-sm font-medium">
                        Valor (R$)
                      </label>
                      <Input
                        id="amount"
                        type="number"
                        value={newTransaction.amount}
                        onChange={e => setNewTransaction({...newTransaction, amount: Number(e.target.value)})}
                        placeholder="0,00"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="date" className="text-sm font-medium">
                        Data
                      </label>
                      <Input
                        id="date"
                        type="date"
                        value={newTransaction.date}
                        onChange={e => setNewTransaction({...newTransaction, date: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="category" className="text-sm font-medium">
                        Categoria
                      </label>
                      <Select 
                        value={newTransaction.category}
                        onValueChange={value => setNewTransaction({...newTransaction, category: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tipo</label>
                      <div className="flex space-x-4">
                        <Button
                          type="button"
                          variant={newTransaction.type === "expense" ? "default" : "outline"}
                          onClick={() => setNewTransaction({...newTransaction, type: "expense"})}
                          className="flex-1"
                        >
                          <ArrowDown className="h-4 w-4 mr-2" />
                          Despesa
                        </Button>
                        <Button
                          type="button"
                          variant={newTransaction.type === "income" ? "default" : "outline"}
                          onClick={() => setNewTransaction({...newTransaction, type: "income"})}
                          className="flex-1"
                        >
                          <ArrowUp className="h-4 w-4 mr-2" />
                          Receita
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newTransaction.isFixed}
                          onChange={() => setNewTransaction({...newTransaction, isFixed: !newTransaction.isFixed})}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                        <span className="text-sm font-medium">Transação fixa (mensal)</span>
                      </label>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={isEditingTransaction !== null ? handleUpdateTransaction : handleAddTransaction}
                      className="flex-1"
                    >
                      {isEditingTransaction !== null ? "Atualizar" : "Adicionar"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAddingTransaction(false);
                        setIsEditingTransaction(null);
                      }}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              <TabsContent value="all" className="space-y-4">
                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma transação encontrada
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredTransactions.map(transaction => (
                      <TransactionItem
                        key={transaction.id}
                        transaction={transaction}
                        onEdit={handleEditTransaction}
                        onDelete={deleteTransaction}
                        onArchive={archiveTransaction}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="expenses" className="space-y-4">
                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma despesa encontrada
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredTransactions.map(transaction => (
                      <TransactionItem
                        key={transaction.id}
                        transaction={transaction}
                        onEdit={handleEditTransaction}
                        onDelete={deleteTransaction}
                        onArchive={archiveTransaction}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="income" className="space-y-4">
                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma receita encontrada
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredTransactions.map(transaction => (
                      <TransactionItem
                        key={transaction.id}
                        transaction={transaction}
                        onEdit={handleEditTransaction}
                        onDelete={deleteTransaction}
                        onArchive={archiveTransaction}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="fixed" className="space-y-4">
                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma transação fixa encontrada
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredTransactions.map(transaction => (
                      <TransactionItem
                        key={transaction.id}
                        transaction={transaction}
                        onEdit={handleEditTransaction}
                        onDelete={deleteTransaction}
                        onArchive={archiveTransaction}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="archived" className="space-y-4">
                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma transação arquivada
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredTransactions.map(transaction => (
                      <TransactionItem
                        key={transaction.id}
                        transaction={transaction}
                        onEdit={handleEditTransaction}
                        onDelete={deleteTransaction}
                        onRestore={handleRestoreTransaction}
                        isArchived={true}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}

interface TransactionItemProps {
  transaction: FinanceTransaction;
  onEdit: (transaction: FinanceTransaction) => void;
  onDelete: (id: number) => void;
  onArchive?: (id: number) => void;
  onRestore?: (id: number) => void;
  isArchived?: boolean;
}

function TransactionItem({ transaction, onEdit, onDelete, onArchive, onRestore, isArchived = false }: TransactionItemProps) {
  // Formatando a data para exibição
  const formattedDate = new Date(transaction.date).toLocaleDateString('pt-BR');
  
  return (
    <div className={cn(
      "p-4 rounded-lg border mb-2 bg-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3",
      transaction.type === "income" ? "border-l-4 border-l-emerald-500" : "border-l-4 border-l-rose-500",
      isArchived && "opacity-70"
    )}>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-start justify-between w-full">
          <h4 className="font-medium truncate mr-2">{transaction.description}</h4>
          <span className={cn(
            "font-bold",
            transaction.type === "income" ? "text-emerald-500" : "text-rose-500"
          )}>
            {transaction.type === "income" ? "+" : "-"}
            R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
          <span>{formattedDate}</span>
          <span>•</span>
          <span>{transaction.category}</span>
          {transaction.isFixed && (
            <>
              <span>•</span>
              <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5">Fixa</span>
            </>
          )}
        </div>
      </div>
      <div className="flex space-x-2 w-full sm:w-auto mt-2 sm:mt-0">
        {!isArchived ? (
          <>
            <Button size="sm" variant="ghost" onClick={() => onEdit(transaction)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onDelete(transaction.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
            {onArchive && (
              <Button size="sm" variant="ghost" onClick={() => onArchive(transaction.id)}>
                <Archive className="h-4 w-4" />
              </Button>
            )}
          </>
        ) : (
          <>
            {onRestore && (
              <Button size="sm" variant="ghost" onClick={() => onRestore(transaction.id)}>
                <ArchiveRestore className="h-4 w-4" />
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => onDelete(transaction.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

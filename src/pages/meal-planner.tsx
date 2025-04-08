import { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import * as LucideIcons from 'lucide-react';
import { Plus, Minus, Utensils, Save, Trash, FolderPlus, AlertTriangle, Calendar, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { 
  getMealPlan, 
  saveMealPlan, 
  getFoodCategories, 
  saveFoodCategories,
  addFoodItem,
  removeFoodItem,
  addFoodCategory,
  removeFoodCategory,
  getDefaultIconForCategoryType,
  MealItem,
  WeeklyMealPlan,
  FoodCategory
} from '@/lib/mealPlanStorage';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import IconPicker from '@/components/IconPicker';

// Define default plans before using them
const defaultWeeklyPlan: WeeklyMealPlan = {
  domingo: { items: [] },
  segunda: { items: [] },
  terca: { items: [] },
  quarta: { items: [] },
  quinta: { items: [] },
  sexta: { items: [] },
  sabado: { items: [] }
};

// Food categories data - Default data if none exists in localStorage
const defaultFoodCategories: FoodCategory[] = [
  {
    id: 'fruits',
    title: 'Frutas Frescas',
    icon: 'Apple',
    items: [
      { name: 'Maçã', benefits: 'Fibras e antioxidantes para digestão e saúde cardiovascular.' },
      { name: 'Banana', benefits: 'Potássio para coração e músculos; energia rápida.' },
      { name: 'Laranja', benefits: 'Vitamina C para imunidade e pele.' },
      { name: 'Mamão', benefits: 'Enzima papaína para digestão.' },
      { name: 'Abacate', benefits: 'Gorduras monoinsaturadas para coração e saciedade.' },
      { name: 'Morango', benefits: 'Antioxidantes e vitamina C; combate inflamação.' },
      { name: 'Kiwi', benefits: 'Vitamina C e fibras; auxilia na digestão.' },
      { name: 'Pera', benefits: 'Hidratação e fibras solúveis.' },
      { name: 'Melancia', benefits: 'Licopeno para pele e hidratação.' },
      { name: 'Uva', benefits: 'Resveratrol antioxidante para coração.' },
      { name: 'Manga', benefits: 'Vitamina A para visão e imunidade.' },
      { name: 'Abacaxi', benefits: 'Bromelina anti-inflamatória.' },
      { name: 'Limão', benefits: 'Vitamina C e desintoxicação.' },
      { name: 'Framboesa', benefits: 'Fibras e antioxidantes para controle glicêmico.' },
      { name: 'Amora', benefits: 'Antioxidantes e ferro.' },
      { name: 'Goiaba', benefits: 'Vitamina C e potássio.' },
      { name: 'Figo', benefits: 'Fibras e minerais para ossos.' },
      { name: 'Caqui', benefits: 'Beta-caroteno para visão.' },
      { name: 'Romã', benefits: 'Antioxidantes para coração e cérebro.' },
      { name: 'Coco', benefits: 'Gorduras MCT para energia e metabolismo.' },
    ]
  },
  {
    id: 'vegetables',
    title: 'Vegetais',
    icon: 'Carrot',
    items: [
      { name: 'Brócolis', benefits: 'Vitamina C e K; combate câncer.' },
      { name: 'Couve', benefits: 'Cálcio e ferro para ossos e sangue.' },
      { name: 'Espinafre', benefits: 'Ferro e magnésio para energia.' },
      { name: 'Cenoura', benefits: 'Beta-caroteno para visão.' },
      { name: 'Tomate', benefits: 'Licopeno para próstata e coração.' },
      { name: 'Abobrinha', benefits: 'Baixa caloria e rica em potássio.' },
      { name: 'Berinjela', benefits: 'Antioxidantes e fibras para intestino.' },
      { name: 'Alface', benefits: 'Hidratação e vitamina K.' },
      { name: 'Pepino', benefits: 'Hidratação e silício para pele.' },
      { name: 'Cebola', benefits: 'Quercetina anti-inflamatória.' },
      { name: 'Alho', benefits: 'Alicina para imunidade e coração.' },
      { name: 'Pimentão', benefits: 'Vitamina C e betacaroteno.' },
      { name: 'Beterraba', benefits: 'Nitratos para pressão arterial.' },
      { name: 'Rúcula', benefits: 'Cálcio e antioxidantes.' },
      { name: 'Couve-flor', benefits: 'Vitamina C e fibra.' },
      { name: 'Vagem', benefits: 'Proteína e fibras.' },
      { name: 'Rabanete', benefits: 'Enzimas digestivas.' },
      { name: 'Acelga', benefits: 'Magnésio para nervos e músculos.' },
      { name: 'Aspargo', benefits: 'Ácido fólico para DNA.' },
      { name: 'Ervilha', benefits: 'Proteína vegetal e ferro.' },
    ]
  },
  {
    id: 'proteins',
    title: 'Proteínas Magras',
    icon: 'Beef',
    items: [
      { name: 'Frango grelhado', benefits: 'Proteína magra para músculos.' },
      { name: 'Salmão', benefits: 'Ômega-3 para cérebro e coração.' },
      { name: 'Tilápia', benefits: 'Proteína de fácil digestão.' },
      { name: 'Sardinha', benefits: 'Cálcio e ômega-3.' },
      { name: 'Ovos', benefits: 'Colina para cérebro e proteína.' },
      { name: 'Lentilhas', benefits: 'Ferro e fibras para intestino.' },
      { name: 'Grão-de-bico', benefits: 'Proteína e fibras para saciedade.' },
      { name: 'Tofu', benefits: 'Cálcio e proteína vegetal.' },
      { name: 'Queijo cottage', benefits: 'Caseína para músculos.' },
      { name: 'Iogurte grego', benefits: 'Probióticos e proteína.' },
      { name: 'Carne magra', benefits: 'Ferro heme e creatina.' },
      { name: 'Peru', benefits: 'Triptofano para serotonina.' },
      { name: 'Camarão', benefits: 'Proteína e selênio.' },
      { name: 'Atum', benefits: 'Ômega-3 e vitamina D.' },
      { name: 'Quinoa', benefits: 'Proteína completa (9 aminoácidos).' },
      { name: 'Feijão preto', benefits: 'Ferro e antioxidantes.' },
      { name: 'Edamame', benefits: 'Proteína e isoflavonas.' },
      { name: 'Tempeh', benefits: 'Probióticos e proteína fermentada.' },
      { name: 'Proteína de soja', benefits: 'Opção vegana para músculos.' },
      { name: 'Leite em pó desnatado', benefits: 'Cálcio e proteína.' },
    ]
  },
  {
    id: 'grains',
    title: 'Grãos Integrais',
    icon: 'Wheat',
    items: [
      { name: 'Arroz integral', benefits: 'Fibras e magnésio para metabolismo.' },
      { name: 'Aveia', benefits: 'Beta-glucana para colesterol.' },
      { name: 'Quinoa', benefits: 'Proteína completa e ferro.' },
      { name: 'Pão integral', benefits: 'Fibras e energia sustentada.' },
      { name: 'Macarrão integral', benefits: 'Menos índice glicêmico.' },
      { name: 'Trigo sarraceno', benefits: 'Livre de glúten e rico em magnésio.' },
      { name: 'Cevada', benefits: 'Beta-glucana para intestino.' },
      { name: 'Centeio', benefits: 'Fibras para saciedade.' },
      { name: 'Milho', benefits: 'Licopeno e energia.' },
      { name: 'Farinha de amaranto', benefits: 'Proteína e cálcio.' },
      { name: 'Farinha de linhaça', benefits: 'Ômega-3 e lignanas.' },
      { name: 'Pipoca natural', benefits: 'Fibras e antioxidantes.' },
      { name: 'Granola sem açúcar', benefits: 'Energia e fibras.' },
      { name: 'Farelo de aveia', benefits: 'Fibras solúveis para coração.' },
      { name: 'Couscous integral', benefits: 'Ferro e vitamina B.' },
      { name: 'Bulgur', benefits: 'Fibras e proteína.' },
      { name: 'Farro', benefits: 'Fósforo para ossos.' },
      { name: 'Batata-doce', benefits: 'Beta-caroteno e energia lenta.' },
      { name: 'Mandioca', benefits: 'Energia e vitamina C.' },
      { name: 'Batata-baroa', benefits: 'Potássio e vitamina A.' },
    ]
  },
  {
    id: 'dairy',
    title: 'Laticínios e Alternativas',
    icon: 'Milk',
    items: [
      { name: 'Leite desnatado', benefits: 'Cálcio sem gordura.' },
      { name: 'Iogurte natural', benefits: 'Probióticos para intestino.' },
      { name: 'Queijo branco', benefits: 'Cálcio e proteína de fácil digestão.' },
      { name: 'Leite de amêndoas', benefits: 'Baixa caloria e vitamina E.' },
      { name: 'Leite de coco', benefits: 'Gorduras MCT para energia.' },
      { name: 'Leite de soja', benefits: 'Proteína completa e isoflavonas.' },
      { name: 'Queijo cottage light', benefits: 'Caseína sem gordura.' },
      { name: 'Kefir', benefits: 'Probióticos e vitamina B12.' },
      { name: 'Requeijão light', benefits: 'Cálcio e proteína.' },
      { name: 'Iogurte de coco', benefits: 'Probióticos veganos.' },
      { name: 'Leite em pó desnatado', benefits: 'Prático e rico em proteína.' },
      { name: 'Queijo parmesão light', benefits: 'Sabor intenso com menos gordura.' },
      { name: 'Leite de aveia', benefits: 'Rico em beta-glucana.' },
      { name: 'Cream cheese light', benefits: 'Versátil e cremoso.' },
      { name: 'Leite de castanha', benefits: 'Selênio e ômega-3.' },
      { name: 'Leite de arroz', benefits: 'Hipoalergênico e doce natural.' },
      { name: 'Leite condensado zero açúcar', benefits: 'Opção para sobremesas saudáveis.' },
      { name: 'Queijo mussarela light', benefits: 'Menos gordura e mais proteína.' },
      { name: 'Leite de amaranto', benefits: 'Ferro e cálcio.' },
      { name: 'Leite de linhaça', benefits: 'Ômega-3 e lignanas.' },
    ]
  },
  {
    id: 'fats',
    title: 'Gorduras Saudáveis',
    icon: 'Avocado',
    items: [
      { name: 'Azeite de oliva', benefits: 'Gorduras monoinsaturadas e antioxidantes.' },
      { name: 'Abacate', benefits: 'Gorduras saudáveis para coração.' },
      { name: 'Castanha-do-pará', benefits: 'Selênio antioxidante.' },
      { name: 'Amêndoas', benefits: 'Vitamina E para pele.' },
      { name: 'Nozes', benefits: 'Ômega-3 para cérebro.' },
      { name: 'Sementes de chia', benefits: 'Ômega-3 e fibras.' },
      { name: 'Sementes de linhaça', benefits: 'Lignanas anticâncer.' },
      { name: 'Tahine', benefits: 'Cálcio e gorduras saudáveis.' },
      { name: 'Óleo de coco', benefits: 'MCT para metabolismo.' },
      { name: 'Sementes de abóbora', benefits: 'Zinco para imunidade.' },
      { name: 'Amendoim', benefits: 'Proteína e resveratrol.' },
      { name: 'Sementes de girassol', benefits: 'Vitamina E e magnésio.' },
      { name: 'Avelãs', benefits: 'Antioxidantes para coração.' },
      { name: 'Pistache', benefits: 'Potássio para pressão.' },
      { name: 'Óleo de cártamo', benefits: 'Reduz gordura abdominal.' },
      { name: 'Óleo de canola', benefits: 'Ômega-3 e baixo LDL.' },
      { name: 'Sementes de quinoa', benefits: 'Proteína e ferro.' },
      { name: 'Gergelim', benefits: 'Cálcio e zinco.' },
      { name: 'Óleo de macadâmia', benefits: 'Anti-inflamatório.' },
      { name: 'Chocolate amargo', benefits: 'Flavonoides para coração.' },
    ]
  },
  {
    id: 'snacks',
    title: 'Snacks Saudáveis',
    icon: 'Cookie',
    items: [
      { name: 'Mix de castanhas', benefits: 'Gorduras boas e proteína.' },
      { name: 'Barras de proteína', benefits: 'Energia sem açúcar.' },
      { name: 'Frutas secas', benefits: 'Fibras e energia rápida.' },
      { name: 'Chips de couve', benefits: 'Baixa caloria e fibras.' },
      { name: 'Pipoca light', benefits: 'Fibras e antioxidantes.' },
      { name: 'Torradas integrais', benefits: 'Fibras e energia.' },
      { name: 'Grão-de-bico assado', benefits: 'Proteína crocante.' },
      { name: 'Iogurte desnatado congelado', benefits: 'Probióticos e cálcio.' },
      { name: 'Gelatina zero', benefits: 'Colágeno para pele.' },
      { name: 'Amêndoas laminadas', benefits: 'Ômega-3 e crocância.' },
      { name: 'Cookies integrais', benefits: 'Fibras e energia.' },
      { name: 'Chips de batata-doce', benefits: 'Beta-caroteno e fibras.' },
      { name: 'Sementes de abóbora torradas', benefits: 'Zinco e magnésio.' },
      { name: 'Snacks de proteína de soja', benefits: 'Vegano e proteico.' },
      { name: 'Arroz integral crocante', benefits: 'Fibras e energia.' },
      { name: 'Barras de cereais integrais', benefits: 'Fibras e grãos.' },
      { name: 'Chips de alga nori', benefits: 'Iodo e minerais.' },
      { name: 'Banana chips', benefits: 'Potássio e energia.' },
      { name: 'Snacks de frutas desidratadas', benefits: 'Vitaminas e fibras.' },
      { name: 'Palitinhos de queijo', benefits: 'Proteína e cálcio.' },
    ]
  },
  {
    id: 'seasonings',
    title: 'Temperos e Suplementos',
    icon: 'Soup',
    items: [
      { name: 'Açafrão', benefits: 'Anti-inflamatório e antioxidante.' },
      { name: 'Páprica', benefits: 'Capsaicina para metabolismo.' },
      { name: 'Orégano', benefits: 'Antioxidantes e antibacteriano.' },
      { name: 'Canela', benefits: 'Controle glicêmico e antioxidante.' },
      { name: 'Gengibre', benefits: 'Digestão e anti-inflamatório.' },
      { name: 'Pimenta-do-reino', benefits: 'Aumenta absorção de nutrientes.' },
      { name: 'Alecrim', benefits: 'Melhora memória e circulação.' },
      { name: 'Manjericão', benefits: 'Antioxidantes e vitamina K.' },
      { name: 'Vinagre balsâmico', benefits: 'Regula açúcar no sangue.' },
      { name: 'Shoyu light', benefits: 'Menos sódio e fermentação natural.' },
      { name: 'Molho de pimenta', benefits: 'Capsaicina termogênica.' },
      { name: 'Ervas finas', benefits: 'Vitaminas e antioxidantes.' },
      { name: 'Mostarda', benefits: 'Rico em selênio e vitamina C.' },
      { name: 'Cominho', benefits: 'Digestão e anti-inflamatório.' },
      { name: 'Pimentão em pó', benefits: 'Vitamina C e betacaroteno.' },
      { name: 'Alho em pó', benefits: 'Alicina para imunidade.' },
      { name: 'Cebola em pó', benefits: 'Sabor sem sódio.' },
      { name: 'Missô', benefits: 'Probióticos e enzimas digestivas.' },
      { name: 'Levedo nutricional', benefits: 'Vitamina B12 vegana.' },
      { name: 'Extrato de tomate', benefits: 'Licopeno concentrado.' },
    ]
  },
  {
    id: 'athlete',
    title: 'Para Quem Treina',
    icon: 'Dumbbell',
    items: [
      { name: 'Frango grelhado', benefits: 'Proteína de alto valor biológico.' },
      { name: 'Peixes (salmão, atum)', benefits: 'Ômega-3 para reduzir inflamação.' },
      { name: 'Ovos', benefits: 'Rico em colina e aminoácidos essenciais.' },
      { name: 'Carnes magras (patinho, maminha)', benefits: 'Ferro e creatina natural.' },
      { name: 'Proteína whey', benefits: 'Para recuperação pós-treino.' },
      { name: 'Aveia', benefits: 'Energia lenta e fibras.' },
      { name: 'Batata-doce', benefits: 'Carboidrato de baixo IG e vitamina A.' },
      { name: 'Arroz integral', benefits: 'Fibras e minerais.' },
      { name: 'Quinoa', benefits: 'Proteína completa e ferro.' },
      { name: 'Banana', benefits: 'Potássio para prevenir cãibras.' },
      { name: 'Abacate', benefits: 'Gorduras monoinsaturadas.' },
      { name: 'Castanhas e amêndoas', benefits: 'Ômega-3 e magnésio.' },
      { name: 'Azeite de oliva', benefits: 'Antioxidantes e anti-inflamatórios.' },
      { name: 'Sementes (chia, linhaça)', benefits: 'Ômega-3 e fibras.' },
      { name: 'Brócolis e couve', benefits: 'Vitaminas e antioxidantes.' },
      { name: 'Espinafre', benefits: 'Ferro e magnésio.' },
      { name: 'Tomate', benefits: 'Licopeno para saúde cardiovascular.' },
      { name: 'Whey Protein', benefits: 'Prático para atingir a ingestão diária de proteína.' },
      { name: 'Creatina', benefits: 'Aumenta força e resistência (5g/dia).' },
      { name: 'BCAA', benefits: 'Reduz catabolismo muscular durante treinos longos.' },
    ]
  }
];

const MealPlanner = () => {
  const [activeTab, setActiveTab] = useState('segunda');
  // Now using the defaultWeeklyPlan that's properly initialized
  const [mealPlan, setMealPlan] = useState<WeeklyMealPlan>(() => {
    const savedPlan = getMealPlan();
    return savedPlan || defaultWeeklyPlan;
  });
  const [foodCategories, setFoodCategories] = useState<FoodCategory[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemBenefits, setNewItemBenefits] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [newCategoryTitle, setNewCategoryTitle] = useState('');
  const [newCategoryId, setNewCategoryId] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('Utensils');
  
  // Estados para os diálogos de confirmação
  const [deleteItemDialogOpen, setDeleteItemDialogOpen] = useState(false);
  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] = useState(false);
  const [clearDayDialogOpen, setClearDayDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{categoryId: string, itemName: string} | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string>('');
  const [dayToClear, setDayToClear] = useState<keyof WeeklyMealPlan | null>(null);
  const [mealItemToRemove, setMealItemToRemove] = useState<{day: keyof WeeklyMealPlan, index: number} | null>(null);

  // Inicializar as categorias de alimentos
  useEffect(() => {
    const storedCategories = getFoodCategories();
    if (storedCategories.length === 0) {
      // Se não houver categorias salvas, use as padrões
      saveFoodCategories(defaultFoodCategories);
      setFoodCategories(defaultFoodCategories);
    } else {
      // Se as categorias existentes não têm ícones, adicione-os
      const updatedCategories = storedCategories.map(category => {
        if (!category.icon) {
          return {
            ...category,
            icon: getDefaultIconForCategoryType(category.id)
          };
        }
        return category;
      });
      
      if (JSON.stringify(updatedCategories) !== JSON.stringify(storedCategories)) {
        saveFoodCategories(updatedCategories);
      }
      
      setFoodCategories(updatedCategories);
    }
  }, []);

  // Função para adicionar um alimento ao dia selecionado
  const addItemToDay = (day: keyof WeeklyMealPlan, item: { name: string, category: string, benefits?: string }) => {
    
    setMealPlan(prevPlan => {
      // Criar uma cópia do plano atual
      const newPlan = { ...prevPlan };
      // Adicionar o novo item ao dia específico
      newPlan[day] = {
        ...newPlan[day],
        items: [...newPlan[day].items, item]
      };
      // Salvar o plano atualizado
      saveMealPlan(newPlan);
      return newPlan;
    });
    
    toast.success(`${item.name} adicionado a ${day}`);
  };

  // Configurar a remoção de um item (abre o diálogo de confirmação)
  const confirmRemoveItemFromDay = (day: keyof WeeklyMealPlan, index: number) => {
    setMealItemToRemove({day, index});
    setDeleteItemDialogOpen(true);
  };

  // Remover um item após confirmação
  const removeItemFromDay = () => {
    if (!mealItemToRemove) return;
    
    const {day, index} = mealItemToRemove;
    
    setMealPlan(prevPlan => {
      // Criar uma cópia do plano atual
      const newPlan = { ...prevPlan };
      // Remover o item pelo índice
      newPlan[day] = {
        ...newPlan[day],
        items: newPlan[day].items.filter((_, i) => i !== index)
      };
      // Salvar o plano atualizado
      saveMealPlan(newPlan);
      return newPlan;
    });
    
    toast.info(`Item removido de ${day}`);
    setDeleteItemDialogOpen(false);
    setMealItemToRemove(null);
  };

  // Função para adicionar novo item a uma categoria
  const handleAddNewItem = () => {
    if (!newItemName || !newItemBenefits || !selectedCategoryId) {
      toast.error('Preencha todos os campos');
      return;
    }

    const newItem = {
      name: newItemName,
      benefits: newItemBenefits
    };

    // Atualizar a categoria selecionada com o novo item
    const updatedCategories = foodCategories.map(category => {
      if (category.id === selectedCategoryId) {
        return {
          ...category,
          items: [...category.items, newItem]
        };
      }
      return category;
    });

    setFoodCategories(updatedCategories);
    saveFoodCategories(updatedCategories);
    
    // Limpar campos
    setNewItemName('');
    setNewItemBenefits('');
    
    toast.success(`${newItemName} adicionado à categoria`);
  };

  // Configurar a remoção de um item de categoria (abre o diálogo de confirmação)
  const confirmRemoveItem = (categoryId: string, itemName: string) => {
    setItemToDelete({categoryId, itemName});
    setDeleteItemDialogOpen(true);
  };

  // Remover um item de categoria após confirmação
  const handleRemoveItem = () => {
    if (!itemToDelete) return;
    
    const {categoryId, itemName} = itemToDelete;
    
    const updatedCategories = foodCategories.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          items: category.items.filter(item => item.name !== itemName)
        };
      }
      return category;
    });

    setFoodCategories(updatedCategories);
    saveFoodCategories(updatedCategories);
    
    toast.info(`${itemName} removido da categoria`);
    setDeleteItemDialogOpen(false);
    setItemToDelete(null);
  };

  // Função para adicionar uma nova categoria
  const handleAddNewCategory = () => {
    if (!newCategoryTitle || !newCategoryId) {
      toast.error('Preencha todos os campos da categoria');
      return;
    }

    const newCategory: FoodCategory = {
      id: newCategoryId,
      title: newCategoryTitle,
      icon: newCategoryIcon || 'Utensils',
      items: []
    };

    const updatedCategories = [...foodCategories, newCategory];
    setFoodCategories(updatedCategories);
    saveFoodCategories(updatedCategories);
    
    // Limpar campos
    setNewCategoryTitle('');
    setNewCategoryId('');
    setNewCategoryIcon('Utensils');
    
    toast.success(`Categoria ${newCategoryTitle} adicionada`);
  };

  // Configurar a remoção de uma categoria (abre o diálogo de confirmação)
  const confirmRemoveCategory = (categoryId: string) => {
    if (!categoryId) {
      toast.error('Selecione uma categoria para remover');
      return;
    }
    setCategoryToDelete(categoryId);
    setDeleteCategoryDialogOpen(true);
  };

  // Remover uma categoria após confirmação
  const handleRemoveCategory = () => {
    if (!categoryToDelete) return;
    
    const updatedCategories = foodCategories.filter(category => category.id !== categoryToDelete);
    setFoodCategories(updatedCategories);
    saveFoodCategories(updatedCategories);
    
    toast.info('Categoria removida');
    setDeleteCategoryDialogOpen(false);
    setCategoryToDelete('');
  };

  // Configurar a limpeza de um dia (abre o diálogo de confirmação)
  const confirmClearDay = (day: keyof WeeklyMealPlan) => {
    setDayToClear(day);
    setClearDayDialogOpen(true);
  };

  // Limpar um dia após confirmação
  const handleClearDay = () => {
    if (!dayToClear) return;
    
    setMealPlan(prev => {
      const newPlan = {...prev};
      newPlan[dayToClear].items = [];
      saveMealPlan(newPlan);
      return newPlan;
    });
    
    toast.info(`Plano de ${dayToClear} limpo`);
    setClearDayDialogOpen(false);
    setDayToClear(null);
  };

  // Renderizar os dias da semana como abas
  const renderDayTabs = () => {
    const days = [
      { id: 'segunda', label: 'Segunda' },
      { id: 'terca', label: 'Terça' },
      { id: 'quarta', label: 'Quarta' },
      { id: 'quinta', label: 'Quinta' },
      { id: 'sexta', label: 'Sexta' },
      { id: 'sabado', label: 'Sábado' },
      { id: 'domingo', label: 'Domingo' }
    ];

    return (
      <TabsList className="w-full flex overflow-x-auto justify-start mb-4 p-1">
        {days.map(day => (
          <TabsTrigger
            key={day.id}
            value={day.id}
            className="flex-1 min-w-[70px] px-1 py-2 text-sm"
          >
            {day.label}
          </TabsTrigger>
        ))}
      </TabsList>
    );
  };

  // Renderizar os itens selecionados para um dia específico
  const renderSelectedItems = (day: keyof WeeklyMealPlan) => {
    
    const dayMeals = mealPlan[day];
    
    if (!dayMeals.items.length) {
      return (
        <div className="text-center py-6 text-muted-foreground">
          Nenhum alimento selecionado para {day}.
        </div>
      );
    }

    // Agrupar itens por categoria
    const groupedItems: Record<string, MealItem[]> = {};
    dayMeals.items.forEach(item => {
      if (!groupedItems[item.category]) {
        groupedItems[item.category] = [];
      }
      groupedItems[item.category].push(item);
    });

    return (
      <div className="space-y-4">
        {Object.keys(groupedItems).map(category => (
          <div key={category} className="bg-card rounded-lg p-3 shadow-sm">
            <h3 className="font-medium text-sm mb-2">{category}</h3>
            <div className="flex flex-wrap gap-2">
              {groupedItems[category].map((item, idx) => (
                <Badge 
                  key={`${item.name}-${idx}`}
                  variant="secondary"
                  className="flex items-center gap-1 py-1"
                >
                  {item.name}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 rounded-full"
                    onClick={() => confirmRemoveItemFromDay(
                      day, 
                      dayMeals.items.findIndex(i => i.name === item.name && i.category === item.category)
                    )}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Renderizar o conteúdo das abas para cada dia
  const renderDayTabContent = () => {
    
    const days = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];

    return days.map(day => (
      <TabsContent key={day} value={day} className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex justify-between items-center flex-wrap gap-2">
              <span className="text-lg">Seu prato para {day.charAt(0).toUpperCase() + day.slice(1)}</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => confirmClearDay(day as keyof WeeklyMealPlan)}
                className="h-8"
              >
                Limpar dia
              </Button>
            </CardTitle>
            <CardDescription>Alimentos selecionados para esse dia</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 pb-4">
            {renderSelectedItems(day as keyof WeeklyMealPlan)}
          </CardContent>
        </Card>
      </TabsContent>
    ));
  };

  // Renderizar as caixas modais para cada categoria de alimento
  const renderFoodCategoryModals = () => {
    return foodCategories.map(category => {
      // Get the icon component for the category
      const IconComponent = category.icon ? (LucideIcons as any)[category.icon] : LucideIcons.Utensils;
      
      return (
        <Dialog key={category.id}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full h-24 flex flex-col items-center justify-center gap-2 border-dashed bg-card text-card-foreground dark:text-card-foreground dark:bg-card"
            >
              {IconComponent && <IconComponent className="h-10 w-10 text-orange-500" />}
              <span className="text-center text-base font-medium">{category.title}</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-hidden w-[95vw] fixed top-[35%] left-1/2 -translate-x-1/2">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {IconComponent && <IconComponent className="h-5 w-5" />}
                {category.title}
              </DialogTitle>
              <DialogDescription>
                Selecione um alimento para adicionar ao seu plano
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[50vh]">
              <div className="grid grid-cols-1 gap-2 p-2">
                {category.items.map((item) => (
                  <Card key={item.name} className="overflow-hidden bg-card">
                    <CardHeader className="p-3 pb-0">
                      <CardTitle className="text-sm font-medium text-orange-500">{item.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-1 text-xs text-muted-foreground">
                      {item.benefits}
                    </CardContent>
                    <CardFooter className="p-2 bg-muted/50">
                      <div className="flex flex-wrap gap-1 w-full">
                        {['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'].map((day) => (
                          <Button
                            key={`${item.name}-${day}`}
                            size="sm"
                            variant="ghost"
                            className="flex-1 h-7 text-xs"
                            onClick={() => addItemToDay(day as keyof WeeklyMealPlan, {
                              name: item.name,
                              category: category.title,
                              benefits: item.benefits
                            })}
                          >
                            {day.slice(0, 3)}
                          </Button>
                        ))}
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      );
    });
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 pl-16 lg:pl-64 h-screen overflow-y-auto">
        <div className="container py-6 space-y-6">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold">Monte Seu Prato Saudável</h1>
            <p className="text-muted-foreground">
              Planeje suas refeições com alimentos nutritivos e equilibrados
            </p>
          </div>
          
          <Tabs defaultValue="segunda" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            {renderDayTabs()}
            {renderDayTabContent()}
          </Tabs>

          <div>
            <h2 className="text-xl font-semibold mb-4">Categorias de Alimentos</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {renderFoodCategoryModals()}
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full h-20 flex flex-col items-center justify-center gap-1 border-dashed"
                  >
                    <FolderPlus className="h-5 w-5" />
                    <span className="text-xs">Gerenciar Categorias</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md w-[95vw]">
                  <DialogHeader>
                    <DialogTitle>Gerenciar Categorias</DialogTitle>
                    <DialogDescription>
                      Adicione ou remova categorias e alimentos
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Adicionar Nova Categoria</h3>
                      <div className="space-y-2">
                        <Input 
                          placeholder="ID da categoria (ex: frutas)" 
                          value={newCategoryId} 
                          onChange={(e) => setNewCategoryId(e.target.value)}
                        />
                        <Input 
                          placeholder="Nome da categoria (ex: Frutas Frescas)" 
                          value={newCategoryTitle} 
                          onChange={(e) => setNewCategoryTitle(e.target.value)}
                        />
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Selecione um ícone:</p>
                          <IconPicker
                            value={newCategoryIcon}
                            onChange={setNewCategoryIcon}
                            className="w-full"
                          />
                        </div>
                        <Button 
                          className="w-full" 
                          onClick={handleAddNewCategory}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Categoria
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Remover Categoria</h3>
                      <div className="flex space-x-2">
                        <Select value={categoryToDelete} onValueChange={setCategoryToDelete}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {foodCategories.map(category => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button 
                          variant="destructive" 
                          onClick={() => confirmRemoveCategory(categoryToDelete)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Adicionar Alimento a uma Categoria</h3>
                      <div className="space-y-2">
                        <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {foodCategories.map(category => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input 
                          placeholder="Nome do alimento" 
                          value={newItemName} 
                          onChange={(e) => setNewItemName(e.target.value)}
                        />
                        <Input 
                          placeholder="Benefícios do alimento" 
                          value={newItemBenefits} 
                          onChange={(e) => setNewItemBenefits(e.target.value)}
                        />
                        <Button 
                          className="w-full" 
                          onClick={handleAddNewItem}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Alimento
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog para confirmação de remoção de item */}
      <AlertDialog open={deleteItemDialogOpen} onOpenChange={setDeleteItemDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover item</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este item?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={itemToDelete ? handleRemoveItem : removeItemFromDay}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog para confirmação de remoção de categoria */}
      <AlertDialog open={deleteCategoryDialogOpen} onOpenChange={setDeleteCategoryDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover categoria</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover esta categoria? Todos os alimentos serão perdidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveCategory}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog para confirmação de limpeza do dia */}
      <AlertDialog open={clearDayDialogOpen} onOpenChange={setClearDayDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Limpar dia</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja limpar todos os alimentos deste dia?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearDay}>
              Limpar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MealPlanner;

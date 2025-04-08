
// Interfaces para o planejador de refeições
export interface MealItem {
  name: string;
  category: string;
  benefits?: string;
}

export interface DayMeals {
  items: MealItem[];
}

export interface WeeklyMealPlan {
  domingo: DayMeals;
  segunda: DayMeals;
  terca: DayMeals;
  quarta: DayMeals;
  quinta: DayMeals;
  sexta: DayMeals;
  sabado: DayMeals;
}

export interface FoodCategory {
  id: string;
  title: string;
  icon?: string;  // New field for icon name
  items: {
    name: string;
    benefits: string;
  }[];
}

// Obter o plano de refeições do localStorage
export const getMealPlan = (): WeeklyMealPlan | null => {
  const storedPlan = localStorage.getItem('mealPlan');
  return storedPlan ? JSON.parse(storedPlan) : null;
};

// Salvar plano de refeições no localStorage
export const saveMealPlan = (plan: WeeklyMealPlan): void => {
  localStorage.setItem('mealPlan', JSON.stringify(plan));
};

// Limpar plano de refeições
export const clearMealPlan = (): void => {
  localStorage.removeItem('mealPlan');
};

// Obter as categorias de alimentos do localStorage
export const getFoodCategories = (): FoodCategory[] => {
  const storedCategories = localStorage.getItem('foodCategories');
  return storedCategories ? JSON.parse(storedCategories) : [];
};

// Salvar categorias de alimentos no localStorage
export const saveFoodCategories = (categories: FoodCategory[]): void => {
  localStorage.setItem('foodCategories', JSON.stringify(categories));
};

// Adicionar um novo item a uma categoria existente
export const addFoodItem = (categoryId: string, item: { name: string; benefits: string }): void => {
  const categories = getFoodCategories();
  const updatedCategories = categories.map(category => {
    if (category.id === categoryId) {
      return {
        ...category,
        items: [...category.items, item]
      };
    }
    return category;
  });
  saveFoodCategories(updatedCategories);
};

// Remover um item de uma categoria
export const removeFoodItem = (categoryId: string, itemName: string): void => {
  const categories = getFoodCategories();
  const updatedCategories = categories.map(category => {
    if (category.id === categoryId) {
      return {
        ...category,
        items: category.items.filter(item => item.name !== itemName)
      };
    }
    return category;
  });
  saveFoodCategories(updatedCategories);
};

// Adicionar uma nova categoria
export const addFoodCategory = (category: FoodCategory): void => {
  const categories = getFoodCategories();
  saveFoodCategories([...categories, category]);
};

// Remover uma categoria
export const removeFoodCategory = (categoryId: string): void => {
  const categories = getFoodCategories();
  const updatedCategories = categories.filter(category => category.id !== categoryId);
  saveFoodCategories(updatedCategories);
};

// Helper function for default icons per category type
export const getDefaultIconForCategoryType = (categoryId: string): string => {
  const categoryToIconMap: Record<string, string> = {
    'fruits': 'Apple',
    'vegetables': 'Carrot',
    'proteins': 'Beef',
    'grains': 'Wheat',
    'dairy': 'Milk',
    'fats': 'Avocado',
    'snacks': 'Cookie',
    'seasonings': 'Soup',
    'athlete': 'Dumbbell'
  };
  
  return categoryToIconMap[categoryId] || 'Utensils';
};

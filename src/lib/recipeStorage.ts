
export interface Recipe {
  id: string;
  title: string;
  content: string;
  date: string;
}

// Get recipes from local storage
export const getRecipes = (): Recipe[] => {
  const recipes = localStorage.getItem('recipes');
  return recipes ? JSON.parse(recipes) : [];
};

// Save recipes to local storage
export const saveRecipes = (recipes: Recipe[]): void => {
  // Sort recipes alphabetically by title
  const sortedRecipes = [...recipes].sort((a, b) => a.title.localeCompare(b.title));
  localStorage.setItem('recipes', JSON.stringify(sortedRecipes));
};

// Add a new recipe
export const addRecipe = (recipe: Omit<Recipe, 'id' | 'date'>): Recipe => {
  const recipes = getRecipes();
  const newRecipe = {
    ...recipe,
    id: Date.now().toString(),
    date: new Date().toISOString(),
  };
  
  saveRecipes([...recipes, newRecipe]);
  return newRecipe;
};

// Delete a recipe
export const deleteRecipe = (id: string): void => {
  const recipes = getRecipes();
  const filteredRecipes = recipes.filter(recipe => recipe.id !== id);
  saveRecipes(filteredRecipes);
};

// Edit a recipe
export const editRecipe = (id: string, updatedRecipe: Partial<Omit<Recipe, 'id' | 'date'>>): Recipe | null => {
  const recipes = getRecipes();
  const index = recipes.findIndex(recipe => recipe.id === id);
  
  if (index !== -1) {
    const updatedRecipes = [...recipes];
    updatedRecipes[index] = {
      ...updatedRecipes[index],
      ...updatedRecipe,
    };
    
    saveRecipes(updatedRecipes);
    return updatedRecipes[index];
  }
  
  return null;
};

import React, { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Footer } from "./components/Footer";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Goals from "./pages/goals";
import Habits from "./pages/habits";
import Tasks from "./pages/tasks";
import Finances from "./pages/finances";
import Ideas from "./pages/knowledge";
import Gratitude from "./pages/gratitude";
import Recipes from "./pages/recipes";
import MealPlanner from "./pages/meal-planner";
import Utilities from "./pages/utilities";
import Profile from "./pages/profile";
import ShoppingList from "./pages/shopping-list";
import { ThemeProvider } from "@/components/theme-provider";

const App = () => {
  // Create a new QueryClient instance inside the component
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" forcedTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="flex flex-col min-h-screen">
              <div className="flex-grow">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/goals" element={<Goals />} />
                  <Route path="/habits" element={<Habits />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/finances" element={<Finances />} />
                  <Route path="/knowledge" element={<Ideas />} />
                  <Route path="/ideas" element={<Ideas />} />
                  <Route path="/gratitude" element={<Gratitude />} />
                  <Route path="/recipes" element={<Recipes />} />
                  <Route path="/meal-planner" element={<MealPlanner />} />
                  <Route path="/utilities" element={<Utilities />} />
                  <Route path="/shopping-list" element={<ShoppingList />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
              <Footer />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;

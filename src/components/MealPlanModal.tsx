
import { useState } from 'react';
import { MealItem, WeeklyMealPlan } from '@/lib/mealPlanStorage';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MealPlanModalProps {
  day: keyof WeeklyMealPlan;
  label: string;
  mealPlan: WeeklyMealPlan;
}

const MealPlanModal = ({ day, label, mealPlan }: MealPlanModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dayMeals = mealPlan[day];
  
  // Format day name for display
  const formatDayName = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };
  
  // Group items by category
  const getGroupedItems = () => {
    const groupedItems: Record<string, MealItem[]> = {};
    
    if (dayMeals && dayMeals.items) {
      dayMeals.items.forEach(item => {
        if (!groupedItems[item.category]) {
          groupedItems[item.category] = [];
        }
        groupedItems[item.category].push(item);
      });
    }
    
    return groupedItems;
  };
  
  const groupedItems = getGroupedItems();
  const hasItems = dayMeals && dayMeals.items && dayMeals.items.length > 0;
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          className={`w-full h-14 border hover:bg-accent/50 transition-colors flex flex-col items-center justify-center gap-1 ${hasItems ? 'border-primary/20 bg-primary/5' : 'border-dashed'}`}
        >
          <span className="text-sm font-medium">{label}</span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {hasItems ? `${dayMeals.items.length} itens` : "Sem plano"}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Plano de {formatDayName(day)}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] mt-2">
          {!hasItems ? (
            <div className="py-8 text-center text-muted-foreground">
              Nenhum alimento planejado para este dia.
            </div>
          ) : (
            <div className="space-y-4">
              {Object.keys(groupedItems).map(category => (
                <Card key={category} className="overflow-hidden">
                  <CardContent className="p-3 space-y-2">
                    <h3 className="font-medium text-sm">{category}</h3>
                    <div className="flex flex-wrap gap-1">
                      {groupedItems[category].map((item, idx) => (
                        <Badge 
                          key={`${item.name}-${idx}`}
                          variant="secondary"
                          className="text-xs"
                        >
                          {item.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default MealPlanModal;

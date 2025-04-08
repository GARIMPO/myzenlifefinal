
import React from 'react';
import { Check } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// Food-related icons from Lucide
const foodIcons = [
  'Apple', 'Banana', 'Cherry', 'Beef', 'Fish', 'Egg', 'Salad', 'Utensils', 'Coffee', 
  'Milk', 'Wheat', 'Sandwich', 'Cookie', 'Pizza', 'IceCream', 'Carrot', 'Lemon', 
  'PizzaSlice', 'ChefHat', 'CakeSlice', 'Soup', 'Wine', 'Beer', 'Cocktail', 'Drumstick',
  'Croissant', 'Dessert', 'Vegetables', 'Grape', 'Bowl', 'Bread', 'Orange', 'Vegetable',
  'Heart', 'Star', 'Sparkles', 'Flame', 'Trophy', 'Medal', 'ThumbsUp', 'Zap', 'Leaf',
  'Bean', 'Candy', 'Mug', 'Spoon', 'Knife', 'Fork', 'Bone', 'Scale', 'Archive', 'ArchiveRestore'
];

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const IconPicker = ({ value, onChange, className }: IconPickerProps) => {
  // Find the icon component
  const selectedIcon = value ? (LucideIcons as any)[value] : null;
  const IconComponent = selectedIcon;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={cn("w-[120px] h-[42px] justify-start gap-2", className)}
        >
          {IconComponent ? (
            <IconComponent className="h-4 w-4" />
          ) : (
            <div className="h-4 w-4 rounded-full border border-dashed border-muted-foreground" />
          )}
          <span className="truncate">{value || "Ícone"}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0" align="start">
        <ScrollArea className="h-[300px]">
          <div className="grid grid-cols-4 gap-1 p-2">
            {foodIcons.map((iconName) => {
              // Get the icon component
              const Icon = (LucideIcons as any)[iconName];
              if (!Icon) return null;
              
              const isSelected = value === iconName;
              
              return (
                <Button
                  key={iconName}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-9 w-full justify-start gap-2 px-2",
                    isSelected && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => onChange(iconName)}
                >
                  <Icon className="h-4 w-4" />
                  {isSelected && <Check className="h-3 w-3 ml-auto" />}
                </Button>
              );
            })}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default IconPicker;

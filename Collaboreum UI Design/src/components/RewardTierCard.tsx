import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Check } from "lucide-react";

interface RewardTierCardProps {
  amount: number;
  title: string;
  description: string;
  items: string[];
  stock?: number;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function RewardTierCard({
  amount,
  title,
  description,
  items,
  stock,
  isSelected,
  onSelect
}: RewardTierCardProps) {
  const isLimited = stock !== undefined;
  const isOutOfStock = isLimited && stock === 0;
  
  return (
    <Card className={`relative ${isSelected ? 'ring-2 ring-indigo border-indigo' : ''} ${isOutOfStock ? 'opacity-60' : ''}`}>
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}
      
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg text-indigo">{amount.toLocaleString()}원</h4>
          {isLimited && (
            <Badge variant={isOutOfStock ? "destructive" : "secondary"}>
              {isOutOfStock ? "품절" : `${stock}개 남음`}
            </Badge>
          )}
        </div>
        <h3>{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-start gap-2 text-sm">
              <Check className="w-4 h-4 text-sky flex-shrink-0 mt-0.5" />
              <span>{item}</span>
            </div>
          ))}
        </div>
        
        <Button 
          className="w-full bg-indigo hover:bg-indigo/90"
          disabled={isOutOfStock}
          onClick={onSelect}
        >
          {isOutOfStock ? "품절" : "선택하기"}
        </Button>
      </CardContent>
    </Card>
  );
}
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TIER_LEVELS } from "@/utils/tierLevels";
import { cn } from "@/lib/utils";
import type { TierLevel } from "@/types";

interface TierBoardProps {
  currentTier?: TierLevel | null;
  children?: React.ReactNode;
}

export function TierBoard({ currentTier, children }: TierBoardProps) {
  return (
    <div className="w-full space-y-4">
      {/* 待評區 - 只在沒有選定 tier 時顯示 */}
      {!currentTier && (
        <Card className="border-dashed border-2 border-muted">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">待評區</CardTitle>
          </CardHeader>
          <CardContent className="min-h-30 flex items-center justify-center">
            {children}
          </CardContent>
        </Card>
      )}

      {/* Tier List 區域 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {TIER_LEVELS.map((tier) => {
          const isActive = currentTier === tier.level;

          return (
            <Card
              key={tier.level}
              className={cn(
                "transition-all duration-300",
                isActive && "ring-2 ring-ring shadow-lg scale-105",
              )}
            >
              <CardHeader className={cn("pb-3", tier.bgColor, tier.textColor)}>
                <Badge
                  variant="secondary"
                  className={cn(
                    "w-fit text-sm font-bold",
                    tier.bgColor,
                    tier.textColor,
                  )}
                >
                  {tier.label}
                </Badge>
              </CardHeader>
              <CardContent
                className={cn(
                  "min-h-37.5 flex flex-col items-center justify-center gap-4 transition-colors",
                  isActive && "bg-accent/20",
                )}
                id={`tier-${tier.level}`}
              >
                {isActive && children}
                {!isActive && (
                  <p className="text-sm text-muted-foreground text-center">
                    {tier.description}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StreamingTextProps {
  text: string;
  isStreaming?: boolean;
  className?: string;
}

export function StreamingText({
  text,
  isStreaming = false,
  className,
}: StreamingTextProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // 自動滾動到最新內容
  useEffect(() => {
    if (contentRef.current && isStreaming) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [text, isStreaming]);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          銳評內容
          {isStreaming && (
            <span className="flex gap-1">
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          ref={contentRef}
          className="max-h-100 overflow-y-auto prose prose-invert prose-sm max-w-none"
        >
          {text ? (
            <p className="whitespace-pre-wrap leading-relaxed">
              {text}
              {isStreaming && (
                <span className="inline-block w-2 h-4 ml-1 bg-foreground animate-pulse" />
              )}
            </p>
          ) : (
            <p className="text-muted-foreground italic">等待銳評內容生成...</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

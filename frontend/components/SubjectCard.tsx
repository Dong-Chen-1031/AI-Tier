import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SubjectCardProps {
  subject: string;
  imageUrl?: string;
  className?: string;
}

export function SubjectCard({
  subject,
  imageUrl,
  className,
}: SubjectCardProps) {
  return (
    <div
      className={cn(
        "w-full max-w-50 transition-all duration-1000 ease-out",
        className,
      )}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-4 flex flex-col items-center gap-3">
          {/* 圖片區域 */}
          <div className="w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center transition-transform hover:scale-105">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={subject}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg
                className="w-12 h-12 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            )}
          </div>

          {/* 名稱 */}
          <p className="text-sm font-medium text-center line-clamp-2 animate-in fade-in duration-500">
            {subject}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

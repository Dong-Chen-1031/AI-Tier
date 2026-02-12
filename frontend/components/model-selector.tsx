import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchIcon, PlayIcon, PauseIcon } from "lucide-react";
import { useState, useRef } from "react";
import config from "@/config/constants";
import axios from "axios";
import { cn } from "@/lib/utils";
import pre_load_models from "@/assets/fish_model/score.json"; // Default import to ensure the file is included in the bundle, but we will fetch actual data from API on search.

interface Model {
  _id: string;
  title: string;
  description: string;
  cover_image?: string;
  tags: string[];
  samples?: { audio: string }[];
}

interface ModelSelectorProps {
  value?: string;
  onSelect: (modelId: string) => void;
}

// Since we don't have a Dialog component in ui/, I'll build a custom simple modal here
// or I can check if I can use radix-ui if installed.
// Given previous file check failed for dialog.tsx, I will implement a custom modal inside this file.

export const ModelSelector = ({ value, onSelect }: ModelSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [models, setModels] = useState<Model[]>(pre_load_models); // Initialize with default models
  const [loading, setLoading] = useState(false);
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);
  const [modelName, setModelName] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const searchModels = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `${config.api_endpoints}/models/${query}`,
      );
      // The backend returns the list of items directly based on code analysis
      // But let's handle if it returns { items: [...] } just in case, though code says list.
      const data = response.data;
      setModels(Array.isArray(data) ? data : data.items || []);
    } catch (e) {
      console.error("Failed to fetch models", e);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (url: string) => {
    if (playingUrl === url) {
      audioRef.current?.pause();
      setPlayingUrl(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
      }
      setPlayingUrl(url);
    }
  };

  const handleSelect = (id: string, name: string) => {
    onSelect(id);
    setModelName(name);
    // Stop playing audio when a model is selected
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setPlayingUrl(null);
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        className="w-full justify-start text-left font-normal cursor-pointer"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <SearchIcon className="mr-2 h-4 w-4" />
        {value ? (
          <span>已選擇模型: {modelName}</span>
        ) : (
          <span>選擇語音模型</span>
        )}
      </Button>

      <audio ref={audioRef} onEnded={() => setPlayingUrl(null)} />

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
          {/* Backdrop click to close */}
          <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

          <div className="relative z-50 w-full max-w-2xl gap-4 border bg-background p-6 shadow-lg rounded-lg max-h-[85vh] flex flex-col">
            <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
              <h2 className="text-lg font-semibold leading-none tracking-tight">
                選擇語音模型
              </h2>
              <p className="text-sm text-muted-foreground">
                輸入關鍵字搜尋 Fish Audio 上的模型
              </p>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="搜尋模型，例如：蔣介石"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), searchModels())
                }
              />
              <Button
                onClick={searchModels}
                disabled={loading}
                className="cursor-pointer"
              >
                {loading ? "搜尋中..." : "搜尋"}
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto mt-4 pr-1 min-h-75 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-muted-foreground/40">
              {models.length === 0 && !loading && (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  {query ? "找不到相關模型" : "請輸入關鍵字並搜尋"}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {models.map((model) => (
                  <div
                    key={model._id}
                    className={cn(
                      "group relative flex flex-col rounded-lg border p-4 hover:bg-accent/50 hover:text-accent-foreground transition-colors",
                      value === model._id && "border-primary bg-accent/50",
                    )}
                  >
                    <div className="flex items-start gap-4 mb-2">
                      <div className="relative h-12 w-12 flex-none overflow-hidden rounded-full border border-border">
                        <img
                          src={
                            model.cover_image
                              ? `https://public-platform.r2.fish.audio/cdn-cgi/image/width=128,format=webp/${model.cover_image}`
                              : "https://public-platform.r2.fish.audio/cdn-cgi/image/width=128,format=webp/coverimage/bc3a7eb87a7744e7876657b0f6254d90"
                          }
                          alt={model.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <h4
                          className="font-medium truncate"
                          title={model.title}
                        >
                          {model.title}
                        </h4>
                        <div className="flex gap-1 flex-wrap mt-1">
                          {model.tags?.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center rounded-sm border px-1 text-xs text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3 h-8">
                      {model.description || "無描述"}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-2">
                      {model.samples && model.samples.length > 0 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlay(model.samples![0].audio);
                          }}
                          type="button"
                        >
                          {playingUrl === model.samples![0].audio ? (
                            <PauseIcon className="h-4 w-4 mr-1" />
                          ) : (
                            <PlayIcon className="h-4 w-4 mr-1" />
                          )}
                          試聽
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant={value === model._id ? "default" : "secondary"}
                        className="ml-auto h-8 cursor-pointer"
                        onClick={() => handleSelect(model._id, model.title)}
                        type="button"
                      >
                        {value === model._id ? "已選擇" : "選擇"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Button
              variant="ghost"
              className="absolute right-4 top-4 h-8 w-8 p-0 cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              <span className="sr-only">Close</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

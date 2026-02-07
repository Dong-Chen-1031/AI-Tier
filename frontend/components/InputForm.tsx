import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ROLE_PRESETS, getRolePreset } from "@/config/roles";
import type { TierRequest } from "@/types";

interface InputFormProps {
  onSubmit: (data: TierRequest) => void;
  isLoading?: boolean;
}

export function InputForm({ onSubmit, isLoading = false }: InputFormProps) {
  const [formData, setFormData] = useState<TierRequest>({
    subject: "",
    role_name: "",
    role_description: undefined,
    tier: undefined,
    suggestion: undefined,
    tts: true,
    tts_model: undefined,
    tts_speed: undefined,
    llm_model: undefined,
    style: undefined,
  });

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 驗證必填欄位
    const newErrors: Record<string, string> = {};
    if (!formData.subject.trim()) {
      newErrors.subject = "請輸入評價對象";
    }
    if (!formData.role_name?.trim()) {
      newErrors.role_name = "請輸入扮演者名稱";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit(formData);
  };

  const updateField = <K extends keyof TierRequest>(
    field: K,
    value: TierRequest[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 清除該欄位的錯誤
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // 處理角色預設選擇
  const handleRolePresetChange = (roleName: string) => {
    if (roleName === "custom") {
      // 自定義角色，清空相關欄位
      updateField("role_name", "");
      updateField("role_description", undefined);
      updateField("tts_model", undefined);
      return;
    }

    const preset = getRolePreset(roleName);
    if (preset) {
      updateField("role_name", preset.name);
      updateField("role_description", preset.description);
      if (preset.tts_model) {
        updateField("tts_model", preset.tts_model);
      }
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">從夯到拉 AI 銳評</CardTitle>
        <CardDescription>
          輸入評價對象和扮演者，讓 AI 進行專業銳評
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 必填欄位 */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject" className="required">
                評價對象 *
              </Label>
              <Input
                id="subject"
                placeholder="例如：蔣中正"
                value={formData.subject}
                onChange={(e) => updateField("subject", e.target.value)}
                className={errors.subject ? "border-destructive" : ""}
                disabled={isLoading}
              />
              {errors.subject && (
                <p className="text-sm text-destructive">{errors.subject}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role_preset">選擇預設角色（可選）</Label>
              <Select
                onValueChange={handleRolePresetChange}
                disabled={isLoading}
              >
                <SelectTrigger id="role_preset">
                  <SelectValue placeholder="選擇預設角色或自定義" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">自定義角色</SelectItem>
                  {ROLE_PRESETS.map((preset) => (
                    <SelectItem key={preset.name} value={preset.name}>
                      {preset.name} - {preset.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role_name">扮演者 *</Label>
              <Input
                id="role_name"
                placeholder="例如：孫中山"
                value={formData.role_name || ""}
                onChange={(e) => updateField("role_name", e.target.value)}
                className={errors.role_name ? "border-destructive" : ""}
                disabled={isLoading}
              />
              {errors.role_name && (
                <p className="text-sm text-destructive">{errors.role_name}</p>
              )}
            </div>
          </div>

          {/* 可選欄位 */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role_description">扮演者描述（可選）</Label>
              <Textarea
                id="role_description"
                placeholder="描述扮演者的背景、特點等..."
                value={
                  formData.role_description === false
                    ? ""
                    : (formData.role_description as string) || ""
                }
                onChange={(e) =>
                  updateField("role_description", e.target.value || undefined)
                }
                rows={3}
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tier">預設等級（可選）</Label>
                <Select
                  value={formData.tier || ""}
                  onValueChange={(value) =>
                    updateField("tier", value || undefined)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger id="tier">
                    <SelectValue placeholder="選擇等級" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="夯">夯</SelectItem>
                    <SelectItem value="頂級">頂級</SelectItem>
                    <SelectItem value="人上人">人上人</SelectItem>
                    <SelectItem value="NPC">NPC</SelectItem>
                    <SelectItem value="拉完了">拉完了</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="style">風格（可選）</Label>
                <Input
                  id="style"
                  placeholder="例如：幽默、嚴肅"
                  value={formData.style || ""}
                  onChange={(e) =>
                    updateField("style", e.target.value || undefined)
                  }
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="suggestion">建議（可選）</Label>
              <Textarea
                id="suggestion"
                placeholder="給 AI 的額外建議..."
                value={formData.suggestion || ""}
                onChange={(e) =>
                  updateField("suggestion", e.target.value || undefined)
                }
                rows={2}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* 進階選項 */}
          <Collapsible
            open={isAdvancedOpen}
            onOpenChange={setIsAdvancedOpen}
            className="space-y-2"
          >
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="flex items-center gap-2 w-full justify-start"
                disabled={isLoading}
              >
                {isAdvancedOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                進階選項
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="tts_model">TTS 模型 ID（可選）</Label>
                <Input
                  id="tts_model"
                  placeholder="例如：339a6814818044f7b00161c8e0dd6e35"
                  value={formData.tts_model || ""}
                  onChange={(e) =>
                    updateField("tts_model", e.target.value || undefined)
                  }
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tts_speed">TTS 速度（可選）</Label>
                <Input
                  id="tts_speed"
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="2"
                  placeholder="1.0 - 2.0"
                  value={formData.tts_speed || ""}
                  onChange={(e) =>
                    updateField(
                      "tts_speed",
                      e.target.value ? parseFloat(e.target.value) : undefined,
                    )
                  }
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="llm_model">LLM 模型（可選）</Label>
                <Input
                  id="llm_model"
                  placeholder="例如：gpt-4"
                  value={formData.llm_model || ""}
                  onChange={(e) =>
                    updateField("llm_model", e.target.value || undefined)
                  }
                  disabled={isLoading}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* 提交按鈕 */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="mr-2">生成中...</span>
                <span className="flex gap-1">
                  <span className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 bg-current rounded-full animate-bounce"></span>
                </span>
              </>
            ) : (
              "開始銳評"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

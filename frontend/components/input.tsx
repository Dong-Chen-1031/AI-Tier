import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldDescription,
  FieldSeparator,
  FieldLabel,
  FieldGroup,
} from "@/components/ui/field";
import {
  MessageCircleQuestionMarkIcon,
  BookUserIcon,
  CompassIcon,
  UserIcon,
  SpeechIcon,
  GaugeIcon,
  SettingsIcon,
  AudioLinesIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useRef, useState, useEffect } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import config from "@/config/constants";
import { motion } from "motion/react";
import EnterAnimation from "./subject";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import Loader from "./loader";

import { ModelSelector } from "./model-selector";
import React from "react";
import axios from "axios";

export interface TierRequest {
  subject: string; //V
  role_name?: string; //V
  role_description?: string | false; //V
  tier?: string;
  suggestion?: string | null; //V
  tts?: boolean | null; //V
  tts_model?: string | null; //V
  tts_speed?: number | null; //V
  llm_model?: string | null; //V
  style?: string | null;
}

export const InputGroupIcon = ({
  onDecided,
  onStreamComplete,
}: {
  onDecided?: (data: {
    id: string;
    tier: string;
    url: string;
    subject: string;
    roleName?: string;
  }) => void;
  onStreamComplete?: (message: string, id: string) => void;
}) => {
  const [editLevel, setEditLevel] = useState(false);
  const [progress, setProgress] = useState<"setting" | "loading" | "finished">(
    "setting",
  );
  const [imgUrl, setImgUrl] = useState<string>("");
  const [caseId, setCaseId] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement>(null);
  const [message, setMessage] = React.useState("");
  const [hasMoved, setHasMoved] = useState(false);
  const [pendingDecision, setPendingDecision] = useState<{
    tier: string;
    url: string;
  } | null>(null);
  const [audioFinished, setAudioFinished] = useState(false);

  const { control, register, handleSubmit, watch, setValue, getValues } =
    useForm<TierRequest>({
      defaultValues: {
        subject: "",
        role_name: "",
        role_description: "",
        suggestion: "",
        tier: config.tierList[0],
        llm_model: "gpt4",
        style: "不指定",
        tts_model: "",
        tts_speed: 1,
        tts: true,
      },
    });

  // Reset state when starting new
  const resetState = () => {
    setHasMoved(false);
    setMessage("");
    setPendingDecision(null);
    setAudioFinished(false);
  };

  useEffect(() => {
    if (pendingDecision && audioFinished && onDecided && !hasMoved) {
      setHasMoved(true);
      const { subject, role_name } = getValues();
      onDecided({
        id: caseId,
        tier: pendingDecision.tier,
        url: pendingDecision.url,
        subject,
        roleName: role_name,
      });
    }
  }, [pendingDecision, audioFinished, onDecided, hasMoved, getValues, caseId]);

  const playAudio = async (case_id: string) => {
    if (audioRef.current) {
      setAudioFinished(false);
      audioRef.current.src = `${config.api_endpoints}/tts/${case_id}`;
      audioRef.current.play();
    }
  };

  const streamText = async (case_id: string, currentImgUrl: string) => {
    const response = await fetch(`${config.api_endpoints}/text/${case_id}`);
    if (!response.ok) {
      console.error("Failed to fetch stream:", response.statusText);
      return;
    }
    if (!response.body) {
      console.error("No response body found");
      return;
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";
    let decided = false;

    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        if (onStreamComplete) {
          onStreamComplete(
            fullText.replace(/\[(夯|頂級|人上人|NPC|拉完了)\]/g, ""),
            case_id,
          );
        }
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      fullText += chunk;
      setMessage(fullText.replace(/\[(夯|頂級|人上人|NPC|拉完了)\]/g, ""));

      if (!decided) {
        const match = fullText.match(/\[(夯|頂級|人上人|NPC|拉完了)\]/);
        if (match) {
          decided = true;
          setPendingDecision({ tier: match[1], url: currentImgUrl });
        }
      }
    }
  };

  const startTier = async (data: TierRequest) => {
    resetState();
    const response = await axios.post(`${config.api_endpoints}/tier`, data);
    const case_id = response.data.case_id;
    const img_url = response.data.img_url;

    // Set ImgUrl state for local display until it moves
    setImgUrl(img_url);
    setCaseId(case_id);

    playAudio(case_id);
    streamText(case_id, img_url);
    return { img_url, case_id };
  };

  const speed = watch("tts_speed") || 1;

  const onSubmit: SubmitHandler<TierRequest> = async (data) => {
    const payload = { ...data };
    if (!editLevel) {
      delete payload.tier;
    }

    setProgress("loading");
    await startTier(payload);
    setProgress("finished");
  };

  const handleNext = () => {
    setValue("subject", "");
    resetState();
    setProgress("setting");
  };

  return (
    <>
      <audio ref={audioRef} onEnded={() => setAudioFinished(true)}></audio>

      {progress === "setting" || progress === "loading" ? (
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, y: 100 }}
          key="form"
          transition={{
            type: "spring",
            stiffness: 260, // 剛性（數值越高，回彈越快）
            damping: 20, // 阻尼（數值越高，晃動次數越少）
          }}
          className="flex h-full flex-col justify-center"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="grid w-full gap-6">
            <FieldGroup>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  {/* <FieldLabel htmlFor="city"></FieldLabel> */}
                  <InputGroup>
                    <InputGroupInput
                      type="text"
                      placeholder="銳評目標"
                      {...register("subject", { required: true })}
                    />
                    <InputGroupAddon>
                      <CompassIcon />
                    </InputGroupAddon>
                  </InputGroup>
                </Field>
                <Field>
                  {/* <FieldLabel htmlFor="city"></FieldLabel> */}
                  <InputGroup>
                    <InputGroupInput
                      type="text"
                      placeholder="銳評者 [可選]"
                      {...register("role_name")}
                    />
                    <InputGroupAddon>
                      <UserIcon />
                    </InputGroupAddon>
                  </InputGroup>
                </Field>
              </div>
            </FieldGroup>

            <InputGroup>
              <InputGroupInput
                placeholder="銳評者描述 [可選]"
                {...register("role_description")}
              />
              <InputGroupAddon>
                <BookUserIcon />
              </InputGroupAddon>
            </InputGroup>

            <InputGroup>
              <InputGroupInput
                placeholder="其他建議 [可選]"
                {...register("suggestion")}
              />
              <InputGroupAddon>
                <MessageCircleQuestionMarkIcon />
              </InputGroupAddon>
            </InputGroup>
            <div className="flex flex-col gap-0 w-full">
              <Field orientation="horizontal" className="pl-1">
                <FieldLabel
                  htmlFor="tier-switch"
                  className="text-primary font-light"
                >
                  <SettingsIcon className="text-primary w-3.5 min-w-3.5" />

                  <p className="w-fit min-w-16">是否指定銳評等級</p>
                </FieldLabel>
                <Switch
                  id="tier-switch"
                  className="cursor-pointer"
                  checked={editLevel}
                  onCheckedChange={(checked) => setEditLevel(checked)}
                />
              </Field>
              <Controller
                control={control}
                name="tier"
                render={({ field }) => (
                  <ToggleGroup
                    type="single"
                    value={field.value}
                    onValueChange={field.onChange}
                    variant="outline"
                    className={`w-max-full transition-all ease-in-out duration-300 overflow-hidden 
                ${editLevel ? "max-h-40 opacity-100 translate-y-0m mt-4" : "max-h-0 opacity-0 -translate-y-1 mt-0"}
              `}
                  >
                    {config.tierList.map((label, index) => (
                      <ToggleGroupItem
                        key={index}
                        value={label}
                        aria-label={`選擇 ${label}`}
                        // style={{ backgroundColor: config.colorList[index] }}
                        className="w-[20%] cursor-pointer"
                      >
                        {label}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                )}
              />
            </div>
            <FieldSeparator />
            <Field orientation="horizontal">
              <FieldLabel
                htmlFor="llm-select"
                className="text-primary font-light pl-1"
              >
                選擇大語言模型
              </FieldLabel>
              <Controller
                control={control}
                name="llm_model"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? undefined}
                  >
                    <SelectTrigger className="w-full max-w-48 select-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" className="select-none">
                      <SelectGroup>
                        <SelectLabel>模型</SelectLabel>
                        <SelectItem value="gpt4">gpt-4</SelectItem>
                        <SelectItem value="banana">Banana</SelectItem>
                        <SelectItem value="blueberry">Blueberry</SelectItem>
                        <SelectItem value="grapes">Grapes</SelectItem>
                        <SelectItem value="pineapple">Pineapple</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field orientation="horizontal">
              <FieldLabel
                htmlFor="style-select"
                className="text-primary font-light pl-1"
              >
                選擇風格
              </FieldLabel>
              <Controller
                control={control}
                name="style"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? undefined}
                  >
                    <SelectTrigger className="w-full max-w-48 select-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" className="select-none">
                      <SelectGroup>
                        <SelectLabel>風格</SelectLabel>
                        <SelectItem value="不指定">不指定</SelectItem>
                        <SelectItem value="尖酸刻薄">尖酸刻薄</SelectItem>
                        <SelectItem value="寬宏大量">寬宏大量</SelectItem>
                        <SelectItem value="幽默風趣">幽默風趣</SelectItem>
                        <SelectItem value="不苟言笑">不苟言笑</SelectItem>
                        <SelectItem value="歡樂喜悅">歡樂喜悅</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <FieldSeparator />

            <Field className="gap-1">
              <Controller
                control={control}
                name="tts_model"
                render={({ field }) => (
                  <ModelSelector
                    value={field.value ?? undefined}
                    onSelect={(id, name) => {
                      field.onChange(id);
                      if (!getValues("role_name")) {
                        setValue("role_name", name);
                      }
                    }}
                  />
                )}
              />
              <FieldDescription className="text-primary/50 text-left text-xs ml-1">
                可直接搜尋並試聽選擇語音模型
              </FieldDescription>
            </Field>

            <Field orientation="horizontal" className="pl-1">
              <GaugeIcon className="text-primary w-3.5 min-w-3.5" />
              <FieldLabel
                htmlFor="speed-slider"
                className="text-primary font-light"
              >
                <p className="w-fit min-w-16">朗讀速度</p>
                <code>
                  {typeof speed === "number" ? speed.toFixed(1) : speed}
                </code>
              </FieldLabel>
              <Controller
                control={control}
                name="tts_speed"
                render={({ field }) => (
                  <Slider
                    defaultValue={[field.value ?? 1]}
                    max={2}
                    min={0.1}
                    step={0.01}
                    className="mx-auto w-full select-none"
                    onValueChange={(value) =>
                      field.onChange(Math.round(value[0] * 10) / 10)
                    }
                  />
                )}
              />
            </Field>
            <Field orientation="horizontal" className="pl-1">
              <AudioLinesIcon className="text-primary w-3.5 min-w-3.5" />
              <FieldLabel
                htmlFor="tts-switch"
                className="text-primary font-light"
              >
                <p className="w-fit min-w-16">啟用文字朗讀功能</p>
              </FieldLabel>
              <Controller
                control={control}
                name="tts"
                render={({ field }) => (
                  <Switch
                    id="tts-switch"
                    checked={field.value ?? true}
                    onCheckedChange={field.onChange}
                    className="cursor-pointer"
                  />
                )}
              />
            </Field>

            <Button
              className="cursor-pointer"
              variant="outline"
              type="submit"
              disabled={progress === "loading"}
            >
              {progress === "setting" ? <SpeechIcon /> : <Loader />}
              開始銳評
            </Button>
          </form>
        </motion.div>
      ) : (
        <div className="flex h-full w-full items-center justify-center flex-col gap-6">
          {console.log(caseId) === void 0 ||
            (!hasMoved && <EnterAnimation imgUrl={imgUrl} layoutId={caseId} />)}
          <div className="flex flex-col items-center gap-4">
            <p>{message}</p>
            {hasMoved && (
              <Button onClick={handleNext} variant="outline">
                繼續銳評
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

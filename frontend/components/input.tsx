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
import { AnimatePresence, motion } from "motion/react";
import EnterAnimation from "./subject";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import Loader from "./loader";

import { ModelSelector } from "./model-selector";
import React from "react";
import axios from "axios";
import { useReviewCases } from "../contexts/ReviewCaseContext";
import { ShareButton } from "./ShareButton";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

export interface TierRequest {
  subject: string; //V
  role_name?: string; //V
  role_description?: string | false; //V
  tier?: string; //V
  suggestion?: string | null; //V
  tts?: boolean | null; //V
  tts_model?: string | null; //V
  tts_speed?: number | null; //V
  llm_model?: string | null; //V
  style?: string | null; //V
  turnstile_token?: string | null; //V
}

export const TierInputGroup = ({
  onDecided,
}: {
  onDecided?: (tier: string, url: string) => void;
}) => {
  const [editLevel, setEditLevel] = useState(false);
  const [progress, setProgress] = useState<"setting" | "loading" | "finished">(
    "setting",
  );
  const [imgUrl, setImgUrl] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement>(null);
  const [message, setMessage] = React.useState("");
  const [hasMoved, setHasMoved] = useState(false);
  const [pendingDecision, setPendingDecision] = useState<{
    tier: string;
    url: string;
  } | null>(null);

  // For image move
  const [audioFinished, setAudioFinished] = useState(false);
  const [msgFinished, setMsgFinished] = useState(false);
  const [isTimeToMove, setIsTimeToMove] = useState(false);

  const { addCase, updateCase } = useReviewCases();

  const turnstileRef = useRef<TurnstileInstance | null>(null);
  const turnstileRefShare = useRef<TurnstileInstance | null>(null);

  // Reset state when starting new
  const resetState = () => {
    setHasMoved(false);
    setMessage("");
    setPendingDecision(null);
    setAudioFinished(false);
  };

  useEffect(() => {
    if (
      pendingDecision &&
      onDecided &&
      !hasMoved &&
      msgFinished &&
      isTimeToMove
    ) {
      setHasMoved(true);
      onDecided(pendingDecision.tier, pendingDecision.url);
    }
  }, [pendingDecision, onDecided, hasMoved, msgFinished, isTimeToMove]);

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
        setMsgFinished(true);
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      fullText += chunk;
      const cleanText = fullText.replace(
        /\[(夯|頂級|人上人|NPC|拉完了)\]/g,
        "",
      );
      setMessage(cleanText);

      // Update streaming text in global state
      updateCase(case_id, { streamingText: fullText, reply: cleanText });

      if (!decided) {
        const match = fullText.match(/\[(夯|頂級|人上人|NPC|拉完了)\]/);
        if (match) {
          decided = true;
          setPendingDecision({ tier: match[1], url: currentImgUrl });
          // Update tier decision in global state
          updateCase(case_id, { tierDecision: match[1] });
        }
      }
    }
  };

  const startTier = async (data: TierRequest) => {
    resetState();
    const response = await axios.post(`${config.api_endpoints}/tier`, data);
    const case_id = response.data.case_id;
    const img_url = response.data.img_url;

    setImgUrl(img_url);

    addCase({
      caseId: case_id,
      imageUrl: img_url,
      formData: {
        subject: data.subject,
        role_name: data.role_name,
        role_description: data.role_description as string | undefined,
        tier: data.tier,
        suggestion: data.suggestion || undefined,
        tts: data.tts || undefined,
        tts_model: data.tts_model || undefined,
        tts_speed: data.tts_speed || undefined,
        llm_model: data.llm_model || undefined,
        style: data.style || undefined,
      },
      streamingText: "",
      reply: "",
    });
    setTimeout(() => {
      setIsTimeToMove(true);
    }, 5000);
    playAudio(case_id);
    streamText(case_id, img_url);
    return img_url;
  };

  const { control, register, handleSubmit, watch, setValue } =
    useForm<TierRequest>({
      defaultValues: {
        subject: "",
        role_name: "",
        role_description: "",
        suggestion: "",
        tier: config.tierList[0],
        llm_model: config.LLMs[0],
        style: "不指定",
        tts_speed: 1,
        tts: true,
      },
    });

  const speed = watch("tts_speed") || 1;

  const onSubmit: SubmitHandler<TierRequest> = async (data) => {
    const payload = { ...data };
    if (!editLevel) {
      delete payload.tier;
    }
    if (!payload.turnstile_token) {
      alert("驗證尚未完成，請等待數秒鐘後再試一次");
      return;
    }
    setProgress("loading");
    turnstileRef.current?.reset();
    const img_url = await startTier(payload);
    setImgUrl(img_url);
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

      <AnimatePresence>
        {progress === "setting" || progress === "loading" ? (
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.1, y: 100 }}
            layoutId="just_an_input"
            key="form"
            transition={{
              type: "spring",
              stiffness: 260, // 剛性（數值越高，回彈越快）
              damping: 20, // 阻尼（數值越高，晃動次數越少）
            }}
            className="flex h-full flex-col justify-center"
          >
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="grid w-full gap-6"
            >
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
                      <SelectTrigger
                        className="w-full max-w-48 select-none"
                        aria-label="選擇大語言模型"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent position="popper" className="select-none">
                        <SelectGroup>
                          <SelectLabel>模型</SelectLabel>
                          {config.LLMs.map((model) => (
                            <SelectItem
                              key={model}
                              value={model}
                              className="cursor-pointer"
                            >
                              {model.split("/")[1]}
                            </SelectItem>
                          ))}
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
                      <SelectTrigger
                        className="w-full max-w-48 select-none"
                        aria-label="選擇風格"
                      >
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
                      onSelect={field.onChange}
                    />
                  )}
                />
                {/* <FieldDescription className="text-primary/50 text-left text-xs ml-1">
                  可直接搜尋並試聽選擇語音模型
                </FieldDescription> */}
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
                      aria-label="朗讀速度"
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
              <div className="w-full grid grid-cols-3 gap-4 mt-6">
                <div className="hidden">
                  <Controller
                    name="turnstile_token"
                    control={control}
                    render={({ field }) => (
                      <Turnstile
                        ref={turnstileRef}
                        siteKey={config.turnstile_site_key}
                        options={{ size: "invisible", action: "submit-tier" }}
                        onSuccess={(token) => {
                          field.onChange(token);
                        }}
                        onExpire={turnstileRef.current?.reset}
                      />
                    )}
                  />
                </div>
                <Button
                  className="cursor-pointer col-span-2"
                  variant="outline"
                  type="submit"
                  disabled={progress === "loading"}
                >
                  {progress === "setting" ? <SpeechIcon /> : <Loader />}
                  開始銳評
                </Button>
                <ShareButton className="col-span-1" turnstile={turnstileRef} />
              </div>
            </form>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {progress === "finished" ? (
        <>
          <Turnstile
            ref={turnstileRefShare}
            siteKey={config.turnstile_site_key}
            options={{ size: "invisible", action: "submit-tier" }}
            onExpire={turnstileRefShare.current?.reset}
          />
          <div className="flex h-full w-full items-center justify-center flex-col gap-6">
            {!hasMoved && <EnterAnimation imgUrl={imgUrl} layoutId={imgUrl} />}
            <div className="flex flex-col items-center gap-4">
              <p>{message}</p>
              {hasMoved && (
                <div className="flex gap-4">
                  <Button onClick={handleNext} variant="outline">
                    繼續銳評
                  </Button>
                  <ShareButton turnstile={turnstileRefShare} />
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </>
  );
};

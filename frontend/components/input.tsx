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
  MicVocalIcon,
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
import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import config from "@/config/constants";
import { motion, AnimatePresence } from "motion/react";
import EnterAnimation from "./subject";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import Loader from "./loader";

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
  whenSubmit,
}: {
  whenSubmit: (data: TierRequest) => Promise<string>;
}) => {
  const [editLevel, setEditLevel] = useState(false);
  const [progress, setProgress] = useState<"setting" | "loading" | "finished">(
    "setting",
  );
  const [imgUrl, setImgUrl] = useState<string>("");

  const { control, register, handleSubmit, watch } = useForm<TierRequest>({
    defaultValues: {
      subject: "",
      role_name: "",
      role_description: "",
      suggestion: "",
      tier: config.tierList[0],
      llm_model: "gpt4",
      style: "不指定",
      tts_model: "",
      tts_speed: 1.0,
      tts: true,
    },
  });

  const speed = watch("tts_speed") || 1;

  const onSubmit: SubmitHandler<TierRequest> = async (data) => {
    // If editLevel is false, we might want to clear the 'tier' or handle it
    // depending on backend requirement. Assuming we just send what's in the form
    // or arguably set tier to undefined if editLevel is false.
    const payload = { ...data };
    if (!editLevel) {
      delete payload.tier;
    }

    setProgress("loading");
    const img_url = await whenSubmit(payload);
    setImgUrl(img_url);
    setProgress("finished");
  };

  return (
    <AnimatePresence initial={false}>
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
              <InputGroup>
                <InputGroupInput
                  placeholder="Fish Audio 模型 ID"
                  {...register("tts_model")}
                />
                <InputGroupAddon>
                  <MicVocalIcon />
                </InputGroupAddon>
              </InputGroup>
              <FieldDescription className="text-primary/50 text-left text-xs ml-1">
                請至{" "}
                <a
                  href="https://fish.audio/app/discovery/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Fish Audio
                </a>{" "}
                官網選擇模型，並輸入 ID
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
        <div className="flex h-full w-full items-center justify-center">
          <EnterAnimation imgUrl={imgUrl} />
        </div>
      )}
    </AnimatePresence>
  );
};

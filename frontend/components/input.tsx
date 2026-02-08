import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupTextarea,
  InputGroupText,
  InputGroupButton,
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
  Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import config from "@/config/constants";

export const InputGroupIcon = ({
  whenSubmit,
}: {
  whenSubmit: () => Promise<void>;
}) => {
  const [speed, setSpeed] = useState(1);
  const [editLevel, setEditLevel] = useState(false);
  return (
    <div className="grid w-full gap-6">
      <FieldGroup>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            {/* <FieldLabel htmlFor="city"></FieldLabel> */}
            <InputGroup>
              <InputGroupInput type="text" placeholder="銳評目標" />
              <InputGroupAddon>
                <CompassIcon />
              </InputGroupAddon>
            </InputGroup>
          </Field>
          <Field>
            {/* <FieldLabel htmlFor="city"></FieldLabel> */}
            <InputGroup>
              <InputGroupInput type="text" placeholder="銳評者 [可選]" />
              <InputGroupAddon>
                <UserIcon />
              </InputGroupAddon>
            </InputGroup>
          </Field>
        </div>
      </FieldGroup>

      <InputGroup>
        <InputGroupInput placeholder="銳評者描述 [可選]" />
        <InputGroupAddon>
          <BookUserIcon />
        </InputGroupAddon>
      </InputGroup>

      <InputGroup>
        <InputGroupInput placeholder="其他建議 [可選]" />
        <InputGroupAddon>
          <MessageCircleQuestionMarkIcon />
        </InputGroupAddon>
      </InputGroup>
      <div className="flex flex-col gap-0 w-full">
        <Field orientation="horizontal" className="pl-1">
          <FieldLabel
            htmlFor="terms-checkbox-basic"
            className="text-primary font-light"
          >
            <SettingsIcon className="text-primary w-3.5 min-w-3.5" />

            <p className="w-fit min-w-16">是否指定銳評等級</p>
          </FieldLabel>
          <Switch
            id="airplane-mode"
            className="cursor-pointer"
            checked={editLevel}
            onCheckedChange={(checked) => setEditLevel(checked)}
          />
        </Field>
        <ToggleGroup
          type="single"
          // defaultValue={config.tierList[0]}
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
      </div>
      <FieldSeparator />
      <Field orientation="horizontal">
        <FieldLabel
          htmlFor="terms-checkbox-basic"
          className="text-primary font-light pl-1"
        >
          選擇大語言模型
        </FieldLabel>
        <Select defaultValue="gpt4">
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
      </Field>
      <Field orientation="horizontal">
        <FieldLabel
          htmlFor="terms-checkbox-basic"
          className="text-primary font-light pl-1"
        >
          選擇風格
        </FieldLabel>
        <Select defaultValue="不指定">
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
      </Field>
      <FieldSeparator />

      <Field className="gap-1">
        <InputGroup>
          <InputGroupInput placeholder="Fish Audio 模型 ID" />
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
          htmlFor="terms-checkbox-basic"
          className="text-primary font-light"
        >
          <p className="w-fit min-w-16">朗讀速度</p>
          <code>{speed.toFixed(1)}</code>
        </FieldLabel>
        <Slider
          defaultValue={[speed]}
          max={2}
          min={0.1}
          step={0.01}
          className="mx-auto w-full select-none"
          // value={[speed]}
          onValueChange={(value) => setSpeed(Math.round(value[0] * 10) / 10)}
        />
      </Field>
      <Field orientation="horizontal" className="pl-1">
        <AudioLinesIcon className="text-primary w-3.5 min-w-3.5" />
        <FieldLabel
          htmlFor="terms-checkbox-basic"
          className="text-primary font-light"
        >
          <p className="w-fit min-w-16">啟用文字朗讀功能</p>
        </FieldLabel>
        <Switch id="airplane-mode" defaultChecked className="cursor-pointer" />
      </Field>

      <Button className="cursor-pointer" variant="outline" onClick={whenSubmit}>
        <SpeechIcon />
        開始銳評
      </Button>
    </div>
  );
};

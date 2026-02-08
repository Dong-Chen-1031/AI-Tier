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
} from "@/components/ui/field";
import {
  MicVocalIcon,
  MessageCircleQuestionMarkIcon,
  BookUserIcon,
  CompassIcon,
  UserIcon,
  SpeechIcon,
  GaugeIcon,
  GuitarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

export function InputGroupIcon() {
  const [speed, setSpeed] = useState(1);
  return (
    <div className="grid w-full gap-6">
      <InputGroup>
        <InputGroupInput placeholder="銳評目標..." />
        <InputGroupAddon>
          <CompassIcon />
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput placeholder="銳評者..." />
        <InputGroupAddon>
          <UserIcon />
        </InputGroupAddon>
      </InputGroup>

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
      <FieldSeparator />
      <Field orientation="horizontal">
        <FieldLabel
          htmlFor="terms-checkbox-basic"
          className="text-primary font-light"
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
          className="text-primary font-light"
        >
          選擇風格 [可選]
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

      <Field orientation="horizontal">
        <GaugeIcon className="w-4 text-primary" />
        <FieldLabel
          htmlFor="terms-checkbox-basic"
          className="text-primary font-light"
        >
          朗讀速度
          <code>{speed}</code>
        </FieldLabel>
        <Slider
          defaultValue={[speed]}
          max={2}
          min={0.1}
          step={0.01}
          className="mx-auto max-w-[60%] "
          // value={[speed]}
          onValueChange={(value) => setSpeed(Math.round(value[0] * 10) / 10)}
        />
      </Field>
      <Field orientation="horizontal">
        <FieldLabel
          htmlFor="terms-checkbox-basic"
          className="text-primary font-light"
        >
          啟用文字朗讀功能
        </FieldLabel>
        <Switch id="airplane-mode" defaultChecked className="cursor-pointer" />
      </Field>

      <Button className="cursor-pointer" variant="outline">
        <SpeechIcon />
        開始銳評
      </Button>
    </div>
  );
}

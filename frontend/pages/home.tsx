import React, { useRef } from "react";
import config from "../config/constants";
import axios from "axios";
import { InputGroupIcon } from "../components/input";

interface TierRequest {
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

const Home: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [message, setMessage] = React.useState("");

  const callApi = async () => {
    setMessage("");
    let requestData: TierRequest = {
      subject: "蔣中正",
      role_name: "孫中山",
      tts_model: "339a6814818044f7b00161c8e0dd6e35",
      tts_speed: 1.3,
    };
    axios
      .post(`${config.api_endpoints}/tier`, requestData)
      .then((response) => {
        const case_id = response.data.case_id;
        playAudio(case_id);
        streamText(case_id);
      })
      .catch((error) => {
        console.error("Error calling API:", error);
      });
  };

  const streamText = async (case_id: string) => {
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

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      // console.log("收到片段:", chunk);
      setMessage((prev) => prev + chunk);
    }
  };

  const playAudio = async (case_id: string) => {
    if (audioRef.current) {
      audioRef.current.src = `${config.api_endpoints}/tts/${case_id}`;
      audioRef.current.play();
    }
  };

  let colors = ["#F00", "#FFBF00", "#FF0", "#FFF2CC", "#FFF"];
  return (
    <div className="h-[90%] mx-auto mt-10 w-[90%]">
      <audio ref={audioRef}></audio>
      <div className="grid grid-cols-1 gap-10 w-full h-full md:grid-cols-3">
        <div className="col-span-1 h-full flex flex-col md:col-span-2">
          {["夯", "頂級", "人上人", "NPC", "拉完了"].map((label, index) => (
            <div
              key={index}
              className={`flex ${index !== 0 ? "mt-5" : ""} text-center`}
            >
              <div
                className={`w-35 h-30 text-3xl flex items-center justify-center rounded-l-md`}
                style={{ backgroundColor: colors[index] }}
              >
                <p className="text-accent font-medium">{label}</p>
              </div>
              <div className="w-full bg-card rounded-r-md"></div>
            </div>
          ))}
        </div>
        <div className="h-full bg-card p-5 rounded-md">
          <InputGroupIcon />
        </div>
      </div>
    </div>
  );
};

export default Home;

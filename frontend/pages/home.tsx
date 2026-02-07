import React, { useRef } from "react";
import config from "../config/constants";
import axios from "axios";

interface TierRequest {
  subject: string;
  role_name?: string;
  role_description?: string | false;
  tier?: string;
  suggestion?: string | null;
  tts?: boolean | null;
  tts_model?: string | null;
  tts_speed?: number | null;
  llm_model?: string | null;
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
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <audio ref={audioRef}></audio>
      <p>{message}</p>
      <button onClickCapture={callApi}>test</button>
    </div>
  );
};

export default Home;

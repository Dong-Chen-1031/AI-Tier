import axios from "axios";
import config from "@/config/constants";
import type { TierRequest, TierResponse } from "@/types";

/**
 * 調用 Tier API 生成銳評
 * @param request 請求參數
 * @returns 包含 case_id 的響應
 */
export async function createTier(request: TierRequest): Promise<TierResponse> {
  const response = await axios.post<TierResponse>(
    `${config.api_endpoints}/tier`,
    request,
  );
  return response.data;
}

/**
 * 獲取文本流
 * @param caseId 案例 ID
 * @returns ReadableStream
 */
export async function getTextStream(
  caseId: string,
): Promise<ReadableStream<Uint8Array>> {
  const response = await fetch(`${config.api_endpoints}/text/${caseId}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch text stream: ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error("No response body found");
  }

  return response.body;
}

/**
 * 獲取 TTS 音頻 URL
 * @param caseId 案例 ID
 * @returns 音頻 URL
 */
export function getTtsUrl(caseId: string): string {
  return `${config.api_endpoints}/tts/${caseId}`;
}

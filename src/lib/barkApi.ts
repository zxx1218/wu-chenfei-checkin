/**
 * API模块：Bark消息推送
 */

interface BarkPushPayload {
  title: string;
  body: string;
  level?: 'active' | 'timeSensitive' | 'passive';
  sound?: string;
  icon?: string;
  group?: string;
  url?: string;
  device_keys: string[];
}

// 从环境变量获取Bark推送URL
const BARK_PUSH_URL = import.meta.env.VITE_BARK_PUSH_URL || 'https://api.day.app/push';

/**
 * 推送消息到Bark
 * @param payload Bark推送请求体
 * @returns Promise<boolean> 推送是否成功
 */
export const barkApi = {
  push: async (payload: BarkPushPayload): Promise<boolean> => {
    try {
      const response = await fetch(BARK_PUSH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      return response.ok;
    } catch (error) {
      console.error('Bark推送请求失败:', error);
      return false;
    }
  }
};
export type SeverityLevel = '超痛' | '很痛' | '一般痛' | '不怎么痛';

export interface BumpRecord {
  id: string;
  date: string;
  time: string;
  type: 'bump' | 'safe';
  location?: string;
  severity?: SeverityLevel;
  createdAt?: string;
}

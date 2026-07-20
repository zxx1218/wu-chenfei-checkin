import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// DOI记录相关的常量
export const EJACULATION_METHODS = [
  '内射',
  '戴套',
  '体外',
  '用手',
  '其他'
];

export const SCENES = [
  'zxx家卧室',
  '小菲家',
  '车内',
  '其他'
];
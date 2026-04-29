import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function serializePrisma<T>(data: T): any {
  return JSON.parse(JSON.stringify(data, (key, value) => {
    if (value && typeof value === "object" && (value.constructor?.name === "Decimal" || value.constructor?.name === "d")) {
      return Number(value);
    }
    return value;
  }));
}

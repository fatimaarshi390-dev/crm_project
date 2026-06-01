import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
// lib/utils.ts
export function toPlainObject<T>(obj: any): T {
  return JSON.parse(JSON.stringify(obj));
}

export function formatContact(contact: string): string {
  if (!contact) return '';
  
  // Sirf digits lo
  const digits = contact.replace(/\D/g, '');
  
  if (digits.length === 10) {
    // 10 digits → +91 add karo
    return `+91 ${digits}`;
  } else if (digits.length === 12 && digits.startsWith('91')) {
    // 12 digits with 91 → +91 format
    return `+91 ${digits.slice(2)}`;
  } else {
    // Kuch aur hai → as is return karo
    return contact;
  }
}
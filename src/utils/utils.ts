import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const formatCurrencyVND = (value: number | string): string => {
    const number = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(number)) return '0 VNĐ';

    return number.toLocaleString('vi-VN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }) + ' VNĐ';
};
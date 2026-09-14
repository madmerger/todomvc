import { useEffect, useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
    const [value, setValue] = useState<T>(() => {
        try {
            const stored = window.localStorage.getItem(key);
            return stored === null ? initialValue : (JSON.parse(stored) as T);
        } catch {
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch {
            /* storage unavailable (private mode, quota) */
        }
    }, [key, value]);

    return [value, setValue];
}

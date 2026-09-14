import { STORAGE_KEY } from './constants';
import type { Todo } from './types';

const isTodo = (value: unknown): value is Todo => {
    if (typeof value !== 'object' || value === null)
        return false;

    const candidate = value as Record<string, unknown>;

    return typeof candidate.id === 'number'
        && typeof candidate.title === 'string'
        && typeof candidate.completed === 'boolean';
};

export const readTodos = (): Todo[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);

        if (!stored)
            return [];

        const parsed: unknown = JSON.parse(stored);

        if (!Array.isArray(parsed))
            return [];

        return parsed.filter(isTodo).map(({ id, title, completed }) => ({ id, title, completed }));
    } catch {
        return [];
    }
};

export const writeTodos = (todos: Todo[]): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
};

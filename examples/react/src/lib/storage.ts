import type { Todo } from "../types";

export const STORAGE_KEY = "todos-react";

const isTodo = (value: unknown): value is Todo => {
    if (typeof value !== "object" || value === null)
        return false;

    const todo = value as Record<string, unknown>;

    return typeof todo.id === "string" && typeof todo.title === "string" && typeof todo.completed === "boolean";
};

export const readTodos = (): Todo[] => {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);

        if (!raw)
            return [];

        const parsed: unknown = JSON.parse(raw);

        if (!Array.isArray(parsed))
            return [];

        return parsed.filter(isTodo);
    } catch {
        return [];
    }
};

export const writeTodos = (todos: Todo[]): void => {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch {
        // ストレージが使えない環境では永続化をあきらめる
    }
};

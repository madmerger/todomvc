import { describe, expect, it } from "vitest";
import { STORAGE_KEY, readTodos, writeTodos } from "../src/lib/storage";

describe("storage", () => {
    it("uses the todos-react key and round-trips todos", () => {
        const todos = [{ id: "1", title: "買い物", completed: false }];

        writeTodos(todos);

        expect(window.localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(todos));
        expect(readTodos()).toEqual(todos);
    });

    it("returns an empty list for missing, broken or malformed data", () => {
        expect(readTodos()).toEqual([]);

        window.localStorage.setItem(STORAGE_KEY, "{");
        expect(readTodos()).toEqual([]);

        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ todos: [] }));
        expect(readTodos()).toEqual([]);

        window.localStorage.setItem(STORAGE_KEY, JSON.stringify([{ id: 1 }, null, "x"]));
        expect(readTodos()).toEqual([]);
    });
});

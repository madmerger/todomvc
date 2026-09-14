import { describe, expect, it } from "vitest";
import { countActive, filterTodos, todoReducer } from "../src/lib/todoReducer";
import type { Todo } from "../src/types";

const todos: Todo[] = [
    { id: "1", title: "買い物", completed: false },
    { id: "2", title: "掃除", completed: true },
];

describe("todoReducer", () => {
    it("adds a trimmed todo and ignores blank titles", () => {
        const added = todoReducer([], { type: "add", title: "  買い物  " });

        expect(added).toEqual([{ id: expect.any(String), title: "買い物", completed: false }]);
        expect(todoReducer(added, { type: "add", title: "   " })).toBe(added);
    });

    it("toggles a single todo and all todos", () => {
        expect(todoReducer(todos, { type: "toggle", id: "1" })[0].completed).toBe(true);
        expect(todoReducer(todos, { type: "toggleAll", completed: true }).every((todo) => todo.completed)).toBe(true);
        expect(todoReducer(todos, { type: "toggleAll", completed: false }).some((todo) => todo.completed)).toBe(false);
    });

    it("updates a title, and removes the todo when the new title is empty", () => {
        expect(todoReducer(todos, { type: "update", id: "1", title: "  洗濯 " })[0].title).toBe("洗濯");
        expect(todoReducer(todos, { type: "update", id: "1", title: "   " })).toEqual([todos[1]]);
    });

    it("removes a todo and clears completed todos", () => {
        expect(todoReducer(todos, { type: "remove", id: "2" })).toEqual([todos[0]]);
        expect(todoReducer(todos, { type: "clearCompleted" })).toEqual([todos[0]]);
    });
});

describe("filterTodos", () => {
    it("filters by the active filter", () => {
        expect(filterTodos(todos, "all")).toEqual(todos);
        expect(filterTodos(todos, "active")).toEqual([todos[0]]);
        expect(filterTodos(todos, "completed")).toEqual([todos[1]]);
    });
});

describe("countActive", () => {
    it("counts todos that are not completed", () => {
        expect(countActive(todos)).toBe(1);
        expect(countActive([])).toBe(0);
    });
});

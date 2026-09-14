import type { Filter, Todo } from "../types";

export type TodoAction =
    | { type: "add"; title: string }
    | { type: "toggle"; id: string }
    | { type: "toggleAll"; completed: boolean }
    | { type: "update"; id: string; title: string }
    | { type: "remove"; id: string }
    | { type: "clearCompleted" };

const createTodo = (title: string): Todo => ({
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
    title,
    completed: false,
});

export const todoReducer = (todos: Todo[], action: TodoAction): Todo[] => {
    switch (action.type) {
        case "add": {
            const title = action.title.trim();

            return title ? [...todos, createTodo(title)] : todos;
        }
        case "toggle":
            return todos.map((todo) => (todo.id === action.id ? { ...todo, completed: !todo.completed } : todo));
        case "toggleAll":
            return todos.map((todo) => ({ ...todo, completed: action.completed }));
        case "update": {
            const title = action.title.trim();

            if (!title)
                return todos.filter((todo) => todo.id !== action.id);

            return todos.map((todo) => (todo.id === action.id ? { ...todo, title } : todo));
        }
        case "remove":
            return todos.filter((todo) => todo.id !== action.id);
        case "clearCompleted":
            return todos.filter((todo) => !todo.completed);
    }
};

export const filterTodos = (todos: Todo[], filter: Filter): Todo[] => {
    if (filter === "active")
        return todos.filter((todo) => !todo.completed);

    if (filter === "completed")
        return todos.filter((todo) => todo.completed);

    return todos;
};

export const countActive = (todos: Todo[]): number => todos.filter((todo) => !todo.completed).length;

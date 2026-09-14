import { useEffect, useReducer } from "react";
import { readTodos, writeTodos } from "../lib/storage";
import { todoReducer } from "../lib/todoReducer";
import type { Todo } from "../types";

export const useTodos = () => {
    const [todos, dispatch] = useReducer(todoReducer, undefined, readTodos);

    useEffect(() => {
        writeTodos(todos);
    }, [todos]);

    return [todos, dispatch] as [Todo[], typeof dispatch];
};

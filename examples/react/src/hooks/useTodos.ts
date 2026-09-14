import { useCallback, useMemo } from 'react';

import type { Todo } from '../types';
import { useLocalStorage } from './useLocalStorage';

const STORAGE_KEY = 'todos-react';

const nextId = (todos: Todo[]): number => todos.reduce((max, todo) => Math.max(max, todo.id), 0) + 1;

export function useTodos() {
    const [todos, setTodos] = useLocalStorage<Todo[]>(STORAGE_KEY, []);

    const addTodo = useCallback(
        (title: string) => {
            setTodos([...todos, { id: nextId(todos), title, completed: false }]);
        },
        [todos, setTodos]
    );

    const toggleTodo = useCallback(
        (id: number) => {
            setTodos(todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)));
        },
        [todos, setTodos]
    );

    const toggleAll = useCallback(
        (completed: boolean) => {
            setTodos(todos.map((todo) => ({ ...todo, completed })));
        },
        [todos, setTodos]
    );

    const updateTodo = useCallback(
        (id: number, title: string) => {
            setTodos(todos.map((todo) => (todo.id === id ? { ...todo, title } : todo)));
        },
        [todos, setTodos]
    );

    const removeTodo = useCallback(
        (id: number) => {
            setTodos(todos.filter((todo) => todo.id !== id));
        },
        [todos, setTodos]
    );

    const clearCompleted = useCallback(() => {
        setTodos(todos.filter((todo) => !todo.completed));
    }, [todos, setTodos]);

    const activeCount = useMemo(() => todos.filter((todo) => !todo.completed).length, [todos]);
    const completedCount = todos.length - activeCount;

    return {
        todos,
        activeCount,
        completedCount,
        addTodo,
        toggleTodo,
        toggleAll,
        updateTodo,
        removeTodo,
        clearCompleted,
    };
}

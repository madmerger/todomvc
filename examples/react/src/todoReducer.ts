import type { Todo } from './types';

export type TodoAction =
    | { type: 'add'; title: string }
    | { type: 'toggle'; id: number }
    | { type: 'toggleAll'; completed: boolean }
    | { type: 'save'; id: number; title: string }
    | { type: 'destroy'; id: number }
    | { type: 'clearCompleted' };

let uniqueID = Date.now();

const nextId = (): number => ++uniqueID;

export const todoReducer = (todos: Todo[], action: TodoAction): Todo[] => {
    switch (action.type) {
        case 'add': {
            const title = action.title.trim();

            if (title === '')
                return todos;

            return [...todos, { id: nextId(), title, completed: false }];
        }
        case 'toggle':
            return todos.map((todo) => todo.id === action.id ? { ...todo, completed: !todo.completed } : todo);
        case 'toggleAll':
            return todos.map((todo) => ({ ...todo, completed: action.completed }));
        case 'save': {
            const title = action.title.trim();

            if (title === '')
                return todos.filter((todo) => todo.id !== action.id);

            return todos.map((todo) => todo.id === action.id ? { ...todo, title } : todo);
        }
        case 'destroy':
            return todos.filter((todo) => todo.id !== action.id);
        case 'clearCompleted':
            return todos.filter((todo) => !todo.completed);
    }
};

export const seedUniqueID = (todos: Todo[]): void => {
    for (const todo of todos)
        uniqueID = Math.max(uniqueID, todo.id);
};

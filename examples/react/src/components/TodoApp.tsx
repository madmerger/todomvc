import { useEffect, useReducer, useState } from 'react';

import Header from './Header';
import TodoList from './TodoList';
import TodoFooter from './TodoFooter';
import { readTodos, writeTodos } from '../storage';
import { seedUniqueID, todoReducer } from '../todoReducer';
import { useHashFilter } from '../useHashFilter';
import type { Todo } from '../types';

const initTodos = (): Todo[] => {
    const todos = readTodos();
    seedUniqueID(todos);

    return todos;
};

const TodoApp = () => {
    const [todos, dispatch] = useReducer(todoReducer, [], initTodos);
    const [editingId, setEditingId] = useState<number | null>(null);
    const filter = useHashFilter();

    useEffect(() => {
        writeTodos(todos);
    }, [todos]);

    const activeCount = todos.filter((todo) => !todo.completed).length;
    const completedCount = todos.length - activeCount;

    const visibleTodos = todos.filter((todo) => {
        if (filter === 'active')
            return !todo.completed;

        if (filter === 'completed')
            return todo.completed;

        return true;
    });

    const stopEditing = () => setEditingId(null);

    const onSave = (id: number, title: string) => {
        dispatch({ type: 'save', id, title });
        stopEditing();
    };

    return (
        <section className="todoapp">
            <Header onAdd={(title) => dispatch({ type: 'add', title })} />
            {todos.length > 0 && (
                <>
                    <main className="main">
                        <div className="toggle-all-container">
                            <input
                                id="toggle-all"
                                className="toggle-all"
                                type="checkbox"
                                checked={activeCount === 0}
                                onChange={(event) => dispatch({ type: 'toggleAll', completed: event.target.checked })}
                            />
                            <label className="toggle-all-label" htmlFor="toggle-all">すべて完了にする</label>
                        </div>
                        <TodoList
                            todos={visibleTodos}
                            editingId={editingId}
                            onToggle={(id) => dispatch({ type: 'toggle', id })}
                            onDestroy={(id) => dispatch({ type: 'destroy', id })}
                            onEdit={(id) => setEditingId(id)}
                            onSave={onSave}
                            onCancel={stopEditing}
                        />
                    </main>
                    <TodoFooter
                        activeCount={activeCount}
                        completedCount={completedCount}
                        filter={filter}
                        onClearCompleted={() => dispatch({ type: 'clearCompleted' })}
                    />
                </>
            )}
        </section>
    );
};

export default TodoApp;

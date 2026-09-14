import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';

import type { Todo } from '../types';

const ENTER_KEY = 'Enter';
const ESCAPE_KEY = 'Escape';

interface TodoItemProps {
    todo: Todo;
    onToggle: (id: number) => void;
    onUpdate: (id: number, title: string) => void;
    onRemove: (id: number) => void;
}

function TodoItem({ todo, onToggle, onUpdate, onRemove }: TodoItemProps) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(todo.title);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editing)
            inputRef.current?.focus();
    }, [editing]);

    const startEditing = () => {
        setDraft(todo.title);
        setEditing(true);
    };

    const save = () => {
        if (!editing)
            return;

        const trimmed = draft.trim();

        setEditing(false);

        if (trimmed)
            onUpdate(todo.id, trimmed);
        else
            onRemove(todo.id);
    };

    const cancel = () => {
        setDraft(todo.title);
        setEditing(false);
    };

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === ENTER_KEY)
            save();
        else if (event.key === ESCAPE_KEY)
            cancel();
    };

    const classes = [todo.completed ? 'completed' : '', editing ? 'editing' : ''].filter(Boolean).join(' ');

    return (
        <li data-id={todo.id} className={classes}>
            <div className="view">
                <input
                    className="toggle"
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => onToggle(todo.id)}
                />
                <label onDoubleClick={startEditing}>{todo.title}</label>
                <button className="destroy" onClick={() => onRemove(todo.id)} />
            </div>
            {editing && (
                <input
                    ref={inputRef}
                    className="edit"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onBlur={save}
                    onKeyDown={onKeyDown}
                />
            )}
        </li>
    );
}

export default TodoItem;

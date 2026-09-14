import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';

import { ENTER_KEY, ESCAPE_KEY } from '../constants';
import type { Todo } from '../types';

interface TodoItemProps {
    todo: Todo;
    editing: boolean;
    onToggle: (id: number) => void;
    onDestroy: (id: number) => void;
    onEdit: (id: number) => void;
    onSave: (id: number, title: string) => void;
    onCancel: () => void;
}

const TodoItem = ({ todo, editing, onToggle, onDestroy, onEdit, onSave, onCancel }: TodoItemProps) => {
    const [draft, setDraft] = useState(todo.title);
    const editField = useRef<HTMLInputElement>(null);
    const canceled = useRef(false);

    useEffect(() => {
        if (!editing)
            return;

        canceled.current = false;
        setDraft(todo.title);
        editField.current?.focus();
    }, [editing, todo.title]);

    const onChange = (event: ChangeEvent<HTMLInputElement>) => setDraft(event.target.value);

    const submit = () => {
        if (canceled.current)
            return;

        onSave(todo.id, draft);
    };

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.keyCode === ESCAPE_KEY) {
            canceled.current = true;
            setDraft(todo.title);
            onCancel();
        } else if (event.keyCode === ENTER_KEY) {
            submit();
        }
    };

    const className = [todo.completed ? 'completed' : '', editing ? 'editing' : ''].join(' ').trim();

    return (
        <li className={className} data-id={todo.id}>
            <div className="view">
                <input
                    className="toggle"
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => onToggle(todo.id)}
                />
                <label onDoubleClick={() => onEdit(todo.id)}>{todo.title}</label>
                <button className="destroy" onClick={() => onDestroy(todo.id)}></button>
            </div>
            {editing && (
                <input
                    ref={editField}
                    className="edit"
                    value={draft}
                    onChange={onChange}
                    onBlur={submit}
                    onKeyDown={onKeyDown}
                />
            )}
        </li>
    );
};

export default TodoItem;

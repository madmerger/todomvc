import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import type { Todo } from "../types";

const ENTER_KEY = "Enter";
const ESCAPE_KEY = "Escape";

interface TodoItemProps {
    todo: Todo;
    onToggle: (id: string) => void;
    onUpdate: (id: string, title: string) => void;
    onRemove: (id: string) => void;
}

export const TodoItem = ({ todo, onToggle, onUpdate, onRemove }: TodoItemProps) => {
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

    const commit = () => {
        if (!editing)
            return;

        setEditing(false);
        onUpdate(todo.id, draft);
    };

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === ENTER_KEY) {
            commit();
        } else if (event.key === ESCAPE_KEY) {
            setDraft(todo.title);
            setEditing(false);
        }
    };

    return (
        <li className={[todo.completed ? "completed" : "", editing ? "editing" : ""].filter(Boolean).join(" ")}>
            <div className="view">
                <input
                    className="toggle"
                    type="checkbox"
                    aria-label={`${todo.title} を完了にする`}
                    checked={todo.completed}
                    onChange={() => onToggle(todo.id)}
                />
                <label onDoubleClick={startEditing}>{todo.title}</label>
                <button className="destroy" aria-label={`${todo.title} を削除`} onClick={() => onRemove(todo.id)} />
            </div>
            {editing && (
                <input
                    ref={inputRef}
                    className="edit"
                    aria-label={`${todo.title} を編集`}
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onBlur={commit}
                    onKeyDown={onKeyDown}
                />
            )}
        </li>
    );
};

export default TodoItem;

import { useState } from "react";
import type { KeyboardEvent } from "react";

const ENTER_KEY = "Enter";

interface TodoInputProps {
    onAdd: (title: string) => void;
}

export const TodoInput = ({ onAdd }: TodoInputProps) => {
    const [title, setTitle] = useState("");

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== ENTER_KEY)
            return;

        if (title.trim())
            onAdd(title);

        setTitle("");
    };

    return (
        <input
            className="new-todo"
            placeholder="何をする必要がありますか？"
            aria-label="新しいタスク"
            autoFocus
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onKeyDown={onKeyDown}
        />
    );
};

export default TodoInput;

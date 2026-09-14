import { useState } from 'react';
import type { KeyboardEvent } from 'react';

const ENTER_KEY = 'Enter';

interface HeaderProps {
    onAdd: (title: string) => void;
}

function Header({ onAdd }: HeaderProps) {
    const [title, setTitle] = useState('');

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== ENTER_KEY)
            return;

        const trimmed = title.trim();

        if (!trimmed)
            return;

        onAdd(trimmed);
        setTitle('');
    };

    return (
        <header className="header">
            <h1>タスク</h1>
            <input
                className="new-todo"
                placeholder="何をする必要がありますか？"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                onKeyDown={onKeyDown}
                autoFocus
            />
        </header>
    );
}

export default Header;

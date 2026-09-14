import { useState } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';

import { ENTER_KEY } from '../constants';

interface HeaderProps {
    onAdd: (title: string) => void;
}

const Header = ({ onAdd }: HeaderProps) => {
    const [title, setTitle] = useState('');

    const onChange = (event: ChangeEvent<HTMLInputElement>) => setTitle(event.target.value);

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.keyCode !== ENTER_KEY)
            return;

        event.preventDefault();

        if (title.trim() === '')
            return;

        onAdd(title);
        setTitle('');
    };

    return (
        <header className="header">
            <h1>タスク</h1>
            <input
                className="new-todo"
                placeholder="何をする必要がありますか？"
                value={title}
                onChange={onChange}
                onKeyDown={onKeyDown}
                autoFocus
            />
        </header>
    );
};

export default Header;

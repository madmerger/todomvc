import type { Filter } from '../types';

interface FooterProps {
    activeCount: number;
    completedCount: number;
    filter: Filter;
    onClearCompleted: () => void;
}

const FILTERS: { filter: Filter; href: string; label: string }[] = [
    { filter: 'all', href: '#/', label: 'すべて' },
    { filter: 'active', href: '#/active', label: '未完了' },
    { filter: 'completed', href: '#/completed', label: '完了' },
];

function Footer({ activeCount, completedCount, filter, onClearCompleted }: FooterProps) {
    return (
        <footer className="footer">
            <span className="todo-count">
                残り <strong>{activeCount}</strong> 件
            </span>
            <ul className="filters">
                {FILTERS.map((item) => (
                    <li key={item.filter}>
                        <a href={item.href} className={filter === item.filter ? 'selected' : ''}>
                            {item.label}
                        </a>
                    </li>
                ))}
            </ul>
            {completedCount > 0 && (
                <button className="clear-completed" onClick={onClearCompleted}>
                    完了したタスクを削除
                </button>
            )}
        </footer>
    );
}

export default Footer;

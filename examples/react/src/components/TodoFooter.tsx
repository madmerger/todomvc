import type { Filter } from "../types";

interface TodoFooterProps {
    activeCount: number;
    completedCount: number;
    filter: Filter;
    onClearCompleted: () => void;
}

const FILTERS: { filter: Filter; hash: string; label: string }[] = [
    { filter: "all", hash: "#/", label: "すべて" },
    { filter: "active", hash: "#/active", label: "未完了" },
    { filter: "completed", hash: "#/completed", label: "完了" },
];

export const TodoFooter = ({ activeCount, completedCount, filter, onClearCompleted }: TodoFooterProps) => (
    <footer className="footer">
        <span className="todo-count">
            <strong>{activeCount}</strong> {activeCount === 1 ? "item" : "items"} left
        </span>
        <ul className="filters">
            {FILTERS.map(({ filter: value, hash, label }) => (
                <li key={value}>
                    <a href={hash} className={filter === value ? "selected" : undefined}>
                        {label}
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

export default TodoFooter;

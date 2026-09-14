import type { Filter } from '../types';

interface TodoFooterProps {
    activeCount: number;
    completedCount: number;
    filter: Filter;
    onClearCompleted: () => void;
}

const filterClassName = (filter: Filter, target: Filter) => filter === target ? 'selected' : '';

const TodoFooter = ({ activeCount, completedCount, filter, onClearCompleted }: TodoFooterProps) => (
    <footer className="footer">
        <span className="todo-count">
            残り <strong>{activeCount}</strong> 件
        </span>
        <ul className="filters">
            <li>
                <a href="#/" className={filterClassName(filter, 'all')}>すべて</a>
            </li>
            <li>
                <a href="#/active" className={filterClassName(filter, 'active')}>未完了</a>
            </li>
            <li>
                <a href="#/completed" className={filterClassName(filter, 'completed')}>完了</a>
            </li>
        </ul>
        {completedCount > 0 && (
            <button className="clear-completed" onClick={onClearCompleted}>完了したタスクを削除</button>
        )}
    </footer>
);

export default TodoFooter;

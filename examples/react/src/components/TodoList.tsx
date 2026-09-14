import type { Todo } from '../types';
import TodoItem from './TodoItem';

interface TodoListProps {
    todos: Todo[];
    onToggle: (id: number) => void;
    onUpdate: (id: number, title: string) => void;
    onRemove: (id: number) => void;
}

function TodoList({ todos, onToggle, onUpdate, onRemove }: TodoListProps) {
    return (
        <ul className="todo-list">
            {todos.map((todo) => (
                <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onUpdate={onUpdate} onRemove={onRemove} />
            ))}
        </ul>
    );
}

export default TodoList;

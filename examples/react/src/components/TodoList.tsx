import TodoItem from './TodoItem';
import type { Todo } from '../types';

interface TodoListProps {
    todos: Todo[];
    editingId: number | null;
    onToggle: (id: number) => void;
    onDestroy: (id: number) => void;
    onEdit: (id: number) => void;
    onSave: (id: number, title: string) => void;
    onCancel: () => void;
}

const TodoList = ({ todos, editingId, onToggle, onDestroy, onEdit, onSave, onCancel }: TodoListProps) => (
    <ul className="todo-list">
        {todos.map((todo) => (
            <TodoItem
                key={todo.id}
                todo={todo}
                editing={editingId === todo.id}
                onToggle={onToggle}
                onDestroy={onDestroy}
                onEdit={onEdit}
                onSave={onSave}
                onCancel={onCancel}
            />
        ))}
    </ul>
);

export default TodoList;

import TodoItem from "./TodoItem";
import type { Todo } from "../types";

interface TodoListProps {
    todos: Todo[];
    onToggle: (id: string) => void;
    onUpdate: (id: string, title: string) => void;
    onRemove: (id: string) => void;
}

export const TodoList = ({ todos, onToggle, onUpdate, onRemove }: TodoListProps) => (
    <ul className="todo-list">
        {todos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onUpdate={onUpdate} onRemove={onRemove} />
        ))}
    </ul>
);

export default TodoList;

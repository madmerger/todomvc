import Footer from './components/Footer';
import Header from './components/Header';
import TodoList from './components/TodoList';
import { useHashFilter } from './hooks/useHashFilter';
import { useTodos } from './hooks/useTodos';

function App() {
    const filter = useHashFilter();
    const {
        todos,
        activeCount,
        completedCount,
        addTodo,
        toggleTodo,
        toggleAll,
        updateTodo,
        removeTodo,
        clearCompleted,
    } = useTodos();

    const visibleTodos = todos.filter((todo) => {
        if (filter === 'active')
            return !todo.completed;

        if (filter === 'completed')
            return todo.completed;

        return true;
    });

    return (
        <section className="todoapp">
            <Header onAdd={addTodo} />
            {todos.length > 0 && (
                <main className="main">
                    <div className="toggle-all-container">
                        <input
                            id="toggle-all"
                            className="toggle-all"
                            type="checkbox"
                            checked={activeCount === 0}
                            onChange={(event) => toggleAll(event.target.checked)}
                        />
                        <label className="toggle-all-label" htmlFor="toggle-all">
                            すべて完了にする
                        </label>
                    </div>
                    <TodoList
                        todos={visibleTodos}
                        onToggle={toggleTodo}
                        onUpdate={updateTodo}
                        onRemove={removeTodo}
                    />
                </main>
            )}
            {todos.length > 0 && (
                <Footer
                    activeCount={activeCount}
                    completedCount={completedCount}
                    filter={filter}
                    onClearCompleted={clearCompleted}
                />
            )}
        </section>
    );
}

export default App;

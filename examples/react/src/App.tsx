import TodoFooter from "./components/TodoFooter";
import TodoInput from "./components/TodoInput";
import TodoList from "./components/TodoList";
import { useHashFilter } from "./hooks/useHashFilter";
import { useTodos } from "./hooks/useTodos";
import { countActive, filterTodos } from "./lib/todoReducer";

export const App = () => {
    const [todos, dispatch] = useTodos();
    const filter = useHashFilter();

    const visibleTodos = filterTodos(todos, filter);
    const activeCount = countActive(todos);
    const completedCount = todos.length - activeCount;

    return (
        <>
            <section className="todoapp">
                <header className="header">
                    <h1>タスク</h1>
                    <TodoInput onAdd={(title) => dispatch({ type: "add", title })} />
                </header>
                {todos.length > 0 && (
                    <main className="main">
                        <div className="toggle-all-container">
                            <input
                                id="toggle-all"
                                className="toggle-all"
                                type="checkbox"
                                checked={activeCount === 0}
                                onChange={(event) => dispatch({ type: "toggleAll", completed: event.target.checked })}
                            />
                            <label className="toggle-all-label" htmlFor="toggle-all">
                                すべて完了にする
                            </label>
                        </div>
                        <TodoList
                            todos={visibleTodos}
                            onToggle={(id) => dispatch({ type: "toggle", id })}
                            onUpdate={(id, title) => dispatch({ type: "update", id, title })}
                            onRemove={(id) => dispatch({ type: "remove", id })}
                        />
                    </main>
                )}
                {todos.length > 0 && (
                    <TodoFooter
                        activeCount={activeCount}
                        completedCount={completedCount}
                        filter={filter}
                        onClearCompleted={() => dispatch({ type: "clearCompleted" })}
                    />
                )}
            </section>
            <footer className="info">
                <p>ダブルクリックでタスクを編集できます</p>
                <p>制作: TodoMVC チーム</p>
                <p>
                    <a href="http://todomvc.com">TodoMVC</a> プロジェクトの一部です
                </p>
            </footer>
        </>
    );
};

export default App;

// Minimal markup of src/index.html, used by the DOM oriented tests.
export const appMarkup = `
<section class="todoapp">
    <header class="header">
        <h1>todos</h1>
        <input class="new-todo" placeholder="What needs to be done?" autofocus />
    </header>
    <main class="main">
        <div class="toggle-all-container">
            <input class="toggle-all" type="checkbox" />
            <label class="toggle-all-label" for="toggle-all">Mark all as complete</label>
        </div>
        <ul class="todo-list"></ul>
    </main>
    <footer class="footer">
        <span class="todo-count"></span>
        <ul class="filters">
            <li><a href="#/" class="selected">All</a></li>
            <li><a href="#/active">Active</a></li>
            <li><a href="#/completed">Completed</a></li>
        </ul>
        <button class="clear-completed">Clear completed</button>
    </footer>
</section>
`;

export const renderApp = () => {
    document.body.innerHTML = appMarkup;
};

let dbCounter = 0;

// Store keeps its data in a module level object keyed by db name, so every test
// needs its own name to stay isolated.
export const uniqueDbName = () => `test-db-${++dbCounter}-${Math.random()}`;

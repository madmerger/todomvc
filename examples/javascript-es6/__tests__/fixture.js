export const appHtml = `
<section class="todoapp">
    <header class="header">
        <input class="new-todo" />
    </header>
    <main class="main">
        <div class="toggle-all-container">
            <input class="toggle-all" type="checkbox" />
            <label class="toggle-all-label" for="toggle-all">すべて完了にする</label>
        </div>
        <ul class="todo-list"></ul>
    </main>
    <footer class="footer">
        <span class="todo-count"></span>
        <ul class="filters">
            <li><a href="#/" class="selected">すべて</a></li>
            <li><a href="#/active">未完了</a></li>
            <li><a href="#/completed">完了</a></li>
        </ul>
        <button class="clear-completed"></button>
    </footer>
</section>
`;

export const setupDom = () => {
    document.body.innerHTML = appHtml;
};

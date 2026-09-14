import React from 'react';
import { createRoot } from 'react-dom/client';

import TodoApp from './components/TodoApp';

import 'todomvc-app-css/index.css';
import 'todomvc-common/base.css';
import './app.css';

const container = document.getElementById('root');

if (container) {
    createRoot(container).render(
        <React.StrictMode>
            <TodoApp />
        </React.StrictMode>
    );
}

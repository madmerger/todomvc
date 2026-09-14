import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import 'todomvc-app-css/index.css';
import 'todomvc-common/base.css';
import './app.css';

import App from './App';

const container = document.getElementById('root');

if (container)
    createRoot(container).render(
        <StrictMode>
            <App />
        </StrictMode>
    );

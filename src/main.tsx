import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Import i18n configuration first - this is critical!
import './i18n';

// Import global styles
import './index.css';

// Import Ant Design styles
import 'antd/dist/reset.css';

import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
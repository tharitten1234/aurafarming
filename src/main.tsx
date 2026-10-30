import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {AppBoundary} from './components/AppBoundary';
import './index.css';

createRoot(document.getElementById('root')!).render(<AppBoundary><App /></AppBoundary>);

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import './index.css'
import App from './App.jsx'
import { SearchProvider } from './context/SearchContext.jsx';
import { SnackbarProvider } from 'notistack';
import { NotificationsProvider } from './context/NotificationsContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <SearchProvider>
        <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <NotificationsProvider>
            <App />
          </NotificationsProvider>
        </SnackbarProvider>
      </SearchProvider>
    </BrowserRouter>
  </StrictMode>,
)

import { Routes, Route } from 'react-router-dom';
import { Container } from '@mui/material';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import OnboardingWizard from './pages/Onboarding/OnboardingWizard';
import Financials from './pages/Financials'; // Import the new Financials page
import Watchdog from './pages/Watchdog';
import Header from './components/Header'; // Import the Header
import { AppProvider } from './context/AppContext.jsx';
import ProtectedRoute from './components/ProtectedRoute';

// A layout component that includes the header and centers the content
const MainLayout = ({ children }) => (
  <>
    <Header />
    <Container maxWidth="lg">
      {children}
    </Container>
  </>
);

function App() {
  return (
    <AppProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes with the main layout */}
        <Route 
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Home />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route 
          path="/onboarding"
          element={
            <ProtectedRoute>
              <MainLayout>
                <OnboardingWizard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route 
          path="/financials"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Financials />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route 
          path="/watchdog"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Watchdog />
              </MainLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AppProvider>
  );
}

export default App;

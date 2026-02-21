import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Accounting from './pages/Accounting';
import Services from './pages/Services';
import Customers from './pages/Customers';
import CompetitorAnalysis from './pages/CompetitorAnalysis';
import GovPort from './pages/GovPort';
import KeywordMonitoring from './pages/KeywordMonitoring';
import Employees from './pages/Employees';
import Reports from './pages/Reports';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/accounting" element={<Accounting />} />
        <Route path="/services" element={<Services />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/competitors" element={<CompetitorAnalysis />} />
        <Route path="/gov-port" element={<GovPort />} />
        <Route path="/keyword-monitoring" element={<KeywordMonitoring />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </Layout>
  );
}

export default App;

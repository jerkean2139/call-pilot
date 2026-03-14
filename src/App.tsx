import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/header';
import { LandingPage } from './pages/LandingPage';
import { AdminPortal } from './pages/AdminPortal';
import { AssessmentResults } from './pages/AssessmentResults';
import { AssessmentPage } from './pages/AssessmentPage';
import { GuidePage } from './pages/GuidePage';
import { ReportsPage } from './pages/ReportsPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { LeakageAssessment } from './pages/LeakageAssessment';
import { LeakageResults } from './pages/LeakageResults';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/assessment" element={<AssessmentPage />} />
            <Route path="/results" element={<AssessmentResults />} />
            <Route path="/guide" element={<GuidePage />} />
            <Route path="/admin" element={<AdminPortal />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/leakage" element={<LeakageAssessment />} />
            <Route path="/leakage/results" element={<LeakageResults />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
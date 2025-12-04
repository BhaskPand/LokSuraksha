import { Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import IssueView from './pages/IssueView';
import TotalIssuesPage from './pages/TotalIssuesPage';
import OpenIssuesPage from './pages/OpenIssuesPage';
import InProgressPage from './pages/InProgressPage';
import ResolvedPage from './pages/ResolvedPage';
import './App.css';

function App(): JSX.Element {
  return (
    <div className="app">
      <header className="app-header">
        <Link to="/" className="app-title">
          <h1>LokSuraksha Dashboard</h1>
        </Link>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/issues" element={<TotalIssuesPage />} />
          <Route path="/issues/open" element={<OpenIssuesPage />} />
          <Route path="/issues/in-progress" element={<InProgressPage />} />
          <Route path="/issues/resolved" element={<ResolvedPage />} />
          <Route path="/issues/:id" element={<IssueView />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
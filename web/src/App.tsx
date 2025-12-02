import { Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import IssueView from './pages/IssueView';
import './App.css';

function App() {
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
          <Route path="/issues/:id" element={<IssueView />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;


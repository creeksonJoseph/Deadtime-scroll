import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ProjectListPage from './pages/ProjectListPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import RevivalListPage from './pages/RevivalListPage';
import RevivalDetailPage from './pages/RevivalDetailPage';
import UserProfilePage from './pages/UserProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';
import ChatPage from './pages/ChatPage';
import SubmitProjectPage from './pages/SubmitProjectPage';
import MyRevivalsPage from './pages/MyRevivalsPage';

function App() {
  return (
    <Router>
      <WalletProvider>
        <div className="dark bg-background-dark">
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/projects" element={<ProjectListPage />} />
              <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
              <Route path="/projects/:projectId/revivals" element={<RevivalListPage />} />
              <Route path="/projects/:projectId/revivals/:revivalId" element={<RevivalDetailPage />} />
              <Route path="/submit" element={<SubmitProjectPage />} />
              <Route path="/revivals" element={<MyRevivalsPage />} />
              <Route path="/profile" element={<UserProfilePage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/chat" element={<ChatPage />} />
            </Route>
          </Routes>
        </div>
      </WalletProvider>
    </Router>
  );
}

export default App;

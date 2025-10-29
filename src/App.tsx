import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ProjectListPage from './pages/ProjectListPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import RevivalListPage from './pages/RevivalListPage';
import RevivalDetailPage from './pages/RevivalDetailPage';
import UserProfilePage from './pages/UserProfilePage';
import PublicProfilePage from './pages/PublicProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';
import ChatPage from './pages/ChatPage';
import SubmitProjectPage from './pages/SubmitProjectPage';
import MyRevivalsPage from './pages/MyRevivalsPage';
import MyProjectsPage from './pages/MyProjectsPage';
import BloodlinePage from './pages/BloodlinePage';
import ReviveProjectPage from './pages/ReviveProjectPage';
import Web3Status from './components/Web3Status';

function App() {
  console.log('App component mounting...');

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
              <Route path="/revivals/:revivalId" element={<RevivalDetailPage />} />
              <Route path="/revivals/:revivalId/bloodline" element={<BloodlinePage />} />
              <Route path="/submit" element={<SubmitProjectPage />} />
              <Route path="/projects/:projectId/revive" element={<ReviveProjectPage />} />
              <Route path="/revivals" element={<MyRevivalsPage />} />
              <Route path="/my-revivals" element={<MyRevivalsPage />} />
              <Route path="/my-projects" element={<MyProjectsPage />} />
              <Route path="/profile" element={<UserProfilePage />} />
              <Route path="/profile/:walletAddress" element={<PublicProfilePage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/chat" element={<ChatPage />} />
            </Route>
          </Routes>
          {import.meta.env.DEV && <Web3Status />}
        </div>
      </WalletProvider>
    </Router>
  );
}

export default App;

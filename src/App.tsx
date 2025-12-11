import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { io } from 'socket.io-client';
import { Navigation } from './components/Navigation';
import { PublicLanding } from './components/PublicLanding';
import { Login } from './components/Login';
import { AdminDashboard } from './components/AdminDashboard';
import { TournamentSetup } from './components/TournamentSetup';
import { TeamRegistration } from './components/TeamRegistration';
import { MatchScheduling } from './components/MatchScheduling';
import { LiveScoreInput } from './components/LiveScoreInput';
import { Standings } from './components/Standings';
import { Fixtures } from './components/Fixtures';
import { Notifications } from './components/Notifications';
import { TeamManagerView } from './components/TeamManagerView';
import { TeamManagement } from './components/TeamManagement';
import { api, clearToken } from './lib/api';
import { useTournament } from './context/TournamentContext';

// --- TYPE DEFINITIONS ---
export type UserRole = 'admin' | 'manager' | 'viewer';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  teamId?: number;
}

export interface Tournament {
  id: number;
  name: string;
  format: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'live' | 'completed';
  teams: Team[];
  matches: Match[];
  notifications: Notification[];
}

export interface Team {
  id: number;
  name: string;
  manager_name: string;
  manager_email: string;
  players: Player[];
  points?: number;
  played?: number;
  won?: number;
  drawn?: number;
  lost?: number;
  goalsFor?: number;
  goalsAgainst?: number;
  goalDifference?: number;
}

export interface Player {
  id: number;
  name: string;
  number: number;
  position: string;
}

export interface Match {
  id: number;
  home_team_id: number;
  away_team_id: number;
  home_team: Team;
  away_team: Team;
  date: string;
  time: string;
  venue: string;
  home_score?: number;
  away_score?: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'postponed';
}

export interface Notification {
  id: number;
  message: string;
  timestamp: string;
  priority: 'normal' | 'urgent';
}

export interface Standing {
  teamId: number;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

const WEBSOCKET_URL = 'http://localhost:3001';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { tournament, setTournament, loading } = useTournament();

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!tournament?.id) return;

    const socket = io(WEBSOCKET_URL);

    socket.on('connect', () => {
      console.log('WebSocket connected!');
      socket.emit('join_tournament_room', tournament.id);
    });

    socket.on('tournament_updated', (updatedTournament: Tournament) => {
      toast.success('Tournament data has been updated in real-time!');
      setTournament(updatedTournament);
    });

    socket.on('notification_sent', (newNotification: Notification) => {
      toast.warning(newNotification.message);
      setTournament(prevTournament => {
        if (!prevTournament) return null;
        return {
          ...prevTournament,
          notifications: [newNotification, ...prevTournament.notifications],
        };
      });
    });
    
    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [tournament?.id, setTournament]);


  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentPage(user.role === 'admin' ? 'dashboard' : 'team-view');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    clearToken();
    setCurrentPage('landing');
    toast.info("You have been logged out.");
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    if (loading || !tournament) {
      return (
        <div className="flex justify-center items-center h-[80vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600"></div>
        </div>
      );
    }

    if (currentPage === 'landing') {
      return <PublicLanding tournament={tournament} onNavigate={handleNavigate} />;
    }

    if (currentPage === 'login-admin' || currentPage === 'login-manager') {
      return (
        <Login
          role={currentPage === 'login-admin' ? 'admin' : 'manager'}
          onLogin={handleLogin}
          onBack={() => setCurrentPage('landing')}
        />
      );
    }

    if (!currentUser) {
      return <PublicLanding tournament={tournament} onNavigate={handleNavigate} />;
    }
    
    // Admin pages
    if (currentUser.role === 'admin') {
      switch (currentPage) {
        case 'dashboard':
          return <AdminDashboard currentUser={currentUser} onNavigate={handleNavigate} />;
        case 'setup':
          return <TournamentSetup />;
        case 'teams':
          return <TeamManagement />;
        case 'schedule':
          return <MatchScheduling />;
        case 'score':
          return <LiveScoreInput />;
        case 'notifications':
          return <Notifications userRole={currentUser.role} />;
        case 'standings':
          return <Standings />;
        case 'fixtures':
          return <Fixtures />;
        default:
          return <AdminDashboard onNavigate={handleNavigate} />;
      }
    }

    // Manager pages
    if (currentUser.role === 'manager') {
      switch (currentPage) {
        case 'team-view':
          return <TeamManagerView currentUser={currentUser} onNavigate={handleNavigate} />;
        case 'register':
          return <TeamRegistration currentUser={currentUser} />;
        case 'standings':
          return <Standings />;
        case 'fixtures':
          return <Fixtures />;
        case 'notifications':
          return <Notifications userRole={currentUser.role} />;
        default:
          return <TeamManagerView currentUser={currentUser} onNavigate={handleNavigate} />;
      }
    }

    return <PublicLanding tournament={tournament} onNavigate={handleNavigate} />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" richColors />
      <Navigation
        currentPage={currentPage}
        currentUser={currentUser}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />
      <main className="pb-20 md:pb-6">
        {renderPage()}
      </main>
    </div>
  );
}
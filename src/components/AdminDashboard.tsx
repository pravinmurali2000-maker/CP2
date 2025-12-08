import React from 'react';
import { Trophy, Users, Calendar, Bell, TrendingUp, Clock, Settings, PlusCircle } from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import type { User } from '../App';

interface AdminDashboardProps {
  currentUser: User;
  onNavigate: (page: string) => void;
}

const StatCard = ({ icon, title, value }: { icon: React.ReactNode, title: string, value: string | number }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const NavCard = ({ icon, title, description, onClick }: { icon: React.ReactNode, title: string, description: string, onClick: () => void }) => (
  <button
    onClick={onClick}
    className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-green-500 transition-all text-left flex flex-col justify-between"
  >
    <div>
      <div className="bg-green-100 text-green-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </button>
);


export function AdminDashboard({ currentUser, onNavigate }: AdminDashboardProps) {
  const { tournament } = useTournament();

  if (!tournament) {
    return <div className="text-center p-8">Loading dashboard...</div>;
  }

  const completedMatches = tournament.matches.filter(m => m.status === 'completed').length;
  const upcomingMatches = tournament.matches.filter(m => m.status === 'scheduled').length;
  const totalTeams = tournament.teams.length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back, {currentUser.name}! Here's an overview of the "{tournament.name}" tournament.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Users className="h-5 w-5 text-blue-500" />} title="Total Teams" value={totalTeams} />
        <StatCard icon={<Trophy className="h-5 w-5 text-green-500" />} title="Completed Matches" value={completedMatches} />
        <StatCard icon={<Calendar className="h-5 w-5 text-orange-500" />} title="Upcoming Matches" value={upcomingMatches} />
        <StatCard icon={<Clock className="h-5 w-5 text-red-500" />} title="Status" value={<span className="capitalize">{tournament.status}</span>} />
      </div>

      {/* Navigation Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Management Console</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <NavCard
            icon={<Settings className="w-6 h-6" />}
            title="Tournament Setup"
            description="Update details, format, and generate the match schedule."
            onClick={() => onNavigate('setup')}
          />
          <NavCard
            icon={<Users className="w-6 h-6" />}
            title="Manage Teams"
            description="Add new teams and assign team managers."
            onClick={() => onNavigate('teams')}
          />
          <NavCard
            icon={<Calendar className="w-6 h-6" />}
            title="Match Scheduling"
            description="Manually edit match details, dates, and times."
            onClick={() => onNavigate('schedule')}
          />
          <NavCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Live Score Input"
            description="Update scores for matches that are currently in progress."
            onClick={() => onNavigate('score')}
          />
          <NavCard
            icon={<Bell className="w-6 h-6" />}
            title="Send Notifications"
            description="Broadcast messages and urgent alerts to all participants."
            onClick={() => onNavigate('notifications')}
          />
        </div>
      </div>
    </div>
  );
}

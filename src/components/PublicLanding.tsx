import React from 'react';
import { Trophy, Calendar, Bell, BarChart3, LogIn, UserPlus } from 'lucide-react';
import type { Tournament } from '../App';

interface PublicLandingProps {
  tournament: Tournament;
  onNavigate: (page: string) => void;
}

export function PublicLanding({ tournament, onNavigate }: PublicLandingProps) {
  const sortedTeams = [...tournament.teams].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  }).slice(0, 5);

  const upcomingMatches = tournament.matches
    .filter(m => m.status === 'scheduled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const recentMatches = tournament.matches
    .filter(m => m.status === 'completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const urgentNotifications = tournament.notifications
    .filter(n => n.priority === 'urgent')
    .slice(0, 2);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-600 via-green-700 to-green-800 text-white rounded-2xl p-6 md:p-8 mb-6 shadow-lg">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Trophy className="w-10 h-10 md:w-12 md:h-12" />
            <div>
              <h1 className="text-2xl md:text-3xl mb-1">{tournament.name}</h1>
              <div className="text-green-100">
                {tournament.format} • {tournament.teams.length} Teams
              </div>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 ${
            (tournament.status === 'live' || tournament.status === 'draft') ? 'bg-green-500 text-white' :
            'bg-gray-100 text-gray-800'
          }`}>
            {(tournament.status === 'live' || tournament.status === 'draft') && (
              <span className="h-2 w-2 rounded-full bg-red-500 animate-blink"></span>
            )}
            <span className="leading-none">
              {(tournament.status === 'live' || tournament.status === 'draft') ? 'LIVE' : tournament.status.toUpperCase()}
            </span>
          </div>
        </div>
        
        <div className="text-sm text-green-100 mb-6">
          {tournament.startDate && !isNaN(new Date(tournament.startDate).getTime()) ? new Date(tournament.startDate).getFullYear() : '2025'}
        </div>

        {/* Login Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => onNavigate('login-admin')}
            className="flex-1 bg-white text-green-700 px-6 py-3 rounded-lg hover:bg-green-50 flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            Admin Login
          </button>
          <button
            onClick={() => onNavigate('login-manager')}
            className="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-400 flex items-center justify-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Manager Login
          </button>
        </div>
      </div>

      {/* Urgent Notifications */}
      {urgentNotifications.length > 0 && (
        <div className="mb-6 space-y-3">
          {urgentNotifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm animate-pulse"
            >
              <div className="flex items-start gap-3">
                <Bell className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-red-900 mb-1">{notification.message}</div>
                  <div className="text-xs text-red-700">
                    {new Date(notification.timestamp).toLocaleString('en-MY', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Current Standings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              <h2 className="text-lg">Current Standings</h2>
            </div>
            <button 
              onClick={() => onNavigate('standings')}
              className="text-xs bg-blue-500 hover:bg-blue-400 px-3 py-1 rounded-full">
              View All
            </button>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              {sortedTeams.map((team, index) => (
                <div
                  key={team.id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    index === 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
                  }`}
                >
                  <div className={`text-lg ${index === 0 ? 'text-yellow-600' : 'text-gray-600'}`}>
                    {index + 1}
                  </div>
                  {index === 0 && <Trophy className="w-4 h-4 text-yellow-600" />}
                  <div className="flex-1">
                    <div className="text-gray-900">{team.name}</div>
                    <div className="text-xs text-gray-600">
                      {team.played}P • {team.won}W • {team.drawn}D • {team.lost}L
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-900">{team.points}</div>
                    <div className="text-xs text-gray-600">pts</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Matches */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <h2 className="text-lg">Upcoming Matches</h2>
            </div>
            <button 
              onClick={() => onNavigate('fixtures')}
              className="text-xs bg-green-500 hover:bg-green-400 px-3 py-1 rounded-full">
              View All
            </button>
          </div>
          <div className="p-4">
            {upcomingMatches.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No upcoming matches scheduled
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingMatches.map((match) => (
                  <div key={match.id} className="border border-green-200 bg-green-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-gray-600">
                        {new Date(match.date).toLocaleDateString('en-MY', { 
                          weekday: 'short',
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="text-xs text-gray-600">{match.time}</div>
                    </div>
                    <div className="text-sm text-gray-900 mb-1">
                      {match.home_team.name} <span className="text-gray-500">vs</span> {match.away_team.name}
                    </div>
                    <div className="text-xs text-gray-600">{match.venue}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Results */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            <h2 className="text-lg">Recent Results</h2>
          </div>
        </div>
        <div className="p-4">
          {recentMatches.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No matches completed yet
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-3">
              {recentMatches.map((match) => (
                <div key={match.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <div className="text-xs text-gray-600 mb-2">
                    {new Date(match.date).toLocaleDateString('en-MY', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm text-gray-900 flex-1">{match.home_team.name}</div>
                    <div className="text-lg text-gray-900 px-2">{match.home_score}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-900 flex-1">{match.away_team.name}</div>
                    <div className="text-lg text-gray-900 px-2">{match.away_score}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* All Notifications */}
      {tournament.notifications.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              <h2 className="text-lg">Latest Updates</h2>
            </div>
          </div>
          <div className="p-4 space-y-2">
            {tournament.notifications.slice(0, 5).map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border-l-4 ${
                  notification.priority === 'urgent'
                    ? 'bg-red-50 border-red-500'
                    : 'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="text-sm text-gray-900">{notification.message}</div>
                <div className="text-xs text-gray-600 mt-1">
                  {new Date(notification.timestamp).toLocaleString('en-MY', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
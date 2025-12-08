import React from 'react';
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

export function Standings() {
  const { tournament } = useTournament();

  if (!tournament) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-50 p-8 rounded-lg shadow-md">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
        <p className="text-xl text-gray-700 font-semibold">Loading standings...</p>
      </div>
    );
  }

  const sortedTeams = [...tournament.teams].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-lg">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-6 h-6" />
            <h2>League Standings</h2>
          </div>
          <div className="text-green-100 text-sm">
            {tournament.name} • {tournament.format}
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs text-gray-600">Pos</th>
                <th className="px-4 py-3 text-left text-xs text-gray-600">Team</th>
                <th className="px-4 py-3 text-center text-xs text-gray-600">P</th>
                <th className="px-4 py-3 text-center text-xs text-gray-600">W</th>
                <th className="px-4 py-3 text-center text-xs text-gray-600">D</th>
                <th className="px-4 py-3 text-center text-xs text-gray-600">L</th>
                <th className="px-4 py-3 text-center text-xs text-gray-600">GF</th>
                <th className="px-4 py-3 text-center text-xs text-gray-600">GA</th>
                <th className="px-4 py-3 text-center text-xs text-gray-600">GD</th>
                <th className="px-4 py-3 text-center text-xs text-gray-600">Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedTeams.map((team, index) => (
                <tr key={team.id} className={index === 0 ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
                  <td className="px-4 py-4 text-gray-900">
                    <div className="flex items-center gap-2">
                      {index + 1}
                      {index === 0 && <Trophy className="w-4 h-4 text-yellow-600" />}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-900">{team.name}</td>
                  <td className="px-4 py-4 text-center text-gray-900">{team.played}</td>
                  <td className="px-4 py-4 text-center text-gray-900">{team.won}</td>
                  <td className="px-4 py-4 text-center text-gray-900">{team.drawn}</td>
                  <td className="px-4 py-4 text-center text-gray-900">{team.lost}</td>
                  <td className="px-4 py-4 text-center text-gray-900">{team.goalsFor}</td>
                  <td className="px-4 py-4 text-center text-gray-900">{team.goalsAgainst}</td>
                  <td className="px-4 py-4 text-center">
                    <span className={team.goalDifference > 0 ? 'text-green-600' : team.goalDifference < 0 ? 'text-red-600' : 'text-gray-900'}>
                      {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center text-gray-900">{team.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-200">
          {sortedTeams.map((team, index) => (
            <div
              key={team.id}
              className={`p-4 ${index === 0 ? 'bg-yellow-50' : ''}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`text-lg ${index === 0 ? 'text-yellow-600' : 'text-gray-600'}`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-gray-900">{team.name}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {team.played}P • {team.won}W • {team.drawn}D • {team.lost}L
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-gray-900">{team.points}</div>
                  <div className="text-xs text-gray-600">pts</div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-gray-600">GF: {team.goalsFor}</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingDown className="w-3 h-3 text-red-600" />
                  <span className="text-gray-600">GA: {team.goalsAgainst}</span>
                </div>
                <div>
                  <span className={`${team.goalDifference > 0 ? 'text-green-600' : team.goalDifference < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                    GD: {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <div className="text-xs text-gray-600 space-y-1">
            <div>P = Played, W = Won, D = Drawn, L = Lost</div>
            <div>GF = Goals For, GA = Goals Against, GD = Goal Difference, Pts = Points</div>
          </div>
        </div>
      </div>

      {/* Top Scorer Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mt-6">
        <h3 className="text-gray-900 mb-3">Tournament Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-xs text-blue-700 mb-1">Total Goals</div>
            <div className="text-xl text-blue-900">
              {tournament.teams.reduce((sum, team) => sum + team.goalsFor, 0)}
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-xs text-green-700 mb-1">Matches Played</div>
            <div className="text-xl text-green-900">
              {tournament.matches.filter(m => m.status === 'completed').length}
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="text-xs text-purple-700 mb-1">Avg Goals/Match</div>
            <div className="text-xl text-purple-900">
              {tournament.matches.filter(m => m.status === 'completed').length > 0
                ? (tournament.teams.reduce((sum, team) => sum + team.goalsFor, 0) / 
                   tournament.matches.filter(m => m.status === 'completed').length).toFixed(1)
                : '0.0'}
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3">
            <div className="text-xs text-orange-700 mb-1">Teams</div>
            <div className="text-xl text-orange-900">{tournament.teams.length}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
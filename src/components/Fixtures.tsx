import React, { useState } from 'react';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';

export function Fixtures() {
  const { tournament } = useTournament();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');

  if (!tournament) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-50 p-8 rounded-lg shadow-md">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mb-4"></div>
        <p className="text-xl text-gray-700 font-semibold">Loading fixtures...</p>
      </div>
    );
  }

  const filteredMatches = tournament.matches.filter(match => {
    if (filter === 'upcoming') return match.status === 'scheduled';
    if (filter === 'completed') return match.status === 'completed';
    return true;
  });

  // Group matches by date
  const groupedMatches = filteredMatches.reduce((groups, match) => {
    const date = match.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(match);
    return groups;
  }, {} as Record<string, typeof filteredMatches>);

  const sortedDates = Object.keys(groupedMatches).sort();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Calendar className="w-7 h-7 text-green-600" />
            Match Fixtures
          </CardTitle>
          <CardDescription>
            View all scheduled and completed matches for {tournament.name}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({tournament.matches.length})
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                filter === 'upcoming'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Upcoming ({tournament.matches.filter(m => m.status === 'scheduled').length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                filter === 'completed'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completed ({tournament.matches.filter(m => m.status === 'completed').length})
            </button>
          </div>

          {/* Fixtures List */}
          {sortedDates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No matches found for the selected filter.
            </div>
          ) : (
            <div className="space-y-6">
              {sortedDates.map((date) => (
                <div key={date}>
                  {/* Date Header */}
                  <div className="bg-gray-50 rounded-lg px-4 py-2 mb-3">
                    <div className="text-gray-900">
                      {new Date(date).toLocaleDateString('en-MY', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </div>

                  {/* Matches for this date */}
                  <div className="space-y-3">
                    {groupedMatches[date].map((match) => (
                      <div
                        key={match.id}
                        className={`border rounded-lg p-4 ${
                          match.status === 'completed'
                            ? 'border-gray-200 bg-gray-50'
                            : 'border-green-200 bg-green-50'
                        }`}
                      >
                        {/* Match Info */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            {match.time}
                          </div>
                          <div
                            className={`px-3 py-1 rounded-full text-xs ${
                              match.status === 'completed'
                                ? 'bg-gray-200 text-gray-700'
                                : 'bg-green-200 text-green-700'
                            }`}
                          >
                            {match.status === 'completed' ? 'Final' : 'Scheduled'}
                          </div>
                        </div>

                        {/* Teams and Score */}
                        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center mb-3">
                          <div className="text-right">
                            <div className="text-gray-900">{match.home_team.name}</div>
                          </div>

                          <div className="flex items-center justify-center gap-3 px-4">
                            {match.status === 'completed' ? (
                              <>
                                <div className="text-2xl text-gray-900">{match.home_score}</div>
                                <div className="text-gray-400">-</div>
                                <div className="text-2xl text-gray-900">{match.away_score}</div>
                              </>
                            ) : (
                              <div className="text-gray-400">vs</div>
                            )}
                          </div>

                          <div className="text-left">
                            <div className="text-gray-900">{match.away_team.name}</div>
                          </div>
                        </div>

                        {/* Venue */}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          {match.venue}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tournament Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mt-6">
        <h3 className="text-gray-900 mb-3">Tournament Period</h3>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {new Date(tournament.start_date).toLocaleDateString('en-MY')}
          </div>
          <div>-</div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {new Date(tournament.end_date).toLocaleDateString('en-MY')}
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useTournament } from '../context/TournamentContext';
import { api } from '../lib/api';
import type { Match } from '../App';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';

export function LiveScoreInput() {
  const { tournament, setTournament } = useTournament();
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [scores, setScores] = useState<{ [key: number]: { home_score: string; away_score: string } }>({});
  const [loadingStates, setLoadingStates] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    if (tournament) {
      const filtered = tournament.matches.filter(
        m => m.status === 'scheduled' || m.status === 'in_progress'
      );
      setLiveMatches(filtered);
    }
  }, [tournament]);

  if (!tournament) {
    return <div className="text-center p-8">Loading live score input...</div>;
  }

  const handleScoreChange = (matchId: number, team: 'home' | 'away', value: string) => {
    setScores(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [team === 'home' ? 'home_score' : 'away_score']: value,
      },
    }));
  };

  const handleSaveScore = async (matchId: number) => {
    setLoadingStates(prev => ({ ...prev, [matchId]: true }));
    const score = scores[matchId];

    if (!score || score.home_score === undefined || score.away_score === undefined) {
      toast.error('Please enter scores for both teams.');
      setLoadingStates(prev => ({ ...prev, [matchId]: false }));
      return;
    }

    try {
      const updatedTournament = await api.post(`/matches/${matchId}/score`, {
        home_score: parseInt(score.home_score),
        away_score: parseInt(score.away_score),
      });

      setTournament(updatedTournament);

      toast.success('Score saved successfully! Standings are being updated.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save score.');
    } finally {
      setLoadingStates(prev => ({ ...prev, [matchId]: false }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card>
        <CardHeader className="p-6">
          <CardTitle className="flex items-center gap-3">
            <span>-</span>
            Live Score Input
          </CardTitle>
          <CardDescription>
            Update scores for ongoing or recently finished matches. 
            Saving a score will mark the match as 'completed'.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {liveMatches.length > 0 ? (
            liveMatches.map(match => (
              <div key={match.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="mb-3">
                  <p className="font-semibold text-gray-800">{match.home_team.name} vs {match.away_team.name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(match.date).toLocaleDateString('en-MY', { weekday: 'long', day: 'numeric', month: 'long' })} at {match.time}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div className="flex-1 space-y-2">
                    <label className="text-sm font-medium" htmlFor={`home-score-${match.id}`}>{match.home_team.name} Score</label>
                    <Input
                      id={`home-score-${match.id}`}
                      type="number"
                      value={scores[match.id]?.home_score || ''}
                      onChange={e => handleScoreChange(match.id, 'home', e.target.value)}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                   <div className="flex-1 space-y-2">
                    <label className="text-sm font-medium" htmlFor={`away-score-${match.id}`}>{match.away_team.name} Score</label>
                    <Input
                      id={`away-score-${match.id}`}
                      type="number"
                      value={scores[match.id]?.away_score || ''}
                      onChange={e => handleScoreChange(match.id, 'away', e.target.value)}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <Button
                    onClick={() => handleSaveScore(match.id)}
                    disabled={loadingStates[match.id]}
                    className="w-full md:w-auto flex items-center gap-2"
                  >
                    <span>Save</span>
                    {loadingStates[match.id] ? 'Saving...' : 'Save Final Score'}
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-16">
                <span>✓</span>
                <h3 className="text-lg font-semibold">All Matches Completed</h3>
                <p className="text-sm">
                    There are no ongoing or scheduled matches to score.
                </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useTournament } from '../context/TournamentContext';
import { api } from '../lib/api';
import type { Match } from '../App';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

export function MatchScheduling() {
  const { tournament, setTournament } = useTournament();
  const [editableMatches, setEditableMatches] = useState<Match[]>([]);
  const [loadingStates, setLoadingStates] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    if (tournament) {
      // Sort matches by date and time
      const sortedMatches = [...tournament.matches].sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
      });
      setEditableMatches(sortedMatches);
    }
  }, [tournament]);

  if (!tournament) {
    return <div className="text-center p-8">Loading scheduler...</div>;
  }

  const handleInputChange = (matchId: number, field: keyof Match, value: any) => {
    setEditableMatches(prevMatches =>
      prevMatches.map(match =>
        match.id === matchId ? { ...match, [field]: value } : match
      )
    );
  };

  const handleSaveChanges = async (matchId: number) => {
    setLoadingStates(prev => ({ ...prev, [matchId]: true }));
    
    const matchToSave = editableMatches.find(m => m.id === matchId);
    if (!matchToSave) return;

    try {
      const updatedTournament = await api.put(`/matches/${matchToSave.id}`, {
        date: matchToSave.date,
        time: matchToSave.time,
        venue: matchToSave.venue,
      });

      // Update the main tournament context
      setTournament(updatedTournament);

      toast.success(`Match ${matchToSave.home_team.name} vs ${matchToSave.away_team.name} updated!`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update match.');
    } finally {
      setLoadingStates(prev => ({ ...prev, [matchId]: false }));
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Card>
        <CardHeader className="p-6">
          <CardTitle className="flex items-center gap-3">
            <span>Cal</span>
            Manual Match Scheduling
          </CardTitle>
          <CardDescription>
            Fine-tune the schedule by manually editing match details. 
            For bulk generation, please use the Tournament Setup page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {editableMatches.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Match</TableHead>
                    <TableHead className="w-[150px]">Date</TableHead>
                    <TableHead className="w-[120px]">Time</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead className="text-right w-[100px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {editableMatches.map(match => (
                    <TableRow key={match.id}>
                      <TableCell className="font-medium">
                        {match.home_team.name} vs {match.away_team.name}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          value={new Date(match.date).toISOString().split('T')[0]}
                          onChange={e => handleInputChange(match.id, 'date', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="time"
                          value={match.time}
                          onChange={e => handleInputChange(match.id, 'time', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={match.venue || ''}
                          onChange={e => handleInputChange(match.id, 'venue', e.target.value)}
                          placeholder="e.g., Stadium A"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => handleSaveChanges(match.id)}
                          disabled={loadingStates[match.id]}
                          className="flex items-center gap-2"
                        >
                          {loadingStates[match.id] ? 'Saving...' : 'Save'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-16">
              <span>Cal</span>
              <h3 className="text-lg font-semibold">No Matches Scheduled</h3>
              <p className="text-sm">
                Generate a schedule from the Tournament Setup page to begin.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
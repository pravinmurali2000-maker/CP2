import React, { useState } from 'react';
import { toast } from 'sonner';
import { Save, Trophy, AlertCircle, Calendar, Trash2 } from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import { api } from '../lib/api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';

export function TournamentSetup() {
  const { tournament, setTournament, loading: tournamentLoading } = useTournament();

  console.log('TournamentSetup - tournament:', tournament);
  console.log('TournamentSetup - tournamentLoading:', tournamentLoading);


  const [formData, setFormData] = useState({
    name: tournament?.name || '',
    format: tournament?.format || '',
    startDate: tournament ? new Date(tournament.start_date).toISOString().split('T')[0] : '',
    endDate: tournament ? new Date(tournament.end_date).toISOString().split('T')[0] : '',
  });

  const [scheduleConfig, setScheduleConfig] = useState({
    matchesPerDay: 3,
    timeSlotInterval: 60,
  });

  const [loading, setLoading] = useState(false);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [error, setError] = useState('');
  const [scheduleError, setScheduleError] = useState('');

  if (!tournament) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-50 p-8 rounded-lg shadow-md">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
        <p className="text-xl text-gray-700 font-semibold">Loading tournament setup...</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const updatedTournament = await api.put(`/tournaments/${tournament.id}`, {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      });
      setTournament(updatedTournament);
      toast.success('Tournament settings saved successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to save settings.');
      toast.error(err.message || 'Failed to save settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setScheduleLoading(true);
    setScheduleError('');
    try {
      const updatedTournament = await api.post(`/tournaments/${tournament.id}/schedule/generate`, {
        startDate: new Date(formData.startDate).toISOString(),
        ...scheduleConfig,
      });
      setTournament(updatedTournament);
      toast.success('Schedule generated successfully!', {
        description: `Created ${updatedTournament.matches.length} matches.`,
      });
    } catch (err: any) {
      setScheduleError(err.message || 'Failed to generate schedule.');
      toast.error(err.message || 'Failed to generate schedule.');
    } finally {
      setScheduleLoading(false);
    }
  };

  const handleClearSchedule = async () => {
    setScheduleLoading(true);
    setScheduleError('');
    try {
      const updatedTournament = await api.delete(`/tournaments/${tournament.id}/schedule`);
      setTournament(updatedTournament);
      toast.success('Schedule cleared successfully!');
    } catch (err: any) {
      setScheduleError(err.message || 'Failed to clear schedule.');
      toast.error(err.message || 'Failed to clear schedule.');
    } finally {
      setScheduleLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Trophy className="w-7 h-7 text-green-600" />
            Tournament Settings
          </CardTitle>
          <CardDescription>
            Update the core details of your tournament.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Tournament Name</Label>
                <Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="format">Format</Label>
                <Input id="format" value={formData.format} onChange={e => setFormData({...formData, format: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} required />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={loading} className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Calendar className="w-7 h-7 text-blue-600" />
            Schedule Management
          </CardTitle>
          <CardDescription>
            Automatically generate a round-robin schedule or clear all existing matches.
            There are currently <strong>{tournament.matches.length}</strong> matches scheduled.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerateSchedule} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="matchesPerDay">Matches Per Day</Label>
                <Input
                  type="number"
                  id="matchesPerDay"
                  value={String(scheduleConfig.matchesPerDay)}
                  onChange={(e) => setScheduleConfig({ ...scheduleConfig, matchesPerDay: parseInt(e.target.value) || 0 })}
                  min="1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeSlotInterval">Time Slot Interval (mins)</Label>
                <Input
                  type="number"
                  id="timeSlotInterval"
                  value={String(scheduleConfig.timeSlotInterval)}
                  onChange={(e) => setScheduleConfig({ ...scheduleConfig, timeSlotInterval: parseInt(e.target.value) || 0 })}
                  min="1"
                  step="5"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 flex items-center gap-2"
                disabled={scheduleLoading}
              >
                <Calendar className="w-4 h-4" />
                {scheduleLoading ? 'Generating...' : 'Generate Schedule'}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleClearSchedule}
                className="flex-1 flex items-center gap-2"
                disabled={scheduleLoading || tournament.matches.length === 0}
              >
                <Trash2 className="w-4 h-4" />
                {scheduleLoading ? 'Working...' : 'Clear Schedule'}
              </Button>
            </div>
          </form>
          {scheduleError && (
            <div className="mt-4 text-red-600 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {scheduleError}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
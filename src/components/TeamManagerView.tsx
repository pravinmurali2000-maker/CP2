import React, { useState } from 'react';
import { Users, Calendar, Trophy, TrendingUp, ShieldCheck, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import type { User, Team } from '../App';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Modal, ConfirmModal } from './ui/modal';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';
import { api } from '../lib/api';

interface TeamManagerViewProps {
  currentUser: User;
  onNavigate: (page: string) => void;
}

const StatCard = ({ icon, title, value, subtext }: { icon: React.ReactNode, title: string, value: string | number, subtext?: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
    </CardContent>
  </Card>
);

export function TeamManagerView({ currentUser, onNavigate }: TeamManagerViewProps) {
  const { tournament, setTournament } = useTournament();
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [deletingTeam, setDeletingTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  if (!tournament) {
    return <div className="text-center p-8">Loading team data...</div>;
  }

  const team = tournament.teams.find(t => t.id === currentUser.teamId);

  if (!team) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center">
        <ShieldCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-4">No Team Assigned</h2>
        <p className="text-gray-600 mb-6">
          You are not currently assigned to a team. Please contact the tournament administrator.
        </p>
        <Button onClick={() => onNavigate('landing')}>
          Back to Home
        </Button>
      </div>
    );
  }
  
  const sortedTeams = [...tournament.teams].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  const rank = sortedTeams.findIndex(t => t.id === team.id) + 1;

  const upcomingMatch = tournament.matches
    .filter(m => (m.home_team_id === team.id || m.away_team_id === team.id) && m.status === 'scheduled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam) return;
    setLoading(true);
    setError('');
    try {
      const updatedTournament = await api.put(`/tournaments/${tournament.id}/teams/${editingTeam.id}`, {
        name: editingTeam.name,
        manager_name: editingTeam.manager_name,
        manager_email: editingTeam.manager_email,
      });
      setTournament(updatedTournament);
      toast.success(`Team "${editingTeam.name}" updated successfully!`);
      setEditingTeam(null);
      setIsEditDialogOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update team.');
      toast.error(err.message || 'Failed to update team.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!deletingTeam) return;
    setLoading(true); 
    setError('');
    try {
      await api.delete(`/tournaments/${tournament.id}/teams/${deletingTeam.id}`);
      const updatedTournament = await api.get(`/tournaments/${tournament.id}`);
      setTournament(updatedTournament);
      toast.success(`Team "${deletingTeam.name}" deleted successfully!`);
      onNavigate('landing');
      setDeletingTeam(null);
      setIsDeleteDialogOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to delete team.');
      toast.error(err.message || 'Failed to delete team.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 via-gray-900 to-black text-white rounded-2xl p-6 md:p-8 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl md:text-4xl font-bold">{team.name}</h1>
          <div className="flex gap-2">
            <Button size="icon" variant="secondary" onClick={() => { setEditingTeam(team); setIsEditDialogOpen(true); }}>
              <Edit className="w-5 h-5" />
            </Button>
            <Button size="icon" variant="destructive" onClick={() => { setDeletingTeam(team); setIsDeleteDialogOpen(true); }}>
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
        <p className="text-gray-300 text-sm">Managed by {team.manager_name} ({team.manager_email})</p>
      </div>

      {/* Edit Team Modal for Manager */}
      <Modal
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingTeam(null);
          setError('');
        }}
        title={`Edit Team: ${editingTeam?.name}`}
        description="Update the team's details below and save your changes."
      >
        <form onSubmit={handleUpdateTeam} className="space-y-4">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="editTeamName">Team Name</Label>
            <Input id="editTeamName" value={editingTeam?.name || ''} onChange={e => setEditingTeam(prev => prev ? {...prev, name: e.target.value} : null)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editManagerName">Manager's Name</Label>
            <Input id="editManagerName" value={editingTeam?.manager_name || ''} onChange={e => setEditingTeam(prev => prev ? {...prev, manager_name: e.target.value} : null)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editManagerEmail">Manager's Email</Label>
            <Input id="editManagerEmail" type="email" value={editingTeam?.manager_email || ''} onChange={e => setEditingTeam(prev => prev ? {...prev, manager_email: e.target.value} : null)} required />
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t mt-6">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingTeam(null);
                setError('');
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setDeletingTeam(null);
        }}
        onConfirm={handleDeleteTeam}
        title="Are you absolutely sure?"
        description={`This action cannot be undone. This will permanently delete "${deletingTeam?.name}" and all associated players. You will also be logged out.`}
        confirmText="Delete My Team"
        cancelText="Cancel"
        isDangerous={true}
      />
    </div>
  );
}

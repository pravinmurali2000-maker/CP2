import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { api } from '../lib/api';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Modal, ConfirmModal } from './ui/modal';
import { Drawer } from './ui/drawer';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import type { Team } from '../App';

export function TeamManagement() {
  const { tournament, setTournament } = useTournament();
  const [newTeam, setNewTeam] = useState({ name: '', manager_name: '', manager_email: '', password: '' });
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [deletingTeam, setDeletingTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  if (!tournament) {
    return <div className="text-center p-8">Loading team data...</div>;
  }

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const updatedTournament = await api.post(`/tournaments/${tournament.id}/teams`, newTeam);
      setTournament(updatedTournament);
      toast.success(`Team "${newTeam.name}" created successfully!`);
      setNewTeam({ name: '', manager_name: '', manager_email: '', password: '' });
      setIsAddDialogOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create team.');
      toast.error(err.message || 'Failed to create team.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam) return;
    setLoading(true);
    setError('');
    try {
      const updatedTournament = await api.put(`/tournaments/${tournament.id}/teams/${editingTeam.id}`, {
        name: editingTeam.name,
        manager_name: editingTeam.manager.name,
        manager_email: editingTeam.manager.email,
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
      const updatedTournament = await api.delete(`/tournaments/${tournament.id}/teams/${deletingTeam.id}`);
      setTournament(updatedTournament);
      toast.success(`Team "${deletingTeam.name}" deleted successfully!`);
      setDeletingTeam(null);
      setIsDeleteDialogOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to delete team.');
      toast.error(err.message || 'Failed to delete team.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                <span>Users</span>
                Team Management
              </CardTitle>
              <CardDescription>
                Manage the teams participating in the tournament. There are currently <strong>{tournament.teams.length}</strong> teams.
              </CardDescription>
            </div>
            <Button 
              className="flex items-center gap-2"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <span>+</span> Add Team
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team Name</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Manager's Email</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tournament.teams.length > 0 ? (
                tournament.teams.map(team => (
                  <TableRow key={team.id}>
                    <TableCell className="font-medium">{team.name}</TableCell>
                    <TableCell>{team.manager?.name}</TableCell>
                    <TableCell>{team.manager?.email}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setEditingTeam(team);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-500 hover:bg-red-50"
                        onClick={() => {
                          setDeletingTeam(team);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                    No teams have been added yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Team Modal */}
      <Modal
        isOpen={isAddDialogOpen}
        onClose={() => {
          setIsAddDialogOpen(false);
          setError('');
        }}
        title="Add a New Team"
        description="Fill in the details below to create a new team for the tournament."
      >
        <form onSubmit={handleCreateTeam} className="space-y-4">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg flex gap-3">
              <span>!</span>
              <p>{error}</p>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="teamName">Team Name</Label>
            <Input 
              id="teamName" 
              value={newTeam.name} 
              onChange={e => setNewTeam({...newTeam, name: e.target.value})} 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="managerName">Manager's Name</Label>
            <Input 
              id="managerName" 
              value={newTeam.manager_name} 
              onChange={e => setNewTeam({...newTeam, manager_name: e.target.value})} 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="managerEmail">Manager's Email</Label>
            <Input 
              id="managerEmail" 
              type="email" 
              value={newTeam.manager_email} 
              onChange={e => setNewTeam({...newTeam, manager_email: e.target.value})} 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              value={newTeam.password} 
              onChange={e => setNewTeam({...newTeam, password: e.target.value})} 
              required 
            />
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                setError('');
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Team'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Team Modal */}
      <Modal
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingTeam(null);
          setError('');
        }}
        title={`Edit Team: ${editingTeam?.name}`}
        description="Update the team's details below."
      >
        <form onSubmit={handleUpdateTeam} className="space-y-4">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg flex gap-3">
              <span>!</span>
              <p>{error}</p>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="editTeamName">Team Name</Label>
            <Input 
              id="editTeamName" 
              value={editingTeam?.name || ''} 
              onChange={e => setEditingTeam(prev => prev ? {...prev, name: e.target.value} : null)} 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editManagerName">Manager's Name</Label>
            <Input 
              id="editManagerName" 
              value={editingTeam?.manager?.name || ''} 
              onChange={e => setEditingTeam(prev => prev ? {...prev, manager: {...prev.manager, name: e.target.value}} : null)} 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editManagerEmail">Manager's Email</Label>
            <Input 
              id="editManagerEmail" 
              type="email" 
              value={editingTeam?.manager?.email || ''} 
              onChange={e => setEditingTeam(prev => prev ? {...prev, manager: {...prev.manager, email: e.target.value}} : null)} 
              required 
            />
          </div>
          <div className="flex gap-3 justify-end pt-4">
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
        description={`This action cannot be undone. This will permanently delete "${deletingTeam?.name}" and all associated players.`}
        confirmText="Yes, confirm delete team"
        cancelText="Cancel"
        isDangerous={true}
      />
    </div>
  );
}

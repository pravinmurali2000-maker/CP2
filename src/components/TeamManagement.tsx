import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { api } from '../lib/api';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { PlusCircle, Users, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import type { Team } from '../App';

export function TeamManagement() {
  const { tournament, setTournament } = useTournament();
  const [newTeam, setNewTeam] = useState({ name: '', manager_name: '', manager_email: '' });
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [deletingTeam, setDeletingTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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
      setNewTeam({ name: '', manager_name: '', manager_email: '' });
      setIsDialogOpen(false);
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
    setLoading(true); // This loading state is for the overall component, not just the dialog
    setError('');
    try {
      await api.delete(`/tournaments/${tournament.id}/teams/${deletingTeam.id}`);
      // After deletion, fetch the updated tournament to refresh the state
      const updatedTournament = await api.get(`/tournaments/${tournament.id}`);
      setTournament(updatedTournament);
      toast.success(`Team "${deletingTeam.name}" deleted successfully!`);
      setDeletingTeam(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete team.');
      toast.error(err.message || 'Failed to delete team.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                <Users className="w-7 h-7 text-blue-600" />
                Team Management
              </CardTitle>
              <CardDescription>
                Manage the teams participating in the tournament. There are currently <strong>{tournament.teams.length}</strong> teams.
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <PlusCircle className="w-4 h-4" /> Add Team
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add a New Team</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateTeam} className="space-y-4 py-4">
                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg flex gap-3">
                      <AlertCircle className="w-5 h-5" />
                      <p>{error}</p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="teamName">Team Name</Label>
                    <Input id="teamName" value={newTeam.name} onChange={e => setNewTeam({...newTeam, name: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="managerName">Manager's Name</Label>
                    <Input id="managerName" value={newTeam.manager_name} onChange={e => setNewTeam({...newTeam, manager_name: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="managerEmail">Manager's Email</Label>
                    <Input id="managerEmail" type="email" value={newTeam.manager_email} onChange={e => setNewTeam({...newTeam, manager_email: e.target.value})} required />
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Creating...' : 'Create Team'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
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
                    <TableCell>{team.manager_name}</TableCell>
                    <TableCell>{team.manager_email}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingTeam(team); setIsEditDialogOpen(true); }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => setDeletingTeam(team)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete 
                              <strong> {deletingTeam?.name}</strong> and all associated players.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setDeletingTeam(null)}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteTeam}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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

          {/* Edit Team Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Team: {editingTeam?.name}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdateTeam} className="space-y-4 py-4">
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
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline" onClick={() => setEditingTeam(null)}>Cancel</Button>
                  </DialogClose>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}

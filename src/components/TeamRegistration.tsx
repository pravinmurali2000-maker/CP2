import React, { useState } from 'react';
import { UserPlus, Save, Plus, X, Trash2, Edit, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useTournament } from '../context/TournamentContext';
import type { Player, User } from '../App';
import { api } from '../lib/api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Modal, ConfirmModal } from './ui/modal';

interface TeamRegistrationProps {
  currentUser: User;
}

export function TeamRegistration({ currentUser }: TeamRegistrationProps) {
  const { tournament, setTournament } = useTournament();
  const [newPlayer, setNewPlayer] = useState({ name: '', number: '', position: '' });
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null); // New state
  const [deletingPlayer, setDeletingPlayer] = useState<Player | null>(null); // New state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditPlayerDialogOpen, setIsEditPlayerDialogOpen] = useState(false); // New state
  const [isDeletePlayerDialogOpen, setIsDeletePlayerDialogOpen] = useState(false); // New state

  if (!tournament) {
    return <div className="text-center p-8">Loading registration form...</div>;
  }

  const team = currentUser.teams && currentUser.teams.length > 0
    ? tournament.teams.find(t => t.id === currentUser.teams[0].id)
    : null;

  if (!team) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-semibold mb-4">Team Not Found</h2>
        <p className="text-gray-600">Could not find your assigned team. Please contact support.</p>
      </div>
    );
  }

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!newPlayer.name || !newPlayer.number) {
      setError('Player name and number are required.');
      setLoading(false);
      return;
    }

    try {
      const createdPlayer = await api.post(
        `/tournaments/${tournament.id}/teams/${team.id}/players`,
        {
          name: newPlayer.name,
          number: parseInt(newPlayer.number),
          position: newPlayer.position,
        },
      );

      // Optimistically update the UI, but a full refresh from API is better
      const updatedTournament = await api.get(`/tournaments/${tournament.id}`);
      setTournament(updatedTournament);
      
      toast.success(`Player ${createdPlayer.name} added successfully!`);
      setNewPlayer({ name: '', number: '', position: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to add player.');
      toast.error(err.message || 'Failed to add player.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayer) return;
    setLoading(true);
    setError('');

    if (!editingPlayer.name || !editingPlayer.number) {
      setError('Player name and number are required.');
      setLoading(false);
      return;
    }

    try {
      const updatedTournament = await api.put(
        `/tournaments/${tournament.id}/teams/${team.id}/players/${editingPlayer.id}`,
        {
          name: editingPlayer.name,
          number: editingPlayer.number,
          position: editingPlayer.position,
        },
      );
      setTournament(updatedTournament);
      toast.success(`Player "${editingPlayer.name}" updated successfully!`);
      setEditingPlayer(null);
      setIsEditPlayerDialogOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update player.');
      toast.error(err.message || 'Failed to update player.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlayerConfirm = async () => {
    if (!deletingPlayer) return;
    setLoading(true);
    setError('');
    try {
      const updatedTournament = await api.delete(
        `/tournaments/${tournament.id}/teams/${team.id}/players/${deletingPlayer.id}`,
      );
      setTournament(updatedTournament);
      toast.success(`Player "${deletingPlayer.name}" deleted successfully!`);
      setDeletingPlayer(null);
      setIsDeletePlayerDialogOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to delete player.');
      toast.error(err.message || 'Failed to delete player.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card>
        <CardHeader className="p-6">
          <CardTitle className="flex items-center gap-3">
            <UserPlus className="w-7 h-7 text-green-600" />
            Player Registration
          </CardTitle>
          <CardDescription>
            Manage the player roster for your team, <strong>{team.name}</strong>.
            You currently have {team.players.length} players.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">Add New Player</h3>
            <form onSubmit={handleAddPlayer} className="space-y-4">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg flex gap-3">
                  <AlertCircle className="w-5 h-5" />
                  <p>{error}</p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="playerName">Player Name</Label>
                  <Input id="playerName" value={newPlayer.name} onChange={e => setNewPlayer({...newPlayer, name: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="playerNumber">Number</Label>
                  <Input id="playerNumber" type="number" value={newPlayer.number} onChange={e => setNewPlayer({...newPlayer, number: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="playerPosition">Position</Label>
                  <Input id="playerPosition" value={newPlayer.position} onChange={e => setNewPlayer({...newPlayer, position: e.target.value})} />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={loading} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  {loading ? 'Adding Player...' : 'Add Player'}
                </Button>
              </div>
            </form>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">Current Roster</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {team.players.length > 0 ? (
                  team.players.map(player => (
                    <TableRow key={player.id}>
                      <TableCell className="font-bold">{player.number}</TableCell>
                      <TableCell>{player.name}</TableCell>
                      <TableCell>{player.position}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="mr-2"
                          onClick={() => {
                            setEditingPlayer(player);
                            setIsEditPlayerDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeletingPlayer(player);
                            setIsDeletePlayerDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500 py-12">
                      Your roster is empty. Add your first player using the form above.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Player Modal */}
      <Modal
        isOpen={isEditPlayerDialogOpen}
        onClose={() => {
          setIsEditPlayerDialogOpen(false);
          setEditingPlayer(null);
          setError('');
        }}
        title={`Edit Player: ${editingPlayer?.name}`}
        description="Update player details below."
      >
        <form onSubmit={handleUpdatePlayer} className="space-y-4">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="editPlayerName">Player Name</Label>
            <Input
              id="editPlayerName"
              value={editingPlayer?.name || ''}
              onChange={e => setEditingPlayer(prev => prev ? {...prev, name: e.target.value} : null)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editPlayerNumber">Number</Label>
            <Input
              id="editPlayerNumber"
              type="number"
              value={editingPlayer?.number || ''}
              onChange={e => setEditingPlayer(prev => prev ? {...prev, number: parseInt(e.target.value)} : null)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editPlayerPosition">Position</Label>
            <Input
              id="editPlayerPosition"
              value={editingPlayer?.position || ''}
              onChange={e => setEditingPlayer(prev => prev ? {...prev, position: e.target.value} : null)}
            />
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditPlayerDialogOpen(false);
                setEditingPlayer(null);
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

      {/* Delete Player Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeletePlayerDialogOpen}
        onClose={() => {
          setIsDeletePlayerDialogOpen(false);
          setDeletingPlayer(null);
        }}
        onConfirm={handleDeletePlayerConfirm}
        title="Are you absolutely sure?"
        description={`This action cannot be undone. This will permanently delete player "${deletingPlayer?.name}".`}
        confirmText="Yes, delete player"
        cancelText="Cancel"
        isDangerous={true}
      />
    </div>
  );
}
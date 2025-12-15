import React, { useState } from 'react';
import { toast } from 'sonner';
import { useTournament } from '../context/TournamentContext';
import type { UserRole } from '../App';
import { api } from '../lib/api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { Trash2, Send, Bell, Info, AlertTriangle, MessageSquare, Megaphone } from 'lucide-react';

interface NotificationsProps {
  userRole: UserRole;
}

export function Notifications({ userRole }: NotificationsProps) {
  const { tournament, setTournament } = useTournament();
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!tournament) {
    return <div className="text-center p-8">Loading notifications...</div>;
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) {
      setError('Message cannot be empty.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const newNotification = await api.post(`/tournaments/${tournament.id}/notifications`, {
        message,
        priority,
      });

      toast.success('Notification sent!', {
        description: 'The message has been broadcast to all users in real-time.'
      });
      
      setMessage('');
      setPriority('normal');

    } catch (err: any) {
      setError(err.message || 'Failed to send notification.');
      toast.error(err.message || 'Failed to send notification.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (notificationId: number) => {
    try {
      await api.delete(`/tournaments/${tournament.id}/notifications/${notificationId}`);
      toast.success('Notification deleted successfully.');
      // The UI will update automatically via the WebSocket broadcast
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete notification.');
    }
  };

  const sortedNotifications = [...tournament.notifications].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {userRole === 'admin' && (
        <Card className="mb-8">
          <CardHeader className="p-6">
            <CardTitle className="flex items-center gap-3">
              <Megaphone className="w-6 h-6 text-green-600"/>
              Send Notification
            </CardTitle>
            <CardDescription>
              Broadcast a message to all tournament participants. Urgent messages will be highlighted.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSend} className="space-y-6">
               {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0"/>
                  <div>
                    <h4 className="font-semibold">Error</h4>
                    <p>{error}</p>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="message" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4"/>
                  Message
                </Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="e.g., Match on Pitch 3 has been delayed by 15 minutes."
                  required
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-3">
                <Label>Priority</Label>
                <ToggleGroup type="single" value={priority} onValueChange={(v: 'normal' | 'urgent') => v && setPriority(v)} className="grid grid-cols-2 gap-2">
                  <ToggleGroupItem value="normal" className="flex items-center justify-start h-auto p-4 gap-3">
                    {priority === 'normal' ? 
                      <div className="w-5 h-5 rounded-full bg-green-500 border-4 border-green-100 ring-2 ring-green-500"/> : 
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300"/>
                    }
                    <Info className="w-5 h-5"/>
                    <span className="text-sm font-medium">Normal</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="urgent" className="flex items-center justify-start h-auto p-4 gap-3">
                    {priority === 'urgent' ? 
                      <div className="w-5 h-5 rounded-full bg-green-500 border-4 border-green-100 ring-2 ring-green-500"/> : 
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300"/>
                    }
                    <AlertTriangle className="w-5 h-5"/>
                    <span className="text-sm font-medium">Urgent</span>
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={loading} className="flex items-center gap-2">
                  <Send className="w-4 h-4"/>
                  {loading ? 'Sending...' : 'Send Broadcast'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="p-6">
          <CardTitle className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-blue-600"/>
            Notification History
          </CardTitle>
          <CardDescription>
            A log of all broadcasted messages for this tournament.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedNotifications.length > 0 ? (
            <div className="space-y-4">
              {sortedNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={`relative p-4 rounded-lg border-l-4 group ${
                    notification.priority === 'urgent'
                      ? 'bg-red-50 border-red-500'
                      : 'bg-blue-50 border-blue-500'
                  }`}
                >
                  <p className="text-sm text-gray-800 pr-12">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(notification.timestamp).toLocaleString('en-MY', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                  {userRole === 'admin' && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(notification.id)}
                        className="text-red-600 hover:bg-red-100 hover:text-red-700 h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-16">
              <Bell className="w-12 h-12 mx-auto text-gray-400"/>
              <h3 className="text-lg font-semibold mt-4">No Notifications Yet</h3>
              <p className="text-sm mt-1">
                Important updates and announcements will appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
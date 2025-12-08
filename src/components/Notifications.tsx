import React, { useState } from 'react';
import { toast } from 'sonner';
import { Bell, Send, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import type { UserRole } from '../App';
import { api } from '../lib/api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

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

      // Optimistically add to the list, but a full refetch is safer for consistency
      setTournament(prev => prev ? { ...prev, notifications: [newNotification, ...prev.notifications] } : null);

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

  const sortedNotifications = [...tournament.notifications].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {userRole === 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Send className="w-6 h-6 text-blue-600" />
              Send Notification
            </CardTitle>
            <CardDescription>
              Broadcast a message to all tournament participants. Urgent messages will be highlighted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSend} className="space-y-4">
               {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg flex gap-3">
                  <AlertCircle className="w-5 h-5" />
                  <p>{error}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="e.g., Match on Pitch 3 has been delayed by 15 minutes."
                  required
                />
              </div>
              <div className="space-y-3">
                <Label>Priority</Label>
                <RadioGroup value={priority} onValueChange={(v: 'normal' | 'urgent') => setPriority(v)} className="flex items-center gap-6">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="normal" id="r1" />
                    <Label htmlFor="r1" className="flex items-center gap-2"><Info className="w-4 h-4 text-gray-600" /> Normal</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="urgent" id="r2" />
                    <Label htmlFor="r2" className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-600" /> Urgent</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={loading} className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  {loading ? 'Sending...' : 'Send Broadcast'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-gray-700" />
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
                  className={`p-4 rounded-lg border-l-4 ${
                    notification.priority === 'urgent'
                      ? 'bg-red-50 border-red-500'
                      : 'bg-blue-50 border-blue-500'
                  }`}
                >
                  <p className="text-sm text-gray-800">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(notification.timestamp).toLocaleString('en-MY', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-16">
              <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold">No Notifications Yet</h3>
              <p className="text-sm">
                Important updates and announcements will appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
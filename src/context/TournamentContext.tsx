// src/context/TournamentContext.tsx
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import type { Tournament } from '../App';
import { api } from '../lib/api';
import { toast } from 'sonner';

interface TournamentContextType {
  tournament: Tournament | null;
  setTournament: React.Dispatch<React.SetStateAction<Tournament | null>>;
  loading: boolean;
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

export function TournamentProvider({ children }: { children: ReactNode }) {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTournamentData = async () => {
      try {
        setLoading(true);
        const tournamentData = await api.get('/tournaments/1');
        setTournament(tournamentData);
      } catch (error: any) {
        toast.error(`Failed to load tournament data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchTournamentData();
  }, []);

  return (
    <TournamentContext.Provider value={{ tournament, setTournament, loading }}>
      {children}
    </TournamentContext.Provider>
  );
}

export function useTournament() {
  const context = useContext(TournamentContext);
  if (context === undefined) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  return context;
}

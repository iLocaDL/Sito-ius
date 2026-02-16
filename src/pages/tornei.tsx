import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

type TournamentRow = {
  id: string;
  title: string;
  date: string | null;
  structure: string | null;
};

type TeamRow = {
  id: string;
  tournament_id: string;
  name: string;
};

type PlayerRow = {
  id: string;
  team_id: string;
  name: string;
  goals: number | null;
};

type MatchRow = {
  id: string;
  tournament_id: string;
  home_team_id: string;
  away_team_id: string;
  home_goals: number;
  away_goals: number;
  played_at: string | null;
};

type RankingEntry = {
  teamId: string;
  teamName: string;
  points: number;
  matchesPlayed: number;
};

type NewMatchForm = {
  homeTeamId: string;
  awayTeamId: string;
  homeGoals: string;
  awayGoals: string;
};

type PendingDelete =
  | { type: 'team'; teamId: string }
  | { type: 'player'; teamId: string; playerId: string }
  | null;

const REGISTRATION_PASSWORD = 'ius1';

const formatDate = (value: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const getTournamentHeading = (tournament: TournamentRow) => {
  const dateLabel = formatDate(tournament.date);
  const baseTitle = tournament.title.trim() || 'Torneo';
  if (!dateLabel) return baseTitle;
  return `${baseTitle} - ${dateLabel}`;
};

export default function Tornei() {
  const [tournaments, setTournaments] = useState<TournamentRow[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [matches, setMatches] = useState<MatchRow[]>([]);

  const [teamName, setTeamName] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [registrationPassword, setRegistrationPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [playerInputs, setPlayerInputs] = useState<string[]>(['']);
  const [registrationError, setRegistrationError] = useState('');
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const registrationPasswordInputRef = useRef<HTMLInputElement | null>(null);

  const [adminOpenTournamentId, setAdminOpenTournamentId] = useState<string | null>(null);
  const [adminSession, setAdminSession] = useState<Session | null>(null);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null);
  const [adminActionError, setAdminActionError] = useState('');
  const [adminActionSuccess, setAdminActionSuccess] = useState('');

  const [newMatchForm, setNewMatchForm] = useState<NewMatchForm>({
    homeTeamId: '',
    awayTeamId: '',
    homeGoals: '0',
    awayGoals: '0',
  });
  const [structureDraft, setStructureDraft] = useState('');
  const [playerNameDrafts, setPlayerNameDrafts] = useState<Record<string, string>>({});
  const [playerGoalsDrafts, setPlayerGoalsDrafts] = useState<Record<string, string>>({});

  const [loadingTournaments, setLoadingTournaments] = useState(false);
  const [loadingTournamentData, setLoadingTournamentData] = useState(false);
  const [pageError, setPageError] = useState('');

  const selectedTournament = useMemo(
    () => tournaments.find((tournament) => tournament.id === selectedTournamentId) ?? null,
    [tournaments, selectedTournamentId]
  );

  const isAdminMode =
    selectedTournament !== null && adminOpenTournamentId === selectedTournament.id;

  const fetchTournaments = useCallback(async () => {
    setLoadingTournaments(true);
    setPageError('');

    const { data, error } = await supabase
      .from('tournaments')
      .select('id,title,date,structure')
      .order('date', { ascending: false });

    if (error) {
      setTournaments([]);
      setPageError(error.message);
      setLoadingTournaments(false);
      return;
    }

    const rows = (data ?? []) as TournamentRow[];
    setTournaments(rows);
    setSelectedTournamentId((previous) => {
      if (previous && rows.some((tournament) => tournament.id === previous)) {
        return previous;
      }
      return rows[0]?.id ?? null;
    });
    setLoadingTournaments(false);
  }, []);

  const loadTournamentData = useCallback(async (tournamentId: string) => {
    setLoadingTournamentData(true);
    setPageError('');

    const [teamsResult, matchesResult] = await Promise.all([
      supabase
        .from('teams')
        .select('id,tournament_id,name')
        .eq('tournament_id', tournamentId)
        .order('name', { ascending: true }),
      supabase
        .from('matches')
        .select('id,tournament_id,home_team_id,away_team_id,home_goals,away_goals,played_at')
        .eq('tournament_id', tournamentId)
        .order('played_at', { ascending: true }),
    ]);

    if (teamsResult.error) {
      setTeams([]);
      setPlayers([]);
      setMatches([]);
      setPageError(teamsResult.error.message);
      setLoadingTournamentData(false);
      return;
    }

    if (matchesResult.error) {
      setTeams([]);
      setPlayers([]);
      setMatches([]);
      setPageError(matchesResult.error.message);
      setLoadingTournamentData(false);
      return;
    }

    const loadedTeams = (teamsResult.data ?? []) as TeamRow[];
    const loadedMatches = (matchesResult.data ?? []) as MatchRow[];
    const teamIds = loadedTeams.map((team) => team.id);

    let loadedPlayers: PlayerRow[] = [];
    if (teamIds.length > 0) {
      const playersResult = await supabase
        .from('players')
        .select('id,team_id,name,goals')
        .in('team_id', teamIds)
        .order('name', { ascending: true });

      if (playersResult.error) {
        setTeams([]);
        setPlayers([]);
        setMatches([]);
        setPageError(playersResult.error.message);
        setLoadingTournamentData(false);
        return;
      }

      loadedPlayers = (playersResult.data ?? []) as PlayerRow[];
    }

    setTeams(loadedTeams);
    setPlayers(loadedPlayers);
    setMatches(loadedMatches);
    setLoadingTournamentData(false);
  }, []);

  useEffect(() => {
    void fetchTournaments();
  }, [fetchTournaments]);

  useEffect(() => {
    if (!selectedTournamentId) {
      setTeams([]);
      setPlayers([]);
      setMatches([]);
      return;
    }

    void loadTournamentData(selectedTournamentId);
  }, [loadTournamentData, selectedTournamentId]);

  useEffect(() => {
    setExpandedTeamId((previous) =>
      previous && teams.some((team) => team.id === previous) ? previous : null
    );
  }, [teams]);

  useEffect(() => {
    setStructureDraft(selectedTournament?.structure ?? '');
  }, [selectedTournament]);

  useEffect(() => {
    setPlayerNameDrafts((previous) => {
      const next: Record<string, string> = {};
      players.forEach((player) => {
        next[player.id] = previous[player.id] ?? player.name;
      });
      return next;
    });

    setPlayerGoalsDrafts((previous) => {
      const next: Record<string, string> = {};
      players.forEach((player) => {
        next[player.id] = previous[player.id] ?? String(Math.max(0, player.goals ?? 0));
      });
      return next;
    });
  }, [players]);

  useEffect(() => {
    let mounted = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setAdminSession(data.session);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAdminSession(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!showPasswordPrompt) return;
    registrationPasswordInputRef.current?.focus();
  }, [showPasswordPrompt]);

  const teamsById = useMemo(() => new Map(teams.map((team) => [team.id, team])), [teams]);

  const playersByTeam = useMemo(() => {
    const map = new Map<string, PlayerRow[]>();
    players.forEach((player) => {
      const current = map.get(player.team_id) ?? [];
      current.push(player);
      map.set(player.team_id, current);
    });
    return map;
  }, [players]);

  const topScorers = useMemo(() => {
    return [...players]
      .sort(
        (a, b) =>
          (b.goals ?? 0) - (a.goals ?? 0) ||
          a.name.localeCompare(b.name, 'it', { sensitivity: 'base' })
      )
      .map((player) => ({
        ...player,
        goals: Math.max(0, player.goals ?? 0),
      }));
  }, [players]);

  const ranking = useMemo((): RankingEntry[] => {
    const table = new Map(
      teams.map((team) => [
        team.id,
        {
          teamId: team.id,
          teamName: team.name,
          points: 0,
          matchesPlayed: 0,
        },
      ])
    );

    matches.forEach((match) => {
      const home = table.get(match.home_team_id);
      const away = table.get(match.away_team_id);
      if (!home || !away) return;

      home.matchesPlayed += 1;
      away.matchesPlayed += 1;

      if (match.home_goals > match.away_goals) {
        home.points += 3;
      } else if (match.home_goals < match.away_goals) {
        away.points += 3;
      } else {
        home.points += 1;
        away.points += 1;
      }
    });

    return Array.from(table.values()).sort(
      (a, b) => b.points - a.points || a.teamName.localeCompare(b.teamName)
    );
  }, [matches, teams]);

  const handleTournamentSelect = (tournamentId: string) => {
    setSelectedTournamentId(tournamentId);
    setExpandedTeamId(null);
    setRegistrationError('');
    setPasswordError('');
    setShowPasswordPrompt(false);
    setRegistrationPassword('');
    setPendingDelete(null);
    setAdminActionError('');
    setAdminActionSuccess('');
  };

  const handleAdminToggle = (tournamentId: string) => {
    if (adminOpenTournamentId === tournamentId) {
      setAdminOpenTournamentId(null);
      setPendingDelete(null);
      setAdminActionError('');
      setAdminActionSuccess('');
      return;
    }

    setSelectedTournamentId(tournamentId);
    setAdminOpenTournamentId(tournamentId);
    setExpandedTeamId(null);
    setAdminError('');
    setPendingDelete(null);
    setAdminActionError('');
    setAdminActionSuccess('');
  };

  const handleExitAdmin = async () => {
    setAdminOpenTournamentId(null);
    setPendingDelete(null);
    setAdminActionError('');
    setAdminActionSuccess('');

    if (selectedTournamentId) {
      await loadTournamentData(selectedTournamentId);
    }
  };

  const toggleTeam = (teamId: string) => {
    setExpandedTeamId((previous) => (previous === teamId ? null : teamId));
  };

  const handlePlayerInputChange = (index: number, value: string) => {
    setPlayerInputs((previous) => {
      const next = [...previous];
      next[index] = value;
      if (index === next.length - 1 && value.trim().length > 0) {
        next.push('');
      }
      return next;
    });
    setRegistrationError('');
  };

  const resetRegistrationForm = () => {
    setTeamName('');
    setShowPasswordPrompt(false);
    setRegistrationPassword('');
    setPasswordError('');
    setPlayerInputs(['']);
    setRegistrationError('');
  };

  const handleRegistration = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTournamentId) return;

    setRegistrationError('');
    setPasswordError('');

    const trimmedTeamName = teamName.trim();
    if (!trimmedTeamName) {
      setRegistrationError('Inserisci il nome della squadra.');
      return;
    }

    if (!showPasswordPrompt) {
      setShowPasswordPrompt(true);
      return;
    }

    if (!registrationPassword) {
      setPasswordError('Inserisci la password.');
      return;
    }

    if (registrationPassword !== REGISTRATION_PASSWORD) {
      setPasswordError('Password non corretta.');
      return;
    }

    setRegistrationLoading(true);

    const trimmedPlayers = playerInputs.map((name) => name.trim()).filter(Boolean);

    const { data: insertedTeam, error: teamError } = await supabase
      .from('teams')
      .insert({ tournament_id: selectedTournamentId, name: trimmedTeamName })
      .select('id')
      .single();

    if (teamError || !insertedTeam) {
      setRegistrationError(teamError?.message ?? 'Errore durante la registrazione della squadra.');
      setRegistrationLoading(false);
      return;
    }

    if (trimmedPlayers.length > 0) {
      const playersPayload = trimmedPlayers.map((name) => ({
        team_id: insertedTeam.id,
        name,
        goals: 0,
      }));

      const { error: playersError } = await supabase.from('players').insert(playersPayload);
      if (playersError) {
        setRegistrationError(playersError.message);
        setRegistrationLoading(false);
        return;
      }
    }

    await loadTournamentData(selectedTournamentId);
    resetRegistrationForm();
    setRegistrationLoading(false);
  };

  const handleAdminLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAdminLoading(true);
    setAdminError('');

    const { error } = await supabase.auth.signInWithPassword({
      email: adminEmail.trim(),
      password: adminPassword,
    });

    if (error) {
      setAdminError(error.message);
      setAdminLoading(false);
      return;
    }

    setAdminEmail('');
    setAdminPassword('');
    setAdminLoading(false);
  };

  const handleAdminLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setAdminError(error.message);
      return;
    }

    setAdminActionError('');
    setAdminActionSuccess('');
  };

  const performDeleteTeam = async (teamId: string) => {
    if (!selectedTournamentId) return;

    setAdminActionError('');
    setAdminActionSuccess('');

    const { error: matchesError } = await supabase
      .from('matches')
      .delete()
      .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`);

    if (matchesError) {
      setAdminActionError(matchesError.message);
      return;
    }

    const { error: teamDeleteError } = await supabase.from('teams').delete().eq('id', teamId);

    if (teamDeleteError) {
      const { error: playersDeleteError } = await supabase
        .from('players')
        .delete()
        .eq('team_id', teamId);

      if (playersDeleteError) {
        setAdminActionError(playersDeleteError.message);
        return;
      }

      const { error: retryDeleteError } = await supabase.from('teams').delete().eq('id', teamId);
      if (retryDeleteError) {
        setAdminActionError(retryDeleteError.message);
        return;
      }
    }

    await loadTournamentData(selectedTournamentId);
    setExpandedTeamId((previous) => (previous === teamId ? null : previous));
    setPendingDelete(null);
    setAdminActionSuccess('Squadra eliminata.');
  };

  const performDeletePlayer = async (playerId: string) => {
    if (!selectedTournamentId) return;

    setAdminActionError('');
    setAdminActionSuccess('');

    const { data, error } = await supabase.from('players').delete().eq('id', playerId);
    void data;
    if (error) {
      setAdminActionError(error.message);
      return;
    }

    await loadTournamentData(selectedTournamentId);
    setPendingDelete(null);
    setAdminActionSuccess('Giocatore eliminato.');
  };

  const renamePlayer = async (playerId: string) => {
    if (!selectedTournamentId) return;

    const nextName = (playerNameDrafts[playerId] ?? '').trim();
    if (!nextName) {
      setAdminActionError('Il nome del giocatore non puo essere vuoto.');
      return;
    }

    setAdminActionError('');
    setAdminActionSuccess('');

    const { data, error } = await supabase
      .from('players')
      .update({ name: nextName })
      .eq('id', playerId)
      .select('id,name')
      .maybeSingle();
    if (error) {
      setAdminActionError(error.message);
      return;
    }
    if (!data) {
      setAdminActionError('Operazione non riuscita: nessuna riga aggiornata (permessi/RLS).');
      return;
    }

    await loadTournamentData(selectedTournamentId);
    setAdminActionSuccess('Nome giocatore aggiornato.');
  };

  const updatePlayerGoals = async (playerId: string) => {
    if (!selectedTournamentId) return;

    const parsedGoals = Number.parseInt(playerGoalsDrafts[playerId] ?? '0', 10);
    if (Number.isNaN(parsedGoals) || parsedGoals < 0) {
      setAdminActionError('I gol devono essere un numero intero non negativo.');
      return;
    }

    setAdminActionError('');
    setAdminActionSuccess('');

    const { data, error } = await supabase
      .from('players')
      .update({ goals: parsedGoals })
      .eq('id', playerId)
      .select('id,goals')
      .maybeSingle();

    if (error) {
      setAdminActionError(error.message);
      return;
    }
    if (!data) {
      setAdminActionError('Operazione non riuscita: nessuna riga aggiornata (permessi/RLS).');
      return;
    }

    await loadTournamentData(selectedTournamentId);
    setAdminActionSuccess('Gol giocatore aggiornati.');
  };

  const updateStructure = async () => {
    if (!selectedTournamentId) return;

    setAdminActionError('');
    setAdminActionSuccess('');

    const { data, error } = await supabase
      .from('tournaments')
      .update({ structure: structureDraft })
      .eq('id', selectedTournamentId)
      .select('id,structure')
      .maybeSingle();

    if (error) {
      setAdminActionError(error.message);
      return;
    }
    if (!data) {
      setAdminActionError('Operazione non riuscita: nessuna riga aggiornata (permessi/RLS).');
      return;
    }

    await fetchTournaments();
    setAdminActionSuccess('Struttura torneo aggiornata.');
  };

  const addMatch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTournamentId) return;

    const homeGoals = Number.parseInt(newMatchForm.homeGoals, 10);
    const awayGoals = Number.parseInt(newMatchForm.awayGoals, 10);

    if (
      !newMatchForm.homeTeamId ||
      !newMatchForm.awayTeamId ||
      newMatchForm.homeTeamId === newMatchForm.awayTeamId ||
      Number.isNaN(homeGoals) ||
      Number.isNaN(awayGoals) ||
      homeGoals < 0 ||
      awayGoals < 0
    ) {
      setAdminActionError('Compila correttamente il risultato della partita.');
      return;
    }

    setAdminActionError('');
    setAdminActionSuccess('');

    const { data, error } = await supabase
      .from('matches')
      .insert({
        tournament_id: selectedTournamentId,
        home_team_id: newMatchForm.homeTeamId,
        away_team_id: newMatchForm.awayTeamId,
        home_goals: homeGoals,
        away_goals: awayGoals,
        played_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      setAdminActionError(error.message);
      return;
    }
    if (!data) {
      setAdminActionError('Operazione non riuscita: nessuna riga aggiornata (permessi/RLS).');
      return;
    }

    await loadTournamentData(selectedTournamentId);
    setNewMatchForm((previous) => ({
      ...previous,
      homeGoals: '0',
      awayGoals: '0',
    }));
    setAdminActionSuccess('Partita aggiunta.');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-[#766648] mb-8 text-center">Tornei</h1>

      <section className="bg-white rounded-lg shadow-lg border-2 border-[#bfa13f] p-6 mb-8">
        <h2 className="text-2xl font-bold text-[#766648] mb-4">Elenco tornei</h2>

        {loadingTournaments ? (
          <p className="text-gray-700">Caricamento tornei...</p>
        ) : tournaments.length === 0 ? (
          <p className="text-gray-700">Nessun torneo disponibile.</p>
        ) : (
          <div className="space-y-3">
            {tournaments.map((tournament) => {
              const isSelected = selectedTournamentId === tournament.id;
              const isAdminOpen = adminOpenTournamentId === tournament.id;

              return (
                <div key={tournament.id} className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleTournamentSelect(tournament.id)}
                    className={`flex-1 p-4 rounded border-l-4 text-left transition-colors ${
                      isSelected
                        ? 'bg-[#bfa13f] border-[#766648]'
                        : 'bg-gray-50 border-[#bfa13f] hover:bg-gray-100'
                    }`}
                  >
                    <span className="block font-bold text-[#766648]">
                      {getTournamentHeading(tournament)}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdminToggle(tournament.id)}
                    className={`px-4 py-3 rounded-lg border-2 font-bold transition-colors ${
                      isAdminOpen
                        ? 'bg-[#766648] text-[#bfa13f] border-[#766648]'
                        : 'bg-white text-[#766648] border-[#bfa13f] hover:bg-gray-100'
                    }`}
                  >
                    Admin
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {pageError && (
        <p className="mb-6 text-sm text-red-600">Errore dati: {pageError}</p>
      )}

      {!selectedTournament ? (
        <p className="text-center text-[#766648] font-semibold">
          Seleziona un torneo per vedere i dettagli
        </p>
      ) : loadingTournamentData ? (
        <p className="text-center text-[#766648] font-semibold">Caricamento torneo...</p>
      ) : isAdminMode ? (
        <section className="bg-white rounded-lg shadow-lg border-2 border-[#bfa13f] p-6 mb-8">
          <h2 className="text-2xl font-bold text-[#766648] mb-4">Admin</h2>

          {!adminSession ? (
            <form onSubmit={handleAdminLogin} className="max-w-md space-y-4">
              <div>
                <label htmlFor="adminEmail" className="block text-[#766648] font-semibold mb-2">
                  Email
                </label>
                <input
                  id="adminEmail"
                  type="email"
                  value={adminEmail}
                  onChange={(event) => setAdminEmail(event.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#bfa13f] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bfa13f]"
                  autoComplete="email"
                />
              </div>
              <div>
                <label htmlFor="adminPass" className="block text-[#766648] font-semibold mb-2">
                  Password
                </label>
                <input
                  id="adminPass"
                  type="password"
                  value={adminPassword}
                  onChange={(event) => setAdminPassword(event.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#bfa13f] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bfa13f]"
                  autoComplete="current-password"
                />
              </div>
              {adminError && <p className="text-red-600 text-sm">{adminError}</p>}
              <button
                type="submit"
                disabled={adminLoading}
                className="bg-[#766648] text-[#bfa13f] font-bold px-6 py-3 rounded-lg hover:bg-[#5a4e36] transition-colors disabled:opacity-70"
              >
                {adminLoading ? 'Accesso...' : 'Login'}
              </button>
            </form>
          ) : (
            <div className="space-y-8">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleAdminLogout}
                  className="px-4 py-2 rounded border-2 border-[#766648] text-[#766648] font-semibold hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>

              {adminActionError && <p className="text-sm text-red-600">{adminActionError}</p>}
              {adminActionSuccess && <p className="text-sm text-green-700">{adminActionSuccess}</p>}

              <div>
                <h3 className="text-xl font-bold text-[#766648] mb-3">Struttura del torneo</h3>
                <textarea
                  value={structureDraft}
                  onChange={(event) => setStructureDraft(event.target.value)}
                  className="w-full min-h-24 px-4 py-3 border-2 border-[#bfa13f] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bfa13f]"
                />
                <button
                  type="button"
                  onClick={updateStructure}
                  className="mt-3 bg-[#766648] text-[#bfa13f] font-bold px-4 py-2 rounded-lg hover:bg-[#5a4e36] transition-colors"
                >
                  Salva struttura
                </button>
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#766648] mb-3">Squadre e giocatori</h3>
                {teams.length === 0 ? (
                  <p className="text-gray-600">Nessuna squadra iscritta.</p>
                ) : (
                  <div className="space-y-4">
                    {teams.map((team) => {
                      const teamPlayers = playersByTeam.get(team.id) ?? [];

                      return (
                        <div key={team.id} className="border-2 border-[#bfa13f] rounded-lg p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                            <p className="font-bold text-[#766648]">{team.name}</p>
                            <button
                              type="button"
                              onClick={() => setPendingDelete({ type: 'team', teamId: team.id })}
                              className="px-3 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
                            >
                              Elimina squadra
                            </button>
                          </div>

                          {pendingDelete?.type === 'team' && pendingDelete.teamId === team.id && (
                            <div className="mb-3 p-3 rounded border border-red-300 bg-red-50">
                              <p className="text-sm text-red-700 mb-2">Confermi eliminazione?</p>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => void performDeleteTeam(team.id)}
                                  className="px-3 py-1.5 rounded bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
                                >
                                  Si
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPendingDelete(null)}
                                  className="px-3 py-1.5 rounded border border-gray-300 text-sm font-semibold hover:bg-gray-100 transition-colors"
                                >
                                  No
                                </button>
                              </div>
                            </div>
                          )}

                          {teamPlayers.length === 0 ? (
                            <p className="text-gray-600">Nessun giocatore inserito.</p>
                          ) : (
                            <div className="space-y-2">
                              {teamPlayers.map((player) => (
                                <div key={player.id} className="grid grid-cols-1 lg:grid-cols-4 gap-2">
                                  <input
                                    type="text"
                                    value={playerNameDrafts[player.id] ?? player.name}
                                    onChange={(event) =>
                                      setPlayerNameDrafts((previous) => ({
                                        ...previous,
                                        [player.id]: event.target.value,
                                      }))
                                    }
                                    className="px-3 py-2 border-2 border-[#bfa13f] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bfa13f]"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => void renamePlayer(player.id)}
                                    className="px-3 py-2 rounded border-2 border-[#766648] text-[#766648] font-semibold hover:bg-gray-100"
                                  >
                                    Salva nome
                                  </button>
                                  <input
                                    type="number"
                                    min={0}
                                    value={playerGoalsDrafts[player.id] ?? String(Math.max(0, player.goals ?? 0))}
                                    onChange={(event) =>
                                      setPlayerGoalsDrafts((previous) => ({
                                        ...previous,
                                        [player.id]: event.target.value,
                                      }))
                                    }
                                    className="px-3 py-2 border-2 border-[#bfa13f] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bfa13f]"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => void updatePlayerGoals(player.id)}
                                    className="px-3 py-2 rounded border-2 border-[#766648] text-[#766648] font-semibold hover:bg-gray-100"
                                  >
                                    Salva gol
                                  </button>

                                  <div className="lg:col-span-4">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setPendingDelete({
                                          type: 'player',
                                          teamId: team.id,
                                          playerId: player.id,
                                        })
                                      }
                                      className="w-full px-3 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
                                    >
                                      Elimina giocatore
                                    </button>
                                    {pendingDelete?.type === 'player' &&
                                      pendingDelete.teamId === team.id &&
                                      pendingDelete.playerId === player.id && (
                                        <div className="mt-2 p-2 rounded border border-red-300 bg-red-50">
                                          <p className="text-xs text-red-700 mb-2">Confermi eliminazione?</p>
                                          <div className="flex gap-2">
                                            <button
                                              type="button"
                                              onClick={() => void performDeletePlayer(player.id)}
                                              className="px-2 py-1 rounded bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors"
                                            >
                                              Si
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => setPendingDelete(null)}
                                              className="px-2 py-1 rounded border border-gray-300 text-xs font-semibold hover:bg-gray-100 transition-colors"
                                            >
                                              No
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#766648] mb-3">Aggiungi risultato partita</h3>
                <form onSubmit={(event) => void addMatch(event)} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <select
                    value={newMatchForm.homeTeamId}
                    onChange={(event) =>
                      setNewMatchForm((previous) => ({ ...previous, homeTeamId: event.target.value }))
                    }
                    className="px-3 py-2 border-2 border-[#bfa13f] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bfa13f]"
                  >
                    <option value="">Squadra casa</option>
                    {teams.map((team) => (
                      <option key={`home-${team.id}`} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={0}
                    value={newMatchForm.homeGoals}
                    onChange={(event) =>
                      setNewMatchForm((previous) => ({ ...previous, homeGoals: event.target.value }))
                    }
                    className="px-3 py-2 border-2 border-[#bfa13f] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bfa13f]"
                  />
                  <select
                    value={newMatchForm.awayTeamId}
                    onChange={(event) =>
                      setNewMatchForm((previous) => ({ ...previous, awayTeamId: event.target.value }))
                    }
                    className="px-3 py-2 border-2 border-[#bfa13f] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bfa13f]"
                  >
                    <option value="">Squadra ospite</option>
                    {teams.map((team) => (
                      <option key={`away-${team.id}`} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={0}
                    value={newMatchForm.awayGoals}
                    onChange={(event) =>
                      setNewMatchForm((previous) => ({ ...previous, awayGoals: event.target.value }))
                    }
                    className="px-3 py-2 border-2 border-[#bfa13f] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bfa13f]"
                  />
                  <button
                    type="submit"
                    className="md:col-span-2 bg-[#766648] text-[#bfa13f] font-bold px-6 py-3 rounded-lg hover:bg-[#5a4e36] transition-colors"
                  >
                    Aggiungi partita
                  </button>
                </form>

                {matches.length === 0 ? (
                  <p className="mt-4 text-gray-600">Nessuna partita registrata.</p>
                ) : (
                  <ul className="mt-4 space-y-2">
                    {matches.map((match) => (
                      <li key={match.id} className="bg-gray-50 border-l-4 border-[#bfa13f] px-3 py-2 rounded">
                        {(teamsById.get(match.home_team_id)?.name ?? 'N/A')} {match.home_goals} - {match.away_goals}{' '}
                        {(teamsById.get(match.away_team_id)?.name ?? 'N/A')}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <button
                type="button"
                onClick={() => void handleExitAdmin()}
                className="bg-[#766648] text-[#bfa13f] font-bold px-6 py-3 rounded-lg hover:bg-[#5a4e36] transition-colors"
              >
                Torna al torneo
              </button>
            </div>
          )}
        </section>
      ) : (
        <>
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-lg border-2 border-[#bfa13f] p-6">
              <h2 className="text-2xl font-bold text-[#766648] mb-4">Registra la tua squadra</h2>
              <form onSubmit={(event) => void handleRegistration(event)} className="space-y-4">
                <div>
                  <label htmlFor="teamName" className="block text-[#766648] font-semibold mb-2">
                    Nome squadra
                  </label>
                  <input
                    id="teamName"
                    type="text"
                    value={teamName}
                    onChange={(event) => {
                      setTeamName(event.target.value);
                      setRegistrationError('');
                    }}
                    className="w-full px-4 py-3 border-2 border-[#bfa13f] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bfa13f]"
                    placeholder="Inserisci il nome della squadra"
                  />
                </div>

                <div>
                  <p className="text-[#766648] font-semibold mb-2">Giocatori</p>
                  <div className="space-y-2">
                    {playerInputs.map((playerName, index) => (
                      <input
                        key={`new-player-${index}`}
                        type="text"
                        value={playerName}
                        onChange={(event) => handlePlayerInputChange(index, event.target.value)}
                        className="w-full px-4 py-3 border-2 border-[#bfa13f] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bfa13f]"
                        placeholder={`Nome giocatore ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>

                {registrationError && <p className="text-red-600 text-sm">{registrationError}</p>}

                <div className="flex flex-wrap items-start gap-3">
                  <button
                    type="submit"
                    disabled={registrationLoading}
                    className="bg-[#766648] text-[#bfa13f] font-bold px-6 py-3 rounded-lg hover:bg-[#5a4e36] transition-colors disabled:opacity-70"
                  >
                    {registrationLoading ? 'Registrazione...' : 'Registra'}
                  </button>

                  {showPasswordPrompt && (
                    <div className="flex flex-wrap items-start gap-2">
                      <label
                        htmlFor="registrationPasswordInline"
                        className="text-[#766648] font-semibold self-center"
                      >
                        Password
                      </label>
                      <input
                        ref={registrationPasswordInputRef}
                        id="registrationPasswordInline"
                        type="password"
                        value={registrationPassword}
                        onChange={(event) => {
                          setRegistrationPassword(event.target.value);
                          setPasswordError('');
                        }}
                        className="px-3 py-2 border-2 border-[#bfa13f] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bfa13f]"
                        placeholder="Password"
                      />
                      <button
                        type="submit"
                        disabled={registrationLoading}
                        className="px-3 py-2 rounded-lg border-2 border-[#766648] text-[#766648] font-semibold hover:bg-gray-100 transition-colors disabled:opacity-70"
                      >
                        Conferma
                      </button>
                      {passwordError && <p className="w-full text-red-600 text-sm">{passwordError}</p>}
                    </div>
                  )}
                </div>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow-lg border-2 border-[#bfa13f] overflow-hidden">
              <h2 className="text-2xl font-bold text-[#766648] p-6 pb-4">Squadre iscritte</h2>
              <div className="px-6 pb-6 space-y-3">
                {teams.length === 0 ? (
                  <p className="text-gray-600">Nessuna squadra iscritta.</p>
                ) : (
                  teams.map((team) => {
                    const teamPlayers = playersByTeam.get(team.id) ?? [];

                    return (
                      <div key={team.id} className="border-2 border-[#bfa13f] rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => toggleTeam(team.id)}
                          className="w-full px-4 py-3 bg-[#bfa13f] hover:bg-[#d4b961] transition-colors flex items-center justify-between text-left"
                        >
                          <span className="font-bold text-[#766648]">{team.name}</span>
                          {expandedTeamId === team.id ? (
                            <ChevronUp className="text-[#766648]" size={22} />
                          ) : (
                            <ChevronDown className="text-[#766648]" size={22} />
                          )}
                        </button>
                        {expandedTeamId === team.id && (
                          <div className="p-4 bg-white text-gray-700">
                            {teamPlayers.length === 0 ? (
                              <p>Nessun giocatore inserito</p>
                            ) : (
                              <ul className="space-y-1">
                                {teamPlayers.map((player) => (
                                  <li key={player.id}>
                                    {player.name} — {Math.max(0, player.goals ?? 0)} gol
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-lg border-2 border-[#bfa13f] p-6">
              <h2 className="text-2xl font-bold text-[#766648] mb-4">Struttura del torneo</h2>
              <div className="min-h-[320px] border-2 border-dashed border-[#bfa13f] rounded-lg bg-gray-50 flex items-center justify-center p-4">
                <p className="text-gray-600 font-semibold text-center">
                  {selectedTournament.structure?.trim() || 'Nessuna struttura disponibile.'}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg border-2 border-[#bfa13f] p-6">
                <h2 className="text-2xl font-bold text-[#766648] mb-4">Marcatori</h2>
                {topScorers.length === 0 ? (
                  <p className="text-gray-600">Nessun marcatore disponibile.</p>
                ) : (
                  <ul className="space-y-2">
                    {topScorers.map((scorer) => (
                      <li
                        key={scorer.id}
                        className="flex items-center justify-between bg-gray-50 rounded px-3 py-2 border-l-4 border-[#bfa13f]"
                      >
                        <span className="text-gray-800">{scorer.name}</span>
                        <span className="font-bold text-[#766648]">{scorer.goals}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-lg border-2 border-[#bfa13f] p-6">
                <h2 className="text-2xl font-bold text-[#766648] mb-4">Classifica</h2>
                {ranking.length === 0 ? (
                  <p className="text-gray-600">Nessuna classifica disponibile.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[#766648] border-b-2 border-[#bfa13f]">
                          <th className="py-2 pr-2">Squadra</th>
                          <th className="py-2 pr-2">Punti</th>
                          <th className="py-2">PG</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ranking.map((entry) => (
                          <tr key={entry.teamId} className="border-b border-gray-200 text-gray-700">
                            <td className="py-2 pr-2">{entry.teamName}</td>
                            <td className="py-2 pr-2 font-semibold text-[#766648]">{entry.points}</td>
                            <td className="py-2">{entry.matchesPlayed}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}





import { FormEvent, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { torneo2026, type Match, type Player, type Team, type Tournament } from '../../data/torneo-2026';

const STORAGE_KEY = 'ius-tornei-v2';

function createInitialTournaments(): Tournament[] {
  return [torneo2026];
}

function loadTournaments(): Tournament[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialTournaments();
    const parsed = JSON.parse(raw) as Tournament[];
    if (!Array.isArray(parsed) || parsed.length === 0) return createInitialTournaments();
    return parsed;
  } catch {
    return createInitialTournaments();
  }
}

type RankingEntry = {
  teamId: string;
  teamName: string;
  points: number;
  matchesPlayed: number;
  goalsFor: number;
  goalDifference: number;
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

export default function Tornei() {
  const [tournaments, setTournaments] = useState<Tournament[]>(loadTournaments);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

  const [teamName, setTeamName] = useState('');
  const [playerInputs, setPlayerInputs] = useState<string[]>(['']);
  const [showRegistrationPassword, setShowRegistrationPassword] = useState(false);
  const [registrationPassword, setRegistrationPassword] = useState('');
  const [registrationError, setRegistrationError] = useState('');

  const [adminOpenTournamentId, setAdminOpenTournamentId] = useState<string | null>(null);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null);

  const [newMatchForm, setNewMatchForm] = useState<NewMatchForm>({
    homeTeamId: '',
    awayTeamId: '',
    homeGoals: '0',
    awayGoals: '0',
  });

  const persistTournaments = (nextTournaments: Tournament[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTournaments));
  };

  const selectedTournament = useMemo(
    () => tournaments.find((tournament) => tournament.id === selectedTournamentId) ?? null,
    [tournaments, selectedTournamentId]
  );

  const isAdminMode =
    selectedTournament !== null && adminOpenTournamentId === selectedTournament.id;

  const updateSelectedTournament = (updater: (tournament: Tournament) => Tournament) => {
    if (!selectedTournamentId) return;
    setTournaments((prev) => {
      const next = prev.map((tournament) =>
        tournament.id === selectedTournamentId ? updater(tournament) : tournament
      );
      persistTournaments(next);
      return next;
    });
  };

  const topScorers = useMemo(() => {
    if (!selectedTournament) return [];
    return selectedTournament.teams
      .flatMap((team) => team.players.map((player) => ({ ...player, teamName: team.name })))
      .sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name));
  }, [selectedTournament]);

  const ranking = useMemo((): RankingEntry[] => {
    if (!selectedTournament) return [];

    const table = new Map(
      selectedTournament.teams.map((team) => [
        team.id,
        {
          teamId: team.id,
          teamName: team.name,
          points: 0,
          matchesPlayed: 0,
          goalsFor: 0,
          goalsAgainst: 0,
        },
      ])
    );

    selectedTournament.matches.forEach((match) => {
      const home = table.get(match.homeTeamId);
      const away = table.get(match.awayTeamId);
      if (!home || !away) return;

      home.matchesPlayed += 1;
      away.matchesPlayed += 1;
      home.goalsFor += match.homeGoals;
      home.goalsAgainst += match.awayGoals;
      away.goalsFor += match.awayGoals;
      away.goalsAgainst += match.homeGoals;

      if (match.homeGoals > match.awayGoals) {
        home.points += 3;
      } else if (match.homeGoals < match.awayGoals) {
        away.points += 3;
      } else {
        home.points += 1;
        away.points += 1;
      }
    });

    return Array.from(table.values())
      .map((entry) => ({
        teamId: entry.teamId,
        teamName: entry.teamName,
        points: entry.points,
        matchesPlayed: entry.matchesPlayed,
        goalsFor: entry.goalsFor,
        goalDifference: entry.goalsFor - entry.goalsAgainst,
      }))
      .sort(
        (a, b) =>
          b.points - a.points ||
          b.goalDifference - a.goalDifference ||
          b.goalsFor - a.goalsFor ||
          a.teamName.localeCompare(b.teamName)
      );
  }, [selectedTournament]);

  const handleTournamentSelect = (tournamentId: string) => {
    setSelectedTournamentId(tournamentId);
    setExpandedTeamId(null);
    setRegistrationError('');
    setPendingDelete(null);
  };

  const handleAdminToggle = (tournamentId: string) => {
    if (adminOpenTournamentId === tournamentId) {
      setAdminOpenTournamentId(null);
      setPendingDelete(null);
      return;
    }

    setSelectedTournamentId(tournamentId);
    setAdminOpenTournamentId(tournamentId);
    setExpandedTeamId(null);
    setAdminError('');
    setPendingDelete(null);
  };

  const handleAdminSave = () => {
    persistTournaments(tournaments);
    setTournaments(loadTournaments());
    setAdminOpenTournamentId(null);
    setPendingDelete(null);
  };

  const toggleTeam = (teamId: string) => {
    setExpandedTeamId((prev) => (prev === teamId ? null : teamId));
  };

  const handlePlayerInputChange = (index: number, value: string) => {
    setPlayerInputs((prev) => {
      const next = [...prev];
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
    setPlayerInputs(['']);
    setShowRegistrationPassword(false);
    setRegistrationPassword('');
    setRegistrationError('');
  };

  const handleRegistration = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTournament) return;

    const trimmedTeamName = teamName.trim();
    if (!trimmedTeamName) {
      setRegistrationError('Inserisci il nome della squadra.');
      return;
    }

    if (!showRegistrationPassword) {
      setShowRegistrationPassword(true);
      setRegistrationError('');
      return;
    }

    if (registrationPassword !== '1402') {
      setRegistrationError('Password non corretta.');
      return;
    }

    const players: Player[] = playerInputs
      .map((name) => name.trim())
      .filter(Boolean)
      .map((name, index) => ({
        id: `player-${Date.now()}-${index}`,
        name,
        goals: 0,
      }));

    const team: Team = {
      id: `team-${Date.now()}`,
      name: trimmedTeamName,
      players,
    };

    updateSelectedTournament((tournament) => ({
      ...tournament,
      teams: [...tournament.teams, team],
    }));

    resetRegistrationForm();
  };

  const handleAdminLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (adminUsername === 'admin' && adminPassword === 'ius2024') {
      setAdminLoggedIn(true);
      setAdminError('');
      return;
    }
    setAdminError('Credenziali non valide.');
  };

  const performDeleteTeam = (teamId: string) => {
    updateSelectedTournament((tournament) => ({
      ...tournament,
      teams: tournament.teams.filter((team) => team.id !== teamId),
      matches: tournament.matches.filter(
        (match) => match.homeTeamId !== teamId && match.awayTeamId !== teamId
      ),
    }));
    setExpandedTeamId((prev) => (prev === teamId ? null : prev));
    setPendingDelete(null);
  };

  const performDeletePlayer = (teamId: string, playerId: string) => {
    updateSelectedTournament((tournament) => ({
      ...tournament,
      teams: tournament.teams.map((team) =>
        team.id !== teamId
          ? team
          : { ...team, players: team.players.filter((player) => player.id !== playerId) }
      ),
    }));
    setPendingDelete(null);
  };

  const renamePlayer = (teamId: string, playerId: string, name: string) => {
    updateSelectedTournament((tournament) => ({
      ...tournament,
      teams: tournament.teams.map((team) =>
        team.id !== teamId
          ? team
          : {
              ...team,
              players: team.players.map((player) =>
                player.id === playerId ? { ...player, name } : player
              ),
            }
      ),
    }));
  };

  const updatePlayerGoals = (teamId: string, playerId: string, goals: number) => {
    updateSelectedTournament((tournament) => ({
      ...tournament,
      teams: tournament.teams.map((team) =>
        team.id !== teamId
          ? team
          : {
              ...team,
              players: team.players.map((player) =>
                player.id === playerId ? { ...player, goals } : player
              ),
            }
      ),
    }));
  };

  const updateStructure = (value: string) => {
    updateSelectedTournament((tournament) => ({
      ...tournament,
      structure: value,
    }));
  };

  const addMatch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTournament) return;

    const homeGoals = Number.parseInt(newMatchForm.homeGoals, 10);
    const awayGoals = Number.parseInt(newMatchForm.awayGoals, 10);

    if (
      !newMatchForm.homeTeamId ||
      !newMatchForm.awayTeamId ||
      newMatchForm.homeTeamId === newMatchForm.awayTeamId ||
      Number.isNaN(homeGoals) ||
      Number.isNaN(awayGoals)
    ) {
      return;
    }

    const match: Match = {
      id: `match-${Date.now()}`,
      homeTeamId: newMatchForm.homeTeamId,
      awayTeamId: newMatchForm.awayTeamId,
      homeGoals: Math.max(0, homeGoals),
      awayGoals: Math.max(0, awayGoals),
    };

    updateSelectedTournament((tournament) => ({
      ...tournament,
      matches: [...tournament.matches, match],
    }));

    setNewMatchForm((prev) => ({
      ...prev,
      homeGoals: '0',
      awayGoals: '0',
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-[#766648] mb-8 text-center">Tornei</h1>

      <section className="bg-white rounded-lg shadow-lg border-2 border-[#bfa13f] p-6 mb-8">
        <h2 className="text-2xl font-bold text-[#766648] mb-4">Elenco tornei</h2>
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
                  <span className="block font-bold text-[#766648]">{tournament.title}</span>
                  <span className="text-gray-700">14/02/2026</span>
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
      </section>

      {!selectedTournament ? (
        <p className="text-center text-[#766648] font-semibold">
          Seleziona un torneo per vedere i dettagli
        </p>
      ) : isAdminMode ? (
        <section className="bg-white rounded-lg shadow-lg border-2 border-[#bfa13f] p-6 mb-8">
          <h2 className="text-2xl font-bold text-[#766648] mb-4">Admin</h2>

          {!adminLoggedIn ? (
            <form onSubmit={handleAdminLogin} className="max-w-md space-y-4">
              <div>
                <label htmlFor="adminUser" className="block text-[#766648] font-semibold mb-2">
                  Utente
                </label>
                <input
                  id="adminUser"
                  type="text"
                  value={adminUsername}
                  onChange={(event) => setAdminUsername(event.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#bfa13f] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bfa13f]"
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
                />
              </div>
              {adminError && <p className="text-red-600 text-sm">{adminError}</p>}
              <button
                type="submit"
                className="bg-[#766648] text-[#bfa13f] font-bold px-6 py-3 rounded-lg hover:bg-[#5a4e36] transition-colors"
              >
                Login
              </button>
            </form>
          ) : (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-[#766648] mb-3">Struttura del torneo</h3>
                <textarea
                  value={selectedTournament.structure}
                  onChange={(event) => updateStructure(event.target.value)}
                  className="w-full min-h-24 px-4 py-3 border-2 border-[#bfa13f] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bfa13f]"
                />
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#766648] mb-3">Squadre e giocatori</h3>
                <div className="space-y-4">
                  {selectedTournament.teams.map((team) => (
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
                              onClick={() => performDeleteTeam(team.id)}
                              className="px-3 py-1.5 rounded bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
                            >
                              Sì
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
                      <div className="space-y-2">
                        {team.players.map((player) => (
                          <div key={player.id} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <input
                              type="text"
                              value={player.name}
                              onChange={(event) => renamePlayer(team.id, player.id, event.target.value)}
                              className="px-3 py-2 border-2 border-[#bfa13f] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bfa13f]"
                            />
                            <input
                              type="number"
                              min={0}
                              value={player.goals}
                              onChange={(event) =>
                                updatePlayerGoals(
                                  team.id,
                                  player.id,
                                  Math.max(0, Number.parseInt(event.target.value || '0', 10))
                                )
                              }
                              className="px-3 py-2 border-2 border-[#bfa13f] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bfa13f]"
                            />
                            <div>
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
                                        onClick={() => performDeletePlayer(team.id, player.id)}
                                        className="px-2 py-1 rounded bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors"
                                      >
                                        Sì
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
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#766648] mb-3">Aggiungi risultato partita</h3>
                <form onSubmit={addMatch} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <select
                    value={newMatchForm.homeTeamId}
                    onChange={(event) =>
                      setNewMatchForm((prev) => ({ ...prev, homeTeamId: event.target.value }))
                    }
                    className="px-3 py-2 border-2 border-[#bfa13f] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bfa13f]"
                  >
                    <option value="">Squadra casa</option>
                    {selectedTournament.teams.map((team) => (
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
                      setNewMatchForm((prev) => ({ ...prev, homeGoals: event.target.value }))
                    }
                    className="px-3 py-2 border-2 border-[#bfa13f] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bfa13f]"
                  />
                  <select
                    value={newMatchForm.awayTeamId}
                    onChange={(event) =>
                      setNewMatchForm((prev) => ({ ...prev, awayTeamId: event.target.value }))
                    }
                    className="px-3 py-2 border-2 border-[#bfa13f] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bfa13f]"
                  >
                    <option value="">Squadra ospite</option>
                    {selectedTournament.teams.map((team) => (
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
                      setNewMatchForm((prev) => ({ ...prev, awayGoals: event.target.value }))
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

                {selectedTournament.matches.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {selectedTournament.matches.map((match) => {
                      const home = selectedTournament.teams.find((team) => team.id === match.homeTeamId);
                      const away = selectedTournament.teams.find((team) => team.id === match.awayTeamId);
                      return (
                        <li key={match.id} className="bg-gray-50 border-l-4 border-[#bfa13f] px-3 py-2 rounded">
                          {(home?.name ?? 'N/A')} {match.homeGoals} - {match.awayGoals} {(away?.name ?? 'N/A')}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <button
                type="button"
                onClick={handleAdminSave}
                className="bg-[#766648] text-[#bfa13f] font-bold px-6 py-3 rounded-lg hover:bg-[#5a4e36] transition-colors"
              >
                Salva
              </button>
            </div>
          )}
        </section>
      ) : (
        <>
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-lg border-2 border-[#bfa13f] p-6">
              <h2 className="text-2xl font-bold text-[#766648] mb-4">Registra la tua squadra</h2>
              <form onSubmit={handleRegistration} className="space-y-4">
                <div>
                  <label htmlFor="teamName" className="block text-[#766648] font-semibold mb-2">
                    Team Name
                  </label>
                  <input
                    id="teamName"
                    type="text"
                    value={teamName}
                    onChange={(event) => setTeamName(event.target.value)}
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

                {showRegistrationPassword && (
                  <div>
                    <label htmlFor="regPassword" className="block text-[#766648] font-semibold mb-2">
                      Password conferma
                    </label>
                    <input
                      id="regPassword"
                      type="password"
                      value={registrationPassword}
                      onChange={(event) => setRegistrationPassword(event.target.value)}
                      className="w-full px-4 py-3 border-2 border-[#bfa13f] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bfa13f]"
                    />
                  </div>
                )}

                {registrationError && <p className="text-red-600 text-sm">{registrationError}</p>}

                <button
                  type="submit"
                  className="bg-[#766648] text-[#bfa13f] font-bold px-6 py-3 rounded-lg hover:bg-[#5a4e36] transition-colors"
                >
                  {showRegistrationPassword ? 'Conferma' : 'Registra'}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow-lg border-2 border-[#bfa13f] overflow-hidden">
              <h2 className="text-2xl font-bold text-[#766648] p-6 pb-4">Squadre iscritte</h2>
              <div className="px-6 pb-6 space-y-3">
                {selectedTournament.teams.length === 0 ? (
                  <p className="text-gray-600">Nessuna squadra iscritta.</p>
                ) : (
                  selectedTournament.teams.map((team) => (
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
                          {team.players.length === 0 ? (
                            <p>Nessun giocatore inserito</p>
                          ) : (
                            <ul className="space-y-1">
                              {team.players.map((player) => (
                                <li key={player.id}>
                                  {player.name} - {player.goals} gol
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-lg border-2 border-[#bfa13f] p-6">
              <h2 className="text-2xl font-bold text-[#766648] mb-4">Struttura del torneo</h2>
              <div className="min-h-[320px] border-2 border-dashed border-[#bfa13f] rounded-lg bg-gray-50 flex items-center justify-center p-4">
                <p className="text-gray-600 font-semibold text-center">{selectedTournament.structure}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg border-2 border-[#bfa13f] p-6">
                <h2 className="text-2xl font-bold text-[#766648] mb-4">Marcatori</h2>
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
              </div>

              <div className="bg-white rounded-lg shadow-lg border-2 border-[#bfa13f] p-6">
                <h2 className="text-2xl font-bold text-[#766648] mb-4">Classifica</h2>
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
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

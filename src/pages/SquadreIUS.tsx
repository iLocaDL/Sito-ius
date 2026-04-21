import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Team, Player, Match, CsiMatch } from '../types';
import { iusACsiData } from '../data/ius-a-csi';

const teams: Team[] = [
  {
    id: '1',
    name: 'IUS ASD - Squadra A (Calcio a 7)',
    type: 'calcio7',
    description: 'La nostra prima squadra di calcio a 7, competitiva e determinata.',
  },
  {
    id: '2',
    name: 'IUS ASD - Squadra B (Calcio a 7)',
    type: 'calcio7',
    description: 'La SECONDA squadra di calcio a 7, sempre pronta a dare il massimo.',
  },
  {
    id: '3',
    name: 'IUS ASD - Squadra Juniores',
    type: 'children',
    description: 'La nostra squadra di bambini, il futuro del calcio IUS ASD.',
  },
];

const players: Player[] = [
  { id: '1', name: 'Lorenzo Locatelli', teamId: '1' },
  { id: '2', name: 'Andrea Belloli', teamId: '1' },
  { id: '3', name: 'Federico Quattrocchi', teamId: '1' },
  { id: '4', name: 'Giuseppe Neri', teamId: '1' },
  { id: '5', name: 'Francesco Romano', teamId: '1' },
  { id: '6', name: 'Paolo Greco', teamId: '2' },
  { id: '7', name: 'Simone Ferrara', teamId: '2' },
  { id: '8', name: 'Davide Marino', teamId: '2' },
  { id: '9', name: 'Roberto Gallo', teamId: '2' },
  { id: '10', name: 'Tommaso Ricci', teamId: '3' },
  { id: '11', name: 'Matteo Esposito', teamId: '3' },
  { id: '12', name: 'Lorenzo Russo', teamId: '3' },
];

const matches: Match[] = [
  { id: '1', date: '2025-12-10', opponent: 'FC Rivali', location: 'Campo Centrale', teamId: '1' },
  { id: '2', date: '2025-12-15', opponent: 'ASD Sportivi', location: 'Trasferta', teamId: '1' },
  { id: '3', date: '2025-12-20', opponent: 'US Calcio', location: 'Campo Centrale', teamId: '1' },
  { id: '4', date: '2025-12-12', opponent: 'Squadra Verde', location: 'Campo Nord', teamId: '2' },
  { id: '5', date: '2025-12-18', opponent: 'Team Blu', location: 'Trasferta', teamId: '2' },
  { id: '6', date: '2025-12-14', opponent: 'Piccoli Campioni', location: 'Campo Juniores', teamId: '3' },
  { id: '7', date: '2025-12-21', opponent: 'Young Stars', location: 'Campo Juniores', teamId: '3' },
];

const formatCsiDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

const formatCsiDateTime = (date: string) =>
  new Intl.DateTimeFormat('it-IT', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Europe/Rome',
  }).format(new Date(date));

const resultLabels = {
  W: 'Vittoria',
  D: 'Pareggio',
  L: 'Sconfitta',
} as const;

function MatchCard({ title, match, showResult }: { title: string; match: CsiMatch | null; showResult?: boolean }) {
  return (
    <div className="p-5 bg-gray-50 rounded border-l-4 border-[#bfa13f] h-full">
      <h4 className="text-lg font-bold text-[#766648] mb-4">{title}</h4>
      {match ? (
        <div className="space-y-3">
          <div>
            <div className="font-bold text-[#766648]">{formatCsiDate(match.date)}</div>
            <div className="text-sm text-gray-600">Ore {match.time}</div>
          </div>

          <div className="flex items-center justify-between gap-3 text-gray-800">
            <span className="font-semibold">{match.home_team}</span>
            <span className="text-sm text-gray-500">vs</span>
            <span className="font-semibold text-right">{match.away_team}</span>
          </div>

          {match.home_score !== null && match.away_score !== null ? (
            <div className="inline-flex items-center rounded bg-white px-3 py-2 font-bold text-[#766648] shadow-sm">
              {match.home_score} - {match.away_score}
            </div>
          ) : (
            <div className="inline-flex items-center rounded bg-white px-3 py-2 text-sm font-semibold text-[#766648] shadow-sm">
              Da giocare
            </div>
          )}

          {showResult && match.result_for_ius_a && (
            <div className="text-sm text-gray-700">
              Esito Ius A:{' '}
              <span className="font-bold text-[#766648]">
                {resultLabels[match.result_for_ius_a]} ({match.result_for_ius_a === 'D' ? 'N' : match.result_for_ius_a === 'L' ? 'P' : 'V'})
              </span>
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-600">Dato non disponibile.</p>
      )}
    </div>
  );
}

function IusACompetitionBlock() {
  if (!iusACsiData.available || iusACsiData.standings.length === 0) {
    return (
      <div className="mt-8 p-5 bg-gray-50 rounded border-l-4 border-[#bfa13f] text-gray-700">
        Dati partite e classifica temporaneamente non disponibili.
      </div>
    );
  }

  return (
    <section className="mt-8 border-t-2 border-[#bfa13f] pt-8">
      <div className="mb-5 flex flex-col gap-2 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
        {iusACsiData.updated_at && (
          <p>
            Ultimo aggiornamento:{' '}
            <span className="font-semibold text-[#766648]">{formatCsiDateTime(iusACsiData.updated_at)}</span>
          </p>
        )}
        {iusACsiData.stale && (
          <p className="font-semibold text-[#766648]">Dati aggiornati all'ultimo recupero disponibile.</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MatchCard title="Prossima partita" match={iusACsiData.next_match} />
        <MatchCard title="Ultima partita" match={iusACsiData.last_match} showResult />
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold text-[#766648] mb-4 pb-2 border-b-2 border-[#bfa13f]">
          Classifica attuale
        </h3>
        <div className="overflow-x-auto rounded border border-[#bfa13f]">
          <table className="min-w-[760px] w-full text-sm">
            <thead className="bg-[#bfa13f] text-[#766648]">
              <tr>
                <th className="px-3 py-3 text-left">#</th>
                <th className="px-3 py-3 text-left">Squadra</th>
                <th className="px-3 py-3 text-right">Pt</th>
                <th className="px-3 py-3 text-right">PG</th>
                <th className="px-3 py-3 text-right">V</th>
                <th className="px-3 py-3 text-right">N</th>
                <th className="px-3 py-3 text-right">P</th>
                <th className="px-3 py-3 text-right">GF</th>
                <th className="px-3 py-3 text-right">GS</th>
                <th className="px-3 py-3 text-right">DR</th>
              </tr>
            </thead>
            <tbody>
              {iusACsiData.standings.map((row) => {
                const isIusA = row.team.toLowerCase() === 'ius a';

                return (
                  <tr
                    key={`${row.rank}-${row.team}`}
                    className={`border-t border-gray-200 ${isIusA ? 'bg-[#fff4cc] font-bold text-[#766648]' : 'bg-white text-gray-700'}`}
                  >
                    <td className="px-3 py-3">{row.rank}</td>
                    <td className="px-3 py-3 whitespace-nowrap">{row.team}</td>
                    <td className="px-3 py-3 text-right">{row.points}</td>
                    <td className="px-3 py-3 text-right">{row.played}</td>
                    <td className="px-3 py-3 text-right">{row.wins}</td>
                    <td className="px-3 py-3 text-right">{row.draws}</td>
                    <td className="px-3 py-3 text-right">{row.losses}</td>
                    <td className="px-3 py-3 text-right">{row.goals_for}</td>
                    <td className="px-3 py-3 text-right">{row.goals_against}</td>
                    <td className="px-3 py-3 text-right">{row.goal_diff}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

interface SquadreIUSProps {
  searchQuery?: string;
}

export default function SquadreIUS({ searchQuery }: SquadreIUSProps) {
  const [expandedTeams, setExpandedTeams] = useState<Record<string, boolean>>({
    '1': true,
    '2': false,
    '3': false,
  });

  const toggleTeam = (teamId: string) => {
    setExpandedTeams((prev) => ({
      ...prev,
      [teamId]: !prev[teamId],
    }));
  };

  const getTeamPlayers = (teamId: string) => players.filter((p) => p.teamId === teamId);
  const getTeamMatches = (teamId: string) => matches.filter((m) => m.teamId === teamId);

  const filteredTeams = searchQuery
    ? teams.filter(
        (team) =>
          team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          team.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : teams;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-[#766648] mb-8 text-center">Le Nostre Squadre</h1>

      {searchQuery && (
        <p className="text-[#766648] mb-6 text-center">
          Risultati per: <span className="font-bold">"{searchQuery}"</span>
        </p>
      )}

      <div className="space-y-6">
        {filteredTeams.map((team) => (
          <div
            key={team.id}
            className="bg-white rounded-lg shadow-lg border-2 border-[#bfa13f] overflow-hidden"
          >
            <button
              onClick={() => toggleTeam(team.id)}
              className="w-full bg-[#bfa13f] hover:bg-[#d4b961] transition-colors p-6 flex items-center justify-between"
            >
              <div className="text-left">
                <h2 className="text-2xl font-bold text-[#766648]">{team.name}</h2>
                <p className="text-[#766648] mt-2">{team.description}</p>
              </div>
              {expandedTeams[team.id] ? (
                <ChevronUp className="text-[#766648]" size={32} />
              ) : (
                <ChevronDown className="text-[#766648]" size={32} />
              )}
            </button>

            {expandedTeams[team.id] && (
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-bold text-[#766648] mb-4 pb-2 border-b-2 border-[#bfa13f]">
                      Tesserati
                    </h3>
                    <ul className="space-y-2">
                      {getTeamPlayers(team.id).map((player) => (
                        <li
                          key={player.id}
                          className="p-3 bg-gray-50 rounded border-l-4 border-[#bfa13f] hover:bg-gray-100 transition-colors"
                        >
                          {player.name}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-[#766648] mb-4 pb-2 border-b-2 border-[#bfa13f]">
                      Calendario
                    </h3>
                    <div className="space-y-3">
                      {getTeamMatches(team.id).map((match) => (
                        <div
                          key={match.id}
                          className="p-4 bg-gray-50 rounded border-l-4 border-[#bfa13f] hover:bg-gray-100 transition-colors"
                        >
                          <div className="font-bold text-[#766648]">
                            {new Date(match.date).toLocaleDateString('it-IT', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </div>
                          <div className="text-gray-700 mt-1">vs {match.opponent}</div>
                          <div className="text-sm text-gray-600 mt-1">{match.location}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {team.id === '1' && <IusACompetitionBlock />}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredTeams.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">Nessuna squadra trovata.</p>
        </div>
      )}
    </div>
  );
}

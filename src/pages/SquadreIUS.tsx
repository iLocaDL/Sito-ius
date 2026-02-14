import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Team, Player, Match } from '../types';

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

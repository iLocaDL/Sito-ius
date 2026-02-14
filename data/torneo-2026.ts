export type Player = {
  id: string;
  name: string;
  goals: number;
};

export type Team = {
  id: string;
  name: string;
  players: Player[];
};

export type Match = {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeGoals: number;
  awayGoals: number;
};

export type Tournament = {
  id: string;
  title: string;
  structure: string;
  teams: Team[];
  matches: Match[];
};

export const torneo2026: Tournament = {
  id: 'torneo-2026-02-14',
  title: 'Torneo 14/02/2026',
  structure: 'Grafico in arrivo',
  teams: [
    {
      id: 'team-1',
      name: 'IUS Legends',
      players: [
        { id: 'p-1', name: 'Mario Rossi', goals: 3 },
        { id: 'p-2', name: 'Luca Bianchi', goals: 1 },
        { id: 'p-3', name: 'Andrea Verdi', goals: 0 },
      ],
    },
    {
      id: 'team-2',
      name: 'ASD Aurora',
      players: [
        { id: 'p-4', name: 'Marco Neri', goals: 2 },
        { id: 'p-5', name: 'Paolo Gallo', goals: 1 },
        { id: 'p-6', name: 'Davide Sala', goals: 0 },
      ],
    },
  ],
  matches: [
    {
      id: 'm-1',
      homeTeamId: 'team-1',
      awayTeamId: 'team-2',
      homeGoals: 2,
      awayGoals: 1,
    },
  ],
};

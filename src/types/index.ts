export interface News {
  id: string;
  title: string;
  date: string;
  content: string;
  image?: string;
}

export interface Player {
  id: string;
  name: string;
  teamId: string;
}

export interface Match {
  id: string;
  date: string;
  opponent: string;
  location: string;
  teamId: string;
}

export interface CsiMatch {
  date: string;
  time: string;
  home_team: string;
  away_team: string;
  home_score: number | null;
  away_score: number | null;
  status: 'played' | 'scheduled';
  starts_at?: string;
  result_for_ius_a?: 'W' | 'D' | 'L';
}

export interface CsiStanding {
  rank: number;
  team: string;
  points: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_diff: number;
}

export interface CsiTeamData {
  team: string;
  source_url: string;
  updated_at: string | null;
  last_error_at: string | null;
  stale: boolean;
  overview: Array<{
    label: string;
    value: string;
  }>;
  next_match: CsiMatch | null;
  last_match: CsiMatch | null;
  standings: CsiStanding[];
  available: boolean;
}

export interface Team {
  id: string;
  name: string;
  type: 'calcio7' | 'children';
  description: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  description: string;
}

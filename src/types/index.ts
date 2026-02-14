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

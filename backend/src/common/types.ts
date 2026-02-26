export type Period = 'FIRST_HALF' | 'SECOND_HALF' | 'EXTRA_TIME';

export type TeamSide = 'A' | 'B';

export type EventType =
  | 'GOAL'
  | 'YELLOW_CARD'
  | 'RED_CARD'
  | 'SUBSTITUTION'
  | 'CORNER'
  | 'FOUL'
  | 'OFFSIDE';

export interface MatchPlayer {
  id: string;
  name: string;
  number: number;
  role: 'STARTER' | 'SUB';
}

export interface MatchTeam {
  id: TeamSide;
  name: string;
  color: string;
  score: number;
  corners: number;
  fouls: number;
  offsides: number;
  starters: MatchPlayer[];
  substitutes: MatchPlayer[];
}

export interface MatchClock {
  running: boolean;
  period: Period;
  elapsedSeconds: number;
  additionalSeconds: number;
}

export interface MatchEvent {
  id: string;
  minute: number;
  type: EventType;
  team: TeamSide;
  player?: string;
  playerIn?: string;
  playerOut?: string;
  createdAt: string;
}

export interface MatchState {
  id: string;
  code: string;
  clock: MatchClock;
  teams: { A: MatchTeam; B: MatchTeam };
  events: MatchEvent[];
}

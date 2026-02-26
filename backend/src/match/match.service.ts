import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { MatchClock, MatchEvent, MatchPlayer, MatchState, Period, TeamSide } from '../common/types';
import { MatchEventDto } from '../dto/match.dto';
import { WebhookService } from '../webhook/webhook.service';
import { MatchGateway } from '../gateway/match.gateway';

@Injectable()
export class MatchService implements OnModuleDestroy {
  private readonly matches = new Map<string, MatchState>();
  private readonly timers = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly webhookService: WebhookService,
    private readonly matchGateway: MatchGateway
  ) {
    this.createDemoMatch();
  }

  onModuleDestroy(): void {
    this.timers.forEach((timer) => clearInterval(timer));
  }

  getMatch(matchId: string): MatchState {
    const match = this.matches.get(matchId);
    if (!match) {
      throw new Error('Match not found');
    }
    return match;
  }

  findByCode(code: string): MatchState | undefined {
    return [...this.matches.values()].find((match) => match.code === code.toUpperCase());
  }

  setPeriod(matchId: string, period: Period): MatchState {
    const match = this.getMatch(matchId);
    match.clock.period = period;
    return match;
  }

  playClock(matchId: string): MatchState {
    const match = this.getMatch(matchId);
    if (match.clock.running) {
      return match;
    }

    match.clock.running = true;
    const interval = setInterval(() => {
      const scopedMatch = this.matches.get(matchId);
      if (!scopedMatch || !scopedMatch.clock.running) {
        return;
      }
      scopedMatch.clock.elapsedSeconds += 1;
      this.matchGateway.emitTimerUpdate(matchId, scopedMatch);
    }, 1000);

    this.timers.set(matchId, interval);
    return match;
  }

  pauseClock(matchId: string): MatchState {
    const match = this.getMatch(matchId);
    match.clock.running = false;

    const timer = this.timers.get(matchId);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(matchId);
    }

    return match;
  }

  addAdditionalTime(matchId: string, seconds: number): MatchState {
    const match = this.getMatch(matchId);
    match.clock.additionalSeconds += seconds;
    return match;
  }

  resetHalf(matchId: string): MatchState {
    const match = this.getMatch(matchId);
    match.clock.elapsedSeconds = 0;
    match.clock.additionalSeconds = 0;
    return match;
  }

  async addEvent(matchId: string, dto: MatchEventDto): Promise<{ match: MatchState; event: MatchEvent }> {
    const match = this.getMatch(matchId);
    const team = match.teams[dto.team];
    const minute = Math.floor(match.clock.elapsedSeconds / 60) + 1;

    if (dto.eventType === 'GOAL') {
      team.score += 1;
    }

    if (dto.eventType === 'CORNER') {
      team.corners += 1;
    }

    if (dto.eventType === 'FOUL') {
      team.fouls += 1;
    }

    if (dto.eventType === 'OFFSIDE') {
      team.offsides += 1;
    }

    const event: MatchEvent = {
      id: randomUUID(),
      minute,
      type: dto.eventType,
      team: dto.team,
      player: dto.player,
      playerIn: dto.playerIn,
      playerOut: dto.playerOut,
      createdAt: new Date().toISOString()
    };

    match.events.unshift(event);
    await this.webhookService.sendMatchEvent(match, event);
    return { match, event };
  }

  private createDemoMatch(): void {
    const makePlayers = (prefix: string): MatchPlayer[] =>
      Array.from({ length: 11 }, (_, index) => ({
        id: `${prefix}-${index + 1}`,
        name: `${prefix} Player ${index + 1}`,
        number: index + 1,
        role: 'STARTER'
      }));

    const makeSubs = (prefix: string): MatchPlayer[] =>
      Array.from({ length: 7 }, (_, index) => ({
        id: `${prefix}-sub-${index + 1}`,
        name: `${prefix} Sub ${index + 1}`,
        number: index + 12,
        role: 'SUB'
      }));

    const clock: MatchClock = {
      running: false,
      period: 'FIRST_HALF',
      elapsedSeconds: 0,
      additionalSeconds: 0
    };

    const state: MatchState = {
      id: 'demo-match-1',
      code: 'A1B2C',
      clock,
      teams: {
        A: {
          id: 'A',
          name: 'Equipe A',
          color: '#1d4ed8',
          score: 0,
          corners: 0,
          fouls: 0,
          offsides: 0,
          starters: makePlayers('A'),
          substitutes: makeSubs('A')
        },
        B: {
          id: 'B',
          name: 'Equipe B',
          color: '#dc2626',
          score: 0,
          corners: 0,
          fouls: 0,
          offsides: 0,
          starters: makePlayers('B'),
          substitutes: makeSubs('B')
        }
      },
      events: []
    };

    this.matches.set(state.id, state);
  }
}

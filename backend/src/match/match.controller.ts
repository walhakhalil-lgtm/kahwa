import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { AddAdditionalTimeDto, JoinMatchDto, MatchEventDto, SetPeriodDto } from '../dto/match.dto';
import { MatchGateway } from '../gateway/match.gateway';
import { MatchService } from './match.service';

@Controller('matches')
export class MatchController {
  constructor(
    private readonly matchService: MatchService,
    private readonly matchGateway: MatchGateway
  ) {}

  @Post('join')
  joinByCode(@Body() dto: JoinMatchDto) {
    const match = this.matchService.findByCode(dto.code);
    if (!match) {
      return { found: false };
    }
    return { found: true, match };
  }

  @Get(':matchId')
  getMatch(@Param('matchId') matchId: string) {
    return this.matchService.getMatch(matchId);
  }

  @Patch(':matchId/timer/play')
  play(@Param('matchId') matchId: string) {
    const match = this.matchService.playClock(matchId);
    this.matchGateway.emitTimerUpdate(matchId, match);
    return match;
  }

  @Patch(':matchId/timer/pause')
  pause(@Param('matchId') matchId: string) {
    const match = this.matchService.pauseClock(matchId);
    this.matchGateway.emitTimerUpdate(matchId, match);
    return match;
  }

  @Patch(':matchId/timer/period')
  setPeriod(@Param('matchId') matchId: string, @Body() dto: SetPeriodDto) {
    const match = this.matchService.setPeriod(matchId, dto.period);
    this.matchGateway.emitTimerUpdate(matchId, match);
    return match;
  }

  @Patch(':matchId/timer/additional')
  addAdditionalTime(@Param('matchId') matchId: string, @Body() dto: AddAdditionalTimeDto) {
    const match = this.matchService.addAdditionalTime(matchId, dto.seconds);
    this.matchGateway.emitTimerUpdate(matchId, match);
    return match;
  }

  @Patch(':matchId/timer/reset-half')
  resetHalf(@Param('matchId') matchId: string) {
    const match = this.matchService.resetHalf(matchId);
    this.matchGateway.emitTimerUpdate(matchId, match);
    return match;
  }

  @Post(':matchId/events')
  async addEvent(@Param('matchId') matchId: string, @Body() dto: MatchEventDto) {
    const { match, event } = await this.matchService.addEvent(matchId, dto);
    this.matchGateway.emitScoreUpdate(matchId, match);
    this.matchGateway.emitMatchEvent(matchId, event);
    this.matchGateway.emitOverlayCommand(matchId, { action: 'SHOW_ALERT', payload: event });
    return { match, event };
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { MatchEvent, MatchState } from '../common/types';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  async sendMatchEvent(match: MatchState, event: MatchEvent): Promise<void> {
    const webhookUrl = process.env.OUTBOUND_WEBHOOK_URL;
    if (!webhookUrl) {
      return;
    }

    const payload = {
      matchId: match.id,
      score: {
        teamA: match.teams.A.score,
        teamB: match.teams.B.score
      },
      minute: event.minute,
      eventType: event.type,
      team: event.team,
      player: event.player,
      stats: {
        corners: {
          A: match.teams.A.corners,
          B: match.teams.B.corners
        },
        fouls: {
          A: match.teams.A.fouls,
          B: match.teams.B.fouls
        },
        offsides: {
          A: match.teams.A.offsides,
          B: match.teams.B.offsides
        }
      }
    };

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      this.logger.warn(`Failed to deliver webhook: ${String(error)}`);
    }
  }
}

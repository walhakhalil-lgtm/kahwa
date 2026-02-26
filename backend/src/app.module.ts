import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MatchController } from './match/match.controller';
import { MatchService } from './match/match.service';
import { MatchGateway } from './gateway/match.gateway';
import { WebhookService } from './webhook/webhook.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [MatchController],
  providers: [MatchService, MatchGateway, WebhookService]
})
export class AppModule {}

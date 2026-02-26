import { IsIn, IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';
import { EventType, Period, TeamSide } from '../common/types';

export class JoinMatchDto {
  @IsString()
  @Length(5, 5)
  code!: string;
}

export class SetPeriodDto {
  @IsIn(['FIRST_HALF', 'SECOND_HALF', 'EXTRA_TIME'])
  period!: Period;
}

export class AddAdditionalTimeDto {
  @IsInt()
  @Min(1)
  @Max(900)
  seconds!: number;
}

export class ScoreGoalDto {
  @IsIn(['A', 'B'])
  team!: TeamSide;

  @IsString()
  player!: string;
}

export class MatchEventDto {
  @IsIn(['A', 'B'])
  team!: TeamSide;

  @IsIn(['GOAL', 'YELLOW_CARD', 'RED_CARD', 'SUBSTITUTION', 'CORNER', 'FOUL', 'OFFSIDE'])
  eventType!: EventType;

  @IsOptional()
  @IsString()
  player?: string;

  @IsOptional()
  @IsString()
  playerIn?: string;

  @IsOptional()
  @IsString()
  playerOut?: string;
}

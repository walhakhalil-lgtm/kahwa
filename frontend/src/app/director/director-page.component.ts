import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatchApiService } from '../core/match-api.service';
import { SocketService } from '../core/socket.service';

@Component({
  selector: 'app-director-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './director-page.component.html',
  styleUrl: './director-page.component.css'
})
export class DirectorPageComponent implements OnInit {
  match: any;

  constructor(
    private readonly api: MatchApiService,
    private readonly socket: SocketService
  ) {}

  ngOnInit(): void {
    this.api.load().subscribe((match) => (this.match = match));

    this.socket.on('timer:update', ({ clock }) => {
      if (this.match) {
        this.match.clock = clock;
      }
    });

    this.socket.on('score:update', ({ score }) => {
      if (this.match) {
        this.match.teams.A.score = score.A;
        this.match.teams.B.score = score.B;
      }
    });
  }

  formatTime(seconds: number): string {
    const mm = `${Math.floor(seconds / 60)}`.padStart(2, '0');
    const ss = `${seconds % 60}`.padStart(2, '0');
    return `${mm}:${ss}`;
  }

  addEvent(team: 'A' | 'B', eventType: string): void {
    const player = prompt('Sélection rapide joueur (nom):') || undefined;
    this.api.addEvent({ team, eventType, player }).subscribe((response) => {
      this.match = response.match;
    });
  }
}

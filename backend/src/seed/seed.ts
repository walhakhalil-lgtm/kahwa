/* eslint-disable no-console */
import { writeFileSync } from 'fs';

const seed = {
  matchId: 'demo-match-1',
  joinCode: 'A1B2C',
  teams: ['Equipe A', 'Equipe B']
};

writeFileSync('seed-data.json', JSON.stringify(seed, null, 2));
console.log('Seed generated at backend/seed-data.json');

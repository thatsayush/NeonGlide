export type PowerUpsState = {
  shield: number;
  turbo: number;
  slowmo: number;
  magnet: number;
};

export type GameStateData = {
  score: number;
  coins: number;
  powerUps: PowerUpsState;
  altitude: number;
  velocity: number;
  fuel: number;
  gameOver: boolean;
  gameStarted: boolean;
};

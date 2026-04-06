export type Board = number[][];
export type Direction = 'up' | 'down' | 'left' | 'right';

export interface GameState {
  board: Board;
  score: number;
  gameOver: boolean;
  won: boolean;
}

export function createEmptyBoard(): Board {
  return Array.from({ length: 4 }, () => Array(4).fill(0));
}

export function addRandomTile(board: Board): Board {
  const empty: [number, number][] = [];
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++)
      if (board[r][c] === 0) empty.push([r, c]);
  if (empty.length === 0) return board;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  const newBoard = board.map(row => [...row]);
  newBoard[r][c] = Math.random() < 0.9 ? 2 : 4;
  return newBoard;
}

export function initGame(): GameState {
  let board = createEmptyBoard();
  board = addRandomTile(board);
  board = addRandomTile(board);
  return { board, score: 0, gameOver: false, won: false };
}

function slideRow(row: number[]): { newRow: number[]; score: number } {
  const filtered = row.filter(v => v !== 0);
  let score = 0;
  const merged: number[] = [];
  let i = 0;
  while (i < filtered.length) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      const val = filtered[i] * 2;
      merged.push(val);
      score += val;
      i += 2;
    } else {
      merged.push(filtered[i]);
      i++;
    }
  }
  while (merged.length < 4) merged.push(0);
  return { newRow: merged, score };
}

function rotateBoard(board: Board): Board {
  const n = 4;
  const rotated = createEmptyBoard();
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++)
      rotated[c][n - 1 - r] = board[r][c];
  return rotated;
}

export function move(state: GameState, dir: Direction): GameState {
  let board = state.board.map(r => [...r]);
  let rotations = 0;
  if (dir === 'up') rotations = 3;
  else if (dir === 'down') rotations = 1;
  else if (dir === 'right') rotations = 2;

  for (let i = 0; i < rotations; i++) board = rotateBoard(board);

  let totalScore = 0;
  const newBoard = board.map(row => {
    const { newRow, score } = slideRow(row);
    totalScore += score;
    return newRow;
  });

  let result = newBoard;
  for (let i = 0; i < (4 - rotations) % 4; i++) result = rotateBoard(result);

  const moved = JSON.stringify(result) !== JSON.stringify(state.board.map(r => [...r]));
  if (!moved) return state;

  const withTile = addRandomTile(result);
  const won = state.won || withTile.some(r => r.some(v => v >= 2048));
  const gameOver = isGameOver(withTile);

  return {
    board: withTile,
    score: state.score + totalScore,
    gameOver,
    won,
  };
}

function isGameOver(board: Board): boolean {
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === 0) return false;
      if (c < 3 && board[r][c] === board[r][c + 1]) return false;
      if (r < 3 && board[r][c] === board[r + 1][c]) return false;
    }
  return true;
}

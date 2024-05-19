import React from 'react';
import { renderSquare } from './Game';

const GameBoard = ({ board, onClick, onReset }) => {
  return (
    <div className="game-board">
      {[0, 1, 2].map((row) => (
        <div key={row} className="board-row">
          {[0, 1, 2].map((col) => {
            const index = row * 3 + col;
            return renderSquare(index, board, onClick);
          })}
        </div>
      ))}
      <div className="reset-button">
        <button onClick={onReset}>Reset Game</button>
      </div>
    </div>
  );
};

export default GameBoard;

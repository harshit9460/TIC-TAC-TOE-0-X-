import React, { useState, useEffect } from 'react';
import './App.css';
import { calculateWinner } from './Game';
import io from 'socket.io-client';

const socket = io('http://localhost:5000'); // Replace with your backend server URL

const App = () => {
  const initialBoard = Array(9).fill(null);
  const [board, setBoard] = useState(initialBoard);
  const [xIsNext, setXIsNext] = useState(true);
  const [player, setPlayer] = useState('');
  const [highScores, setHighScores] = useState([]);
  const [winner, setWinner] = useState(null);
  const [movesToWin, setMovesToWin] = useState(null);

  useEffect(() => {
    const savedPlayer = localStorage.getItem('ticTacToePlayer');
    const savedScores = JSON.parse(localStorage.getItem('ticTacToeHighScores'));

    if (savedPlayer) {
      setPlayer(savedPlayer);
    } else {
      const defaultPlayer = prompt('Enter your username:');
      setPlayer(defaultPlayer || 'Guest');
    }

    if (savedScores) setHighScores(savedScores);
  }, []);

  useEffect(() => {
    socket.on('gameStateUpdate', (updatedGameState) => {
      setBoard(updatedGameState.grid);
      setXIsNext(updatedGameState.currentPlayer === 'X');
      setWinner(calculateWinner(updatedGameState.grid));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleClick = (index) => {
    const squares = [...board];
    const row = Math.floor(index / 3);
    const col = index % 3;

    if (calculateWinner(squares) || squares[index]) return;

    squares[index] = xIsNext ? 'X' : 'O';
    setBoard(squares);

    const winner = calculateWinner(squares);
    if (winner) {
      setWinner(winner);
      const numMoves = squares.filter((square) => square).length;
      if (movesToWin === null || numMoves < movesToWin) {
        setMovesToWin(numMoves);
        updateHighScores(player, numMoves);
      }
    } else {
      setXIsNext(!xIsNext);
    }

    socket.emit('gameStateUpdate', { roomId: 'game123', gameState: { row, col, player } });
  };

  const updateHighScores = (player, moves) => {
    const updatedScores = [...highScores, { player, moves }];
    updatedScores.sort((a, b) => a.moves - b.moves);
    setHighScores(updatedScores.slice(0, 5));
  };

  const renderSquare = (index) => {
    return (
      <button className={`square ${board[index]}`} onClick={() => handleClick(index)}>
        {board[index]}
      </button>
    );
  };

  const handleReset = () => {
    setBoard(initialBoard);
    setXIsNext(true);
    setWinner(null);
    setMovesToWin(null);
  };

  const handlePlayerChange = () => {
    const newPlayer = prompt('Enter your username:');
    if (newPlayer) setPlayer(newPlayer);
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1>Tic Tac Toe</h1>
      </div>
      <div className="game-content">
        <div className="game-board">
          {[0, 1, 2].map((row) => (
            <div key={row} className="board-row">
              {[0, 1, 2].map((col) => renderSquare(row * 3 + col))}
            </div>
          ))}
        </div>
        <div className="game-info">
          {winner ? (
            <div className="status">Winner: {winner}</div>
          ) : (
            <div className="status">Next player: {xIsNext ? 'X' : 'O'}</div>
          )}
          <div className="change-reset-buttons">
            <button className="change-player" onClick={handlePlayerChange}>
              Change Player
            </button>
            <button className="reset" onClick={handleReset}>
              Reset
            </button>
          </div>
          <div className="player-info">
            {movesToWin !== null && (
              <div className="top-scorer-moves">
                <div className="top-scorer-name">{player}</div>
                <div className="top-scorer-info">
                  <div className="moves-label">Moves to Win:</div>
                  <div className="moves-count">{movesToWin}</div>
                </div>
              </div>
            )}
            {highScores.length > 0 && (
              <div className="top-scores">
                <h2>Top Scores</h2>
                <ul>
                  {highScores.map((score, index) => (
                    <li key={index}>
                      {score.player}: Moves to win - {score.moves}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="player-name">
            <h2>Player: {player}</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;

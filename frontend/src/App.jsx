import { useState } from "react";
import "./App.css";

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState(null);
  const [rank, setRank] = useState(null);
  const [history, setHistory] = useState([]);

  async function startGame() {
    const res = await fetch("http://127.0.0.1:8000/start_game", { method: "POST" });
    if (res.ok) {
      setGameStarted(true);
      setMessage("Game started! Make your guess.");
      setRank(null);
      setHistory([]);
      setGuess("");
    } else {
      setMessage("Failed to start game.");
    }
  }

  async function submitGuess(e) {
    e.preventDefault();
    if (!guess.trim()) return;
    const res = await fetch("http://127.0.0.1:8000/guess", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word: guess.trim() }),
    });
    const data = await res.json();
    if (data.valid_guess) {
      setRank(data.rank);
      setMessage(
        <>
          Word <strong>{data.word}</strong> {data.message}
        </>
      );
      setHistory((prevHistory) =>
        [...prevHistory, { word: guess, rank: data.rank, progress: data.progress, progress_color: data.progress_color }]
          .sort((a, b) => a.rank - b.rank)
      );

    } else {
      setMessage(
        <>
          Word <strong>{data.word}</strong> {data.message}
        </>
      );
    }
    setGuess("");
  }

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h1>Wikipedia Contexto</h1>
      {!gameStarted ? (
        <button onClick={startGame}>Start Game</button>
      ) : (
        <>
          <form onSubmit={submitGuess}>
            <input
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="guess a word"
              autoFocus
            />
            {/* <button type="submit">Guess</button> */}
          </form>
          <p>{message}</p>
          {history.length > 0 && (
            <div>
              {history.map(({ word, rank, progress, progress_color }, i) => (
                <div 
                  className="wordBox"
                  key={i}
                  style={{
                      background: `linear-gradient(to right, ${progress_color} ${progress}%, transparent 0%)` /* used to be the color #4caf50 */
                  }}
                >
                  <div className="word">{word}</div>
                  <div className="rank">{rank}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;

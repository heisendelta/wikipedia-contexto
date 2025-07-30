import { useState } from "react";

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
      ); // not using the message from api
      setHistory((h) => [...h, { word: guess, rank: data.rank }]);
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
      <h1>Contexto Clone</h1>
      {!gameStarted ? (
        <button onClick={startGame}>Start Game</button>
      ) : (
        <>
          <form onSubmit={submitGuess}>
            <input
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Enter your guess"
              autoFocus
            />
            <button type="submit">Guess</button>
          </form>
          <p>{message}</p>
          {history.length > 0 && (
            <table border="1" cellPadding="5" style={{ marginTop: 20 }}>
              <thead>
                <tr>
                  <th>Word</th>
                  <th>Rank</th>
                </tr>
              </thead>
              <tbody>
                {history.map(({ word, rank }, i) => (
                  <tr key={i}>
                    <td>{word}</td>
                    <td>{rank}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}

export default App;

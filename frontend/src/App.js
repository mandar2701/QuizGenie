import React, { useEffect, useState } from "react";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export default function App() {
  const [inputText, setInputText] = useState("");
  const [generated, setGenerated] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/quizzes`);
      const data = await res.json();
      setQuizzes(data);
    } catch (e) {
      setError("Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  const generateQuiz = async () => {
    setError("");
    if (!inputText.trim()) return setError("Please paste some study text.");
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/generate-quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || "Failed to generate");
      } else {
        setGenerated(data);
        setInputText("");
        loadQuizzes();
      }
    } catch (e) {
      setError("Backend not reachable. Is it running on 5000?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ margin: 40, fontFamily: "Inter, Arial, sans-serif" }}>
      <h1>AI Quiz Generator (React + Node + MySQL)</h1>

      <div style={{ display: "grid", gap: 8, maxWidth: 720 }}>
        <textarea
          rows={6}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste study text here, e.g., 'Chlorophyll is the primary pigment in photosynthesis.'"
        />
        <button onClick={generateQuiz} disabled={loading}>
          {loading ? "Generating..." : "Generate & Save Quiz"}
        </button>
        {error && <div style={{ color: "red" }}>{error}</div>}
      </div>

      {generated && (
        <div style={{ marginTop: 24 }}>
          <h2>Latest Generated</h2>
          <p><b>Q:</b> {generated.question}</p>
          <ul>
            {generated.options.map((o, i) => <li key={i}>{o}</li>)}
          </ul>
          <p><b>Answer:</b> {generated.answer}</p>
        </div>
      )}

      <div style={{ marginTop: 32 }}>
        <h2>Saved Quizzes</h2>
        <ol>
          {quizzes.map(q => (
            <li key={q.id} style={{ marginBottom: 12 }}>
              <div><b>Q:</b> {q.question}</div>
              <div>Options:
                <ul>
                  {q.options.map((o, i) => <li key={i}>{o}</li>)}
                </ul>
              </div>
              <div><b>Answer:</b> {q.answer}</div>
            </li>
          ))}
        </ol>
        <button onClick={loadQuizzes} disabled={loading}>Refresh</button>
      </div>
    </div>
  );
}

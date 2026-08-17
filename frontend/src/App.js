import React, { useState } from "react";
import "../src/services/App.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function App() {
  const [sourceText, setSourceText] = useState("");
  const [numQuestions, setNumQuestions] = useState(3);
  const [quizData, setQuizData] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [score, setScore] = useState(0);

  const handleGenerate = async () => {
    if (!sourceText.trim()) {
      alert("Please enter some text or notes to generate a quiz.");
      return;
    }

    setIsLoading(true);
    setIsSubmitted(false);
    setUserAnswers({});
    setQuizData([]);

    try {
      const response = await fetch(`${API_BASE_URL}/api/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: sourceText,
          numQuestions: Number(numQuestions),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const data = await response.json();
      setQuizData(data.questions || data);
    } catch (err) {
      console.error("API Error:", err);
      alert("Could not generate quiz. Make sure your backend is running on port 5000.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (questionIndex, option) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [questionIndex]: option }));
  };

  const handleSubmit = () => {
    if (Object.keys(userAnswers).length < quizData.length) {
      if (!window.confirm("You have unanswered questions. Submit anyway?")) {
        return;
      }
    }

    let calculatedScore = 0;
    quizData.forEach((q, idx) => {
      if (userAnswers[idx] === q.answer) {
        calculatedScore += 1;
      }
    });

    setScore(calculatedScore);
    setIsSubmitted(true);
  };

  return (
    <div className="container">
      <header>
        <h1>Quiz<span>Genie</span> 🧞‍♂️</h1>
        <p>AI-Powered Quiz Generator</p>
      </header>

      {/* Input Panel */}
      <div className="card">
        <label htmlFor="source-text">Source Content / Study Notes</label>
        <textarea
          id="source-text"
          rows="6"
          placeholder="Paste articles, study materials, or notes here..."
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
        />

        <div className="input-row">
          <div className="input-group">
            <label htmlFor="num-questions">Question Count</label>
            <input
              id="num-questions"
              type="number"
              min="1"
              max="10"
              value={numQuestions}
              onChange={(e) => setNumQuestions(e.target.value)}
            />
          </div>
        </div>

        <button
          className="primary-btn"
          disabled={isLoading}
          onClick={handleGenerate}
        >
          {isLoading ? "Generating Quiz..." : "Generate Quiz"}
        </button>
      </div>

      {/* Questions Panel */}
      {quizData.length > 0 && (
        <div className="card">
          {quizData.map((item, qIdx) => (
            <div key={qIdx} className="question-box">
              <p className="question-title">
                {qIdx + 1}. {item.question}
              </p>
              <div className="options-grid">
                {item.options && item.options.map((opt, optIdx) => {
                  const isSelected = userAnswers[qIdx] === opt;
                  const isCorrect = isSubmitted && opt === item.answer;
                  const isWrong = isSubmitted && isSelected && opt !== item.answer;

                  let btnClass = "option-btn";
                  if (isCorrect) btnClass += " correct";
                  else if (isWrong) btnClass += " incorrect";
                  else if (isSelected) btnClass += " selected";

                  return (
                    <button
                      key={optIdx}
                      className={btnClass}
                      onClick={() => handleSelectOption(qIdx, opt)}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {!isSubmitted ? (
            <button className="primary-btn" onClick={handleSubmit}>
              Submit Answers
            </button>
          ) : (
            <div className="result-banner">
              You scored {score} / {quizData.length}! 🎉
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
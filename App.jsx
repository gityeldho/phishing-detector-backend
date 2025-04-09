import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);

  const checkUrl = async () => {
    try {
      const response = await axios.post("http://localhost:5000/predict", { url });
      setResult(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error checking URL:", error);
      setResult({ prediction: "error", url });
    }
  };

  return (
    <div className="container">
      <h1>Phishing Website Detector</h1>
      <div className="input-container">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL"
        />
        <button onClick={checkUrl}>Check</button>
      </div>

      {result && (
        <div className="result">
          <p><strong>URL:</strong> {result.url}</p>
          <p><strong>Result:</strong> 
            {result.prediction?.toLowerCase() === "phishing"
              ? "⚠️ Phishing Detected"
              : "✅ Safe"}
          </p>
        </div>
      )}
    </div>
  );
}

export default App;

import { useState, useEffect, useRef } from "react";

export default function Pomodoro() {
  const FOCUS_TIME = 25 * 60; // 25 min
  const BREAK_TIME = 5 * 60;  // 5 min

  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState(() => {
    return JSON.parse(localStorage.getItem("pomodoroSessions")) || [];
  });

  const timerRef = useRef(null);

  // Oppdater localStorage når sessions endres
  useEffect(() => {
    localStorage.setItem("pomodoroSessions", JSON.stringify(sessions));
  }, [sessions]);

  // Start / Stopp logikk
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  // Når tiden er ferdig
  useEffect(() => {
    if (timeLeft === 0) {
      if (isBreak) {
        // Ferdig med pause → start ny fokus
        setTimeLeft(FOCUS_TIME);
        setIsBreak(false);
        setIsRunning(false);
      } else {
        // Ferdig med fokus → logg økt, start pause
        const today = new Date().toISOString().split("T")[0];
        setSessions((prev) => [...prev, today]);
        setTimeLeft(BREAK_TIME);
        setIsBreak(true);
        setIsRunning(false);
      }
    }
  }, [timeLeft, isBreak]);

  // Format tid (mm:ss)
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const totalTime = isBreak ? BREAK_TIME : FOCUS_TIME;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  // Tell antall økter per dag
  const sessionsPerDay = sessions.reduce((acc, date) => {
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">Work Timer</h1>

        <p className="text-lg mb-2 text-gray-600">
          {isBreak ? "Pause 💤" : "Fokus ✨"}
        </p>

        <div className="text-6xl font-mono mb-6 text-gray-900">
          {formatTime(timeLeft)}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-4 mb-6 overflow-hidden">
          <div
            className={`h-4 transition-all duration-500 ${
              isBreak ? "bg-blue-400" : "bg-green-500"
            }`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Knapper */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="px-6 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors"
          >
            {isRunning ? "Pause" : "Start"}
          </button>
          <button
            onClick={() => {
              clearInterval(timerRef.current);
              setIsRunning(false);
              setTimeLeft(FOCUS_TIME);
              setIsBreak(false);
            }}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Antall økter totalt */}
        <p className="text-gray-700 mb-4">
          Totalt fullførte økter:{" "}
          <span className="font-bold text-indigo-600">{sessions.length}</span>
        </p>

        {/* Historikk */}
        <div className="text-left">
          <h2 className="text-lg font-semibold mb-2 text-gray-800">Historikk</h2>
          <ul className="space-y-1">
            {Object.entries(sessionsPerDay).map(([date, count]) => (
              <li key={date} className="text-gray-700">
                {date}: <span className="font-bold">{count}</span> økter
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

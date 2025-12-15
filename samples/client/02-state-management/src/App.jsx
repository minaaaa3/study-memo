import { useState } from "react";
import UseStateDemo from "./demos/01-UseStateDemo";
import ContextDemo from "./demos/02-ContextDemo";
import ZustandDemo from "./demos/03-ZustandDemo";
import ReduxDemo from "./demos/04-ReduxDemo";

const demos = [
  { id: "useState", label: "1. useState", component: UseStateDemo },
  { id: "context", label: "2. Context API", component: ContextDemo },
  { id: "zustand", label: "3. Zustand", component: ZustandDemo },
  { id: "redux", label: "4. Redux Toolkit", component: ReduxDemo },
];

export default function App() {
  const [activeDemo, setActiveDemo] = useState("useState");

  const ActiveComponent = demos.find((d) => d.id === activeDemo)?.component;

  return (
    <div className="container">
      <h1>状態管理デモ</h1>
      <p style={{ textAlign: "center", marginBottom: 20, color: "#666" }}>
        カリキュラム: 4-2. 状態管理
      </p>

      <div className="tabs">
        {demos.map((demo) => (
          <button
            key={demo.id}
            className={`tab ${activeDemo === demo.id ? "active" : ""}`}
            onClick={() => setActiveDemo(demo.id)}
          >
            {demo.label}
          </button>
        ))}
      </div>

      <div className="demo-container">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
}

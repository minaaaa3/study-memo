import { useState } from "react";
import RawReactForm from "./demos/01-RawReactForm";
import ZodDemo from "./demos/02-ZodDemo";
import ReactHookFormDemo from "./demos/03-ReactHookFormDemo";
import CombinedDemo from "./demos/04-CombinedDemo";

const demos = [
  { id: "raw", label: "1. 素のReact", component: RawReactForm },
  { id: "zod", label: "2. Zod", component: ZodDemo },
  { id: "rhf", label: "3. React Hook Form", component: ReactHookFormDemo },
  { id: "combined", label: "4. RHF + Zod", component: CombinedDemo },
];

export default function App() {
  const [activeDemo, setActiveDemo] = useState("raw");

  const ActiveComponent = demos.find((d) => d.id === activeDemo)?.component;

  return (
    <div className="container">
      <h1>フォームバリデーションデモ</h1>
      <p style={{ textAlign: "center", marginBottom: 20, color: "#666" }}>
        カリキュラム: 4-6. フォームとバリデーション
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

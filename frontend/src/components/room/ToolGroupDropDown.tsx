import { useEffect, useRef, useState } from "react";
import {  ChevronUp } from "lucide-react";

// Reusable collapsed tool-group dropdown
export function ToolGroupDropdown({
  tools,
  activeTool,
  onSelect,
}: {
  tools: { name: string; title: string; icon: React.ReactNode }[];
  activeTool: string|null;
  onSelect: (tool: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const active = tools.find((t) => t.name === activeTool) ?? tools[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative " ref={ref}>
      <button
        title={active.title}
        onClick={() => setOpen((o) => !o)}
        className={tools.some((t) => t.name === activeTool) ? "tool-btn-active" : "tool-btn"}
      >
        <span className="flex items-center gap-0.5">
          {active.icon}
          <ChevronUp size={12} />
        </span>
      </button>

      {open && (
       <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black rounded-2xl border border-gray-800 shadow-lg px-2 py-1 z-[9990099]">
          {tools.map((t) => (
            <button
              key={t.name}
              title={t.title}
              onClick={() => {
                onSelect(t.name);
                setOpen(false);
              }}
              className={activeTool === t.name ? "tool-btn-active" : "tool-btn"}
            >
              {t.icon}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
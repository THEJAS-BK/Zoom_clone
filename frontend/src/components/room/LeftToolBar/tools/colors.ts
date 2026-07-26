const colorShades: Record<string, string[]> = {
  w: ["#3a3a3a", "#2a2a2a", "#1a1a1a", "#0d0d0d", "#000000"], // near-black
  e: ["#e9ecef", "#ced4da", "#adb5bd", "#868e96", "#495057"], // gray
  r: ["#ffffff", "#f1f3f5", "#dee2e6", "#ced4da", "#adb5bd"], // light gray/white
  t: ["#e8c9b8", "#d4a98e", "#a88b7a", "#8a6f5c", "#6b5544"], // taupe/brown
  a: ["#a8e6ec", "#6fd1db", "#4fb8c4", "#2f97a3", "#1f7682"], // teal/cyan
  s: ["#a8cdf0", "#7eb3e8", "#5b9bd5", "#3d7fc0", "#3b82f6"], // blue
  d: ["#cdbafc", "#b69cfa", "#a78bfa", "#8f6df0", "#7950e0"], // violet
  f: ["#e8c4fa", "#dba3f7", "#cf85f5", "#c266f0", "#b347e6"], // light purple/orchid
  g: ["#fcc9e0", "#fba8cf", "#f9a8d4", "#f580bf", "#e860a8"], // pink
  z: ["#7fd9a8", "#5fc48c", "#4caf7d", "#3a9968", "#22c55e"], // green
  x: ["#6fc4b0", "#52ab98", "#3d9b85", "#2f8470", "#236c5c"], // teal-green
  c: ["#e08a3e", "#cc7a28", "#c2691e", "#a85618", "#8a4512"], // burnt orange/brown
  v: ["#f5a05c", "#ec8a40", "#e8742c", "#d4621f", "#d97706"], // orange
  b: ["#f7a3a3", "#f58f8f", "#f47c7c", "#ef6363", "#e64545"], 
  n:["#ef4444","#dc2626","#b91c1c","#991b1b","#f87171"]
};

 const strokeColors = ["#adb5bd", "#f87171", "#22c55e", "#3b82f6", "#d97706"];
  const backgroundColors = [
    "transparent",
    "#7f1d1d",
    "#14532d",
    "#1e3a8a",
    "#422006",
  ];

  const transparentPattern = {
    backgroundImage: `
    linear-gradient(45deg, #1a1a1a 25%, transparent 25%),
    linear-gradient(-45deg, #1a1a1a 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #1a1a1a 75%),
    linear-gradient(-45deg, transparent 75%, #1a1a1a 75%)
  `,
    backgroundSize: "12px 12px",
    backgroundPosition: "0 0, 0 6px, 6px -6px, -6px 0px",
    backgroundColor: "#3a3a3a",
  };

  const boardColors = [
  { name: "white", value: "#FFFFFF" },
  { name: "gray",  value: "#374151" }, // gray-700
  { name: "black", value: "#18181B" }, // zinc-900, not pure black
  { name: "dark-grey", value: "#27272A" }, // zinc-800
];

export {colorShades,boardColors, strokeColors, backgroundColors, transparentPattern}
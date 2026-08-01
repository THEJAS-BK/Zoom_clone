// components/icons/ZigzagArrow.tsx
export const ZigzagArrow = ({
  size = 24,
  strokeWidth = 2,
  ...props
}: React.SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* main zigzag path */}
    <path d="M6 20 L6 15 Q6 12 9 12 L15 12 Q18 12 18 9 L18 4" />
    {/* top arrowhead */}
    <path d="M15.5 6.5 L18 4 L20.5 6.5" />
    {/* bottom arrowhead */}
    <path d="M8.5 17.5 L6 20 L3.5 17.5" />
    {/* midpoint dot */}
    <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
  </svg>
);
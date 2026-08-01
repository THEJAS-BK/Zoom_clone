// components/icons/DashedLine.tsx
export const DashedLine = ({
  size = 24,
  strokeWidth = 3,
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
    {...props}
  >
    <line x1="4" y1="12" x2="8" y2="12" />
    <line x1="11" y1="12" x2="15" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
  </svg>
);
// components/icons/DottedLine.tsx
export const DottedLine = ({
  size = 24,
  strokeWidth = 3,
  ...props
}: React.SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="none"
    {...props}
  >
    <circle cx="5" cy="12" r={strokeWidth / 2} />
    <circle cx="12" cy="12" r={strokeWidth / 2} />
    <circle cx="19" cy="12" r={strokeWidth / 2} />
  </svg>
);
export function BrandMark({ className = "size-9" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect width="40" height="40" rx="11" fill="currentColor" />
      <g stroke="#f5f7ef" strokeWidth="1.5">
        <rect x="9" y="8" width="22" height="24" rx="1" />
        <path d="M9 20h22M15 8v6H9m16-6v6h6M15 32v-6H9m16 6v-6h6" />
        <circle cx="20" cy="20" r="4" />
      </g>
    </svg>
  );
}

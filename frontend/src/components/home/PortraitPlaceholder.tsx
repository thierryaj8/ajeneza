/** Editorial abstract portrait used until a real portrait is uploaded in Admin → Biography. */
export function PortraitPlaceholder() {
  return (
    <svg className="block h-full w-full bg-[#d8d0c1]" viewBox="0 0 360 450" role="img" aria-label="Portrait placeholder">
      <rect width="360" height="450" fill="#d8d0c1" />
      <rect x="18" y="18" width="324" height="414" fill="none" stroke="#a99b84" strokeWidth="1" />
      <circle cx="180" cy="151" r="76" fill="#b69b7b" />
      <path d="M100 160 Q105 54 184 57 Q263 62 260 163 Q236 121 215 111 Q170 145 100 160" fill="#263744" />
      <path d="M62 420 Q72 264 180 254 Q288 264 298 420Z" fill="#263744" />
      <path d="M128 258 L180 329 L232 258" fill="#f1e8d8" />
      <path d="M153 255 L180 294 L207 255" fill="#a7834e" />
      <path d="M18 368 L90 368 M270 368 L342 368" stroke="#a7834e" strokeWidth="1" />
      <text x="180" y="395" textAnchor="middle" fill="#e9dfcf" fontFamily="Georgia,serif" fontSize="11" letterSpacing="4">YOUR PORTRAIT</text>
    </svg>
  );
}

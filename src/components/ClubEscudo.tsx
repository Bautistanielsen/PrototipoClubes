export default function ClubEscudo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 116" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Escudo Club Atlético Modelo">
      <path
        d="M50 2 L94 16 V54 C94 84 76 104 50 114 C24 104 6 84 6 54 V16 Z"
        fill="#172a54"
        stroke="#d4af6a"
        strokeWidth="3"
      />
      <path
        d="M50 8 L88 20 V54 C88 80 72 98 50 107 C28 98 12 80 12 54 V20 Z"
        fill="#fff"
      />
      <path d="M50 8 L88 20 V54 C88 80 72 98 50 107 Z" fill="#e7eef8" />
      <path d="M12 20 H88 V44 H12 Z" fill="#172a54" />
      <path d="M12 44 H88 V60 H12 Z" fill="#d4af6a" />
      <circle cx="50" cy="32" r="9" fill="#d4af6a" stroke="#172a54" strokeWidth="1.5" />
      <path d="M50 25 L54 30 L52.5 36 L47.5 36 L46 30 Z" fill="#172a54" />
      <text x="50" y="55" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="700" fontSize="15" fill="#172a54">CAM</text>
      <text x="50" y="90" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="700" fontSize="10" fill="#172a54" letterSpacing="1">1926</text>
    </svg>
  );
}

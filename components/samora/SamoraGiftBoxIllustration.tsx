const SamoraGiftBoxIllustration = ({ className = "" }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 320 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Samora gift box wrapped in signature butter paper"
    >
      <ellipse cx="160" cy="232" rx="118" ry="14" fill="#2b2420" opacity="0.06" />

      {/* Box body — butter paper tone */}
      <rect x="62" y="108" width="196" height="112" rx="10" fill="#f3ead9" />
      <rect x="62" y="108" width="196" height="112" rx="10" stroke="#2b2420" strokeOpacity="0.08" />

      {/* Box lid */}
      <rect x="48" y="78" width="224" height="42" rx="10" fill="#efe2c8" />
      <rect x="48" y="78" width="224" height="42" rx="10" stroke="#2b2420" strokeOpacity="0.08" />

      {/* Ribbon */}
      <rect x="146" y="78" width="28" height="142" fill="#c1683d" />
      <rect x="48" y="90" width="224" height="18" fill="#c1683d" />

      {/* Bow */}
      <path
        d="M160 78C160 78 132 52 108 62C88 70 96 92 118 92C136 92 160 78 160 78Z"
        fill="#a8552f"
      />
      <path
        d="M160 78C160 78 188 52 212 62C232 70 224 92 202 92C184 92 160 78 160 78Z"
        fill="#c1683d"
      />
      <circle cx="160" cy="80" r="10" fill="#460000" />

      {/* Tag */}
      <g transform="rotate(-8 96 150)">
        <rect x="80" y="140" width="56" height="30" rx="4" fill="#fbf6ef" stroke="#460000" strokeWidth="1.5" />
        <text
          x="108"
          y="159"
          textAnchor="middle"
          fontSize="10"
          fontWeight="600"
          fill="#460000"
          fontFamily="serif"
          letterSpacing="0.5"
        >
          SAMORA
        </text>
        <circle cx="80" cy="145" r="2.5" fill="#460000" />
      </g>
    </svg>
  );
};

export default SamoraGiftBoxIllustration;

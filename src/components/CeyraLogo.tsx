interface CeyraLogoProps {
  className?: string;
  size?: number;
}

export default function CeyraLogo({ className = 'w-8 h-8', size }: CeyraLogoProps) {
  const style = size ? { width: `${size}px`, height: `${size}px` } : undefined;

  return (
    <div className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`} style={style}>
      <img
        src="https://bgpytpebhjybqhfrubha.supabase.co/storage/v1/object/public/Site%20Images/round-hub-transparent.png"
        alt="Ceyra Assist Logo"
        className="w-full h-full object-contain select-none pointer-events-none"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}


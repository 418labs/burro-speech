interface SubtitlesProps {
  text: string;
  settings: {
    fontSize: number;
    position: string;
    textColor: string;
    backgroundColor: string;
  };
}

export function Subtitles({ text, settings }: SubtitlesProps) {
  if (!text) return null;

  const positionClass = settings.position === 'top' ? 'top-4' : 'bottom-4';

  return (
    <div
      className={`absolute left-1/2 transform -translate-x-1/2 ${positionClass} px-6 py-3 rounded-lg max-w-[90%] text-center`}
      style={{
        backgroundColor: settings.backgroundColor,
        fontSize: `${settings.fontSize}px`,
        color: settings.textColor,
      }}
    >
      {text}
    </div>
  );
}

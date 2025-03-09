interface SubtitlesProps {
  text: string | { line1: string; line2: string };
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
  
  // Handle both string and two-line object formats
  const isMultiLine = typeof text === 'object';
  
  return (
    <div
      className={`absolute left-1/2 transform -translate-x-1/2 ${positionClass} px-6 py-3 rounded-lg max-w-[90%] text-center`}
      style={{
        backgroundColor: settings.backgroundColor,
        fontSize: `${settings.fontSize}px`,
        color: settings.textColor,
      }}
    >
      {isMultiLine ? (
        <div className="flex flex-col gap-1">
          {/* Only display non-empty lines */}
          {text.line1 && text.line1.trim() !== "" && (
            <div key="line1">{text.line1}</div>
          )}
          {text.line2 && text.line2.trim() !== "" && (
            <div key="line2">{text.line2}</div>
          )}
        </div>
      ) : (
        text
      )}
    </div>
  );
}

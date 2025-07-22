import { useRef, useEffect, useState } from "react";

export default function Description({
  text,
  clampLines = 3, // default to 3
  className
}: {
  text: string;
  clampLines?: number;
  className?: string;
}) {
  const pRef = useRef<HTMLParagraphElement>(null);
  const [isClamped, setIsClamped] = useState(false);

  useEffect(() => {
    const el = pRef.current;
    if (!el) return;

    // Force layout and measure
    const fullHeight = el.scrollHeight;
    const style = window.getComputedStyle(el);
    const lineHeight = parseFloat(style.lineHeight);
    const clampHeight = lineHeight * clampLines;

    if (fullHeight > clampHeight) {
      setIsClamped(true);
    }
  }, [text, clampLines]);

  return (
    <div>
      <p
        ref={pRef}
        className={className}
      >
        {text}
      </p>
      {isClamped && (
        <span className="text-muted-foreground dark:text-foreground dark:group-data-[state=active]/tabstrigger:text-muted-foreground group-data-[state=active]/tabstrigger:text-muted-foreground">Read more...</span>
      )}
    </div>
  );
}

import { siInstagram } from "simple-icons";

export function InstagramIcon() {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill={`#${siInstagram.hex}`}
      className="size-4"
    >
      <title>{siInstagram.title}</title>
      <path d={siInstagram.path} />
    </svg>
  );
}

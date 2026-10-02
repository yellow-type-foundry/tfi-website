import "./Eyebrow.css";

export function Eyebrow({ children }: { children: string }) {
  return (
    <p className="eyebrow t-label-m">
      <span className="eyebrow__dot" aria-hidden />
      {children}
      <span className="eyebrow__dot" aria-hidden />
    </p>
  );
}

/**
 * transitions.dev "Number pop-in": each character re-enters with a blurred slide when the
 * value changes. Remounting on value change replays the animation (the recipe's
 * remove → reflow → re-add); the last two characters stagger behind the rest.
 */
export function DigitPop({ value, animate = true }: { value: string; animate?: boolean }) {
  const chars = value.split("");
  return (
    <span key={value} className={`t-digit-group${animate ? " is-animating" : ""}`}>
      {chars.map((ch, i) => (
        <span
          key={i}
          className="t-digit"
          data-stagger={i === chars.length - 2 ? "1" : i === chars.length - 1 ? "2" : undefined}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}

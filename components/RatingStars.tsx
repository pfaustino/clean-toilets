type Props = {
  value: number | null;
  size?: "sm" | "md";
};

export function RatingStars({ value, size = "sm" }: Props) {
  const filled = value == null ? 0 : Math.round(value);
  const textSize = size === "md" ? "text-lg" : "text-sm";

  return (
    <span
      className={`${textSize} leading-none tracking-tight`}
      aria-label={
        value == null ? "No cleanliness ratings" : `${value.toFixed(1)} out of 5`
      }
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= filled ? "text-teal-700" : "text-teal-800/25"}
        >
          ★
        </span>
      ))}
    </span>
  );
}

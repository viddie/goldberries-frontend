export function JournalIcon({ height = "1em", alt = "Generic Campaign Icon", style = {}, ...props }) {
  return (
    <img
      src={"/icons/journal.png"}
      alt={alt}
      className="outlined"
      style={{
        height: height,
        ...style,
      }}
      {...props}
    />
  );
}

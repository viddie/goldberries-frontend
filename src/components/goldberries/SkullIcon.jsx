export function SkullIcon({ height = "1em", alt = "Low Death", style = {}, ...props }) {
  return (
    <img
      src={"/icons/skullA.png"}
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

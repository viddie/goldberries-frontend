export function EmoteImage({ emote, alt, height = "1em", style = {} }) {
  return <AnyImage path={"/emotes/" + emote} alt={alt ?? emote} height={height} style={style} />;
}

export function AnyImage({ path, alt, height = "1em", style = {}, ...props }) {
  return (
    <img
      src={path}
      alt={alt ?? path}
      style={{
        height: height,
        ...style,
      }}
      {...props}
    />
  );
}

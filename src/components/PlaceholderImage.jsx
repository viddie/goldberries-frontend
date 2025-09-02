import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "@emotion/react";

export const PlaceholderImage = ({ src, alt = "", style, className, ...props }) => {
  const theme = useTheme();
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        overflow: "hidden",
        ...style,
      }}
      className={className}
    >
      {/* Spinner */}
      {!loaded && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1,
          }}
        >
          <FontAwesomeIcon icon={faSpinner} spin size="2x" color={theme.palette.text.secondary} />
        </div>
      )}

      {/* Real Image */}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transition: "opacity 0.3s ease",
          opacity: loaded ? 1 : 0,
        }}
        {...props}
      />
    </div>
  );
};

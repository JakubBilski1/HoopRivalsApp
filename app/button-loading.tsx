import React from "react";

const dotStyle: React.CSSProperties = {
  display: "inline-block",
  width: "4px",
  height: "4px",
  margin: "0 2px",
  backgroundColor: "currentColor",
  borderRadius: "50%",
  animation: "loading 1.4s infinite ease-in-out both",
};

const containerStyle: React.CSSProperties = {
  display: "inline-block",
};

const ButtonLoading: React.FC = () => {
  return (
    <div style={containerStyle}>
      <span style={{ ...dotStyle, animationDelay: "-0.32s" }} />
      <span style={{ ...dotStyle, animationDelay: "-0.16s" }} />
      <span style={dotStyle} />
      <style jsx>{`
        @keyframes loading {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default ButtonLoading;

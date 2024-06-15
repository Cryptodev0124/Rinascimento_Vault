import React from "react";
import Typewriter from "typewriter-effect";

function Type() {
  return (
    <Typewriter
      options={{
        strings: [
          "On-chain",
          "Optimized",
          "Risk-adjusted",
          "Institutional",
          "Leveraged",
          "Sustainable"
        ],
        autoStart: true,
        loop: true,
        deleteSpeed: 50,
        cursor: ""
      }}
    />
  );
}

export default Type;

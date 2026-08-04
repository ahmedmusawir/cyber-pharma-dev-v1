import SpinnerLarge from "@/components/common/SpinnerLarge";
import React from "react";

// Scoped route loading state (v0.4.1 doctrine): lives INSIDE the surface dir so
// only the content column spins — AuthedShell (navbar + sidebar) stays mounted.
const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <SpinnerLarge />
    </div>
  );
};

export default Loading;

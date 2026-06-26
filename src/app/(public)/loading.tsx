import SpinnerLarge from "@/components/common/SpinnerLarge";
import React from "react";

// Matches the authed routes' loading spinner (moose/admin) so the "/" → /owedbook
// redirect shows the same large centered spinner, not the small one.
const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <SpinnerLarge />
    </div>
  );
};

export default Loading;

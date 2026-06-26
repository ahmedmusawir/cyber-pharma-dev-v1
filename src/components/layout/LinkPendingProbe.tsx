"use client";

import { useEffect } from "react";
import { useLinkStatus } from "next/link";
import { useNavSpinner } from "@/store/useNavSpinner";

// Rendered INSIDE a primary-nav <Link>. useLinkStatus().pending is true while
// that link's navigation is in flight; we mirror it into the shared store so the
// content-area NavigationSpinner can show. Renders nothing.
const LinkPendingProbe = () => {
  const { pending } = useLinkStatus();
  const setPending = useNavSpinner((s) => s.setPending);

  useEffect(() => {
    setPending(pending);
  }, [pending, setPending]);

  return null;
};

export default LinkPendingProbe;

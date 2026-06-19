"use client";

import dynamic from "next/dynamic";

const ReactTraceWidget = dynamic(() => import("./react-trace-widget"), {
  ssr: false,
});

export function ReactTrace() {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const root = process.env.NEXT_PUBLIC_REACT_TRACE_ROOT;

  if (!root) {
    return null;
  }

  return <ReactTraceWidget root={root} />;
}

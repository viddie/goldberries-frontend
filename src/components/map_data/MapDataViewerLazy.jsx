import { Suspense, lazy } from "react";

import { LoadingSpinner } from "../basic";

const Viewer = lazy(() => import("./MapDataViewer").then((m) => ({ default: m.MapDataViewer })));

export function MapDataViewer(props) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Viewer {...props} />
    </Suspense>
  );
}

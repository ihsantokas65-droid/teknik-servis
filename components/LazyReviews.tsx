import dynamic from "next/dynamic";

export const LazyReviews = dynamic(
  () => import("./Reviews").then((mod) => mod.Reviews),
  { ssr: false }
);

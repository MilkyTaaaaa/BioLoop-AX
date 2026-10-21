import { Suspense } from "react";
import { KameraView } from "@/components/KameraView";

type SearchParams = Promise<{ gagal?: string }>;

async function Kamera({ searchParams }: { searchParams: SearchParams }) {
  const { gagal } = await searchParams;
  return <KameraView gagal={gagal === "1"} />;
}

export default function FotoPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-night" />}>
      <Kamera searchParams={searchParams} />
    </Suspense>
  );
}
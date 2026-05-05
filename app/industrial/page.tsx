import Link from "next/link";
import StlViewer from "../_components/StlViewer";

export default function IndustrialPage() {
  return (
    <div className="relative min-h-screen bg-black text-white">
      <StlViewer stlPath="/industrial.stl" scale={2} />
      <div className="pointer-events-none relative z-10 flex min-h-screen flex-col items-center justify-start px-12 pt-6 pb-12">
        <Link
          href="/#choose"
          className="pointer-events-auto absolute left-6 top-6 font-die-grotesk text-sm tracking-tight text-white/70 transition-colors hover:text-white"
        >
          ← Back
        </Link>
        <h1 className="mt-6 font-die-grotesk text-lg tracking-tight">
          Industrial
        </h1>
      </div>
    </div>
  );
}

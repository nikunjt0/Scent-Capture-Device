import Link from "next/link";
import StlViewer from "../_components/StlViewer";

export default function IndustrialPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center bg-black px-12 pt-6 pb-12 text-white">
      <Link
        href="/#choose"
        className="absolute left-6 top-6 font-die-grotesk text-sm tracking-tight text-white/70 transition-colors hover:text-white"
      >
        ← Back
      </Link>
      <h1 className="mt-6 font-die-grotesk text-lg tracking-tight">
        Industrial
      </h1>
      <div className="mt-4 w-full flex-1">
        <StlViewer stlPath="/industrial.stl" scale={2} />
      </div>
    </div>
  );
}

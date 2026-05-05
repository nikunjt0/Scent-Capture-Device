import Link from "next/link";
import StlViewer from "../_components/StlViewer";

export default function PersonalPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center bg-white px-12 pt-6 pb-12 text-black">
      <Link
        href="/#choose"
        className="absolute left-6 top-6 font-die-grotesk text-sm tracking-tight text-black/50 transition-colors hover:text-black"
      >
        ← Back
      </Link>
      <h1 className="mt-6 font-die-grotesk text-lg tracking-tight">
        Personal
      </h1>
      <div className="mt-4 w-full flex-1">
      <StlViewer
        stlPath="/personal.stl"
        scale={15}
        initialRotation={[-Math.PI / 2, 0, 0]}
      />
      </div>
    </div>
  );
}

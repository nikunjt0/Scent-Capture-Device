"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center, Environment, useGLTF } from "@react-three/drei";
import {
  Color,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  type Material,
} from "three";

type Colorway = "original" | "blue-silver" | "purple-gold";

export type GlbInstanceConfig = {
  position?: [number, number, number];
  scale?: number;
  initialRotation?: [number, number, number];
  /** Per-axis rotation rate (rad/sec). Defaults emphasise z + x. */
  rotationSpeed?: [number, number, number];
  /** Sin-wave amplitude on scale (fraction of base). */
  breatheAmplitude?: number;
  /** Sin-wave speed (rad/sec). */
  breatheSpeed?: number;
  /** Phase offset so multiple instances don't pulse in lockstep. */
  breathePhase?: number;
  colorway?: Colorway;
};

// The Liam smell-device GLB has 5 named source materials. We classify them
// by name into roles so colorways can repaint the body/scroll-wheel/etc.
// independently — preserving the visual distinction between parts (screen
// shouldn't share a colour with the chassis).
type MaterialRole = "body" | "screen" | "scrollWheel" | "accent";

function classifyRole(materialName: string): MaterialRole {
  const n = materialName.toLowerCase();
  if (n.includes("glass")) return "screen";
  if (n.includes("aluminum") || n.includes("metal")) return "scrollWheel";
  if (n.includes("yellow")) return "accent";
  return "body";
}

type ColorwayMap = Record<MaterialRole, MeshPhysicalMaterial>;

function buildColorway(colorway: Colorway): ColorwayMap | null {
  if (colorway === "original") return null;
  if (colorway === "blue-silver") {
    return {
      // Glass mesh dominates visually — paint it the main blue body colour.
      body: new MeshPhysicalMaterial({
        color: new Color("#0a1430"),
        metalness: 0.25,
        roughness: 0.22,
        clearcoat: 1,
        clearcoatRoughness: 0.04,
        envMapIntensity: 1.2,
      }),
      screen: new MeshPhysicalMaterial({
        color: new Color("#1f3aa6"),
        metalness: 0.92,
        roughness: 0.18,
        clearcoat: 1,
        clearcoatRoughness: 0.06,
        envMapIntensity: 1.4,
      }),
      scrollWheel: new MeshPhysicalMaterial({
        color: new Color("#e6e9ee"),
        metalness: 1,
        roughness: 0.16,
        clearcoat: 0.7,
        clearcoatRoughness: 0.05,
        envMapIntensity: 1.5,
      }),
      accent: new MeshPhysicalMaterial({
        color: new Color("#cfd4dc"),
        metalness: 0.95,
        roughness: 0.22,
        envMapIntensity: 1.3,
      }),
    };
  }
  // purple-gold
  return {
    body: new MeshPhysicalMaterial({
      color: new Color("#1a0a2c"),
      metalness: 0.25,
      roughness: 0.22,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      envMapIntensity: 1.1,
    }),
    screen: new MeshPhysicalMaterial({
      color: new Color("#4d1c8a"),
      metalness: 0.85,
      roughness: 0.28,
      clearcoat: 0.5,
      clearcoatRoughness: 0.15,
      envMapIntensity: 1.2,
    }),
    scrollWheel: new MeshPhysicalMaterial({
      color: new Color("#d4a44a"),
      metalness: 1,
      roughness: 0.18,
      clearcoat: 0.6,
      clearcoatRoughness: 0.08,
      envMapIntensity: 1.5,
    }),
    accent: new MeshPhysicalMaterial({
      color: new Color("#e8c270"),
      metalness: 1,
      roughness: 0.22,
      envMapIntensity: 1.4,
    }),
  };
}

function GlbInstance({
  url,
  config,
}: {
  url: string;
  config: GlbInstanceConfig;
}) {
  const { scene } = useGLTF(url);
  const groupRef = useRef<Group>(null);

  const cloned = useMemo(() => {
    const c = scene.clone(true);
    const map = buildColorway(config.colorway ?? "original");
    if (map) {
      c.traverse((obj) => {
        const mesh = obj as Mesh;
        if (!mesh.isMesh) return;
        const orig = mesh.material as Material | Material[] | undefined;
        const origMat = Array.isArray(orig) ? orig[0] : orig;
        const role = classifyRole(origMat?.name ?? "");
        mesh.material = map[role];
      });
    }
    return c;
  }, [scene, config.colorway]);

  const baseScale = config.scale ?? 1;
  const speed = config.rotationSpeed ?? [0.18, 0, 0.5];
  const breatheAmp = config.breatheAmplitude ?? 0.22;
  const breatheSpd = config.breatheSpeed ?? 0.55;
  const breathePhase = config.breathePhase ?? 0;

  useFrame((state, delta) => {
    const g = groupRef.current;
    if (!g) return;
    g.rotation.x += delta * speed[0];
    g.rotation.y += delta * speed[1];
    g.rotation.z += delta * speed[2];
    const t = state.clock.elapsedTime;
    const b = 1 + breatheAmp * Math.sin(t * breatheSpd + breathePhase);
    g.scale.setScalar(baseScale * b);
  });

  return (
    <group position={config.position ?? [0, 0, 0]}>
      <Center>
        <group ref={groupRef} rotation={config.initialRotation ?? [0, 0, 0]}>
          <primitive object={cloned} />
        </group>
      </Center>
    </group>
  );
}

interface Props {
  glbPath: string;
  instances: GlbInstanceConfig[];
}

export default function GlbViewer({ glbPath, instances }: Props) {
  return (
    <div className="pointer-events-none absolute inset-0 h-full w-full">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.2} />
        {/* Key light shining from top-left. */}
        <directionalLight position={[-8, 10, 6]} intensity={2.4} />
        <directionalLight position={[6, -2, 4]} intensity={0.35} />
        <Environment preset="studio" />
        {instances.map((cfg, i) => (
          <GlbInstance key={i} url={glbPath} config={cfg} />
        ))}
      </Canvas>
    </div>
  );
}

useGLTF.preload("/liam_smell_device.glb");

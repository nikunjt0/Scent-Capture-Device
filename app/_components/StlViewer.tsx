"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Center, Environment } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { useLoader } from "@react-three/fiber";
import type { Mesh } from "three";

function RotatingModel({
  url,
  scale = 1,
  initialRotation = [0, 0, 0],
}: {
  url: string;
  scale?: number;
  initialRotation?: [number, number, number];
}) {
  const geometry = useLoader(STLLoader, url);
  const meshRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.4;
    }
  });

  return (
    <Center>
      <group rotation={[initialRotation[0], 0, initialRotation[2]]}>
        <mesh ref={meshRef} geometry={geometry} scale={scale}>
        <meshPhysicalMaterial
          color="#c0c0c0"
          metalness={0.95}
          roughness={0.12}
          clearcoat={0.4}
          clearcoatRoughness={0.1}
          envMapIntensity={1.2}
        />
        </mesh>
      </group>
    </Center>
  );
}

interface Props {
  stlPath: string;
  /** Canvas background — defaults to transparent. */
  bgColor?: string;
  /** Uniform scale multiplier for the mesh — defaults to 1. */
  scale?: number;
  /** Initial Euler rotation [x, y, z] in radians before the auto-spin. */
  initialRotation?: [number, number, number];
  /** Camera distance on the z axis — defaults to 120. */
  camZ?: number;
}

export default function StlViewer({
  stlPath,
  bgColor = "transparent",
  scale = 1,
  initialRotation = [0, 0, 0],
  camZ = 120,
}: Props) {
  return (
    <div className="absolute inset-0 h-full w-full">
      <Canvas
        camera={{ position: [0, 0, camZ], fov: 45 }}
        style={{ background: bgColor }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1.2} />
        <directionalLight position={[-10, -5, -10]} intensity={0.5} />
        <directionalLight position={[0, 10, -10]} intensity={0.3} />
        <Environment preset="studio" />
        <RotatingModel
          url={stlPath}
          scale={scale}
          initialRotation={initialRotation}
        />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}

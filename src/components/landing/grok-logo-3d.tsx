"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Environment, Sparkles } from "@react-three/drei";
import * as THREE from "three";

function GrokCore() {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);
  const ringRef3 = useRef<THREE.Mesh>(null);
  const eyeRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.15;
      meshRef.current.rotation.x = Math.sin(t * 0.3) * 0.1;
    }

    if (ringRef1.current) {
      ringRef1.current.rotation.x = t * 0.5;
      ringRef1.current.rotation.z = t * 0.2;
    }

    if (ringRef2.current) {
      ringRef2.current.rotation.y = t * 0.4;
      ringRef2.current.rotation.x = t * 0.3;
    }

    if (ringRef3.current) {
      ringRef3.current.rotation.z = t * 0.6;
      ringRef3.current.rotation.y = t * 0.15;
    }

    if (eyeRef.current) {
      eyeRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.05);
    }
  });

  const ringGeometry = useMemo(() => {
    return new THREE.TorusGeometry(1.8, 0.04, 16, 100);
  }, []);

  const innerRingGeometry = useMemo(() => {
    return new THREE.TorusGeometry(1.3, 0.03, 16, 100);
  }, []);

  const outerRingGeometry = useMemo(() => {
    return new THREE.TorusGeometry(2.3, 0.025, 16, 100);
  }, []);

  return (
    <group ref={meshRef}>
      {/* Central glowing sphere — the "eye" */}
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
        <mesh ref={eyeRef}>
          <sphereGeometry args={[0.6, 64, 64]} />
          <MeshDistortMaterial
            color="#22c55e"
            emissive="#16a34a"
            emissiveIntensity={2}
            roughness={0.1}
            metalness={0.8}
            distort={0.3}
            speed={3}
          />
        </mesh>
      </Float>

      {/* Inner glow halo */}
      <mesh>
        <sphereGeometry args={[0.75, 32, 32]} />
        <meshBasicMaterial color="#22c55e" transparent opacity={0.15} />
      </mesh>

      {/* Ring 1 — main orbital */}
      <mesh ref={ringRef1} geometry={ringGeometry}>
        <meshStandardMaterial
          color="#86efac"
          emissive="#22c55e"
          emissiveIntensity={1.5}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Ring 2 — inner orbital */}
      <mesh ref={ringRef2} geometry={innerRingGeometry} rotation={[Math.PI / 3, 0, Math.PI / 6]}>
        <meshStandardMaterial
          color="#bbf7d0"
          emissive="#86efac"
          emissiveIntensity={1.2}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Ring 3 — outer orbital */}
      <mesh ref={ringRef3} geometry={outerRingGeometry} rotation={[Math.PI / 4, Math.PI / 5, 0]}>
        <meshStandardMaterial
          color="#15803d"
          emissive="#14532d"
          emissiveIntensity={1}
          metalness={0.9}
          roughness={0.15}
        />
      </mesh>

      {/* Orbital particles */}
      <Sparkles
        count={80}
        scale={5}
        size={2}
        speed={0.4}
        color="#86efac"
      />

      {/* Accent point lights on the rings */}
      <pointLight position={[2, 0, 0]} color="#22c55e" intensity={2} distance={5} />
      <pointLight position={[-2, 0, 0]} color="#15803d" intensity={2} distance={5} />
      <pointLight position={[0, 2, 0]} color="#86efac" intensity={1.5} distance={4} />
    </group>
  );
}

function Particles() {
  const count = 200;

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return geo;
  }, []);

  const ref = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.02;
      ref.current.rotation.x = state.clock.getElapsedTime() * 0.01;
    }
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={0.03}
        color="#15803d"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

export function GrokLogo3D() {
  return (
    <div className="w-full h-[500px] md:h-[600px] relative">
      {/* Glow backdrop */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-full bg-green-500/20 blur-[100px]" />
      </div>

      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={0.5} />

        <GrokCore />
        <Particles />

        <Environment preset="night" />
      </Canvas>
    </div>
  );
}

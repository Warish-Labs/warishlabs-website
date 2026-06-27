'use client';

import React, { Suspense, useEffect, useState, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import HeroCube from './HeroCube';
import * as THREE from 'three';

function RotatingStars({ particles }: { particles: Float32Array }) {
  const pointsRef = useRef<THREE.Points>(null);
  
  useFrame((state) => {
    if (pointsRef.current) {
      // Slow rotation for dynamic background feeling
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.015;
      pointsRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.05) * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#3B82F6"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}

export default function HeroCanvas() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate random particle positions (memoized to prevent recalculation)
  const particles = useMemo(() => {
    const count = 150;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 14; // Spread particles wider
    }
    return positions;
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black">
        {/* Simple placeholder logo glow while Canvas mounts */}
        <div className="w-24 h-24 rounded-xl border border-accent/20 bg-bg-card flex items-center justify-center animate-pulse glow-accent-element">
          <span className="text-2xl font-bold text-accent font-mono">&gt;_</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 2]} // Cap pixel ratio to max 2 for performance
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          {/* Lighting Rig */}
          <ambientLight intensity={0.25} />
          <pointLight position={[3, 3, 3]} intensity={3.0} color="#3B82F6" distance={12} decay={2} />
          <pointLight position={[-3, -3, 2]} intensity={0.8} color="#FFFFFF" distance={10} decay={2} />
          <directionalLight position={[0, 5, -2]} intensity={0.4} color="#1D4ED8" />

          {/* Interactive Core Cube & Orbital System */}
          <HeroCube />

          {/* Background Rotating Star Particle Field */}
          <RotatingStars particles={particles} />
        </Suspense>
      </Canvas>
    </div>
  );
}

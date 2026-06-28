'use client';

import React, { Suspense, useEffect, useState, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import HeroCube from './HeroCube';
import * as THREE from 'three';

function MouseReactiveParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 320;
  
  const [initialPositions, currentPositions, velocities] = useMemo(() => {
    const init = new Float32Array(count * 3);
    const curr = new Float32Array(count * 3);
    const vels = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Wider distribution in 3D space
      const x = (Math.random() - 0.5) * 16;
      const y = (Math.random() - 0.5) * 12;
      const z = (Math.random() - 0.5) * 6;
      
      init[i * 3] = x;
      init[i * 3 + 1] = y;
      init[i * 3 + 2] = z;
      
      curr[i * 3] = x;
      curr[i * 3 + 1] = y;
      curr[i * 3 + 2] = z;
      
      vels[i * 3] = 0;
      vels[i * 3 + 1] = 0;
      vels[i * 3 + 2] = 0;
    }
    return [init, curr, vels];
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const geom = pointsRef.current.geometry;
    const posAttr = geom.getAttribute('position') as THREE.BufferAttribute;
    
    // Scale normalized mouse coords [-1, 1] to roughly match 3D projection plane bounds
    const mouseX = state.pointer.x * 5.5;
    const mouseY = state.pointer.y * 4.0;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const x = posAttr.array[idx];
      const y = posAttr.array[idx + 1];

      const dx = x - mouseX;
      const dy = y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Repulsion force
      if (dist < 2.5) {
        const force = (2.5 - dist) * 0.06;
        const angle = Math.atan2(dy, dx);
        velocities[idx] += Math.cos(angle) * force;
        velocities[idx + 1] += Math.sin(angle) * force;
      }

      // Return to home position spring force
      const homeX = initialPositions[idx];
      const homeY = initialPositions[idx + 1];
      
      velocities[idx] += (homeX - x) * 0.025;
      velocities[idx + 1] += (homeY - y) * 0.025;

      // Apply drag
      velocities[idx] *= 0.88;
      velocities[idx + 1] *= 0.88;

      // Update position arrays
      posAttr.array[idx] += velocities[idx];
      posAttr.array[idx + 1] += velocities[idx + 1];
    }
    
    posAttr.needsUpdate = true;
    
    // Slow rotational drift of entire particle system
    pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.008;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[currentPositions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.055}
        color="#3B82F6"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function BackgroundDust() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 200;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      arr[i] = (Math.random() - 0.5) * 20;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = -state.clock.getElapsedTime() * 0.004;
      pointsRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.015) * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#1D4ED8"
        transparent
        opacity={0.3}
        sizeAttenuation
      />
    </points>
  );
}

export default function HeroCanvas() {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const linePositions = useMemo(() => {
    const points = new Float32Array(18 * 2 * 3);
    for (let i = 0; i < 18; i++) {
      const x1 = (Math.random() - 0.5) * 16;
      const y1 = (Math.random() - 0.5) * 12;
      const z1 = -3 - Math.random() * 4;

      const x2 = x1 + (Math.random() - 0.5) * 2.0;
      const y2 = y1 + (Math.random() - 0.5) * 2.0;
      const z2 = z1 + (Math.random() - 0.5) * 2.0;

      const idx = i * 6;
      points[idx] = x1;
      points[idx + 1] = y1;
      points[idx + 2] = z1;
      points[idx + 3] = x2;
      points[idx + 4] = y2;
      points[idx + 5] = z2;
    }
    return points;
  }, []);

  if (!mounted || isMobile) {
    return null; // Fallback handled by parent HeroSection
  }

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-0">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          {/* Lighting Rig */}
          <ambientLight intensity={0.2} />
          <pointLight position={[4, 4, 4]} intensity={2.8} color="#2563EB" distance={15} decay={2} />
          <pointLight position={[-5, -3, 2]} intensity={0.8} color="#FFFFFF" distance={12} decay={2} />
          <pointLight position={[0, 6, -3]} intensity={1.5} color="#1D4ED8" distance={15} decay={2} />
          <directionalLight position={[0, 5, -2]} intensity={0.4} color="#3B82F6" />

          {/* Interactive Core Cube & Orbital System */}
          <HeroCube />

          {/* Particle layers */}
          <MouseReactiveParticles />
          <BackgroundDust />

          {/* Connection Lines */}
          <lineSegments>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[linePositions, 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#3B82F6" transparent opacity={0.08} />
          </lineSegments>
        </Suspense>
      </Canvas>
    </div>
  );
}

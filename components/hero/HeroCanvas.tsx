'use client';

import React, { Suspense, useEffect, useState, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import HeroCube from './HeroCube';
import * as THREE from 'three';

function MouseReactiveParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 320;

  // 1. Initial positions are created with useMemo (pure, no mutation)
  const initialPositions = useMemo(() => {
    let seed = 100;
    const rnd = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };
    const init = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const x = (rnd() - 0.5) * 16;
      const y = (rnd() - 0.5) * 12;
      const z = (rnd() - 0.5) * 6;
      
      init[i * 3] = x;
      init[i * 3 + 1] = y;
      init[i * 3 + 2] = z;
    }
    return init;
  }, []);

  // 2. velocitiesRef is populated after mount (outside render)
  const velocitiesRef = useRef<Float32Array | null>(null);

  useEffect(() => {
    velocitiesRef.current = new Float32Array(count * 3);
  }, []);

  useFrame((state) => {
    if (!pointsRef.current || !velocitiesRef.current) return;
    const geom = pointsRef.current.geometry;
    const posAttr = geom.getAttribute('position') as THREE.BufferAttribute;
    const velocities = velocitiesRef.current;
    
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
          args={[initialPositions, 3]}
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
    let seed = 200;
    const rnd = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      arr[i] = (rnd() - 0.5) * 20;
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

function CanvasCleanup() {
  const { gl, scene } = useThree();
  useEffect(() => {
    return () => {
      scene?.traverse?.((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) {
          mesh.geometry.dispose();
        }
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat) => {
              if (mat && typeof mat.dispose === 'function') mat.dispose();
            });
          } else {
            if (mesh.material && typeof mesh.material.dispose === 'function') {
              mesh.material.dispose();
            }
          }
        }
      });
      gl?.dispose?.();
    };
  }, [gl, scene]);
  return null;
}

export default function HeroCanvas() {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const linePositions = useMemo(() => {
    let seed = 300;
    const rnd = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };
    const points = new Float32Array(18 * 2 * 3);
    for (let i = 0; i < 18; i++) {
      const x1 = (rnd() - 0.5) * 16;
      const y1 = (rnd() - 0.5) * 12;
      const z1 = -3 - rnd() * 4;

      const x2 = x1 + (rnd() - 0.5) * 2.0;
      const y2 = y1 + (rnd() - 0.5) * 2.0;
      const z2 = z1 + (rnd() - 0.5) * 2.0;

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
    <CanvasErrorBoundary>
      <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-0">
        <Canvas
          camera={{ position: [0, 0, 6], fov: 50 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          frameloop="always"
        >
          <CanvasCleanup />
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
    </CanvasErrorBoundary>
  );
}

class CanvasErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[CanvasErrorBoundary] Caught R3F rendering crash:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 bg-[#020b1a] flex items-center justify-center opacity-60">
          <div className="absolute inset-0 blueprint-grid opacity-[0.03] pointer-events-none" />
        </div>
      );
    }
    return this.props.children;
  }
}

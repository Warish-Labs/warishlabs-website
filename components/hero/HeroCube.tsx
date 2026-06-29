'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';

export default function HeroCube() {
  const outerGroupRef = useRef<THREE.Group>(null);
  const coreCubeRef = useRef<THREE.Mesh>(null);
  const innerOctaRef = useRef<THREE.Mesh>(null);
  const gridRef = useRef<THREE.GridHelper>(null);
  
  const shardRefs = useRef<(THREE.Mesh | null)[]>([]);
  const ringRefs = useRef<(THREE.Mesh | null)[]>([]);
  const nodeRefs = useRef<(THREE.Mesh | null)[]>([]);

  // 1. Shards Setup (8 scattered floating wireframe shards)
  const shardsData = useMemo(() => {
    return Array.from({ length: 8 }).map((_, idx) => {
      const isLeft = idx < 4;
      // Position them on the sides to not block the core
      const x = isLeft ? -4.8 - Math.random() * 1.5 : 4.8 + Math.random() * 1.5;
      const y = (Math.random() - 0.5) * 5;
      const z = -1.5 - Math.random() * 2.5;
      const size = 0.12 + Math.random() * 0.15;
      const speed = 0.3 + Math.random() * 0.5;
      const phase = Math.random() * Math.PI * 2;
      const rotSpeed = [
        (Math.random() - 0.5) * 0.8,
        (Math.random() - 0.5) * 0.8,
        (Math.random() - 0.5) * 0.8
      ];
      return { x, y, z, size, speed, phase, rotSpeed };
    });
  }, []);

  // 2. Data Nodes Setup (4 orbiting glowing nodes)
  const nodesData = useMemo(() => {
    return [
      { radius: 2.3, speed: 0.7, phase: 0, size: 0.18, color: '#3B82F6' },
      { radius: 2.8, speed: -0.5, phase: Math.PI / 2, size: 0.14, color: '#60A5FA' },
      { radius: 3.3, speed: 0.4, phase: Math.PI, size: 0.16, color: '#93C5FD' },
      { radius: 3.9, speed: -0.3, phase: (3 * Math.PI) / 2, size: 0.12, color: '#2563EB' },
    ];
  }, []);

  // 3. Orbital Rings Radii (4 rings)
  const ringsData = useMemo(() => {
    return [
      { radius: 2.5, rotX: Math.PI / 6, rotZ: Math.PI / 8 },
      { radius: 3.0, rotX: -Math.PI / 4, rotZ: -Math.PI / 6 },
      { radius: 3.6, rotX: Math.PI / 3, rotZ: Math.PI / 12 },
      { radius: 4.2, rotX: -Math.PI / 3, rotZ: Math.PI / 4 },
    ];
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // A. Smooth Mouse Tilt via Lerp
    if (outerGroupRef.current) {
      const targetX = -state.pointer.y * 0.22;
      const targetY = state.pointer.x * 0.28;
      
      outerGroupRef.current.rotation.x += (targetX - outerGroupRef.current.rotation.x) * 0.04;
      outerGroupRef.current.rotation.y += (targetY - outerGroupRef.current.rotation.y) * 0.04;
    }

    // B. Core Glass Cube & Inner Octahedron counter-rotation
    if (coreCubeRef.current) {
      coreCubeRef.current.rotation.y = time * 0.15;
      coreCubeRef.current.rotation.z = Math.sin(time * 0.2) * 0.1;
    }
    if (innerOctaRef.current) {
      innerOctaRef.current.rotation.y = -time * 0.3;
      innerOctaRef.current.rotation.x = time * 0.15;
    }

    // C. LatticeGrid Z-drift animation
    if (gridRef.current) {
      gridRef.current.position.z = (time * 0.7) % 2;
      const mat = gridRef.current.material as THREE.LineBasicMaterial;
      if (mat) {
        mat.transparent = true;
        mat.opacity = 0.07;
      }
    }

    // D. Floating Shards rotation & motion
    shardsData.forEach((shard, idx) => {
      const mesh = shardRefs.current[idx];
      if (mesh) {
        mesh.position.y = shard.y + Math.sin(time * shard.speed + shard.phase) * 0.5;
        mesh.rotation.x += shard.rotSpeed[0] * 0.015;
        mesh.rotation.y += shard.rotSpeed[1] * 0.015;
        mesh.rotation.z += shard.rotSpeed[2] * 0.015;
      }
    });

    // E. Orbital Rings slow spinning
    ringsData.forEach((_, idx) => {
      const mesh = ringRefs.current[idx];
      if (mesh) {
        const speed = (idx + 1) * 0.03;
        const dir = idx % 2 === 0 ? 1 : -1;
        mesh.rotation.z = time * speed * dir;
      }
    });

    // F. Orbiting Data Nodes paths
    nodesData.forEach((node, idx) => {
      const mesh = nodeRefs.current[idx];
      if (mesh) {
        const angle = time * node.speed + node.phase;
        mesh.position.x = Math.cos(angle) * node.radius;
        mesh.position.z = Math.sin(angle) * node.radius;
        mesh.position.y = Math.sin(time * 0.6 + node.phase) * 0.6;
        mesh.rotation.x = time * 0.4;
        mesh.rotation.y = time * 0.6;
      }
    });
  });

  return (
    <group ref={outerGroupRef} position={[1.5, 0, 0]}>
      {/* 1. Core Glass Cube */}
      <mesh ref={coreCubeRef} castShadow>
        <boxGeometry args={[2.0, 2.0, 2.0]} />
        <meshPhysicalMaterial
          color="#030712"
          metalness={0.98}
          roughness={0.05}
          transmission={0.5}
          thickness={0.8}
          transparent
          opacity={0.85}
          emissive="#1D4ED8"
          emissiveIntensity={0.35}
        />
        <Edges
          scale={1.0}
          threshold={15}
          color="#3B82F6"
          lineWidth={2.0}
        />
      </mesh>

      {/* 2. Inner Counter-Rotating Octahedron */}
      <mesh ref={innerOctaRef}>
        <octahedronGeometry args={[0.7, 0]} />
        <meshBasicMaterial
          color="#60A5FA"
          wireframe
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* 3. Lattice Grid floor (scrolling ground plane) */}
      <gridHelper
        ref={gridRef}
        args={[35, 35, '#1D4ED8', '#1F1F1F']}
        position={[0, -3.5, 0]}
      />

      {/* 4. Orbital Rings */}
      {ringsData.map((ring, idx) => (
        <mesh
          key={`ring-${idx}`}
          ref={(el) => { ringRefs.current[idx] = el; }}
          rotation={[ring.rotX, 0, ring.rotZ]}
        >
          <torusGeometry args={[ring.radius, 0.012, 8, 64]} />
          <meshBasicMaterial
            color="#2563EB"
            transparent
            opacity={0.25 - idx * 0.04}
          />
        </mesh>
      ))}

      {/* 5. Orbiting Data Nodes */}
      {nodesData.map((node, idx) => (
        <mesh
          key={`node-${idx}`}
          ref={(el) => { nodeRefs.current[idx] = el; }}
        >
          <octahedronGeometry args={[node.size, 0]} />
          <meshPhysicalMaterial
            color={node.color}
            roughness={0.1}
            metalness={0.9}
            emissive={node.color}
            emissiveIntensity={0.6}
          />
          <Edges
            scale={1.0}
            threshold={15}
            color="#93C5FD"
            lineWidth={1.0}
          />
        </mesh>
      ))}

      {/* 6. Floating Shards (in parent group coordinate coordinates) */}
      {shardsData.map((shard, idx) => (
        <mesh
          key={`shard-${idx}`}
          ref={(el) => { shardRefs.current[idx] = el; }}
          position={[shard.x, shard.y, shard.z]}
        >
          <boxGeometry args={[shard.size, shard.size, shard.size]} />
          <meshBasicMaterial
            color="#2563EB"
            wireframe
            transparent
            opacity={0.18}
          />
        </mesh>
      ))}
    </group>
  );
}

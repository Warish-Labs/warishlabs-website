'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';

export default function HeroCube() {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const node1Ref = useRef<THREE.Mesh>(null);
  const node2Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const group = groupRef.current;
    const mesh = meshRef.current;
    
    if (group) {
      // 1. Idle rotational movements & breathing float
      const idleX = Math.sin(time * 0.3) * 0.08;
      const idleY = time * 0.12;
      const floatY = Math.sin(time * 0.5) * 0.12;

      // 2. Mouse-guided tilt coordinates (lerped for responsive drag feeling)
      const mousePitch = -state.pointer.y * 0.25; // Maximum tilt rotation
      const mouseYaw = state.pointer.x * 0.3;

      // 3. Smooth interpolation (lerp) toward target rotations
      group.rotation.x += (mousePitch + idleX - group.rotation.x) * 0.05;
      group.rotation.y += (mouseYaw + idleY - group.rotation.y) * 0.05;
      group.position.y += (floatY - group.position.y) * 0.05;
    }

    if (mesh) {
      // Rotate the core cube counter to the group for complex kinetic look
      mesh.rotation.y = -time * 0.08;
      mesh.rotation.z = time * 0.05;
    }

    // Outer Orbital Rings Rotations
    if (ringRef.current) {
      ringRef.current.rotation.x = time * 0.2;
      ringRef.current.rotation.y = time * 0.15;
    }
    
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = -time * 0.15;
      ring2Ref.current.rotation.y = time * 0.3;
    }

    // Orbiting Node 1
    if (node1Ref.current) {
      const radius = 2.4;
      node1Ref.current.position.x = Math.cos(time * 0.6) * radius;
      node1Ref.current.position.z = Math.sin(time * 0.6) * radius;
      node1Ref.current.position.y = Math.sin(time * 0.3) * 0.4;
      node1Ref.current.rotation.x = time * 0.4;
      node1Ref.current.rotation.y = time * 0.5;
    }

    // Orbiting Node 2
    if (node2Ref.current) {
      const radius = 2.8;
      node2Ref.current.position.x = Math.sin(time * 0.5 + Math.PI) * radius;
      node2Ref.current.position.z = Math.cos(time * 0.5 + Math.PI) * radius;
      node2Ref.current.position.y = Math.cos(time * 0.4) * 0.6;
      node2Ref.current.rotation.y = time * 0.3;
      node2Ref.current.rotation.z = time * 0.6;
    }
  });

  return (
    <group ref={groupRef}>
      {/* 1. Interactive Core Glass Cube */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={[1.8, 1.8, 1.8]} />
        <meshPhysicalMaterial
          color="#050505"
          metalness={0.95}
          roughness={0.05}
          transmission={0.4}
          thickness={0.6}
          transparent
          opacity={0.88}
          emissive="#1D4ED8"
          emissiveIntensity={0.3}
        />
        <Edges
          scale={1.0}
          threshold={15}
          color="#3B82F6"
          lineWidth={1.5}
        />
      </mesh>

      {/* 2. Primary Orbital Wireframe Ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[2.1, 0.015, 8, 64]} />
        <meshBasicMaterial color="#2563EB" opacity={0.4} transparent />
      </mesh>

      {/* 3. Secondary Diagonal Orbital Wireframe Ring */}
      <mesh ref={ring2Ref} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[2.5, 0.01, 8, 64]} />
        <meshBasicMaterial color="#3B82F6" opacity={0.25} transparent />
      </mesh>

      {/* 4. Orbiting Node 1 - Small Tech Cube */}
      <mesh ref={node1Ref}>
        <boxGeometry args={[0.25, 0.25, 0.25]} />
        <meshPhysicalMaterial
          color="#1D4ED8"
          roughness={0.1}
          metalness={0.8}
          emissive="#2563EB"
          emissiveIntensity={0.5}
        />
        <Edges
          scale={1.0}
          threshold={15}
          color="#60A5FA"
          lineWidth={1.0}
        />
      </mesh>

      {/* 5. Orbiting Node 2 - Tiny Glow Sphere */}
      <mesh ref={node2Ref}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color="#60A5FA" />
      </mesh>
    </group>
  );
}

'use client';

import { RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

/** Tapered blade planform, extruded a few centimetres thick. */
function makeBladeGeometry(len: number) {
  const s = new THREE.Shape();
  s.moveTo(-0.14, 0.2);
  s.lineTo(0.36, 0.2);
  s.bezierCurveTo(0.42, 1.2, 0.3, 3.2, 0.1, len); // trailing edge → tip
  s.lineTo(0.03, len);
  s.bezierCurveTo(-0.12, 4.0, -0.22, 1.6, -0.14, 0.2); // leading edge → root
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.07, bevelEnabled: false, steps: 1 });
  g.translate(0, 0, -0.035);
  return g;
}

type Props = {
  position?: [number, number, number];
  scale?: number;
  /** radians per second — kept slow and heavy, like a real turbine */
  speed?: number;
  phase?: number;
  /** rotate the whole turbine around Y so far-away ones don't all face one way */
  yaw?: number;
  hero?: boolean;
};

/** A white three-blade wind turbine. Blades never stop rotating. */
export default function WindmillModel({ position = [0, 0, 0], scale = 1, speed = 0.9, phase = 0, yaw = 0, hero = false }: Props) {
  const rotor = useRef<THREE.Group>(null);
  const beacon = useRef<THREE.MeshStandardMaterial>(null);
  const blade = useMemo(() => makeBladeGeometry(7.4), []);

  const white = useMemo(() => new THREE.MeshStandardMaterial({ color: '#f3f3f0', roughness: 0.42, metalness: 0.05 }), []);
  const grey = useMemo(() => new THREE.MeshStandardMaterial({ color: '#8d9096', roughness: 0.6, metalness: 0.3 }), []);
  const orange = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ff6b00', roughness: 0.5, metalness: 0.1 }), []);

  useFrame((state, dt) => {
    if (rotor.current) rotor.current.rotation.z = phase - state.clock.elapsedTime * speed;
    if (beacon.current) beacon.current.emissiveIntensity = Math.sin(state.clock.elapsedTime * 3 + phase) > 0.2 ? 4 : 0.2;
    void dt;
  });

  return (
    <group position={position} scale={scale} rotation={[0, yaw, 0]}>
      {/* foundation + tower */}
      <mesh position={[0, 0.18, 0]} material={grey}>
        <cylinderGeometry args={[0.72, 0.86, 0.36, 24]} />
      </mesh>
      <mesh position={[0, 7.2, 0]} material={white}>
        <cylinderGeometry args={[0.14, 0.3, 14, 28]} />
      </mesh>
      {/* REUDE orange band */}
      <mesh position={[0, 1.7, 0]} material={orange}>
        <cylinderGeometry args={[0.285, 0.292, 0.32, 28]} />
      </mesh>
      {hero && (
        <mesh position={[0, 0.9, 0.29]} material={grey}>
          <boxGeometry args={[0.34, 1.1, 0.06]} />
        </mesh>
      )}

      {/* nacelle */}
      <RoundedBox args={[0.82, 0.86, 2.5]} radius={0.14} smoothness={3} position={[0, 14.15, 0.1]} material={white} />
      <mesh position={[0, 14.7, -0.55]}>
        <sphereGeometry args={[0.07, 10, 10]} />
        <meshStandardMaterial ref={beacon} color="#330000" emissive="#ff1a00" emissiveIntensity={2} toneMapped={false} />
      </mesh>

      {/* rotor */}
      <group ref={rotor} position={[0, 14.15, 1.45]}>
        <mesh position={[0, 0, 0.18]} rotation={[Math.PI / 2, 0, 0]} material={white}>
          <coneGeometry args={[0.44, 0.95, 28]} />
        </mesh>
        <mesh position={[0, 0, -0.1]} rotation={[Math.PI / 2, 0, 0]} material={grey}>
          <cylinderGeometry args={[0.4, 0.4, 0.3, 24]} />
        </mesh>
        {[0, 1, 2].map((i) => (
          <group key={i} rotation={[0, 0, (i * Math.PI * 2) / 3]}>
            <mesh geometry={blade} material={white} rotation={[0, 0.13, 0]} />
            <mesh position={[0.05, 7.2, 0]} rotation={[0, 0.13, 0]} material={orange}>
              <boxGeometry args={[0.22, 0.42, 0.085]} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

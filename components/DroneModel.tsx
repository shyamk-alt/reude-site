'use client';

import { RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

const ARMS: { dx: number; dz: number; dir: 1 | -1 }[] = [
  { dx: 1, dz: 1, dir: 1 },
  { dx: -1, dz: 1, dir: -1 },
  { dx: 1, dz: -1, dir: -1 },
  { dx: -1, dz: -1, dir: 1 },
];

type Props = { groupRef: React.Ref<THREE.Group>; reduced?: boolean };

/**
 * REUDE Stingraey — built from primitives: black airframe, orange accents,
 * four spinning props with a blur disc, a gimbal camera that pans, a GAPs
 * gripper under the belly and blinking orange arm-tip LEDs.
 */
export default function DroneModel({ groupRef, reduced = false }: Props) {
  const props = useRef<(THREE.Group | null)[]>([]);
  const leds = useRef<(THREE.Mesh | null)[]>([]);
  const gimbal = useRef<THREE.Group>(null);
  const glow = useRef<THREE.PointLight>(null);

  const black = useMemo(() => new THREE.MeshStandardMaterial({ color: '#0f1013', roughness: 0.34, metalness: 0.65 }), []);
  const carbon = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1a1b20', roughness: 0.55, metalness: 0.35 }), []);
  const orange = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ff6b00', roughness: 0.4, metalness: 0.2 }), []);
  const steel = useMemo(() => new THREE.MeshStandardMaterial({ color: '#b9bcc4', roughness: 0.25, metalness: 0.9 }), []);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const spin = reduced ? 14 : 46;
    ARMS.forEach((arm, i) => {
      const p = props.current[i];
      if (p) p.rotation.y += dt * spin * arm.dir;
      const led = leds.current[i];
      if (led) {
        const on = Math.sin(t * 7 + i * 1.6) > -0.2 ? 1 : 0.25;
        led.scale.setScalar(0.7 + on * 0.9);
      }
    });
    if (gimbal.current) {
      gimbal.current.rotation.y = Math.sin(t * 0.8) * 0.65;
      gimbal.current.rotation.x = -0.55 + Math.sin(t * 0.55) * 0.18;
    }
    if (glow.current) glow.current.intensity = 5 + Math.sin(t * 6) * 1.5;
  });

  return (
    <group ref={groupRef} scale={1.15}>
      {/* body + shell */}
      <RoundedBox args={[0.96, 0.27, 0.62]} radius={0.07} smoothness={4} material={black} />
      <RoundedBox args={[0.58, 0.2, 0.44]} radius={0.07} smoothness={4} position={[0, 0.2, -0.02]} material={carbon} />
      <mesh position={[0, 0.311, -0.02]} material={orange}>
        <boxGeometry args={[0.46, 0.014, 0.09]} />
      </mesh>
      {/* antennas */}
      {[-0.17, 0.17].map((x) => (
        <mesh key={x} position={[x, 0.46, -0.16]} material={carbon}>
          <cylinderGeometry args={[0.012, 0.012, 0.42, 8]} />
        </mesh>
      ))}

      {/* arms, motors, props, LEDs */}
      {ARMS.map((arm, i) => {
        const yaw = -Math.atan2(arm.dz, arm.dx);
        return (
          <group key={i} rotation={[0, yaw, 0]}>
            <mesh position={[0.52, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={carbon}>
              <cylinderGeometry args={[0.032, 0.042, 1.02, 10]} />
            </mesh>
            {/* motor */}
            <mesh position={[1.04, 0.05, 0]} material={black}>
              <cylinderGeometry args={[0.095, 0.105, 0.14, 18]} />
            </mesh>
            <mesh position={[1.04, 0.125, 0]} material={orange}>
              <cylinderGeometry args={[0.07, 0.07, 0.03, 18]} />
            </mesh>
            {/* spinning blades + blur disc */}
            <group position={[1.04, 0.2, 0]}>
              <group ref={(el) => void (props.current[i] = el)}>
                <mesh material={carbon}>
                  <boxGeometry args={[1.0, 0.012, 0.075]} />
                </mesh>
                <mesh position={[0.5, 0, 0]} material={orange}>
                  <boxGeometry args={[0.04, 0.014, 0.077]} />
                </mesh>
                <mesh position={[-0.5, 0, 0]} material={orange}>
                  <boxGeometry args={[0.04, 0.014, 0.077]} />
                </mesh>
              </group>
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.52, 40]} />
                <meshBasicMaterial color="#ffd9b0" transparent opacity={reduced ? 0.06 : 0.14} side={THREE.DoubleSide} depthWrite={false} />
              </mesh>
            </group>
            {/* arm-tip LED */}
            <mesh ref={(el) => void (leds.current[i] = el)} position={[1.04, -0.05, 0.1]}>
              <sphereGeometry args={[0.04, 10, 10]} />
              <meshBasicMaterial color={[4.5, 1.7, 0]} toneMapped={false} />
            </mesh>
          </group>
        );
      })}

      {/* gimbal camera */}
      <group position={[0, -0.17, 0.3]}>
        <group ref={gimbal}>
          <mesh material={black}>
            <sphereGeometry args={[0.11, 18, 18]} />
          </mesh>
          <mesh position={[0, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]} material={steel}>
            <cylinderGeometry args={[0.052, 0.058, 0.1, 14]} />
          </mesh>
          <mesh position={[0, 0, 0.152]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.04, 16]} />
            <meshBasicMaterial color={[0.1, 0.5, 1.6]} toneMapped={false} />
          </mesh>
        </group>
      </group>

      {/* GAPs gripper under the belly */}
      <group position={[0, -0.3, -0.04]}>
        <mesh material={steel}>
          <cylinderGeometry args={[0.17, 0.2, 0.2, 24]} />
        </mesh>
        <mesh position={[0, -0.12, 0]} rotation={[Math.PI / 2, 0, 0]} material={orange}>
          <torusGeometry args={[0.2, 0.025, 10, 28]} />
        </mesh>
      </group>

      {/* landing gear */}
      {[-0.4, 0.4].map((x) => (
        <group key={x}>
          <mesh position={[x, -0.62, 0]} rotation={[Math.PI / 2, 0, 0]} material={carbon}>
            <cylinderGeometry args={[0.022, 0.022, 1.0, 8]} />
          </mesh>
          {[-0.34, 0.34].map((z) => (
            <mesh key={z} position={[x * 0.9, -0.33, z]} rotation={[0, 0, x > 0 ? -0.12 : 0.12]} material={carbon}>
              <cylinderGeometry args={[0.016, 0.016, 0.62, 8]} />
            </mesh>
          ))}
        </group>
      ))}

      <pointLight ref={glow} position={[0, -0.5, 0]} color="#ff6b00" intensity={5} distance={7} decay={2} />
    </group>
  );
}

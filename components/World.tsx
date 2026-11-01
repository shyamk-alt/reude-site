'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import WindmillModel from './WindmillModel';

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Direction of the setting sun (behind the windmill from the default view). */
export const SUN_DIR = new THREE.Vector3(-0.36, 0.1, -0.93).normalize();
export const HAZE = '#f3b277';

type InstanceFn = (i: number, o: THREE.Object3D, c: THREE.Color) => void;

function useInstances(count: number, fn: InstanceFn) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      o.position.set(0, 0, 0);
      o.rotation.set(0, 0, 0);
      o.scale.set(1, 1, 1);
      c.set('#ffffff');
      fn(i, o, c);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
      mesh.setColorAt(i, c);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);
  return ref;
}

/* ------------------------------------------------------------------ */
/* sky, sun, light                                                      */
/* ------------------------------------------------------------------ */

export function Sky() {
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          top: { value: new THREE.Color('#10183a') },
          mid: { value: new THREE.Color('#d9602b') },
          low: { value: new THREE.Color(HAZE) },
        },
        vertexShader: /* glsl */ `
          varying vec3 vDir;
          void main() {
            vDir = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 top; uniform vec3 mid; uniform vec3 low;
          varying vec3 vDir;
          void main() {
            float h = clamp(vDir.y, 0.0, 1.0);
            vec3 c = mix(low, mid, smoothstep(0.0, 0.22, h));
            c = mix(c, top, smoothstep(0.18, 0.85, h));
            gl_FragColor = vec4(c, 1.0);
            #include <colorspace_fragment>
          }`,
      }),
    [],
  );
  useFrame(({ camera }) => {
    mesh.current?.position.copy(camera.position);
  });
  return (
    <mesh ref={mesh} material={mat} renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[900, 32, 16]} />
    </mesh>
  );
}

export function Sun() {
  const ref = useRef<THREE.Sprite>(null);
  const map = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d')!;
    const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(0.12, 'rgba(255,226,170,0.95)');
    gr.addColorStop(0.38, 'rgba(255,150,70,0.38)');
    gr.addColorStop(1, 'rgba(255,100,20,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  useFrame(({ camera }) => {
    ref.current?.position.copy(camera.position).addScaledVector(SUN_DIR, 760);
  });
  return (
    <sprite ref={ref} scale={[420, 420, 1]} renderOrder={-9}>
      <spriteMaterial map={map} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} toneMapped={false} transparent />
    </sprite>
  );
}

export function Lights() {
  return (
    <>
      <ambientLight intensity={0.55} color="#ffd9b8" />
      <hemisphereLight args={['#ffd7a8', '#3a4d2a', 0.95]} />
      <directionalLight position={[SUN_DIR.x * 120, SUN_DIR.y * 120 + 30, SUN_DIR.z * 120]} intensity={3.1} color="#ffb067" />
      <directionalLight position={[40, 26, 60]} intensity={0.9} color="#a9bfff" />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* terrain                                                              */
/* ------------------------------------------------------------------ */

export function Ground() {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(1000, 640, 120, 76);
    g.rotateX(-Math.PI / 2);
    g.translate(150, 0, 0);
    const pos = g.attributes.position;
    const col = new Float32Array(pos.count * 3);
    const a = new THREE.Color('#3f7a2c');
    const b = new THREE.Color('#8c9c3a');
    const c = new THREE.Color('#2b5a22');
    const tmp = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const n = 0.5 + 0.5 * Math.sin(x * 0.045 + Math.cos(z * 0.06) * 2.1) * Math.cos(z * 0.052 - x * 0.012);
      const m = 0.5 + 0.5 * Math.sin(x * 0.11 + z * 0.09);
      tmp.copy(a).lerp(b, THREE.MathUtils.smoothstep(n, 0.45, 0.95)).lerp(c, m * 0.35);
      col[i * 3] = tmp.r;
      col[i * 3 + 1] = tmp.g;
      col[i * 3 + 2] = tmp.b;
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return g;
  }, []);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial vertexColors roughness={0.95} metalness={0} />
    </mesh>
  );
}

export function Mountains() {
  const items = useMemo(() => {
    const r = rng(7);
    const out: { p: [number, number, number]; s: [number, number, number]; c: string }[] = [];
    // ring around the windmill
    for (let i = 0; i < 22; i++) {
      const a = (i / 22) * Math.PI * 2 + r() * 0.2;
      const d = 270 + r() * 60;
      const h = 26 + r() * 46;
      const px = Math.cos(a) * d;
      const pz = Math.sin(a) * d;
      const sx = 34 + r() * 40;
      const sz = 34 + r() * 40;
      if (px > 140 && Math.abs(pz) < 130) continue; // keep the flight corridor clear
      out.push({ p: [px, h / 2 - 1, pz], s: [sx, h, sz], c: i % 3 ? '#4a4d6a' : '#5b4f63' });
    }
    // two ranges flanking the flight corridor
    for (let x = 60; x <= 560; x += 46) {
      for (const side of [-1, 1]) {
        const h = 22 + r() * 40;
        out.push({ p: [x + r() * 20, h / 2 - 1, side * (255 + r() * 45)], s: [38 + r() * 30, h, 36 + r() * 24], c: '#4f5273' });
      }
    }
    return out;
  }, []);
  return (
    <group>
      {items.map((m, i) => (
        <mesh key={i} position={m.p} scale={m.s}>
          <coneGeometry args={[0.5, 1, 5]} />
          <meshStandardMaterial color={m.c} roughness={1} flatShading />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* atmosphere                                                           */
/* ------------------------------------------------------------------ */

export function Clouds({ count = 16 }: { count?: number }) {
  const group = useRef<THREE.Group>(null);
  const clouds = useMemo(() => {
    const r = rng(21);
    return Array.from({ length: count }, () => ({
      x: -120 + r() * 660,
      y: 46 + r() * 36,
      z: -170 + r() * 340,
      s: 5 + r() * 7,
      puffs: Array.from({ length: 6 }, () => ({ x: (r() - 0.5) * 2.4, y: (r() - 0.3) * 0.5, z: (r() - 0.5) * 1.1, s: 0.55 + r() * 0.7 })),
      speed: 0.9 + r() * 1.4,
    }));
  }, [count]);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    g.children.forEach((c, i) => {
      c.position.x += clouds[i].speed * dt;
      if (c.position.x > 540) c.position.x = -130;
    });
  });

  return (
    <group ref={group}>
      {clouds.map((c, i) => (
        <group key={i} position={[c.x, c.y, c.z]} scale={[c.s, c.s * 0.55, c.s * 0.8]}>
          {c.puffs.map((p, j) => (
            <mesh key={j} position={[p.x, p.y, p.z]} scale={p.s}>
              <sphereGeometry args={[1, 14, 12]} />
              <meshBasicMaterial color="#ffd0a2" transparent opacity={0.5} depthWrite={false} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

const wingGeo = (() => {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0.18, 0.9, 0, 0, 0, 0, -0.12]), 3));
  g.computeVertexNormals();
  return g;
})();

export function Birds({ count = 9 }: { count?: number }) {
  const group = useRef<THREE.Group>(null);
  const birds = useMemo(() => {
    const r = rng(99);
    return Array.from({ length: count }, () => ({
      radius: 26 + r() * 22,
      height: 17 + r() * 10,
      speed: 0.22 + r() * 0.18,
      phase: r() * Math.PI * 2,
      flap: 7 + r() * 4,
      cx: (r() - 0.5) * 14,
      cz: (r() - 0.5) * 14,
    }));
  }, [count]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const g = group.current;
    if (!g) return;
    g.children.forEach((node, i) => {
      const b = birds[i];
      const a = b.phase + t * b.speed;
      node.position.set(b.cx + Math.cos(a) * b.radius, b.height + Math.sin(t * 0.7 + i) * 0.8, b.cz + Math.sin(a) * b.radius);
      node.rotation.y = -a;
      const f = Math.sin(t * b.flap + i) * 0.7;
      const [l, rr] = node.children as THREE.Object3D[];
      if (l) l.rotation.z = f;
      if (rr) rr.rotation.z = -f;
    });
  });

  return (
    <group ref={group}>
      {birds.map((_, i) => (
        <group key={i} scale={1.1}>
          <mesh geometry={wingGeo}>
            <meshBasicMaterial color="#2a1812" side={THREE.DoubleSide} />
          </mesh>
          <mesh geometry={wingGeo} scale={[-1, 1, 1]}>
            <meshBasicMaterial color="#2a1812" side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Floating dust / pollen that stays around whatever the camera is looking at. */
export function Dust({ count = 520, anchor }: { count?: number; anchor: React.RefObject<THREE.Vector3> }) {
  const points = useRef<THREE.Points>(null);
  const { positions, speeds } = useMemo(() => {
    const r = rng(5);
    const p = new Float32Array(count * 3);
    const s = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (r() - 0.5) * 70;
      p[i * 3 + 1] = (r() - 0.5) * 26;
      p[i * 3 + 2] = (r() - 0.5) * 70;
      s[i] = 0.12 + r() * 0.4;
    }
    return { positions: p, speeds: s };
  }, [count]);

  useFrame((state, dt) => {
    const pts = points.current;
    if (!pts) return;
    if (anchor.current) pts.position.lerp(anchor.current, 1 - Math.exp(-dt * 2));
    const arr = pts.geometry.attributes.position.array as Float32Array;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i] * dt;
      arr[i * 3] += Math.sin(t * 0.4 + i) * 0.004;
      if (arr[i * 3 + 1] > 13) arr[i * 3 + 1] = -13;
    }
    pts.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#ffd9a0" size={0.14} sizeAttenuation transparent opacity={0.65} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

/** Soft dark blob under the drone; grows and fades with altitude. */
export function DroneShadow({ target }: { target: React.RefObject<THREE.Group | null> }) {
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(() => {
    const t = target.current;
    const m = mesh.current;
    if (!t || !m) return;
    const alt = Math.max(0.5, t.position.y);
    m.position.set(t.position.x, 0.06, t.position.z);
    m.scale.setScalar(1.1 + alt * 0.16);
    if (mat.current) mat.current.opacity = 0.42 / (1 + alt * 0.12);
  });
  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[1, 28]} />
      <meshBasicMaterial ref={mat} color="#000000" transparent opacity={0.3} depthWrite={false} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* stations along the flight                                            */
/* ------------------------------------------------------------------ */

export function WindFarm({ speedScale = 1 }: { speedScale?: number }) {
  const spots: { p: [number, number, number]; s: number; ph: number; yaw: number }[] = [
    { p: [-44, 0, -34], s: 0.85, ph: 0.6, yaw: 0.2 },
    { p: [34, 0, -52], s: 0.95, ph: 2.1, yaw: -0.1 },
    { p: [-70, 0, 20], s: 0.8, ph: 3.3, yaw: 0.3 },
    { p: [52, 0, 50], s: 0.9, ph: 1.4, yaw: 0 },
    { p: [-18, 0, 74], s: 0.75, ph: 4.2, yaw: 0.25 },
    { p: [96, 0, -70], s: 1, ph: 0.2, yaw: 0.1 },
  ];
  return (
    <>
      {spots.map((s, i) => (
        <WindmillModel key={i} position={s.p} scale={s.s} phase={s.ph} yaw={s.yaw} speed={(0.7 + (i % 3) * 0.12) * speedScale} />
      ))}
    </>
  );
}

/** Crop rows + barn: the "farm field" station. */
export function Farm() {
  const rows = useInstances(30, (i, o, c) => {
    // three crop patches side by side: x 62–143, z -38 … -4
    const patch = Math.floor(i / 10);
    const row = i % 10;
    o.position.set(74 + patch * 28, 0.14, -38 + row * 3.8);
    o.scale.set(25, 0.28, 2.1);
    c.set(patch === 0 ? '#3f8f2b' : patch === 1 ? '#c9a63a' : '#5ea03a').offsetHSL(0, 0, row % 2 ? 0.04 : -0.03);
  });
  return (
    <group>
      <instancedMesh ref={rows} args={[undefined, undefined, 30]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={1} />
      </instancedMesh>
      {/* barn + silo */}
      <group position={[58, 0, -58]}>
        <mesh position={[0, 2, 0]}>
          <boxGeometry args={[9, 4, 6]} />
          <meshStandardMaterial color="#9c2f26" roughness={0.9} />
        </mesh>
        <mesh position={[0, 4.6, 0]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[4.7, 4.7, 6.2]} />
          <meshStandardMaterial color="#6e6a66" roughness={0.9} />
        </mesh>
        <mesh position={[6.4, 3.4, 0]}>
          <cylinderGeometry args={[1.5, 1.5, 6.8, 18]} />
          <meshStandardMaterial color="#c8c9cc" metalness={0.5} roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}

export function Solar() {
  // 8 × 6 panels: x 160–209, clear of the farm (ends x≈143) and the base (starts x≈222)
  const panels = useInstances(48, (i, o, c) => {
    const col = i % 8;
    const row = Math.floor(i / 8);
    o.position.set(162 + col * 6.6, 1.1, -42 + row * 6.2);
    o.rotation.set(-0.5, 0, 0);
    o.scale.set(5.6, 0.14, 3.4);
    c.set('#1b4d9a').offsetHSL(0, 0, ((col + row) % 3) * 0.015);
  });
  return (
    <group>
      <instancedMesh ref={panels} args={[undefined, undefined, 48]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.18} metalness={0.75} />
      </instancedMesh>
      <mesh position={[216, 1.6, -4]}>
        <boxGeometry args={[7, 3.2, 5]} />
        <meshStandardMaterial color="#9aa0aa" roughness={0.6} metalness={0.3} />
      </mesh>
    </group>
  );
}

export function DefenseBase() {
  const dish = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (dish.current) dish.current.rotation.y += dt * 0.8;
  });
  const olive = '#566149';
  return (
    <group position={[246, 0, -26]}>
      {/* hangars */}
      {[-14, 12].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 2.6, 0]}>
            <boxGeometry args={[15, 5.2, 11]} />
            <meshStandardMaterial color={olive} roughness={0.9} />
          </mesh>
          <mesh position={[0, 5.2, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 1]}>
            <cylinderGeometry args={[5.5, 5.5, 15, 20, 1, false, 0, Math.PI]} />
            <meshStandardMaterial color="#4a5440" roughness={0.9} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
      {/* radar */}
      <group position={[0, 0, -14]}>
        <mesh position={[0, 4, 0]}>
          <cylinderGeometry args={[0.5, 0.8, 8, 12]} />
          <meshStandardMaterial color="#c4c7cc" roughness={0.5} metalness={0.4} />
        </mesh>
        <group ref={dish} position={[0, 8.4, 0]}>
          <mesh rotation={[0.2, 0, 0]} position={[1.4, 0, 0]}>
            <sphereGeometry args={[2.4, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2.6]} />
            <meshStandardMaterial color="#e6e8ea" side={THREE.DoubleSide} roughness={0.4} metalness={0.3} />
          </mesh>
        </group>
      </group>
      {/* helipad */}
      <mesh position={[0, 0.07, 14]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4.4, 5.2, 40]} />
        <meshBasicMaterial color={[3.2, 1.3, 0]} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.05, 14]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[4.4, 40]} />
        <meshStandardMaterial color="#2c3034" roughness={0.9} />
      </mesh>
      {/* watch towers */}
      {[-26, 26].map((x) => (
        <mesh key={x} position={[x, 3.2, 8]}>
          <boxGeometry args={[2.2, 6.4, 2.2]} />
          <meshStandardMaterial color="#6b6f62" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

export function City() {
  const blocks = useInstances(84, (i, o, c) => {
    const r = rng(i * 9301 + 49297);
    const gx = i % 14;
    const gz = Math.floor(i / 14);
    const w = 3.6 + r() * 3.2;
    const d = 3.6 + r() * 3.2;
    const h = 4 + Math.pow(r(), 1.7) * 26;
    o.position.set(292 + gx * 6.4 + (r() - 0.5) * 1.4, h / 2, -52 + gz * 8.2 + (r() - 0.5) * 1.4);
    o.scale.set(w, h, d);
    c.set('#4b5266').offsetHSL((r() - 0.5) * 0.04, 0, r() * 0.18 - 0.04);
  });
  return (
    <group>
      <mesh position={[334, 0.04, -26]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[104, 80]} />
        <meshStandardMaterial color="#2a2e37" roughness={1} />
      </mesh>
      <instancedMesh ref={blocks} args={[undefined, undefined, 84]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.55} metalness={0.25} />
      </instancedMesh>
      {/* delivery pad */}
      <group position={[344, 0.1, 8]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.2, 3.9, 40]} />
          <meshBasicMaterial color={[3.2, 1.3, 0]} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[1.1, 1, 1.1]} />
          <meshStandardMaterial color="#ff6b00" roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}

/** Keeps the camera frustum + fog tidy for the whole world. */
export function Atmosphere() {
  const { scene } = useThree();
  useLayoutEffect(() => {
    scene.fog = new THREE.Fog(HAZE, 70, 430);
    scene.background = new THREE.Color(HAZE);
    return () => {
      scene.fog = null;
    };
  }, [scene]);
  return null;
}

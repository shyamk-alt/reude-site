'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer, ToneMapping, Vignette } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { clamp01, flight, smooth, stations } from '@/lib/flight';
import DroneModel from './DroneModel';
import WindmillModel from './WindmillModel';
import { Atmosphere, Birds, City, Clouds, DefenseBase, DroneShadow, Dust, Farm, Ground, Lights, Mountains, Sky, Solar, Sun, WindFarm } from './World';

/** Where the drone hovers at each station (same order as `stations`; 0 = where it leaves the windmill orbit). */
const WAYPOINTS = [
  new THREE.Vector3(22, 13, 12),
  new THREE.Vector3(102, 15, -10),
  new THREE.Vector3(184, 17, -22),
  new THREE.Vector3(244, 16, -14),
  new THREE.Vector3(340, 10, 12),
];
const CURVE = new THREE.CatmullRomCurve3(WAYPOINTS, false, 'catmullrom', 0.4);
const HUB = new THREE.Vector3(0, 12, 0);

/** Scroll progress → position on the flight curve. The drone eases to a near-stop at every station. */
function pathU(p: number) {
  const last = stations.length - 1;
  let k = 0;
  for (let i = 0; i < last; i++) if (p >= stations[i].at) k = i;
  if (k >= last) return 1;
  const a = stations[k].at;
  const b = stations[k + 1].at;
  const f = clamp01((p - a) / (b - a));
  return Math.min(1, (k + smooth(0.14, 0.86, f)) / last);
}

// scratch objects: nothing is allocated inside the frame loop
const vOrbit = new THREE.Vector3();
const vFlight = new THREE.Vector3();
const vTan = new THREE.Vector3();
const vDrone = new THREE.Vector3();
const vRight = new THREE.Vector3();
const vUp = new THREE.Vector3();
const vVel = new THREE.Vector3();
const vHead = new THREE.Vector3();
const vSide = new THREE.Vector3();
const vOff = new THREE.Vector3();
const vCamOrbit = new THREE.Vector3();
const vCamFollow = new THREE.Vector3();
const vTgtOrbit = new THREE.Vector3();
const vTgtFollow = new THREE.Vector3();

type RigProps = { reduced: boolean; mobile: boolean; onFirstDrag?: () => void };

/**
 * The director. Scroll = forward: for the first moments the drone circles the windmill while the camera
 * orbits on its own (drag to take over); then scroll carries the drone — and a chase camera — along the
 * flight path from wind farm to farm, solar plant, defense base and city.
 */
function Rig({ reduced, mobile, onFirstDrag }: RigProps) {
  const { gl, camera, size } = useThree();
  const drone = useRef<THREE.Group>(null);
  const anchor = useRef(new THREE.Vector3(0, 10, 0));
  const s = useRef({
    prog: 0,
    az: 0,
    el: 0,
    vAz: 0,
    dragging: false,
    lastX: 0,
    lastY: 0,
    lastMove: 0,
    mx: 0,
    my: 0,
    smx: 0,
    smy: 0,
    yaw: 0,
    yawRate: 0,
    pitch: 0,
    roll: 0,
    speed: 0,
    prev: new THREE.Vector3(13.5, 12, 0),
  });

  // drag to orbit 360°, pointer position drives the parallax
  useEffect(() => {
    const el = gl.domElement;
    const st = s.current;
    el.style.touchAction = 'pan-y';
    const down = (e: PointerEvent) => {
      st.dragging = true;
      st.lastX = e.clientX;
      st.lastY = e.clientY;
      st.vAz = 0;
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* pointer already released */
      }
      onFirstDrag?.();
    };
    const move = (e: PointerEvent) => {
      st.mx = (e.clientX / window.innerWidth) * 2 - 1;
      st.my = (e.clientY / window.innerHeight) * 2 - 1;
      if (!st.dragging) return;
      const dx = e.clientX - st.lastX;
      const dy = e.clientY - st.lastY;
      st.lastX = e.clientX;
      st.lastY = e.clientY;
      st.az -= dx * 0.006;
      st.vAz = -dx * 0.006;
      st.lastMove = performance.now();
      st.el = THREE.MathUtils.clamp(st.el + dy * 0.02, -4, 12);
    };
    const up = () => {
      st.dragging = false;
      if (performance.now() - st.lastMove > 90) st.vAz = 0;
    };
    el.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [gl, onFirstDrag]);

  useFrame((state, dtRaw) => {
    const st = s.current;
    const dt = Math.min(dtRaw, 0.05);
    const t = state.clock.elapsedTime;
    const calm = reduced ? 0.15 : 1;

    // eased scroll progress, so a fast flick never teleports the drone
    st.prog += (flight.progress - st.prog) * (1 - Math.exp(-dt * 4.5));
    const p = st.prog;
    const orbitW = 1 - smooth(0.035, 0.17, p); // 1 = circling the windmill, 0 = on the flight path

    st.smx += (st.mx - st.smx) * (1 - Math.exp(-dt * 3));
    st.smy += (st.my - st.smy) * (1 - Math.exp(-dt * 3));
    if (!st.dragging) {
      st.az += st.vAz * dt * 40;
      st.vAz *= Math.exp(-dt * 2.5);
      st.el *= Math.exp(-dt * 0.5);
    }

    /* ---------------- drone ---------------- */
    CURVE.getPoint(pathU(p), vFlight);
    CURVE.getTangent(Math.min(0.999, pathU(p)), vTan);
    vFlight.x += Math.sin(t * 0.9) * 0.6;
    vFlight.y += Math.sin(t * 1.3) * 0.5;
    vFlight.z += Math.cos(t * 0.7) * 0.6;

    const a = 0.8 + t * 0.38 * calm;
    const r = 13.5 + Math.sin(t * 0.5) * 1.2;
    vOrbit.set(Math.cos(a) * r, 12.4 + Math.sin(t * 0.9) * 0.9, Math.sin(a) * r);
    vDrone.copy(vOrbit).lerp(vFlight, 1 - orbitW);

    // the drone leans toward the pointer
    const e = camera.matrixWorld.elements;
    vRight.set(e[0], e[1], e[2]);
    vUp.set(e[4], e[5], e[6]);
    vDrone.addScaledVector(vRight, st.smx * 2.2).addScaledVector(vUp, -st.smy * 1.6);

    const d = drone.current;
    if (d) {
      vVel.copy(vDrone).sub(st.prev).divideScalar(Math.max(dt, 1e-4));
      st.prev.copy(vDrone);
      const sp = Math.min(vVel.length(), 80);
      st.speed += (sp - st.speed) * (1 - Math.exp(-dt * 3));
      if (vVel.x * vVel.x + vVel.z * vVel.z > 0.05) {
        const targetYaw = Math.atan2(vVel.x, vVel.z);
        let dy = targetYaw - st.yaw;
        dy = Math.atan2(Math.sin(dy), Math.cos(dy));
        st.yaw += dy * (1 - Math.exp(-dt * 4));
        st.yawRate = dy;
      }
      const pitchT = Math.min(0.32, st.speed * 0.018) + st.smy * 0.08;
      const rollT = THREE.MathUtils.clamp(-st.yawRate * 0.55, -0.45, 0.45) + st.smx * 0.14;
      st.pitch += (pitchT - st.pitch) * (1 - Math.exp(-dt * 3));
      st.roll += (rollT - st.roll) * (1 - Math.exp(-dt * 3));
      d.position.copy(vDrone);
      d.rotation.set(st.pitch, st.yaw, st.roll, 'YXZ');
      d.scale.setScalar(THREE.MathUtils.lerp(1.55, 1.3, orbitW));
    }
    anchor.current.copy(vDrone);
    flight.alt = vDrone.y;
    flight.speed = st.speed;

    /* ---------------- camera ---------------- */
    const baseAz = 0.75 + t * 0.085 * calm + st.az;
    vCamOrbit.set(Math.cos(baseAz) * 36, 10 + st.el + Math.sin(t * 0.25) * 1.2, Math.sin(baseAz) * 36);
    vCamOrbit.x += st.smx * 1.8;
    vCamOrbit.y += -st.smy * 1.2;
    vTgtOrbit.copy(HUB).lerp(vDrone, 0.18);

    vHead.set(vTan.x, 0, vTan.z);
    if (vHead.lengthSq() < 1e-4) vHead.set(1, 0, 0);
    vHead.normalize();
    vSide.set(-vHead.z, 0, vHead.x);
    vOff.copy(vHead).multiplyScalar(-17).addScaledVector(vSide, 21);
    const ca = Math.cos(st.az);
    const sa = Math.sin(st.az);
    vCamFollow.set(vDrone.x + vOff.x * ca - vOff.z * sa, Math.max(4, vDrone.y + 7 + st.el), vDrone.z + vOff.x * sa + vOff.z * ca);
    vTgtFollow.copy(vDrone).addScaledVector(vHead, 8);
    vTgtFollow.y -= 1.5;

    camera.position.copy(vCamOrbit).lerp(vCamFollow, 1 - orbitW);
    vTgtOrbit.lerp(vTgtFollow, 1 - orbitW);
    camera.lookAt(vTgtOrbit);

    // park the subject to one side so the headline has room (right on landscape, lower on portrait)
    const portrait = size.width / size.height <= 1.15;
    const offX = portrait ? 0 : -size.width * 0.17 * orbitW;
    const offY = portrait ? -size.height * 0.12 * orbitW : 0;
    (camera as THREE.PerspectiveCamera).setViewOffset(size.width, size.height, offX, offY, size.width, size.height);
  });

  return (
    <>
      <DroneModel groupRef={drone} reduced={reduced} />
      <DroneShadow target={drone} />
      <Dust anchor={anchor} count={mobile ? 260 : 520} />
    </>
  );
}

type SceneProps = {
  mobile: boolean;
  reduced: boolean;
  /** false while the hero is off-screen: the render loop sleeps */
  active: boolean;
  onLoaded?: () => void;
  onFirstDrag?: () => void;
};

export default function Scene({ mobile, reduced, active, onLoaded, onFirstDrag }: SceneProps) {
  return (
    <Canvas
      dpr={mobile ? [1, 1.5] : [1, 1.75]}
      camera={{ fov: 40, near: 0.1, far: 1800, position: [30, 10, 20] }}
      gl={{ antialias: false, powerPreference: 'high-performance', toneMapping: THREE.NoToneMapping }}
      frameloop={active ? 'always' : 'never'}
      onCreated={() => onLoaded?.()}
    >
      <Atmosphere />
      <Sky />
      <Sun />
      <Lights />
      <Ground />
      <Mountains />

      {/* the hero windmill + its neighbours */}
      <WindmillModel hero position={[0, 0, 0]} speed={0.75} />
      <WindFarm speedScale={reduced ? 0.4 : 1} />

      {/* stations along the flight */}
      <Farm />
      <Solar />
      <DefenseBase />
      <City />

      <Clouds count={mobile ? 9 : 16} />
      <Birds count={mobile ? 5 : 9} />
      <Rig reduced={reduced} mobile={mobile} onFirstDrag={onFirstDrag} />

      <EffectComposer multisampling={mobile ? 2 : 4}>
        <Bloom intensity={0.9} luminanceThreshold={1} luminanceSmoothing={0.2} mipmapBlur />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <Vignette offset={0.25} darkness={0.5} />
      </EffectComposer>
    </Canvas>
  );
}

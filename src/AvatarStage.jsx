import React, { useEffect, useRef, useState } from 'react';

const BASE = import.meta.env.BASE_URL;
const AVATAR_URL = `${BASE}avatar/avatar.glb`;
const LINES = { left: 'Anyone here on the left?', right: 'Anyone here on the right?' };
const CENTER_LINES = ['Hey, it’s you!', 'Check out the portfolio'];

// Tuning knobs. Distances in metres, angles in radians, relative to the avatar's head bone.
const CFG = {
  hold: 2400,           // ms a reaction is held before returning to work
  cooldown: 500,        // ms before the next reaction can start
  camDist: 1.05, camFov: 26, camLift: 0.03, targetDrop: 0.09,
  lidTop: -0.12, lidW: 0.36, lidH: 0.2, lidTilt: 0.2, laptopZ: 0.34,
  poses: {              // yaw: - looks screen-left, + screen-right; pitch: + looks down
    idle:   { yaw: 0,     pitch: 0.15,  eyeX: 0,    eyeY: -0.55, smile: 0,   brow: 0 },
    left:   { yaw: -0.42, pitch: 0.02,  eyeX: -0.6, eyeY: 0,     smile: 0,   brow: 0.1 },
    right:  { yaw: 0.42,  pitch: 0.02,  eyeX: 0.6,  eyeY: 0,     smile: 0,   brow: 0.1 },
    center: { yaw: 0,     pitch: -0.01, eyeX: 0,    eyeY: 0.08,  smile: 0.5, brow: 0.2 },
  },
};
const RATE = { yaw: 4.5, pitch: 4.5, eyeX: 11, eyeY: 11, smile: 3, brow: 4 };

export default function AvatarStage() {
  const box = useRef(null);
  const frameEl = useRef(null);
  const [ready, setReady] = useState(false);
  const [missing, setMissing] = useState(false);
  const [cue, setCue] = useState({ zone: 'center', text: '', show: false });

  useEffect(() => {
    const wrap = box.current;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const touch = matchMedia('(hover: none), (pointer: coarse)').matches;
    let dead = false;
    let stop = () => {};

    Promise.all([
      import('three'),
      import('three/addons/loaders/GLTFLoader.js'),
      import('three/addons/libs/meshopt_decoder.module.js'),
      import('three/addons/environments/RoomEnvironment.js'),
      import('three/addons/geometries/RoundedBoxGeometry.js'),
    ]).then(([THREE, { GLTFLoader }, { MeshoptDecoder }, { RoomEnvironment }, { RoundedBoxGeometry }]) => {
      if (dead) return;
      const loader = new GLTFLoader();
      loader.setMeshoptDecoder(MeshoptDecoder);
      loader.load(
        AVATAR_URL,
        (gltf) => { if (!dead) stop = run(THREE, gltf, RoomEnvironment, RoundedBoxGeometry); },
        undefined,
        () => { if (!dead) setMissing(true); },
      );
    });

    function run(THREE, gltf, RoomEnvironment, RoundedBoxGeometry) {
      const V3 = THREE.Vector3, Q = THREE.Quaternion;
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setClearAlpha(0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      frameEl.current.appendChild(renderer.domElement);
      renderer.domElement.className = 'avatar-canvas';
      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environmentIntensity = 0.3;

      // ---- find rig parts (works with Mixamo / Ready Player Me style names) ----
      const root = gltf.scene;
      scene.add(root);
      const bones = {};
      const meshes = [];
      root.traverse((o) => {
        if (o.isMesh) { o.frustumCulled = false; if (o.morphTargetDictionary) meshes.push(o); }
        if (o.isBone) bones[o.name.replace(/^mixamorig[:_]?/i, '').toLowerCase()] = o;
      });
      const spine = bones.spine2 || bones.spine1 || bones.spine;
      const neck = bones.neck, head = bones.head;
      const eyeL = bones.lefteye, eyeR = bones.righteye;
      if (!head) console.warn('[avatar] no "Head" bone found; head turns will not work');
      const morph = {};
      const setMorph = (name, v) => {
        const hits = morph[name] || (morph[name] = meshes.filter((m) => name in m.morphTargetDictionary).map((m) => [m, m.morphTargetDictionary[name]]));
        for (const [m, i] of hits) m.morphTargetInfluences[i] = v;
      };
      const has = (n) => meshes.some((m) => n in m.morphTargetDictionary);
      const hasBlink = has('eyeBlinkLeft'), hasEyeMorph = has('eyeLookOutLeft');
      console.info('[avatar] bones: head', !!head, 'neck', !!neck, 'eyes', !!eyeL,
        '| morphs: blink', hasBlink, 'smile', has('mouthSmileLeft') || has('mouthSmile'), 'eyeLook', hasEyeMorph);

      // ---- pose the arms down and forward so the avatar is not left in a T-pose ----
      const aim = (bone, child, dir) => {
        if (!bone || !child) return;
        bone.updateWorldMatrix(true, true);
        const cur = child.getWorldPosition(new V3()).sub(bone.getWorldPosition(new V3())).normalize();
        const dq = new Q().setFromUnitVectors(cur, dir.clone().normalize());
        const nw = dq.multiply(bone.getWorldQuaternion(new Q()));
        bone.quaternion.copy(bone.parent.getWorldQuaternion(new Q()).invert().multiply(nw));
        bone.updateWorldMatrix(false, true);
      };
      [['left', 1], ['right', -1]].forEach(([side, s]) => {
        aim(bones[`${side}arm`], bones[`${side}forearm`], new V3(s * 0.14, -1, 0.25));
        aim(bones[`${side}forearm`], bones[`${side}hand`], new V3(-s * 0.05, -0.2, 1));
      });
      root.updateMatrixWorld(true);
      const rest = new Map([spine, neck, head, eyeL, eyeR].filter(Boolean).map((b) => [b, b.quaternion.clone()]));
      const H = (head || root).getWorldPosition(new V3());

      // ---- laptop (seen from behind), desk, and lights ----
      const graphite = new THREE.MeshStandardMaterial({ color: 0x2b302e, metalness: 0.85, roughness: 0.45 });
      const baseY = H.y + CFG.lidTop - CFG.lidH * Math.cos(CFG.lidTilt);
      const hingeZ = H.z + CFG.laptopZ;
      const lid = new THREE.Mesh(new RoundedBoxGeometry(CFG.lidW, CFG.lidH, 0.008, 2, 0.004).translate(0, CFG.lidH / 2, 0), graphite);
      lid.position.set(H.x, baseY, hingeZ);
      lid.rotation.x = CFG.lidTilt;
      const keys = new THREE.Mesh(new RoundedBoxGeometry(CFG.lidW, 0.012, 0.24, 2, 0.004).translate(0, 0.006, -0.12), graphite);
      keys.position.set(H.x, baseY, hingeZ);
      const desk = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.8, 0.9), new THREE.MeshStandardMaterial({ color: 0x040505, roughness: 1, metalness: 0 }));
      desk.position.set(H.x, baseY - 0.9, H.z + 0.62);
      scene.add(lid, keys, desk);

      const screen = new THREE.PointLight(0xcfe6ff, 0.3, 0, 2);
      screen.position.set(H.x, H.y - 0.12, hingeZ - 0.12);
      const key = new THREE.DirectionalLight(0xd6fff0, 1.3);
      key.position.set(H.x - 1, H.y + 0.8, H.z + 1.4);
      const redRim = new THREE.DirectionalLight(0xff4d5e, 2.4);
      redRim.position.set(H.x + 1.2, H.y + 0.4, H.z - 1.2);
      const greenRim = new THREE.DirectionalLight(0x2fd39a, 1.4);
      greenRim.position.set(H.x - 1.2, H.y + 0.5, H.z - 1.0);
      scene.add(screen, key, redRim, greenRim);

      const camera = new THREE.PerspectiveCamera(CFG.camFov, 1, 0.1, 20);
      const lookAt = new V3(H.x, H.y - CFG.targetDrop, H.z);
      const resize = () => {
        const w = wrap.clientWidth || 1, h = wrap.clientHeight || 1;
        renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        // pull back on tall (mobile) layouts so the laptop and shoulders stay in frame
        const need = 0.36 / (Math.tan((CFG.camFov * Math.PI) / 360) * camera.aspect);
        const d = Math.min(2.3, Math.max(CFG.camDist, need));
        camera.position.set(H.x, H.y + CFG.camLift, H.z + d);
        camera.lookAt(lookAt);
        camera.updateProjectionMatrix();
      };

      // ---- pose state ----
      const P = { ...CFG.poses.idle };
      const T = { ...CFG.poses.idle };
      let react = null, until = 0, cool = 0, lastZone = null, announced = false;
      let visible = true, raf = 0, last = performance.now(), timers = [];
      let blinkAt = 2000, blinkT = -1, wanderAt = 0, wander = 0, ready_ = false;

      const say = (z) => {
        timers.forEach(clearTimeout);
        timers = [];
        if (!z) return setCue((c) => ({ ...c, show: false }));
        if (z === 'center') {
          setCue({ zone: z, text: CENTER_LINES[0], show: true });
          timers.push(setTimeout(() => setCue({ zone: z, text: CENTER_LINES[1], show: true }), 1500));
        } else setCue({ zone: z, text: LINES[z], show: true });
      };
      const request = (z, t) => {
        if (!react && t < cool) return;
        until = t + CFG.hold;
        if (z === react) return;
        react = z;
        Object.assign(T, CFG.poses[z]);
        say(z);
      };

      const _a = new Q(), _b = new Q(), _d = new Q(), _e = new THREE.Euler(0, 0, 0, 'YXZ');
      // rotate a bone by a world-space pitch/yaw on top of its rest pose (rig-agnostic)
      const turn = (b, pitch, yaw) => {
        if (!b) return;
        _d.setFromEuler(_e.set(pitch, yaw, 0));
        b.parent.updateWorldMatrix(true, false);
        b.parent.getWorldQuaternion(_b);
        _a.copy(_b).invert().multiply(_d).multiply(_b).multiply(rest.get(b));
        b.quaternion.copy(_a);
        b.updateWorldMatrix(false, false);
      };

      const tick = (t) => {
        raf = requestAnimationFrame(tick);
        const dt = Math.min(0.05, (t - last) / 1000);
        last = t;
        if (!visible || document.hidden) return;
        const sec = t / 1000;

        if (react && t >= until) { react = null; Object.assign(T, CFG.poses.idle); cool = t + CFG.cooldown; lastZone = null; say(null); }
        for (const k in P) P[k] += (T[k] - P[k]) * (reduced ? 1 : 1 - Math.exp(-RATE[k] * dt));

        // living idle: slow head drift, reading-like eye wander, breathing
        const calm = reduced ? 0 : 1;
        if (t > wanderAt) { wander = (Math.random() - 0.5) * 0.3; wanderAt = t + 1200 + Math.random() * 2200; }
        const working = react ? 0.25 : 1;
        const drift = calm * (Math.sin(sec * 0.5) * 0.012 + Math.sin(sec * 0.83 + 1) * 0.008);
        const breath = calm * Math.sin(sec * 1.3);

        spine && (turn(spine, breath * 0.01, 0));
        const yaw = P.yaw + drift * working, pitch = P.pitch + calm * Math.sin(sec * 0.37) * 0.01;
        turn(neck, pitch * 0.4, yaw * 0.4);
        turn(head, pitch * 0.6, yaw * 0.6);
        root.position.y = breath * 0.0012;

        // eyes lead the head
        const ex = Math.max(-1, Math.min(1, P.eyeX + wander * working)), ey = P.eyeY;
        if (hasEyeMorph) {
          const l = Math.max(0, -ex), r = Math.max(0, ex);
          setMorph('eyeLookInLeft', l); setMorph('eyeLookOutRight', l);
          setMorph('eyeLookOutLeft', r); setMorph('eyeLookInRight', r);
          setMorph('eyeLookDownLeft', Math.max(0, -ey)); setMorph('eyeLookDownRight', Math.max(0, -ey));
          setMorph('eyeLookUpLeft', Math.max(0, ey)); setMorph('eyeLookUpRight', Math.max(0, ey));
        } else {
          turn(eyeL, -ey * 0.3, ex * 0.4);
          turn(eyeR, -ey * 0.3, ex * 0.4);
        }

        // blink
        if (blinkT < 0 && t > blinkAt && !reduced) blinkT = 0;
        let blink = 0;
        if (blinkT >= 0) {
          blinkT += dt;
          blink = Math.sin(Math.min(1, blinkT / 0.17) * Math.PI);
          if (blinkT > 0.17) { blinkT = -1; blinkAt = t + 2200 + Math.random() * 3000; blink = 0; }
        }
        setMorph('eyeBlinkLeft', blink); setMorph('eyeBlinkRight', blink);

        // expression
        const sm = P.smile;
        setMorph('mouthSmileLeft', sm); setMorph('mouthSmileRight', sm); setMorph('mouthSmile', sm);
        setMorph('cheekSquintLeft', sm * 0.4); setMorph('cheekSquintRight', sm * 0.4);
        setMorph('browInnerUp', P.brow);

        renderer.render(scene, camera);
        if (!ready_) { ready_ = true; setReady(true); }
      };
      const onMove = (e) => {
        if (e.pointerType === 'touch') return;
        const x = e.clientX / window.innerWidth;
        const z = x < 0.34 ? 'left' : x > 0.66 ? 'right' : 'center';
        if (z === lastZone) return;
        lastZone = z;
        request(z, performance.now());
      };
      const onLeave = () => { lastZone = null; if (react) until = Math.min(until, performance.now() + 500); };
      const onTap = () => request('center', performance.now());

      const ro = new ResizeObserver(resize);
      ro.observe(wrap);
      const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        if (visible && touch && !announced) {
          announced = true;
          timers.push(setTimeout(() => request('center', performance.now()), 1400));
        }
      });
      io.observe(wrap);
      resize();
      if (!touch) {
        window.addEventListener('pointermove', onMove, { passive: true });
        document.documentElement.addEventListener('mouseleave', onLeave);
        window.addEventListener('blur', onLeave);
      }
      wrap.addEventListener('pointerdown', onTap);
      raf = requestAnimationFrame(tick);

      return () => {
        cancelAnimationFrame(raf);
        timers.forEach(clearTimeout);
        ro.disconnect(); io.disconnect();
        window.removeEventListener('pointermove', onMove);
        document.documentElement.removeEventListener('mouseleave', onLeave);
        window.removeEventListener('blur', onLeave);
        wrap.removeEventListener('pointerdown', onTap);
        scene.traverse((o) => { o.geometry?.dispose?.(); [].concat(o.material || []).forEach((m) => m.dispose?.()); });
        pmrem.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    }

    return () => { dead = true; stop(); };
  }, []);

  return (
    <div className="stage" ref={box} role="img" aria-label="3D avatar of Adhik Chintalwar working on a laptop">
      <div className={`frame${ready ? ' on' : ''}`} ref={frameEl} />
      <p className="bubble" data-zone={cue.zone} data-show={cue.show} aria-live="polite">{cue.text}</p>
      {missing && <p className="missing">Add your avatar file at public/avatar/avatar.glb</p>}
    </div>
  );
}

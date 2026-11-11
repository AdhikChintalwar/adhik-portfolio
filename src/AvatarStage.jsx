import React, { useEffect, useRef, useState } from 'react';
import { AVATAR_X } from './stageConfig.js';

const BASE = import.meta.env.BASE_URL;
const AVATAR_URL = `${BASE}avatar/avatar.glb`;
const LINES = { left: 'Anyone here on the left?', right: 'Anyone here on the right?' };
const CENTER_LINES = ['Hey, it’s you!', 'Check out the portfolio'];
const FPS = 30;
const MIRROR = true;       // glossy reflecting floor; set to false on very slow machines (the floor then keeps only his soft shadow and ring)

// ---------------------------------------------------------------------------------------------------
// The avatar file carries six animations (from your Avaturn exports). Each is short, so a "scene" plays
// a time range of one clip, once or looped, then he settles back to the idle clip.
//   clip   : animation name inside avatar.glb      from/to : seconds of the clip to play
//   reps   : how many times to loop (omit to play once)
//   shot   : camera framing (see SHOTS)            yaw     : turns his whole body (radians)
//   glasses: sunglasses on while it plays
//   then   : another animation that follows straight away      hold: seconds to stay in the last pose
//   fade / out: seconds to blend in / back to idle             say: caption shown while it plays
// ---------------------------------------------------------------------------------------------------
const ACTIONS = {
  think:  { clip: 'think',  from: 0,   to: 16.4, shot: 'think' },
  box:    { clip: 'box',    from: 0,   to: 2.3,  shot: 'full' },
  groove: { clip: 'move',   from: 0,   to: 1.75, shot: 'full' },
  pushup: { clip: 'pushup', from: 0,   to: 1.6,  shot: 'low', reps: 5, yaw: -1.15, fade: 0.8, out: 0.95 },
  dance:  { clip: 'dance',  from: 0,   to: 4.4,  shot: 'full', glasses: true, then: 'callme' },
  callme: { clip: 'move',   from: 1.55, to: 2.75, shot: 'call', glasses: true, hold: 1.8, fade: 0.55, say: 'Call me' },
};
// which animation plays when each section scrolls into view (home = idle)
const SECTION_ACTION = { about: 'think', experience: 'box', projects: 'groove', skills: 'pushup', contact: 'dance' };
const ROTATION = ['groove', 'box', 'dance', 'think', 'pushup'];   // what a click / tap on him plays
const SECTION_IDS = ['home', 'about', 'experience', 'projects', 'skills', 'contact'];

// Camera framings. y = look-at height, cy = camera height, d = distance, w = width that must fit.
// ax = where he stands across the stage (0 = left edge, 1 = right edge); the default is AVATAR_X (stageConfig.js), the spot the text rolls out from.
// Wide moves get a little more room on the left.
const SHOTS = {
  hero:  { y: 0.88, cy: 1.16, d: 5.1, w: 1.6 },   // the whole studio: head to toe on the glossy floor, headroom for the speech bubble
  think: { y: 1.02, cy: 1.26, d: 4.3, w: 1.25 },   // a little closer
  call:  { y: 1.24, cy: 1.34, d: 3.5, w: 1.25, ax: 0.42 },    // the call-me arm swings wide
  full:  { y: 0.92, cy: 1.22, d: 4.9, w: 1.7, ax: 0.4 },   // head to toe, room for big moves
  low:   { y: 0.3,  cy: 1.15, d: 5.0, w: 2.15, ax: 0.5 },   // push-ups along the floor
};

// The glossy floor: a mirror whose reflection is see-through (alpha comes from the reflected avatar), fades out the
// farther it gets from his feet and toward the sides, and is tinted a little, so it reads as polished black stone.
const SOFT_MIRROR = {
  name: 'SoftMirror',
  uniforms: { color: { value: null }, tDiffuse: { value: null }, textureMatrix: { value: null }, strength: { value: 0.5 } },
  vertexShader: /* glsl */`
    uniform mat4 textureMatrix;
    varying vec4 vUv;
    varying vec3 vW;
    void main() {
      vUv = textureMatrix * vec4( position, 1.0 );
      vW = ( modelMatrix * vec4( position, 1.0 ) ).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`,
  fragmentShader: /* glsl */`
    uniform vec3 color;
    uniform float strength;
    uniform sampler2D tDiffuse;
    varying vec4 vUv;
    varying vec3 vW;
    void main() {
      vec4 base = texture2DProj( tDiffuse, vUv );
      float fade = exp( -max( vW.z, 0.0 ) * 0.55 );
      float side = 1.0 - smoothstep( 1.6, 3.4, abs( vW.x ) );
      float a = base.a * strength * fade * side;
      gl_FragColor = vec4( base.rgb / max( base.a, 0.001 ) * color, a );
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`,
};

const CFG = {
  fov: 24,
  fade: 0.5,            // seconds of cross-fade into an animation
  fadeOut: 0.7,         // ... and back to idle
  settle: 320,          // ms a section must stay in view before its animation starts (fast scrolling skips the rest)
  dwell: 900,           // ms an animation always plays before the next one may take over
  hold: 2400,           // ms a cursor reaction is held before returning
  cooldown: 500,        // ms before the next cursor reaction can start
  poses: {              // head glance for the cursor zones. yaw: - looks screen-left, + screen-right
    idle:   { yaw: 0,     pitch: 0,     eyeX: 0,    eyeY: 0,    smile: 0,   brow: 0 },
    left:   { yaw: -0.5,  pitch: -0.02, eyeX: -0.7, eyeY: 0,    smile: 0.1, brow: 0.1 },
    right:  { yaw: 0.5,   pitch: -0.02, eyeX: 0.7,  eyeY: 0,    smile: 0.1, brow: 0.1 },
    center: { yaw: 0,     pitch: -0.03, eyeX: 0,    eyeY: 0.05, smile: 0.55, brow: 0.2 },
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
      import('three/addons/objects/Reflector.js'),
    ]).then(([THREE, { GLTFLoader }, { MeshoptDecoder }, { RoomEnvironment }, { Reflector }]) => {
      if (dead) return;
      const loader = new GLTFLoader();
      loader.setMeshoptDecoder(MeshoptDecoder);
      loader.load(
        AVATAR_URL,
        (gltf) => { if (!dead) stop = run(THREE, gltf, RoomEnvironment, Reflector); },
        undefined,
        () => { if (!dead) setMissing(true); },
      );
    });

    function run(THREE, gltf, RoomEnvironment, Reflector) {
      const V3 = THREE.Vector3, Q = THREE.Quaternion;
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setClearAlpha(0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      frameEl.current.appendChild(renderer.domElement);
      renderer.domElement.className = 'avatar-canvas';
      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environmentIntensity = 0.42;

      // ---- the character, inside a group so push-ups can turn him side-on ----
      const rig = new THREE.Group();
      const root = gltf.scene;
      rig.add(root);
      scene.add(rig);
      const bones = {};
      const meshes = [];
      const glasses = [];
      const glassMats = [];
      const aniso = renderer.capabilities.getMaxAnisotropy();
      root.traverse((o) => {
        if (o.isBone) bones[o.name.replace(/^mixamorig[:_]?/i, '').toLowerCase()] = o;
        if (!o.isMesh) return;
        o.frustumCulled = false;
        if (o.morphTargetDictionary) meshes.push(o);
        const mats = [].concat(o.material || []);
        const tag = `${o.name} ${mats.map((m) => m.name).join(' ')}`.toLowerCase();
        if (tag.includes('glasses')) {
          o.visible = false; glasses.push(o);
          mats.forEach((m) => { glassMats.push([m, m.opacity]); m.transparent = true; m.needsUpdate = true; });
        }
        mats.forEach((m) => { for (const k of ['map', 'normalMap', 'roughnessMap', 'metalnessMap']) if (m[k]) m[k].anisotropy = aniso; });
      });
      const spine = bones.spine2 || bones.spine1 || bones.spine;
      const neck = bones.neck, head = bones.head;
      if (!head) console.warn('[avatar] no "Head" bone found; head turns will not work');

      const morph = {};
      const hits = (name) => morph[name] || (morph[name] = meshes.filter((m) => name in m.morphTargetDictionary).map((m) => [m, m.morphTargetDictionary[name]]));
      // adds on top of whatever the animation set this frame (the mixer rewrites its own weights every frame)
      const addMorph = (name, v) => { if (v) for (const [m, i] of hits(name)) m.morphTargetInfluences[i] = Math.min(1, m.morphTargetInfluences[i] + v); };
      const hasEyeMorph = meshes.some((m) => 'eyeLookOutLeft' in m.morphTargetDictionary);

      // ---- animation: idle loop + scene actions ----
      const mixer = new THREE.AnimationMixer(root);
      const clips = Object.fromEntries(gltf.animations.map((c) => [c.name, c]));
      const seg = (name, from, to) => {
        const c = clips[name];
        if (!c) return null;
        const a = Math.round(from * FPS), b = Math.min(Math.round(to * FPS), Math.round(c.duration * FPS));
        return THREE.AnimationUtils.subclip(c, `${name}:${from}-${to}`, a, b, FPS);
      };
      const idleClip = seg('idle', 0.3, 7.9);
      const idle = mixer.clipAction(idleClip);
      idle.setLoop(THREE.LoopPingPong, Infinity);
      const acts = {};
      for (const [k, a] of Object.entries(ACTIONS)) {
        const clip = seg(a.clip, a.from, a.to);
        if (!clip) continue;
        const act = mixer.clipAction(clip);
        if (a.reps) act.setLoop(THREE.LoopRepeat, Infinity);
        else { act.setLoop(THREE.LoopOnce, 1); act.clampWhenFinished = true; }
        acts[k] = act;
      }
      const nameOf = new Map([[idle, 'idle']]);
      for (const [k, act] of Object.entries(acts)) nameOf.set(act, k);

      // Blending is done here instead of with three's fadeIn/fadeOut: those restart an interrupted fade from
      // full weight, which made him jump whenever a scroll cut one animation short. Here the weights of all
      // live animations always add up to exactly 1, so a blend can be interrupted at any moment.
      idle.play(); idle.setEffectiveWeight(1);
      let cur = idle, curName = null, loops = 0;
      let clock = 0;                                    // animation clock (ms); only moves while frames are drawn
      let startedAt = 0, holdUntil = 0, pending = null, finishedAct = null, settleAt = 0, settleFor = null;
      let fadeP = 1, fadeDur = CFG.fade;
      const wt = new Map([[idle, 1]]);                  // weight of every live animation right now
      let from = new Map(wt);                           // ... and when the current blend began
      if (reduced) { idle.time = 3; mixer.update(0); mixer.timeScale = 0; }

      const T = { rigYaw: 0, shot: 'hero' };            // targets for body yaw and camera
      let gT = 0, gA = 0;                               // sunglasses opacity: target / current

      const begin = (act, dur) => {
        from = new Map(wt);
        if (!from.has(act)) { from.set(act, 0); wt.set(act, 0); }
        act.reset().play();
        act.setEffectiveWeight(wt.get(act));
        fadeP = 0; fadeDur = Math.max(0.05, dur);
      };
      const blend = (dt) => {
        if (fadeP < 1) fadeP = Math.min(1, fadeP + dt / fadeDur);
        const e = fadeP * fadeP * (3 - 2 * fadeP);       // ease in and out
        const base = from.get(cur) || 0;
        for (const [act, f] of from) {
          const w = act === cur ? base + (1 - base) * e : f * (1 - e);
          wt.set(act, w);
          act.setEffectiveWeight(w);
        }
        if (fadeP >= 1) for (const act of [...from.keys()]) if (act !== cur) { act.stop(); from.delete(act); wt.delete(act); }
      };

      const goIdle = () => {
        if (cur === idle) return;
        const a = ACTIONS[curName];
        begin(idle, (a && a.out) || CFG.fadeOut);
        cur = idle; curName = null; loops = 0; holdUntil = 0; startedAt = clock; finishedAct = null;
        T.rigYaw = 0; T.shot = 'hero'; gT = 0;
        say(null);
      };
      const play = (name) => {
        const a = ACTIONS[name], act = acts[name];
        if (reduced || !a || !act || curName === name) return;
        begin(act, a.fade || CFG.fade);
        cur = act; curName = name; loops = 0; holdUntil = 0; startedAt = clock; pending = null; finishedAct = null;
        T.rigYaw = a.yaw || 0; T.shot = a.shot; gT = a.glasses ? 1 : 0;
        say(null);
        if (a.say) setCue({ zone: 'center', text: a.say, show: true });
      };
      // scroll asks for an animation (or idle): it starts at once if the current one has had its moment, otherwise it waits
      const ask = (name) => {
        if (!curName || clock - startedAt >= CFG.dwell) return name ? play(name) : goIdle();
        pending = { name };
      };
      mixer.addEventListener('finished', (e) => { if (e.action === cur) finishedAct = e.action; });
      mixer.addEventListener('loop', (e) => {
        const a = ACTIONS[curName];
        if (e.action === cur && a && a.reps && ++loops >= a.reps) finishedAct = e.action;
      });
      // everything that reacts to those events runs after mixer.update, never inside it
      const sequence = () => {
        if (settleAt && clock >= settleAt) { settleAt = 0; ask(settleFor); }
        if (pending && clock - startedAt >= CFG.dwell) { const n = pending.name; pending = null; if (n) play(n); else goIdle(); }
        if (finishedAct && finishedAct === cur) {
          finishedAct = null;
          const a = ACTIONS[curName];
          if (a && a.then) play(a.then);
          else if (a && a.hold) holdUntil = clock + a.hold * 1000;
          else goIdle();
        }
        if (holdUntil && clock >= holdUntil) { holdUntil = 0; goIdle(); }
      };

      // ---- lights, floor, camera ----
      const key = new THREE.DirectionalLight(0xe6fff4, 1.25);
      key.position.set(-1.4, 2.6, 2.8);
      const redRim = new THREE.DirectionalLight(0xff4a45, 3.0);
      redRim.position.set(2.4, 1.6, -1.8);
      const greenRim = new THREE.DirectionalLight(0x2fbf8a, 1.5);
      greenRim.position.set(-2.4, 1.8, -1.6);
      scene.add(key, redRim, greenRim);
      // rim lights follow the section palette (palette.js): c1 is the green-side rim, c2 the crimson-side rim
      const tintA = new THREE.Color(0x2fbf8a), tintB = new THREE.Color(0xff4a45);
      const onPalette = (e) => { try { tintA.set(e.detail.c1); tintB.set(e.detail.c2); } catch { /* keep the old colors */ } };
      if (window.__palette) onPalette({ detail: window.__palette });
      window.addEventListener('palette', onPalette);

      // soft contact shadow + faint green ring under his feet
      const c2 = document.createElement('canvas');
      c2.width = c2.height = 256;
      const g2 = c2.getContext('2d');
      let gr = g2.createRadialGradient(128, 128, 0, 128, 128, 90);
      gr.addColorStop(0, 'rgba(0,0,0,0.62)'); gr.addColorStop(0.55, 'rgba(0,0,0,0.3)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g2.fillStyle = gr; g2.fillRect(0, 0, 256, 256);
      gr = g2.createRadialGradient(128, 128, 96, 128, 128, 124);
      gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.26)'); gr.addColorStop(1, 'rgba(255,255,255,0)');   // white: tinted by the palette below
      g2.fillStyle = gr; g2.fillRect(0, 0, 256, 256);
      const floorTex = new THREE.CanvasTexture(c2);
      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(2.1, 2.1),
        new THREE.MeshBasicMaterial({ map: floorTex, transparent: true, depthWrite: false, toneMapped: false }),
      );
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = 0.003;
      floor.renderOrder = 2;                          // drawn after the mirror, so his shadow sits on top of the reflection
      rig.add(floor);

      // glossy studio floor: a transparent mirror under him
      let mirror = null;
      if (MIRROR) {
        mirror = new Reflector(new THREE.PlaneGeometry(8, 8), {
          shader: SOFT_MIRROR, color: 0xffffff, textureWidth: 768, textureHeight: 768, clipBias: 0.003, multisample: 2,
        });
        mirror.rotation.x = -Math.PI / 2;
        mirror.material.transparent = true;
        mirror.material.depthWrite = false;
        mirror.renderOrder = 1;
        scene.add(mirror);
      }

      const camera = new THREE.PerspectiveCamera(CFG.fov, 1, 0.1, 30);
      const cam = { y: SHOTS.hero.y, cy: SHOTS.hero.cy, d: SHOTS.hero.d, x: 0 };
      const cam1 = { ...cam };                       // first stage of a two-stage follow (gives the move a soft start)
      let yaw1 = 0, aspect = 1;
      const fv = new V3();
      let floorPx = -1;
      const narrow = matchMedia('(max-width: 960px)');   // on tablets and phones the stage is full width and he stands in the middle
      const shotTarget = () => {
        const s = SHOTS[T.shot];
        const th = Math.tan((CFG.fov * Math.PI) / 360);
        const d = Math.min(9, Math.max(s.d, (s.w / 2) / (th * aspect)));   // keep the width in frame on narrow stages
        const ax = narrow.matches ? 0.5 : (s.ax ?? AVATAR_X);
        return { y: s.y, cy: s.cy, d, x: -(2 * ax - 1) * d * th * aspect };   // slide the camera so his feet land at ax across the stage
      };
      const resize = () => {
        const w = wrap.clientWidth || 1, h = wrap.clientHeight || 1;
        aspect = w / h;
        wrap.parentElement.style.setProperty('--ax', `${(narrow.matches ? 0.5 : AVATAR_X) * 100}%`);   // the CSS beam and reel center on him
        renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
        renderer.setSize(w, h, false);
        camera.aspect = aspect;
        camera.updateProjectionMatrix();
        const t = shotTarget(); Object.assign(cam, t); Object.assign(cam1, t);
      };

      // ---- cursor reactions (head, eyes, face) ----
      const P = { ...CFG.poses.idle };
      const R = { ...CFG.poses.idle };
      let react = null, until = 0, cool = 0, lastZone = null, announced = false, camX = 0, camXt = 0;
      let visible = true, raf = 0, last = performance.now(), timers = [];
      let blinkAt = 1800, blinkT = -1, wanderAt = 0, wander = 0, ready_ = false, lookW = 1;

      function say(z) {
        timers.forEach(clearTimeout);
        timers = [];
        if (!z) return setCue((c) => ({ ...c, show: false }));
        if (z === 'center') {
          setCue({ zone: z, text: CENTER_LINES[0], show: true });
          timers.push(setTimeout(() => setCue({ zone: z, text: CENTER_LINES[1], show: true }), 1500));
        } else setCue({ zone: z, text: LINES[z], show: true });
      }
      const request = (z, t) => {
        if (curName) return;                         // he is busy doing something
        if (!react && t < cool) return;
        until = t + CFG.hold;
        if (z === react) return;
        react = z;
        Object.assign(R, CFG.poses[z]);
        say(z);
      };

      // ---- scroll: each section starts its animation ----
      let section = 'home', scrolled = 0, lastY = window.scrollY, rot = 0;
      const sectionNow = () => {
        const line = window.innerHeight * 0.45;
        let now = 'home';
        for (const id of SECTION_IDS) { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top <= line) now = id; }
        return now;
      };
      const onScroll = () => {
        if (!visible) return;
        const y = window.scrollY;
        scrolled += Math.abs(y - lastY);
        lastY = y;
        const sec = sectionNow();
        if (sec !== section) {
          // note the new section, but only start its animation once the scroll has settled there
          section = sec; scrolled = 0;
          settleFor = SECTION_ACTION[sec] || null;
          settleAt = clock + CFG.settle;
        } else if (scrolled > 1400 && !curName && SECTION_ACTION[sec]) {   // long section: do it again if they keep scrolling
          scrolled = 0;
          play(SECTION_ACTION[sec]);
        }
      };

      const _a = new Q(), _b = new Q(), _d = new Q(), _e = new THREE.Euler(0, 0, 0, 'YXZ');
      // Rotate a bone by a world-space pitch/yaw on top of whatever the animation did this frame.
      // Some clips do not animate every bone (e.g. the head in push-ups), so remember our own output and
      // only treat the bone's value as "fresh animation" when something else changed it.
      const mine = new Map();
      const turn = (b, pitch, yaw) => {
        if (!b) return;
        let m = mine.get(b);
        if (!m) { m = { out: new Q(), base: new Q(), init: false }; mine.set(b, m); }
        if (!(m.init && b.quaternion.equals(m.out))) m.base.copy(b.quaternion);
        _d.setFromEuler(_e.set(pitch, yaw, 0));
        b.parent.updateWorldMatrix(true, false);
        b.parent.getWorldQuaternion(_b);
        m.out.copy(_b).invert().multiply(_d).multiply(_b).multiply(m.base);
        m.init = true;
        b.quaternion.copy(m.out);
        b.updateWorldMatrix(false, false);
      };

      const update = (dt, t) => {
        const sec = t / 1000;
        clock += dt * 1000;
        blend(dt);
        mixer.update(dt);
        sequence();

        // rim lights and floor ring blend toward the current palette
        const kc = reduced ? 1 : 1 - Math.exp(-2.2 * dt);
        greenRim.color.lerp(tintA, kc); redRim.color.lerp(tintB, kc); floor.material.color.copy(redRim.color);

        // sunglasses fade in and out instead of popping
        gA += (gT - gA) * (1 - Math.exp(-9 * dt));
        if (Math.abs(gT - gA) < 0.01) gA = gT;
        const gOn = gA > 0.01;
        glasses.forEach((g) => { g.visible = gOn; });
        for (const [m, o] of glassMats) m.opacity = o * gA;

        // body yaw (push-ups) and camera: two cascaded smoothers, so they ease in as well as out
        const k = reduced ? 1 : 1 - Math.exp(-4 * dt);
        const st = shotTarget();
        yaw1 += (T.rigYaw - yaw1) * k;
        rig.rotation.y += (yaw1 - rig.rotation.y) * k;
        for (const f of ['y', 'cy', 'd', 'x']) { cam1[f] += (st[f] - cam1[f]) * k; cam[f] += (cam1[f] - cam[f]) * k; }
        camX += (camXt - camX) * (1 - Math.exp(-3 * dt));
        camera.position.set(cam.x + camX * 0.6, cam.cy, cam.d);
        camera.lookAt(cam.x + camX * 0.25, cam.y, 0);
        // tell the CSS studio where his feet are on screen, so the floor gradient lines up with the 3D floor
        camera.updateMatrixWorld();
        fv.set(0, 0, 0).project(camera);
        const fpx = Math.round(wrap.offsetTop + ((1 - fv.y) / 2) * wrap.clientHeight);
        if (fpx !== floorPx) { floorPx = fpx; wrap.parentElement.style.setProperty('--floor', `${fpx}px`); }

        if (react && t >= until) { react = null; Object.assign(R, CFG.poses.idle); cool = t + CFG.cooldown; lastZone = null; say(null); }
        for (const key2 in P) P[key2] += (R[key2] - P[key2]) * (reduced ? 1 : 1 - Math.exp(-RATE[key2] * dt));

        // how much the cursor may steer him: fully when idle, a little during an action, never on the floor
        const want = !curName ? 1 : curName === 'think' ? 0.5 : curName === 'pushup' ? 0 : 0.15;
        lookW += (want - lookW) * (1 - Math.exp(-4 * dt));

        const calm = reduced ? 0 : 1;
        if (t > wanderAt) { wander = (Math.random() - 0.5) * 0.25; wanderAt = t + 1400 + Math.random() * 2400; }
        const yaw = (P.yaw + calm * Math.sin(sec * 0.5) * 0.015) * lookW;
        const pitch = (P.pitch + calm * Math.sin(sec * 0.37) * 0.01) * lookW;
        turn(spine, 0, yaw * 0.12);
        turn(neck, pitch * 0.4, yaw * 0.38);
        turn(head, pitch * 0.6, yaw * 0.5);

        // eyes lead the head
        const ex = Math.max(-1, Math.min(1, P.eyeX * lookW + wander * lookW)), ey = P.eyeY * lookW;
        if (hasEyeMorph) {
          const l = Math.max(0, -ex), r = Math.max(0, ex);
          addMorph('eyeLookInLeft', l); addMorph('eyeLookOutRight', l);
          addMorph('eyeLookOutLeft', r); addMorph('eyeLookInRight', r);
          addMorph('eyeLookDownLeft', Math.max(0, -ey)); addMorph('eyeLookDownRight', Math.max(0, -ey));
          addMorph('eyeLookUpLeft', Math.max(0, ey)); addMorph('eyeLookUpRight', Math.max(0, ey));
        }

        // blink (on top of anything the animation already does)
        if (blinkT < 0 && t > blinkAt && !reduced) blinkT = 0;
        let blink = 0;
        if (blinkT >= 0) {
          blinkT += dt;
          blink = Math.sin(Math.min(1, blinkT / 0.17) * Math.PI);
          if (blinkT > 0.17) { blinkT = -1; blinkAt = t + 2200 + Math.random() * 3200; blink = 0; }
        }
        addMorph('eyeBlinkLeft', blink); addMorph('eyeBlinkRight', blink);

        // expression
        const sm = P.smile * lookW;
        addMorph('mouthSmileLeft', sm); addMorph('mouthSmileRight', sm);
        addMorph('cheekSquintLeft', sm * 0.4); addMorph('cheekSquintRight', sm * 0.4);
        addMorph('browInnerUp', P.brow * lookW);
      };
      const tick = (t) => {
        raf = requestAnimationFrame(tick);
        const dt = Math.min(0.05, (t - last) / 1000);
        last = t;
        if (!visible || document.hidden) return;
        update(dt, t);
        renderer.render(scene, camera);
        if (!ready_) { ready_ = true; setReady(true); window.__avatarReady = true; window.dispatchEvent(new Event('avatar-ready')); }
      };

      const onMove = (e) => {
        if (e.pointerType === 'touch') return;
        if (e.target.closest && e.target.closest('.chat')) return;      // he does not react while you use the chat window
        const x = e.clientX / window.innerWidth;
        camXt = (x - 0.5) * 0.5;
        const z = x < 0.34 ? 'left' : x > 0.66 ? 'right' : 'center';
        if (z === lastZone) return;
        lastZone = z;
        request(z, performance.now());
      };
      const onLeave = () => { lastZone = null; if (react) until = Math.min(until, performance.now() + 500); };
      const onTap = () => { play(ROTATION[rot++ % ROTATION.length]); };

      const ro = new ResizeObserver(resize);
      ro.observe(wrap);
      const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        if (visible && touch && !announced) {
          announced = true;
          timers.push(setTimeout(() => request('center', performance.now()), 1400));
          timers.push(setTimeout(() => play('groove'), 4200));
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
      window.addEventListener('scroll', onScroll, { passive: true });
      raf = requestAnimationFrame(tick);


      return () => {
        cancelAnimationFrame(raf);
        timers.forEach(clearTimeout);
        ro.disconnect(); io.disconnect();
        window.removeEventListener('pointermove', onMove);
        document.documentElement.removeEventListener('mouseleave', onLeave);
        window.removeEventListener('blur', onLeave);
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('palette', onPalette);
        wrap.removeEventListener('pointerdown', onTap);
        mixer.stopAllAction();
        scene.traverse((o) => { o.geometry?.dispose?.(); [].concat(o.material || []).forEach((m) => m.dispose?.()); });
        floorTex.dispose();
        if (mirror) mirror.getRenderTarget().dispose();
        pmrem.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    }

    return () => { dead = true; stop(); };
  }, []);

  return (
    <div className="stage" ref={box} role="img" aria-label="3D avatar of Adhik Chintalwar, standing, who reacts as you scroll">
      <div className={`frame${ready ? ' on' : ''}`} ref={frameEl} />
      <p className="bubble" data-zone={cue.zone} data-show={cue.show} aria-live="polite">{cue.text}</p>
      {missing && <p className="missing">Add your avatar file at public/avatar/avatar.glb</p>}
    </div>
  );
}

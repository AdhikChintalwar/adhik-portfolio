// Procedural arm and hand gestures for a Mixamo-style humanoid (T-pose rest, Avaturn / Ready Player Me).
// No animation clips are needed: every pose is computed from world-space directions and blended smoothly.
//
// Character frame: +Y up, +Z forward (towards the camera). Poses below are written for the RIGHT arm
// (which sits on -X, the left of the screen). The left arm uses the same numbers mirrored in X.

const FINGERS = ['thumb', 'index', 'middle', 'ring', 'pinky'];

// ---- the pose the arms rest in while he works at the laptop ---------------------------------------
const IDLE = {
  d1: [-0.14, -1, 0.25],        // upper arm: hangs down, slightly out and forward
  d2: [0.05, -0.2, 1],          // forearm: forward towards the keyboard
  f: [0.03, -0.25, 1],          // fingers point along the forearm
  n: [0, -1, -0.25],            // palm faces down
  curl: { thumb: 0.3, index: 0.35, middle: 0.4, ring: 0.45, pinky: 0.5 },
  spread: 0,
};

// ---- gestures ----------------------------------------------------------------------------------------
// Each pose(t) returns the same fields as IDLE (any may be omitted to keep the idle value).
// dur is in seconds, including the ease in and ease out.
export const GESTURES = {
  thumbsUp: {
    side: 'right', dur: 3.0,
    pose: (t) => ({
      d1: [-0.12, -0.78, 0.62],
      d2: [0.34, 0.86 + 0.04 * Math.sin(t * 9), 0.40],
      f: [0.02, 0.28, 0.96],
      n: [0.95, 0.08, 0],                       // palm faces his midline, thumb side up
      curl: { thumb: 0, index: 1, middle: 1, ring: 1, pinky: 1 },
    }),
  },
  wave: {
    side: 'right', dur: 3.2,
    pose: (t) => {
      const w = Math.sin(t * 11);
      return {
        d1: [-0.04, -0.70, 0.52],
        d2: [0.28 + 0.05 * w, 0.92, 0.25],
        f: [0.10 + 0.15 * w, 1, 0.1],
        n: [0, 0.1, 1],                          // palm faces the visitor
        curl: { thumb: 0.15, index: 0.05, middle: 0.05, ring: 0.1, pinky: 0.1 },
        spread: 0.1,
      };
    },
  },
  peace: {
    side: 'left', dur: 3.0,
    pose: (t) => ({
      d1: [-0.10, -0.74, 0.50],
      d2: [0.26, 0.9, 0.32],
      f: [0.10, 1, 0.12 + 0.03 * Math.sin(t * 6)],
      n: [0, 0.1, 1],
      curl: { thumb: 0.85, index: 0, middle: 0, ring: 1, pinky: 1 },
      spread: 0.2,
    }),
  },
  pointAtYou: {
    side: 'right', dur: 2.8,
    pose: (t) => ({
      d1: [-0.12, -0.15, 0.98],
      d2: [0.59, 0.28 + 0.03 * Math.sin(t * 8), 0.74],
      f: [0.25, 0.22, 0.94],
      n: [0.8, -0.5, 0],
      curl: { thumb: 0.55, index: 0, middle: 1, ring: 1, pinky: 1 },
    }),
  },
  clap: {
    side: 'both', dur: 2.6,
    pose: (t) => {
      const c = 0.5 + 0.5 * Math.sin(t * 15);   // 0 = hands apart, 1 = together
      return {
        d1: [-0.10, -0.40, 0.91],
        d2: [0.48 + 0.30 * c, 0.20, 0.85],
        f: [0.35 + 0.25 * c, 0.55, 0.80],
        n: [1, 0.05, 0],
        curl: { thumb: 0.1, index: 0, middle: 0, ring: 0, pinky: 0 },
      };
    },
  },
  nod: {
    side: null, dur: 2.4,
    pose: () => ({}),
    head: (t, env) => 0.13 * Math.sin(t * 8.5) * env,   // adds to head pitch
  },
};
export const GESTURE_NAMES = Object.keys(GESTURES);

export function createGestures(THREE, bones) {
  const { Vector3: V3, Quaternion: Q, Matrix4: M4 } = THREE;
  const V = (a, mirror) => new V3(mirror ? -a[0] : a[0], a[1], a[2]);

  const mk = (side) => {
    const g = (n) => bones[`${side}${n}`];
    const r = { side, sgn: side === 'right' ? -1 : 1, arm: g('arm'), fore: g('forearm'), hand: g('hand'), fingers: {} };
    FINGERS.forEach((f) => { r.fingers[f] = [1, 2, 3].map((k) => g(`hand${f}${k}`)).filter(Boolean); });
    return r;
  };
  const rig = { right: mk('right'), left: mk('left') };
  const ok = (r) => r.arm && r.fore && r.hand;
  const sides = ['right', 'left'].filter((s) => ok(rig[s]));

  // basis with columns [y x z, y, z]; z is made perpendicular to y
  const _x = new V3(), _y = new V3(), _z = new V3(), _m = new M4();
  const triad = (y, z, out = new Q()) => {
    _y.copy(y).normalize();
    _z.copy(z).addScaledVector(_y, -z.dot(_y));
    if (_z.lengthSq() < 1e-8) _z.set(0, -1, 0).addScaledVector(_y, _y.y);
    _z.normalize();
    _x.crossVectors(_y, _z);
    return out.setFromRotationMatrix(_m.makeBasis(_x, _y, _z));
  };

  // ---- capture the rest (T-pose) data before anything is posed ----
  const wq = (o) => o.getWorldQuaternion(new Q());
  const wp = (o) => o.getWorldPosition(new V3());
  const down = new V3(0, -1, 0);
  sides.forEach((s) => {
    const r = rig[s];
    r.rest = {};
    const kid = { arm: r.fore, fore: r.hand, hand: r.fingers.middle[0] || r.fingers.index[0] };
    ['arm', 'fore', 'hand'].forEach((k) => {
      const y0 = wp(kid[k]).sub(wp(r[k])).normalize();
      const T0 = triad(y0, down);
      r.rest[k] = { corr: T0.clone().invert().multiply(wq(r[k])) };      // actual = ideal * corr
    });
    r.base = new Map();
    FINGERS.forEach((f) => r.fingers[f].forEach((b) => r.base.set(b, b.quaternion.clone())));
    r.curl = Object.fromEntries(FINGERS.map((f) => [f, IDLE.curl[f]]));
    r.spread = 0;
  });

  // ---- state ----
  let active = null;      // { name, g, t }
  let paused = false;
  const out = { nod: 0 };
  const ease = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
  const lerp3 = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

  const _pq = new Q(), _t = new Q(), _loc = new Q(), _qx = new Q(), _qz = new Q();
  const X = new V3(1, 0, 0), Z = new V3(0, 0, 1);
  function drive(bone, y, z, rest, k) {
    triad(y, z, _t).multiply(rest.corr);                 // target world rotation
    bone.parent.updateWorldMatrix(true, false);
    bone.parent.getWorldQuaternion(_pq);
    _loc.copy(_pq).invert().multiply(_t);
    if (k >= 1) bone.quaternion.copy(_loc); else bone.quaternion.slerp(_loc, k);
    bone.updateWorldMatrix(false, false);
  }

  const _d1 = new V3(), _d2 = new V3(), _f = new V3(), _n = new V3(), _h = new V3(), _zf = new V3(), _np = new V3();
  function poseSide(s, spec, u, dt, snap) {
    const r = rig[s];
    const mirror = s === 'left';
    const mix = (key) => lerp3(IDLE[key], spec[key] || IDLE[key], u);
    _d1.copy(V(mix('d1'), mirror)).normalize();
    _d2.copy(V(mix('d2'), mirror)).normalize();
    _f.copy(V(mix('f'), mirror)).normalize();
    _n.copy(V(mix('n'), mirror));
    // hinge of the elbow (shared by upper arm and forearm), then half of the wrist twist goes into the forearm
    _h.crossVectors(_d1, _d2);
    if (_h.lengthSq() < 1e-6) _h.set(0, -1, 0); else _h.normalize().multiplyScalar(-r.sgn);
    _np.copy(_n).addScaledVector(_d2, -_n.dot(_d2));
    _zf.copy(_h).multiplyScalar(0.5).addScaledVector(_np.lengthSq() > 1e-6 ? _np.normalize() : _h, 0.5);
    const k = snap ? 1 : 1 - Math.exp(-14 * dt);
    drive(r.arm, _d1, _h, r.rest.arm, k);
    drive(r.fore, _d2, _zf, r.rest.fore, k);
    drive(r.hand, _f, _n, r.rest.hand, k);

    // fingers
    const ck = snap ? 1 : 1 - Math.exp(-12 * dt);
    const cs = spec.curl || {};
    FINGERS.forEach((f) => {
      const target = IDLE.curl[f] + ((cs[f] ?? IDLE.curl[f]) - IDLE.curl[f]) * u;
      r.curl[f] += (target - r.curl[f]) * ck;
    });
    const sp = (spec.spread || 0) * u;
    r.spread += (sp - r.spread) * ck;
    const A = { index: [1.35, 1.7, 1.1], middle: [1.35, 1.7, 1.1], ring: [1.35, 1.7, 1.1], pinky: [1.4, 1.7, 1.1], thumb: [0.45, 0.85, 0.85] };
    const SP = { index: 1, middle: 0, ring: -0.6, pinky: -1.2, thumb: 0 };
    FINGERS.forEach((f) => {
      r.fingers[f].forEach((b, i) => {
        _qx.setFromAxisAngle(X, A[f][i] * r.curl[f]);
        _loc.copy(r.base.get(b)).multiply(_qx);
        if (i === 0 && SP[f]) { _qz.setFromAxisAngle(Z, SP[f] * r.spread * r.sgn * -1); _loc.multiply(_qz); }
        b.quaternion.copy(_loc);
      });
    });
  }

  function update(dt, snap = false) {
    if (paused && !snap) return out;
    let name = null, g = null, u = 0, t = 0;
    if (active) {
      active.t += dt;
      t = active.t; g = active.g; name = active.name;
      u = ease(t / 0.5) * (1 - ease((t - (g.dur - 0.55)) / 0.55));
      if (t >= g.dur) { active = null; g = null; u = 0; }
    }
    sides.forEach((s) => {
      const on = g && (g.side === s || g.side === 'both');
      poseSide(s, on ? g.pose(t) : {}, on ? u : 0, dt, snap);
    });
    out.nod = g && g.head ? g.head(t, u) : 0;
    return out;
  }

  return {
    names: GESTURE_NAMES,
    get busy() { return !!active; },
    get current() { return active && active.name; },
    trigger(name) {
      const g = GESTURES[name];
      if (!g || !sides.length) return false;
      if (g.side && g.side !== 'both' && !sides.includes(g.side)) return false;
      active = { name, g, t: 0 };
      return true;
    },
    update,
    snapIdle() { active = null; update(0.016, true); },
    // test helper: freeze at time t of a gesture, with the pose fully applied
    freeze(name, t) {
      const g = GESTURES[name];
      paused = true; active = null;
      if (!g) { update(0.016, true); return; }
      // apply with envelope forced to 1
      sides.forEach((s) => { const on = g.side === s || g.side === 'both'; poseSide(s, on ? g.pose(t) : {}, on ? 1 : 0, 0.016, true); });
      out.nod = g.head ? g.head(t, 1) : 0;
    },
    release() { paused = false; },
  };
}

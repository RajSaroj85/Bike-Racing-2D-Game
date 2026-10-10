
import * as THREE from "three";
import "./style.css";

// ============================================
// RAJ RACING 3D - UPDATED GAME
// ============================================

document.body.innerHTML = "";
document.body.style.cssText =
  "margin:0;overflow:hidden;background:#07100b;color:white;font-family:Arial,sans-serif";

const app = document.createElement("div");
app.id = "game";
app.style.cssText = "position:fixed;inset:0;overflow:hidden";
document.body.appendChild(app);

app.innerHTML = `
<div id="hud">
  <div class="hudbox"><small>LEVEL</small><b id="lv">1</b></div>
  <div class="hudbox"><small>SCORE</small><b id="sc">0</b></div>
  <div class="hudbox"><small>SPEED</small><b><span id="sp">0</span> <small>km/h</small></b></div>
  <div class="hudbox"><small>LEVEL DISTANCE</small><b><span id="dist">0</span><small>/1000m</small></b></div>
</div>
<div id="progress"><div id="bar"></div></div>
<div id="tiltStatus">PHONE TILT: OFF</div>
<div id="overlay">
  <div class="panel">
    <h1 id="title">RAJ <span>RACING</span></h1>
    <p id="message">Race 1,000 metres to complete each level!</p>
    <p id="stats"></p>
    <button id="start">START RACE</button>
    <button id="tilt">ENABLE PHONE TILT</button>
    <small>PC: Arrow keys / A-D to steer, W to accelerate</small>
  </div>
</div>
<div id="countdown"></div>
<div id="toast"></div>
<div id="controls">
  <button id="left">◀</button>
  <button id="horn">HORN</button>
  <button id="right">▶</button>
  <button id="brake">BRAKE</button>
  <button id="gas">GAS 🔥</button>
</div>`;

const style = document.createElement("style");
style.textContent = `
*{box-sizing:border-box;user-select:none;-webkit-user-select:none}
canvas{display:block;width:100%;height:100%}
#hud{position:absolute;z-index:3;top:10px;left:8px;right:8px;display:flex;gap:5px;justify-content:space-between;pointer-events:none}
.hudbox{background:#06120cdb;border:1px solid #437452;border-radius:9px;padding:8px 5px;flex:1;text-align:center;min-width:0;font-size:clamp(13px,3vw,20px)}
.hudbox small{display:block;font-size:9px;color:#a9cbb3;margin-bottom:4px}
.hudbox b small{display:inline;font-size:8px}
#progress{position:absolute;z-index:3;top:78px;left:10px;right:10px;height:6px;background:#28392d;border-radius:8px;overflow:hidden}
#bar{height:100%;width:0;background:#50ff84}
#tiltStatus{position:absolute;z-index:3;top:91px;left:10px;background:#001008b8;padding:5px 8px;border-radius:6px;font-size:10px}
#overlay{position:absolute;inset:0;z-index:10;display:flex;align-items:center;justify-content:center;background:#0009;padding:20px}
.panel{width:min(420px,100%);text-align:center;background:linear-gradient(145deg,#192e20,#07110a);border:1px solid #448a59;border-radius:20px;padding:25px 20px;box-shadow:0 10px 60px #000a}
.panel h1{font-size:29px;letter-spacing:2px}.panel h1 span{color:#4dff85}
.panel p{line-height:1.5;color:#d1e3d5;font-size:14px}
.panel button{width:100%;padding:14px;margin-top:11px;border:0;border-radius:10px;background:#4eff83;color:#06110a;font-weight:900;font-size:15px}
.panel #tilt{background:#293d30;color:white;border:1px solid #547c60}
.panel small{display:block;margin-top:15px;color:#9bb2a0;font-size:11px}
#countdown{display:none;position:absolute;z-index:8;top:35%;width:100%;text-align:center;font-size:100px;font-weight:1000;text-shadow:0 0 30px #4cff80;pointer-events:none}
#toast{position:absolute;z-index:6;top:23%;left:50%;transform:translateX(-50%);background:#00180beF;border:1px solid #4cff80;border-radius:9px;padding:11px 15px;font-weight:900;opacity:0;pointer-events:none;white-space:nowrap}
#controls{position:absolute;z-index:4;bottom:16px;left:0;right:0;display:flex;gap:9px;justify-content:center;align-items:center;padding:0 8px}
#controls button{width:54px;height:54px;border:1px solid #ffffff75;border-radius:50%;background:#07150ccc;color:white;font-weight:900;touch-action:none}
#controls #gas,#controls #brake{height:57px;width:64px;border-radius:13px}
#controls #gas{background:#34df69;color:#06110a}
@media(min-width:850px){#controls{opacity:.8}}
`;
document.head.appendChild(style);

// ---------------- SCENE ----------------

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87bfe8);
scene.fog = new THREE.Fog(0x87bfe8, 80, 260);

const camera = new THREE.PerspectiveCamera(
  65, innerWidth / innerHeight, 0.1, 500
);
camera.position.set(0, 5, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;
app.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff, 0x35452c, 2));
const sun = new THREE.DirectionalLight(0xffffff, 2.4);
sun.position.set(-15, 25, 10);
sun.castShadow = true;
scene.add(sun);

const material = (color, roughness = 0.7, metalness = 0) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });

const roadMat = material(0x30343a);
const grassMat = material(0x367b36);
const whiteMat = material(0xffffff);
const blackMat = material(0x101216);
const metalMat = material(0x9faab5, 0.35, 0.7);
const helmetMat = material(0xf3f3f3, 0.25, 0.3);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(500, 500), grassMat
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.12;
scene.add(ground);

const road = new THREE.Mesh(
  new THREE.PlaneGeometry(14, 500), roadMat
);
road.rotation.x = -Math.PI / 2;
road.position.set(0, -0.06, -190);
scene.add(road);

const laneMarkers = [];
for (let i = 0; i < 42; i++) {
  for (const x of [-2.3, 2.3]) {
    const marker = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.035, 3.2), whiteMat
    );
    marker.position.set(x, 0.02, -i * 9);
    scene.add(marker);
    laneMarkers.push(marker);
  }
}

// ---------------- BIKE + RIDER + EXHAUST ----------------

function createBike(color = 0xf32132) {
  const bike = new THREE.Group();
  const bodyMat = material(color, 0.3, 0.3);

  function box(w, h, d, m, x, y, z) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    bike.add(mesh);
    return mesh;
  }

  const wheels = [];
  for (const z of [-0.92, 0.8]) {
    const wheel = new THREE.Group();
    const tire = new THREE.Mesh(
      new THREE.TorusGeometry(0.37, 0.105, 10, 24), blackMat
    );
    tire.rotation.y = Math.PI / 2;
    wheel.add(tire);

    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.16, 12), metalMat
    );
    hub.rotation.z = Math.PI / 2;
    wheel.add(hub);
    wheel.position.set(0, 0.48, z);
    bike.add(wheel);
    wheels.push(wheel);
  }

  box(0.43, 0.28, 1.2, bodyMat, 0, 0.94, 0);
  box(0.62, 0.17, 0.55, bodyMat, 0, 1.05, -0.42);
  box(0.3, 0.24, 0.42, blackMat, 0, 1.12, 0.38);
  box(0.22, 0.1, 0.32, helmetMat, 0, 1.18, -0.78);
  box(0.92, 0.07, 0.08, metalMat, 0, 1.28, -0.78);
  box(0.42, 0.58, 0.3, blackMat, 0, 1.58, 0.08);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.23, 16, 12), material(0xe8b58d)
  );
  head.position.set(0, 1.96, -0.18);
  bike.add(head);

  const helmet = new THREE.Mesh(
    new THREE.SphereGeometry(0.26, 16, 12), helmetMat
  );
  helmet.position.set(0, 2.05, -0.2);
  bike.add(helmet);

  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(
      new THREE.BoxGeometry(0.13, 0.48, 0.13), blackMat
    );
    arm.position.set(side * 0.28, 1.45, -0.38);
    arm.rotation.x = -0.5;
    bike.add(arm);

    const leg = new THREE.Mesh(
      new THREE.BoxGeometry(0.17, 0.48, 0.17), blackMat
    );
    leg.position.set(side * 0.2, 1.04, 0.28);
    bike.add(leg);
  }

  // Exhaust pipes at rear of bike (+Z).
  for (const side of [-1, 1]) {
    const pipe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.09, 0.48, 12),
      metalMat
    );
    pipe.rotation.x = Math.PI / 2;
    pipe.position.set(side * 0.19, 0.77, 0.76);
    bike.add(pipe);
  }

  // Animated flame meshes. Hidden until GAS is pressed.
  const flames = [];
  const flameColors = [0xff3200, 0xff8c00, 0xffef54];

  for (const side of [-1, 1]) {
    const flameGroup = new THREE.Group();
    flameGroup.position.set(side * 0.19, 0.77, 1.04);

    for (let i = 0; i < 3; i++) {
      const flame = new THREE.Mesh(
        new THREE.ConeGeometry(0.105 - i * 0.02, 0.38 + i * 0.12, 8),
        new THREE.MeshBasicMaterial({
          color: flameColors[i],
          transparent: true,
          opacity: 0.9
        })
      );
      flame.rotation.x = -Math.PI / 2;
      flame.position.z = 0.12 + i * 0.12;
      flameGroup.add(flame);
    }

    flameGroup.visible = false;
    bike.add(flameGroup);
    flames.push(flameGroup);
  }

  bike.userData.wheels = wheels;
  bike.userData.flames = flames;
  return bike;
}

const player = createBike();
player.position.set(0, 0, 3);
scene.add(player);

// ---------------- SCENERY ----------------

const scenery = [];

function createTree(x, z) {
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.25, 2.3, 7),
    material(0x76502d)
  );
  trunk.position.y = 1.1;
  group.add(trunk);

  for (let i = 0; i < 3; i++) {
    const crown = new THREE.Mesh(
      new THREE.ConeGeometry(1.25 - i * 0.17, 1.8, 8),
      material([0x176b2d, 0x238539, 0x2d9943][i])
    );
    crown.position.y = 2.2 + i * 0.75;
    group.add(crown);
  }

  group.position.set(x, 0, z);
  scene.add(group);
  scenery.push(group);
}

for (let i = 0; i < 34; i++) {
  const z = -i * 12 - 10;
  createTree(-10 - Math.random() * 4, z);
  createTree(10 + Math.random() * 4, z - 4);
}

// ---------------- TRAFFIC ----------------

const traffic = [];
const carColors = [0xffbd21, 0x1685ff, 0xffffff, 0x28c76f, 0xd64cff];

function createCar(color) {
  const car = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.45, 0.7, 2.5),
    material(color, 0.35, 0.15)
  );
  body.position.y = 0.62;
  car.add(body);

  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 0.55, 1.15),
    material(0x8fc9e8, 0.25, 0.1)
  );
  cabin.position.set(0, 1.15, -0.12);
  car.add(cabin);

  for (const x of [-0.75, 0.75]) {
    for (const z of [-0.8, 0.8]) {
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.23, 0.23, 0.16, 12), blackMat
      );
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.34, z);
      car.add(wheel);
    }
  }
  return car;
}

function spawnTraffic() {
  if (traffic.length >= 8) return;

  const isBike = Math.random() < 0.4;
  const color = carColors[Math.floor(Math.random() * carColors.length)];
  const object = isBike ? createBike(color) : createCar(color);
  const lanes = [-4.3, -2.3, 0, 2.3, 4.3];
  const lane = lanes[Math.floor(Math.random() * lanes.length)];

  object.position.set(lane, 0, -95 - Math.random() * 70);
  scene.add(object);

  traffic.push({
    object,
    isBike,
    lane,
    relativeSpeed: 0.45 + Math.random() * 0.65,
    passed: false,
    nearMiss: false
  });
}

// ---------------- GAME STATE ----------------

let state = "ready";
let level = 1;
let score = 0;
let highScore = Number(localStorage.getItem("rajRaceBest") || 0);
let totalDistance = 0;
let levelDistance = 0;
let speed = 0;
let targetSpeed = 220;
let gasPressed = false;
let steerInput = 0;
let steer = 0;
let tilt = 0;
let tiltNeutral = null;
let tiltEnabled = false;
let lastSpawn = 0;
let lastScenery = performance.now();
let lastFrame = performance.now();
let countdownId = 0;
let toastTimer = null;

// ---------------- SOUND EFFECTS ----------------
// Browser-generated effects: no external audio files required.

let audio = null;
let engineOsc1 = null;
let engineOsc2 = null;
let engineGain = null;
let engineFilter = null;
let hornGain = null;
let hornOsc1 = null;
let hornOsc2 = null;
let hornTimer = null;

function initAudio() {
  if (audio) {
    if (audio.state === "suspended") audio.resume();
    return;
  }

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  audio = new AudioContextClass();

  // Deeper layered synthetic sports-bike engine.
  engineOsc1 = audio.createOscillator();
  engineOsc2 = audio.createOscillator();
  engineOsc1.type = "sawtooth";
  engineOsc2.type = "triangle";
  engineOsc1.frequency.value = 48;
  engineOsc2.frequency.value = 24;

  engineFilter = audio.createBiquadFilter();
  engineFilter.type = "lowpass";
  engineFilter.frequency.value = 160;

  engineGain = audio.createGain();
  engineGain.gain.value = 0;

  const engineMix = audio.createGain();
  engineMix.gain.value = 0.45;

  engineOsc1.connect(engineMix);
  engineOsc2.connect(engineMix);
  engineMix.connect(engineFilter);
  engineFilter.connect(engineGain);
  engineGain.connect(audio.destination);

  engineOsc1.start();
  engineOsc2.start();

  // Sharp, descending electronic "bullet-style" horn.
  // This is a synthesized arcade sound, not a gunshot recording.
  hornOsc1 = audio.createOscillator();
  hornOsc2 = audio.createOscillator();
  hornOsc1.type = "square";
  hornOsc2.type = "sawtooth";

  hornGain = audio.createGain();
  hornGain.gain.value = 0;

  const hornFilter = audio.createBiquadFilter();
  hornFilter.type = "lowpass";
  hornFilter.frequency.value = 1500;

  hornOsc1.connect(hornFilter);
  hornOsc2.connect(hornFilter);
  hornFilter.connect(hornGain);
  hornGain.connect(audio.destination);

  hornOsc1.start();
  hornOsc2.start();
}

function engineOn() {
  initAudio();
  if (!audio || !engineGain) return;
  audio.resume();
  engineGain.gain.cancelScheduledValues(audio.currentTime);
  engineGain.gain.setTargetAtTime(0.045, audio.currentTime, 0.1);
}

function engineOff() {
  if (!audio) return;

  if (engineGain) {
    engineGain.gain.cancelScheduledValues(audio.currentTime);
    engineGain.gain.setTargetAtTime(0, audio.currentTime, 0.035);
  }

  if (hornGain) {
    hornGain.gain.cancelScheduledValues(audio.currentTime);
    hornGain.gain.setTargetAtTime(0, audio.currentTime, 0.01);
  }

  if (hornTimer) clearTimeout(hornTimer);
  hornTimer = null;
}

function updateEngine() {
  if (!audio || !engineGain) return;

  const now = audio.currentTime;
  const active = state === "racing";
  const rpm = 42 + speed * 1.2;

  engineOsc1.frequency.setTargetAtTime(active ? rpm : 42, now, 0.06);
  engineOsc2.frequency.setTargetAtTime(active ? rpm * 0.48 : 20, now, 0.06);
  engineFilter.frequency.setTargetAtTime(active ? 180 + speed * 4 : 100, now, 0.06);

  const volume = active ? 0.025 + speed / 400 * 0.055 : 0;
  engineGain.gain.setTargetAtTime(volume, now, 0.05);
}

function playHorn() {
  if (state !== "racing") return;

  initAudio();
  if (!audio || !hornGain) return;
  audio.resume();

  const now = audio.currentTime;
  hornGain.gain.cancelScheduledValues(now);
  hornOsc1.frequency.cancelScheduledValues(now);
  hornOsc2.frequency.cancelScheduledValues(now);

  hornGain.gain.setValueAtTime(0.16, now);
  hornGain.gain.setValueAtTime(0.16, now + 0.055);
  hornGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

  hornOsc1.frequency.setValueAtTime(950, now);
  hornOsc1.frequency.exponentialRampToValueAtTime(190, now + 0.23);
  hornOsc2.frequency.setValueAtTime(1450, now);
  hornOsc2.frequency.exponentialRampToValueAtTime(260, now + 0.23);

  if (hornTimer) clearTimeout(hornTimer);
  hornTimer = setTimeout(() => {
    if (audio && hornGain) {
      hornGain.gain.setTargetAtTime(0, audio.currentTime, 0.01);
    }
  }, 260);
}

// ---------------- UI ----------------

const $ = (id) => document.getElementById(id);

function updateHUD() {
  $("lv").textContent = level;
  $("sc").textContent = Math.floor(score).toLocaleString("en-IN");
  $("sp").textContent = Math.round(speed);
  $("dist").textContent = Math.floor(levelDistance);
  $("bar").style.width = `${Math.min(levelDistance / 10, 100)}%`;
}

function toast(text) {
  $("toast").textContent = text;
  $("toast").style.opacity = "1";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("toast").style.opacity = "0", 1400);
}

function overlay(title, message, buttonText, stats = "") {
  $("title").textContent = title;
  $("message").textContent = message;
  $("start").textContent = buttonText;
  $("stats").textContent = stats;
  $("overlay").style.display = "flex";
}

function hideOverlay() {
  $("overlay").style.display = "none";
}

// ---------------- TILT STEERING ----------------

async function enableTilt() {
  try {
    if (!("DeviceOrientationEvent" in window)) {
      toast("Tilt supported nahi hai; buttons use karo");
      return;
    }

    if (typeof DeviceOrientationEvent.requestPermission === "function") {
      const permission = await DeviceOrientationEvent.requestPermission();
      if (permission !== "granted") {
        toast("Motion permission allow karo");
        return;
      }
    }

    window.addEventListener("deviceorientation", (event) => {
      if (event.gamma == null) return;
      if (tiltNeutral === null) tiltNeutral = event.gamma;
      tilt = THREE.MathUtils.clamp((event.gamma - tiltNeutral) / 22, -1, 1);
    }, true);

    tiltEnabled = true;
    $("tiltStatus").textContent = "PHONE TILT: ON";
    toast("Tilt steering enabled!");
  } catch (error) {
    console.error(error);
    toast("Tilt enable nahi hua");
  }
}

// ---------------- GAME FLOW ----------------

function clearTraffic() {
  for (const item of traffic) scene.remove(item.object);
  traffic.length = 0;
}

function setFlames(on) {
  player.userData.flames.forEach((flame, i) => {
    flame.visible = on;
    if (on) {
      flame.scale.setScalar(0.7 + Math.random() * 0.8);
      flame.rotation.z = (Math.random() - 0.5) * 0.5;
    }
  });
}

function resetBike() {
  player.position.set(0, 0, 3);
  player.rotation.set(0, 0, 0);
  speed = 0;
  steer = 0;
  steerInput = 0;
  tilt = 0;
  gasPressed = false;
  targetSpeed = 220;
  setFlames(false);
}

function startCountdown(nextLevel = false) {
  const id = ++countdownId;

  engineOff();
  speed = 0;
  setFlames(false);
  state = "countdown";
  hideOverlay();
  $("countdown").style.display = "block";

  const steps = ["3", "2", "1", "GO!"];
  let index = 0;

  function tick() {
    if (id !== countdownId || state !== "countdown") return;

    if (index >= steps.length) {
      $("countdown").style.display = "none";
      state = "racing";
      engineOn();
      return;
    }

    $("countdown").textContent = steps[index++];
    setTimeout(tick, 750);
  }

  tick();
}

function startRace() {
  countdownId++;
  engineOff();

  level = 1;
  score = 0;
  totalDistance = 0;
  levelDistance = 0;

  clearTraffic();
  resetBike();
  lastSpawn = performance.now();
  lastScenery = performance.now();
  updateHUD();
  startCountdown();
}

function finishLevel() {
  if (state !== "racing") return;

  state = "levelComplete";
  speed = 0;
  gasPressed = false;
  setFlames(false);
  engineOff();
  countdownId++;

  // A level-completion bonus. Total score is retained.
  const bonus = 500 + Math.floor(Math.random() * 1001);
  score += bonus;

  highScore = Math.max(highScore, Math.floor(score));
  localStorage.setItem("rajRaceBest", String(highScore));

  updateHUD();

  overlay(
    `LEVEL ${level} COMPLETE!`,
    `Great ride! Next level is unlocked.`,
    "NEXT LEVEL",
    `Bonus +${bonus} | Total score: ${Math.floor(score)}`
  );

  $("start").onclick = () => {
    level++;
    levelDistance = 0; // Reset only the current level distance.
    clearTraffic();
    resetBike();
    updateHUD();
    lastSpawn = performance.now();
    startCountdown(true);
  };
}

function gameOver() {
  if (state !== "racing") return;

  state = "gameOver";
  speed = 0;
  gasPressed = false;
  setFlames(false);
  engineOff();
  countdownId++;
  $("countdown").style.display = "none";

  // Save the final score first, then reset the visible score to zero.
  const finalScore = Math.floor(score);
  highScore = Math.max(highScore, finalScore);
  localStorage.setItem("rajRaceBest", String(highScore));

  score = 0;
  levelDistance = 0;
  totalDistance = 0;
  updateHUD();

  overlay(
    "GAME OVER",
    "Crash ho gayi! Score zero kar diya gaya. Dobara race start karo.",
    "RESTART RACE",
    `Previous score: ${finalScore} | Best score: ${highScore}`
  );

  $("start").onclick = startRace;
}

$("start").onclick = startRace;
$("tilt").onclick = enableTilt;

// ---------------- CONTROLS ----------------

function bindHold(id, down, up = () => {}) {
  const button = $(id);

  button.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    button.setPointerCapture?.(e.pointerId);
    down();
  });

  for (const eventName of ["pointerup", "pointercancel", "lostpointercapture"]) {
    button.addEventListener(eventName, (e) => {
      e.preventDefault();
      up();
    });
  }
}

bindHold("left", () => { steerInput = -1; }, () => { steerInput = 0; });
bindHold("right", () => { steerInput = 1; }, () => { steerInput = 0; });

bindHold("gas", () => {
  gasPressed = true;
  targetSpeed = 400;
  initAudio();
}, () => {
  gasPressed = false;
  targetSpeed = 220;
  setFlames(false);
});

bindHold("brake", () => { targetSpeed = 0; }, () => { targetSpeed = 220; });
bindHold("horn", playHorn);

window.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();

  if (["arrowleft", "arrowright", "arrowup", "arrowdown", " "].includes(key)) {
    e.preventDefault();
  }

  if (key === "arrowleft" || key === "a") steerInput = -1;
  if (key === "arrowright" || key === "d") steerInput = 1;

  if (key === "arrowup" || key === "w") {
    gasPressed = true;
    targetSpeed = 400;
    initAudio();
  }

  if (key === "arrowdown" || key === "s") targetSpeed = 0;
  if (key === "h") playHorn();
});

window.addEventListener("keyup", (e) => {
  const key = e.key.toLowerCase();

  if (["arrowleft", "arrowright", "a", "d"].includes(key)) steerInput = 0;

  if (["arrowup", "arrowdown", "w", "s"].includes(key)) {
    gasPressed = false;
    targetSpeed = 220;
    setFlames(false);
  }
});

// ---------------- ENVIRONMENT SWITCH ----------------

let sceneryMode = 0;
let lastEnvironmentChange = performance.now();

function changeEnvironment() {
  sceneryMode = (sceneryMode + 1) % 4;

  const modes = [
    { sky: 0x87bfe8, ground: 0x367b36, name: "JUNGLE" },
    { sky: 0x91b7d6, ground: 0x777777, name: "CITY" },
    { sky: 0x9ccce8, ground: 0x47835d, name: "BRIDGE" },
    { sky: 0xf0b66b, ground: 0xc59a57, name: "DESERT" }
  ];

  const mode = modes[sceneryMode];
  scene.background.setHex(mode.sky);
  scene.fog.color.setHex(mode.sky);
  ground.material.color.setHex(mode.ground);

  scenery.forEach((prop) => {
    prop.visible = sceneryMode === 1
      ? Math.random() > 0.4
      : sceneryMode === 3
        ? Math.random() > 0.6
        : true;
  });

  toast(mode.name);
}

function moveWorld(dt) {
  const movement = speed / 3.6 * dt;

  laneMarkers.forEach((marker) => {
    marker.position.z += movement;
    if (marker.position.z > 8) marker.position.z -= 378;
  });

  scenery.forEach((prop) => {
    prop.position.z += movement;
    if (prop.position.z > 14) prop.position.z -= 420;
  });
}

// ---------------- TRAFFIC COLLISIONS ----------------

function collide(item) {
  const dx = Math.abs(player.position.x - item.object.position.x);
  const dz = Math.abs(player.position.z - item.object.position.z);
  return dx < (item.isBike ? 0.85 : 1.15) && dz < 1.65;
}

function updateTraffic(dt) {
  const movement = speed / 3.6 * dt;

  for (let i = traffic.length - 1; i >= 0; i--) {
    const item = traffic[i];
    item.object.position.z += movement * (0.8 + item.relativeSpeed);

    const dx = Math.abs(player.position.x - item.object.position.x);
    const dz = Math.abs(player.position.z - item.object.position.z);

    if (
      !item.nearMiss &&
      !item.passed &&
      dz < 3.2 && dz > 1.1 &&
      dx < 1.7 && dx > 0.65
    ) {
      item.nearMiss = true;
      const bonus = 100 + Math.floor(Math.random() * 401);
      score += bonus;
      toast(`CLOSE CALL +${bonus}`);
    }

    if (collide(item)) {
      gameOver();
      return;
    }

    if (!item.passed && item.object.position.z > player.position.z + 1.5) {
      item.passed = true;
      const bonus = 50 + Math.floor(Math.random() * 451);
      score += bonus;
      toast(`OVERTAKE +${bonus}`);
    }

    if (item.object.position.z > 15) {
      scene.remove(item.object);
      traffic.splice(i, 1);
    }
  }
}

// ---------------- MAIN LOOP ----------------

function animate(now = performance.now()) {
  requestAnimationFrame(animate);

  const dt = Math.min((now - lastFrame) / 1000, 0.05);
  lastFrame = now;

  if (state === "racing") {
    speed += (targetSpeed - speed) * Math.min(1, dt * 1.8);
    speed = THREE.MathUtils.clamp(speed, 0, 400);

    const desired = THREE.MathUtils.clamp(
      steerInput + (tiltEnabled ? tilt : 0), -1, 1
    );
    steer += (desired - steer) * Math.min(1, dt * 5);

    player.position.x += steer * (3 + speed / 100) * dt;
    player.position.x = THREE.MathUtils.clamp(player.position.x, -5.6, 5.6);
    player.rotation.z = -steer * 0.22;
    player.rotation.y = -steer * 0.12;

    player.userData.wheels.forEach((wheel) => {
      wheel.rotation.x -= speed * dt * 0.035;
    });

    // Flame effect stays on while the GAS control is held.
    setFlames(gasPressed && speed > 5);

    const travelled = speed / 3.6 * dt;
    levelDistance += travelled;
    totalDistance += travelled;
    score += travelled * 2;

    moveWorld(dt);
    updateTraffic(dt);

    if (state === "racing" && now - lastSpawn > Math.max(450, 1300 - speed * 1.7)) {
      spawnTraffic();
      lastSpawn = now;
    }

    if (state === "racing" && now - lastEnvironmentChange > 10000) {
      changeEnvironment();
      lastEnvironmentChange = now;
    }

    if (state === "racing" && levelDistance >= 1000) {
      levelDistance = 1000;
      finishLevel();
    }

    updateEngine();
    updateHUD();
  } else {
    // Win/Game Over/countdown: engine muted and exhaust off.
    speed = 0;
    setFlames(false);
    updateEngine();
  }

  camera.position.x += (player.position.x * 0.45 - camera.position.x) * 0.07;
  camera.position.y += (5.2 - camera.position.y) * 0.04;
  camera.position.z += (10 - camera.position.z) * 0.04;
  camera.lookAt(player.position.x * 0.2, 1, -9);

  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

updateHUD();
overlay(
  "RAJ RACING",
  "Har 1,000 metres par next level! GAS dabao aur exhaust flames dekho.",
  "START RACE",
  `BEST SCORE: ${highScore}`
);

requestAnimationFrame(animate);

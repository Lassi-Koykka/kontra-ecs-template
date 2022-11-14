import './style.css'
import {
  Types,
  pipe,
  createWorld,
  defineComponent,
  defineQuery,
  IWorld,
  addComponent,
  addEntity,
  Component,
} from "bitecs"

import {
  GameLoop, 
  Sprite,
  init,
  Vector,
  GameObject, 
} from "kontra";

import { setCanvasScale } from './utils';
import { keyDown, keyPress } from './input';

const {canvas, context} = init("gameCanvas")

// --- Globals ---
globalThis.canvas = canvas;
globalThis.ctx = context;
globalThis.KEYMAP = {};
globalThis.KEYMAP_PREV = {};
globalThis.GAMESTATE = {
  paused: false,
  scene: "game",
};

// --- Canvas ---
canvas.tabIndex = 1;
setCanvasScale();
window.onresize = () => setCanvasScale();

// --- Context ---
const ctx = canvas.getContext("2d", {alpha: false, desynchronized: true})!;
ctx.lineWidth = 2;
ctx.imageSmoothingEnabled = false;
// ctx.font = "40px 'Press Start 2P'";


// --- Audio Context ---
//@ts-ignore
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// --- Input Setup ---
const updateKeyMap = (e: KeyboardEvent) => {
  // e.preventDefault()
  KEYMAP[e.key.toLowerCase()] = e.type === "keydown";
};

const resetKeymap = () => {
  KEYMAP = {};
  KEYMAP_PREV = {};
};

window.onkeydown = (e) => updateKeyMap(e);
window.onkeyup = (e) =>  updateKeyMap(e);
window.onblur = () => resetKeymap();
window.onfocus = () => resetKeymap();


interface W extends IWorld {
  delta: number
}

const Vector2 = {x: Types.f32, y: Types.f32}
const SizeData = {w: Types.f32, h: Types.f32}
const BoxColliderData = {...SizeData, anchor: Vector2, offset: Vector2}
// const CircleColliderData = {r: Types.f32, offset: Vector2}
const ControlData = { dir: Vector2, action1: Types.ui8, action2: Types.ui8, action3: Types.ui8, action4: Types.f32, menu: Types.ui8 }

const GameObjectComp = defineComponent()
const InputListener = defineComponent()
const Speed = defineComponent({ val: Types.f32 });
const Position = defineComponent({...Vector2, ox: Types.f32, oy: Types.f32});
const Size = defineComponent(SizeData)
const BoxCollider = defineComponent(BoxColliderData)
// const CircleCollider = defineComponent(CircleColliderData)
const Controls = defineComponent(ControlData)

const inputListenerQuery = defineQuery([InputListener, Controls])
const gameObjectQuery = defineQuery([GameObjectComp, Position, Size])
const movementQuery = defineQuery([Position, Speed, Controls])
const colliderQuery = defineQuery([BoxCollider, Position])

// --- SYSTEMS ---
const inputSystem = (world: W) => {
  const entities = inputListenerQuery(world)
  for (let eid of entities) {
    let dir = Vector(0, 0)
    // Static movement, no acceleration
    if (keyPress("UP") || (!keyDown("DOWN") && keyDown("UP"))) dir.y = -1;
    if (keyPress("DOWN") || (!keyDown("UP") && keyDown("DOWN"))) dir.y = 1;
    if (!keyDown("UP") && !keyDown("DOWN")) dir.y = 0;

    if (keyPress("LEFT") || (!keyDown("RIGHT") && keyDown("LEFT"))) dir.x = -1;
    if (keyPress("RIGHT") || (!keyDown("LEFT") && keyDown("RIGHT"))) dir.x = 1;
    if (!keyDown("LEFT") && !keyDown("RIGHT")) dir.x = 0;

    dir.normalize()
    Controls.dir.x[eid] = dir.x
    Controls.dir.y[eid] = dir.y
  }
  return world
}

const movementSystem = (world: W) => {
  const {delta} = world
  const entities = movementQuery(world)
  for (let eid of entities) {
      let pos = Vector(Position.x[eid], Position.y[eid])
      Position.ox[eid] = pos.x
      Position.oy[eid] = pos.y
      Position.x[eid] = pos.x + Controls.dir.x[eid] * Speed.val[eid] * delta;
      Position.y[eid] = pos.y + Controls.dir.y[eid] * Speed.val[eid] * delta;
  }
  return world
}

const collisionSystem = (world: W) => {
  const entities = colliderQuery(world)
  for (let eid of entities) {
    let pos = Vector(Position.x[eid], Position.y[eid])
    let offset = Vector(BoxCollider.offset.x[eid], BoxCollider.offset.y[eid])
    let anchor = Vector(BoxCollider.anchor.x[eid], BoxCollider.anchor.y[eid])

    let w = BoxCollider.w[eid]
    let h = BoxCollider.h[eid]

    const l = pos.x - Math.floor(w * (1 - anchor.x)) + offset.x
    const r = pos.x + Math.floor(w * (1 - anchor.x)) + offset.x
    const t = pos.y - Math.floor(h * (1 - anchor.y)) + offset.y
    const b = pos.y + Math.floor(h * (1 - anchor.y)) + offset.y
  }

  return world
}

const gameObjectUpdateSystem = (world: W) => {
    const entities = gameObjectQuery(world)
    for (const eid of entities) {
        const go = gameObjects[eid]
        if (!go) {
            continue
        }

        go.x = Position.x[eid]
        go.y = Position.y[eid]
        go.width = Size.w[eid]
        go.height = Size.h[eid]
    }
    return world
}

const renderGameObjects = (world: W) => {
    const entities = gameObjectQuery(world)
    for (const eid of entities) {
      const go = gameObjects[eid]
      if(!go) continue
      go.render()
    }
    return world
} 

const pipeline = pipe(inputSystem, movementSystem, gameObjectUpdateSystem);
const renderPipeline = pipe(renderGameObjects)
const world: W  = createWorld();
world.delta = 0;

const gameObjects: {[eid: number]: GameObject} = {}

// --- UTILITY FUNCTIONS ---
const addGameObject = (world: W, eid: number, go: GameObject) => {
  addComponent(world, GameObjectComp, eid)
  gameObjects[eid] = go
}

const gameObjectToActor = (go: GameObject): number => {
  const eid = addEntity(world)
  const components: Component[] = [
    Size,
    Position,
  ]

  for (let c of components) addComponent(world, c, eid);

  Size.w[eid] = go.width
  Size.h[eid] = go.height
  Position.x[eid] = go.x
  Position.y[eid] = go.y
  Position.ox[eid] = go.x
  Position.oy[eid] = go.y

  addGameObject(world, eid, go)

  return eid
}

// --- GAMEOBJECTS ---
const player = (x: number, y: number) => {
  const playerSprite = Sprite({
    x,
    y,
    width: 16 * 3,
    height: 32 * 3,
    anchor: Vector(0.5, 0.5),
    color: "red"
  })

  const eid = gameObjectToActor(playerSprite)

  const components: Component[] = [
    Speed,
    InputListener,
    Controls,
    BoxCollider,
  ]

  for (let c of components) addComponent(world, c, eid);

  Speed.val[eid] = 200;
  BoxCollider.w[eid] = Size.w[eid]
  BoxCollider.h[eid] = Size.h[eid]
  BoxCollider.anchor.x[eid] = BoxCollider.anchor.y[eid] = 0.5
  BoxCollider.offset.x[eid] = BoxCollider.offset.y[eid] = 0

  return eid
}

const obstacle = (x: number, y: number): number => {
  const obstacleSprite = Sprite({
    x,
    y,
    width: 32 * 3,
    height: 32 * 3,
    anchor: Vector(0.5, 0.5),
    color: "white"
  })

  const eid = gameObjectToActor(obstacleSprite)
  const components: Component[] = [
    BoxCollider
  ]

  for (let c of components) addComponent(world, c, eid);

  BoxCollider.w[eid] = Size.w[eid]
  BoxCollider.h[eid] = Size.h[eid]
  BoxCollider.anchor.x[eid] = BoxCollider.anchor.y[eid] = 0.5
  BoxCollider.offset.x[eid] = BoxCollider.offset.y[eid] = 0
  return eid
}

player(canvas.width / 2, canvas.height / 2)
obstacle( canvas.width / 4, canvas.height / 2 )
obstacle( canvas.width * 0.75, canvas.height / 2 )

// --- LOOP ---
let loop = GameLoop({
  update: (delta) => {
    world.delta = delta;
    pipeline(world)

    // Set keymap history
    KEYMAP_PREV = Object.assign(KEYMAP_PREV, KEYMAP);
  },
  render: () => { // render the game state
    renderPipeline(world)
  }
});

loop.start();    //
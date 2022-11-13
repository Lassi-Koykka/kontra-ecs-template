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

const Vector2 = {x: Types.f32, y: Types.f32, xPrev: Types.f32, yPrev: Types.f32}
const ControlData = { dir: Vector2, action1: Types.ui8, action2: Types.ui8, action3: Types.ui8, action4: Types.f32, menu: Types.ui8 }

const SpriteComp = defineComponent()
const InputListener = defineComponent()
const Speed = defineComponent({ val: Types.f32 });
const Position = defineComponent(Vector2);
const Controls = defineComponent(ControlData)

const inputListenerQuery = defineQuery([InputListener, Controls])
const movementQuery = defineQuery([Position, Speed, Controls])
const spriteQuery = defineQuery([SpriteComp, Position])

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
      Position.xPrev[eid] = pos.x
      Position.yPrev[eid] = pos.y
      Position.x[eid] = pos.x + Controls.dir.x[eid] * Speed.val[eid] * delta;
      Position.y[eid] = pos.y + Controls.dir.y[eid] * Speed.val[eid] * delta;
  }
  return world
}

const positionSprites = (world: W) => {
    const entities = spriteQuery(world)
    for (const eid of entities) {
        const sprite = sprites[eid]
        if (!sprite) {
            continue
        }

        sprite.x = Position.x[eid]
        sprite.y = Position.y[eid]
    }
    return world
}

const renderSprites = (world: W) => {
    const entities = spriteQuery(world)
    for (const eid of entities) {
      const sprite = sprites[eid]
      if(!sprite) continue
      sprite.render()
    }
    return world
} 

const pipeline = pipe(inputSystem, movementSystem, positionSprites);
const renderPipeline = pipe(renderSprites)
const world: W  = createWorld();
world.delta = 0;

const sprites: {[eid: number]: Sprite} = {}

const addSprite = (world: W, eid: number, sprite: Sprite) => {
  addComponent(world, SpriteComp, eid)
  sprites[eid] = sprite
}

const addPlayer = (): number => {
  const p = addEntity(world)
  const components: Component[] = [
    Speed,
    Position,
    InputListener,
    Controls
  ]
  for (let c of components) {
    addComponent(world, c, p)
  }

  const pos = Vector(
    canvas.width / 2,
    canvas.height / 2
  )

  Position.x[p] = pos.x
  Position.y[p] = pos.y
  Speed.val[p] = 200

  addSprite(world, p, Sprite({
    x: pos.x,
    y: pos.y,
    width: 16 * 3,
    height: 32 * 3,
    color: "red",
    anchor: {x: 0.5, y: 0.5}
  }))

  return p
}

addPlayer()

let loop = GameLoop({
  update: function(delta) {
    world.delta = delta;
    pipeline(world)

    // Set keymap history
    KEYMAP_PREV = Object.assign(KEYMAP_PREV, KEYMAP);
  },
  render: function() { // render the game state
    renderPipeline(world)
  }
});

loop.start();    //

import './style.css'
import { W } from './types';
import {pipe, createWorld, defineQuery} from "bitecs"
import {GameLoop, init, TileEngine, Vector} from "kontra";
import { setCanvasScale } from './utils';
import { movementSystem, inputSystem, collisionSystem, colliderQuery, getColliderBounds } from './systems';
import { GameObjectComp, Position, Size } from './components';
import { Obstacle, Player } from './entities';

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

const gameObjectQuery = defineQuery([GameObjectComp, Position, Size])

const updateGameObjects = (world: W) => {
    const entities = gameObjectQuery(world)
    for (const eid of entities) {
      const go = world.gameObjects[eid]
      if(!go) continue
      go.update()
    }
    return world
} 

const renderGameObjects = (world: W) => {
    const entities = gameObjectQuery(world)
    for (const eid of entities) {
      const go = world.gameObjects[eid]
      if(!go) continue
      go.render()
    }
    return world
} 

const renderColliders = (world: W) => {
  const entities = colliderQuery(world)
  for (const eid of entities) {
    const {t,b,l,r} = getColliderBounds(eid)

    ctx.save();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "purple";
    ctx.strokeRect(l,t,r - l,b - t);
    ctx.restore();
  }
}

const pipeline = pipe(
  inputSystem, 
  movementSystem, 
  collisionSystem,
  updateGameObjects
);
const renderPipeline = pipe(
  renderGameObjects, 
  // renderColliders
)
const world: W  = createWorld();
// const quadTree = Quadtree();
world.delta = 0;
world.gameObjects = {}
world.collisions = {}

Player(world, canvas.width / 2, canvas.height / 2)


Obstacle(world, canvas.width / 4, canvas.height / 2 )
Obstacle(world, canvas.width * 0.75, canvas.height / 2 )
Obstacle(world, canvas.width * 0.5, canvas.height * 0.75 )
Obstacle(world, canvas.width * 0.5, canvas.height * 0.25 )
Obstacle(world, canvas.width / 2, canvas.height -10, canvas.width, 10 )

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

loop.start();

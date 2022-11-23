import './style.css'
import { W } from './types';
import {pipe, createWorld } from "bitecs"
import {GameLoop, imageAssets, init, load, TileEngine} from "kontra";
import { scaleImage, setCanvasScale } from './utils';
import { movementSystem, inputSystem, collisionSystem, updateGameObjects, gameObjectQuery } from './systems';
import { Obstacle, Player } from './entities';
import { renderColliders, renderGameObjects } from './rendering';
import { Transform, Velocity } from './components';

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

const pipeline = pipe(
  inputSystem, 
  movementSystem, 
  collisionSystem,
  updateGameObjects
);

const renderPipeline = pipe(
  renderGameObjects, 
  renderColliders
)

const world: W  = createWorld();
// const quadTree = Quadtree();
world.delta = 0;
world.gameObjects = {};
world.collisions = {};

(async () => {
  // --- LOAD ASSETS ---
  await load(
    'images/Player_Idle.png',
    'images/Player_Walk.png',
    'images/Player_Air.png',
    'images/Tileset.png',
    'images/Background_Tileset.png',
  )

  const scale = 7
  const tilesetImg = scaleImage(imageAssets["images/Background_Tileset"], scale)
  const tileSize = 14 * scale

  const tileEngine = TileEngine({
    width: Math.ceil(canvas.width / tileSize),
    height: Math.ceil(canvas.height / tileSize),
    tilewidth:  tileSize,
    tileheight: tileSize,
    tilesets: [{
      image: tilesetImg,
      firstgid: 1,
      margin: scale * 2,
      columns: 11,
    }],
    layers: [{
      name: "ground",
      data: [
         "35", "35", "35", "35", "35", "35", "35", "35", "35", "35", "35", "35", "35",
         "35", "35", "35", "35", "35", "35", "35", "35", "35", "35", "35", "35", "35",
         "35", "35", "35", "35", "35", "35", "35", "35", "35", "35", "35", "35", "35",
         "35", "35", "35", "35", "35", "35", "35", "35", "35", "35", "35", "35", "35",
         "35", "35", "35", "35", "35", "35", "35", "35", "35", "35", "35", "35", "35",
         "35", "35", "35", "35", "35", "35", "35", "35", "35", "35", "35", "35", "35",
         "35", "35", "35", "35", "35", "35", "35", "35", "35", "35", "35", "35", "35",
         "35", "35", "35", "35", "35", "35", "35", "35", "35", "35", "35", "35", "35",
         "35", "35", "35", "35", "35", "35", "35", "35", "35", "35", "35", "35", "35",
      ]
    }]
  })

  tileEngine.tilewidth = 50,
  tileEngine.tileheight = 50

  world.tileEngine = tileEngine

  // --- ADD ENTITIES ---
  const player = Player(world, canvas.width / 2, canvas.height / 2)

  Obstacle(world, canvas.width / 4, canvas.height / 2 );
  Obstacle(world, canvas.width * 0.75, canvas.height / 2 );
  Obstacle(world, canvas.width * 0.5, canvas.height * 0.75 );
  Obstacle(world, canvas.width * 0.5, canvas.height * 0.25 );
  Obstacle(world, canvas.width / 2, canvas.height -10, canvas.width, 30 );

  const entities = gameObjectQuery(world)

  for (let eid of entities) {
    const go = world.gameObjects[eid]
    if(!go) continue
    world.tileEngine.add(go)
  }

  // --- LOOP ---
  let loop = GameLoop({
    update: (delta) => {
      world.delta = delta;
      pipeline(world)

      //Update camera
      if((Transform.x[player.eid] < canvas.width / 4 && Velocity.x[player.eid] < -0.1) || (Transform.x[player.eid] > canvas.width * 0.75 && Velocity.x[player.eid] > 0.1)) {
        world.tileEngine.sx += Transform.x[player.eid] - Transform.ox[player.eid]
      }
      if((Transform.y[player.eid] < canvas.height / 4 && Velocity.y[player.eid] < -0.1) || (Transform.y[player.eid] > canvas.height * 0.75 && Velocity.y[player.eid] > 0.1)) {
        world.tileEngine.sy += Transform.y[player.eid] - Transform.oy[player.eid]
      }

      // Set keymap history
      KEYMAP_PREV = Object.assign(KEYMAP_PREV, KEYMAP);
    },
    render: () => { // render the game state
      world.tileEngine.render()
      // renderPipeline(world)

    }
  });

  loop.start();
})()

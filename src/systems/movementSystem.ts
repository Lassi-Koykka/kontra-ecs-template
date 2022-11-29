import { hasComponent } from "bitecs"
import { clamp, TileEngine, Vector } from "kontra"
import { Controls, Physics2D, Speed, TileMovement, Transform, Velocity } from "../components"
import { movementQuery } from "../queries"
import { W } from "../types"
import { updateGameObject } from "./actorUpdateSystem"

// Tile movement
const tileMovement = ({delta, eid, tileEngine}: {delta: number, eid: number, tileEngine: TileEngine}) => {
      const te = tileEngine
      const tileSize = te.tilewidth
      let pos = Vector(Transform.x[eid], Transform.y[eid]);
      let startPos = Vector(TileMovement.sx[eid], TileMovement.sy[eid]);
      let endPos = Vector(TileMovement.ex[eid], TileMovement.ey[eid]);
      let vel = Vector(Velocity.x[eid], Velocity.y[eid]);
      let dir = Vector(Controls.dir.x[eid], Controls.dir.y[eid]);
      let speed = Speed.val[eid]


      if(pos.x === endPos.x && pos.y === endPos.y) {
        vel.x = 0;
        vel.y = 0;
        startPos.x = pos.x;
        startPos.y = pos.y;

        if(dir.x !== 0 && dir.y !== 0) return
        vel.x = dir.x * speed;
        vel.y = dir.y * speed;
        endPos = pos.add(dir.scale(tileSize));
        // TODO check if valid movementTile 
      }

        pos.x = clamp(Math.min(startPos.x, endPos.x), Math.max(startPos.x, endPos.x), pos.x + vel.x * delta);
        pos.y = clamp(Math.min(startPos.y, endPos.y), Math.max(startPos.y, endPos.y), pos.y + vel.y * delta);

        Velocity.x[eid] = vel.x
        Velocity.y[eid] = vel.y
        Transform.x[eid] = pos.x;
        Transform.y[eid] = pos.y;
        TileMovement.sx[eid] = startPos.x
        TileMovement.sy[eid] = startPos.y
        TileMovement.ex[eid] = endPos.x
        TileMovement.ey[eid] = endPos.y
}

const movementSystem = (world: W) => {
  const {delta, tileEngine}: {delta: number, tileEngine: TileEngine} = world
  const entities = movementQuery(world)
  for (let eid of entities) {
      let pos = Vector(Transform.x[eid], Transform.y[eid])
      let vel = Vector(Velocity.x[eid], Velocity.y[eid])
      const hasPhysics = hasComponent(world, Physics2D, eid)
      const hasTileMovement = hasComponent(world, TileMovement, eid)
      Transform.ox[eid] = pos.x
      Transform.oy[eid] = pos.y

      if(hasTileMovement) {
        tileMovement({delta, eid, tileEngine})
        return world
      }

      const gravity = hasPhysics ? Physics2D.gravity[eid] : 0;
      const grounded = hasPhysics && Physics2D.grounded[eid] === 1;

      vel.x = Controls.dir.x[eid] * Speed.val[eid];

      if(gravity) {
        let g = gravity
        Transform.y[eid] = pos.y + gravity * delta
        if(grounded && Controls.action1[eid]) {
            const jumpHeight = Physics2D.jumpHeight[eid]
            vel.y = -Math.sqrt(jumpHeight * -2 * -g); 
        }
        if(vel.y > 0)  g *= 1.5
        vel.y = vel.y + gravity * delta

      } else {
        vel.y = Controls.dir.y[eid] * Speed.val[eid]
      }
      Velocity.x[eid] = vel.x
      Velocity.y[eid] = vel.y

      Transform.x[eid] = pos.x + vel.x * delta;
      Transform.y[eid] = pos.y + vel.y * delta;


      updateGameObject(world, eid)
  }
  return world
}

export default movementSystem

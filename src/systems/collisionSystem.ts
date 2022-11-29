import { hasComponent } from "bitecs"
import { Vector } from "kontra"
import { BoxCollider, Physics2D, TileMovement, Transform, Velocity } from "../components"
import { ColliderType } from "../enums"
import { boxColliderQuery } from "../queries"
import { Bounds, CollisionSide, W } from "../types"


const rectCollide = (a: Bounds, b:Bounds): CollisionSide  => {
  if(a.t > b.b || a.b < b.t || a.r < b.l || a.l > b.r) return false;

  if (a.t <= b.b && a.ot > b.ob) return "top"
  else if (a.r >= b.l && a.or < b.ol) return "right";
  else if (a.l <= b.r && a.ol > b.or) return "left"
  else if (a.b >= b.t && a.ob < b.ob) return "bottom";

  return true
}

export const getColliderBounds = (eid: number): Bounds => {
    let pos = Vector(Transform.x[eid], Transform.y[eid])
    let oldPos = Vector(Transform.ox[eid], Transform.oy[eid])
    let offset = Vector(BoxCollider.offset.x[eid], BoxCollider.offset.y[eid])
    let anchor = Vector(BoxCollider.anchor.x[eid], BoxCollider.anchor.y[eid])

    let w = BoxCollider.w[eid]
    let h = BoxCollider.h[eid]

    const l = pos.x - Math.floor(w * (anchor.x)) + offset.x
    const r = l + w
    const t = pos.y - Math.floor(h * (anchor.y)) + offset.y
    const b = t + h

    const ol = oldPos.x - Math.floor(w * (anchor.x)) + offset.x
    const or = ol + w
    const ot = oldPos.y - Math.floor(h * (anchor.y)) + offset.y
    const ob = ot + h

    return {l ,r, t, b, ol, or, ot, ob}
}

const collisionSystem = (world: W) => {

  const entities = boxColliderQuery(world)

  for(let i = 0;  i < entities.length; i++) {

    const eidA = entities[i]
    const a = getColliderBounds(eidA)
    const hasPhysics = hasComponent(world, Physics2D, eidA)
    const hasTileMovement = hasComponent(world, TileMovement, eidA)
    let grounded = false

    if(hasTileMovement) continue;

    for(let eidB of entities) {

      const b = getColliderBounds(eidB);
      let collisionSide = rectCollide(a, b)

      if(!collisionSide) {
        delete world.collisions[eidA + "-" + eidB];
        continue;
      };

      if(collisionSide !== true) {
        world.collisions[eidA + "-" + eidB] = collisionSide
      } else {
        collisionSide = world.collisions[eidA + "-" + eidB] 
      }

      if(BoxCollider.type[eidB] === ColliderType.SOLID) {
        if(collisionSide === "bottom") {
          Transform.y[eidA] -= Math.abs(b.t - a.b) + 0.1
          grounded = true
        } else if (collisionSide === "top") {
          Transform.y[eidA] += Math.abs(a.t - b.b) + 0.1
          Velocity.y[eidA] = 0
        } else if (collisionSide === "right") {
          Transform.x[eidA] -= Math.abs(a.r - b.l) + 0.1
        } else if (collisionSide === "left") {
          Transform.x[eidA] += Math.abs(a.l - b.r) + 0.1
        }
      }
    }

    if(hasPhysics) {
      Physics2D.grounded[eidA] = Number(grounded);
      if(grounded) Velocity.y[eidA] = 2
    }
  }

  return world;
}

export default collisionSystem

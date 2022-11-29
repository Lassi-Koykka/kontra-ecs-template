import { boxColliderQuery, gameObjectQuery } from "./queries"
import { getColliderBounds } from "./systems/collisionSystem"
import { W } from "./types"

export const renderGameObjects = (world: W) => {
    const entities = gameObjectQuery(world)
    for (const eid of entities) {
      const go = world.actors[eid]
      if(!go) continue
      go.render()
    }
    return world
} 

export const renderColliders = (world: W) => {
  const entities = boxColliderQuery(world)
  for (const eid of entities) {
    const {t,b,l,r} = getColliderBounds(eid)

    ctx.save();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "purple";
    ctx.strokeRect(l,t,r - l,b - t);
    ctx.restore();
  }
}

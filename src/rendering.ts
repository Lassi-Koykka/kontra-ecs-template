import { colliderQuery, gameObjectQuery, getColliderBounds } from "./systems"
import { W } from "./types"

export const renderGameObjects = (world: W) => {
    const entities = gameObjectQuery(world)
    for (const eid of entities) {
      const go = world.gameObjects[eid]
      if(!go) continue
      go.render()
    }
    return world
} 

export const renderColliders = (world: W) => {
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

import { Vector } from "kontra"
import { ActorClass } from "../actor"
import { Interactable, Transform } from "../components"
import { interactableQuery, playerQuery } from "../queries"
import { W } from "../types"


const interactionSystem = (world: W) => {
  const entities = interactableQuery(world)
  const playerEid = playerQuery(world)[0]
  const playerPos = Vector(Transform.x[playerEid], Transform.y[playerEid])
  for (let eid in entities) {
    const a: ActorClass = world.actors[eid];
    if(!a) continue;
    const interactablePos = Vector(Transform.x[eid], Transform.y[eid])
    const playerInRange = playerPos.distance(interactablePos) < Interactable.range[eid]
    if(!a.animationFinished()) continue
      a.currentAnimation.reset()
    if(playerInRange) {
      if(["closed", "close"].includes(a.currAnimationName!) ) {
        a.playAnimation("open")
      } else if(a.currAnimationName === "open") {
        a.playAnimation("opened")
      }
    } else {
      if(["opened", "open"].includes(a.currAnimationName!)) {
        a.playAnimation("close")
      } else if(a.currAnimationName === "close") {
        a.playAnimation("closed")
      }
    }
  }
  return world;
}

export default interactionSystem

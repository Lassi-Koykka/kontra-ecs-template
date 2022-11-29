import { hasComponent } from "bitecs"
import { Animations, Physics2D, Transform, Velocity } from "../components"
import { gameObjectQuery } from "../queries"
import { W } from "../types"

export const updateGameObject = (world: W, eid: number) => {
        const go = world.actors[eid]
        if (!go) return;

        go.x = Transform.x[eid]
        go.y = Transform.y[eid]
        go.width = Transform.w[eid]
        go.height = Transform.h[eid]

        const hasVel = hasComponent(world, Velocity, eid)
        const hasAnimations = hasComponent(world, Animations, eid)
        const hasPhysics = hasComponent(world, Physics2D, eid)

        if(hasVel) {
          const xVel = Velocity.x[eid]
          if(xVel > 0) go.scaleX = 1
          else if(xVel < 0) go.scaleX = -1

          if(!hasAnimations) return
          //Update animations
          if(hasPhysics && Physics2D.grounded[eid] === 0) {
            go.playAnimation("air")
          }else if(Math.abs(xVel) < 0.1) {
            go.playAnimation("idle")
          } else {
            go.playAnimation("walk")
          }
        }
}

const updateActors = (world: W) => {
    const entities = gameObjectQuery(world)
    for (const eid of entities) {
      const a = world.actors[eid]
      if(!a) continue
      a.update()
      updateGameObject(world, eid);
    }
    return world
} 

export default updateActors

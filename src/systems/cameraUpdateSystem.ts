import { Transform, Velocity } from "../components"
import { playerQuery } from "../queries"
import { W } from "../types"

const cameraUpdateSystem = (world: W) => {
      //Update camera
      const entities = playerQuery(world)
      for (let eid of entities) {
        if((Transform.x[eid] < canvas.width / 4 && Velocity.x[eid] < -0.1) || (Transform.x[eid] > canvas.width * 0.75 && Velocity.x[eid] > 0.1)) {
          world.tileEngine.sx += Transform.x[eid] - Transform.ox[eid]
        }
        if((Transform.y[eid] < canvas.height / 4 && Velocity.y[eid] < -0.1) || (Transform.y[eid] > canvas.height * 0.75 && Velocity.y[eid] > 0.1)) {
          world.tileEngine.sy += Transform.y[eid] - Transform.oy[eid]
        }
      }

}

export default cameraUpdateSystem;

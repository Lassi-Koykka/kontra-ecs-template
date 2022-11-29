import { Vector } from "kontra";
import { Controls } from "../components";
import { keyDown, keyPress } from "../input";
import { inputListenerQuery } from "../queries";
import { W } from "../types";

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

    Controls.action1[eid] = Number(keyPress("ACTION1"));
    Controls.action2[eid] = Number(keyPress("ACTION1"));
    Controls.action3[eid] = Number(keyPress("ACTION1"));
    Controls.action4[eid] = Number(keyPress("ACTION1"));

  }
  return world
}

export default inputSystem

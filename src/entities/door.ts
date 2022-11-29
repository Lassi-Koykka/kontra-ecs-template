import { imageAssets, SpriteSheet, Vector } from "kontra";
import { Actor } from "../actor";
import { Interactable } from "../components";
import { W } from "../types";

const Door = (
  world: W, 
  x: number, 
  y: number,
  w: number = 32 * 6,
  h: number = 32 * 6,
  anchor: Vector = Vector(0.5, 0.5)
) => {

  const spriteSheet = SpriteSheet({
    frameWidth: 32,
    frameHeight: 64,
    image: imageAssets['images/Door'],
    animations: {
      closed: {
        frames: "0..0",
        frameRate: 12,
      },
      opened: {
        frames: "2..2",
        frameRate: 12,
      },
      open: {
        frames: "0..2",
        frameRate: 12,
      },
      close: {
        frames: "2..0",
        frameRate: 12,
      }
    }
  })

  const door = Actor({
    w: world,
    animations: {...spriteSheet.animations},
    x, 
    y,
    width: w,
    height: h,
    anchor: anchor,
    comps: [Interactable]
  })

  const eid = door.eid;
  Interactable.range[eid] = 200;

  return door;
}

export default Door

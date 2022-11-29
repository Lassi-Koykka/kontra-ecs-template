import { imageAssets, Vector } from "kontra";
import { Actor } from "../actor";
import { BoxCollider, Transform } from "../components";
import { ColliderType } from "../enums";
import { W } from "../types";
import { scaleImage } from "../utils";

const Obstacle = (
  world: W,
  x: number,
  y: number,
  w: number = 32 * 3,
  h: number = 32 * 3,
  anchor: Vector = Vector(0.5, 0.5)
) => {
  const img = scaleImage(imageAssets['images/Tileset'], 1, {x: 1, y: 1})

  const obstacle = Actor({
    w: world,
    image: img,
    x,
    y,
    width: w,
    height: h,
    anchor,
    comps: [BoxCollider],
    render: function () {
      if(!this.image || !this.width || !this.height) return;
      this.context?.drawImage(this.image, 32, 64, 30, 30, 0, 0, this.width, this.height )
    },
  });

  const eid = obstacle.eid;

  BoxCollider.w[eid] = Transform.w[eid];
  BoxCollider.h[eid] = Transform.h[eid];
  BoxCollider.anchor.x[eid] = anchor.x
  BoxCollider.anchor.y[eid] = anchor.y;
  BoxCollider.offset.x[eid] = BoxCollider.offset.y[eid] = 0;
  BoxCollider.type[eid] = ColliderType.SOLID;

  return obstacle;
};

export default Obstacle

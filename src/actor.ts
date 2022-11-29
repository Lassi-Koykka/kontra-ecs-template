import { addComponent, addEntity, Component, getEntityComponents, hasComponent, removeComponent, removeEntity } from "bitecs";
import { Animation, GameObject, SpriteClass } from "kontra"
import { Animations, GameObjectComp, Transform } from "./components";
import { W } from "./types";

type IProps = { [props: string]: any; 
  w: W
  color?: string;
  image?: HTMLImageElement | HTMLCanvasElement;
  animations?: { [name: string]: Animation };
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  context?: CanvasRenderingContext2D;
  dx?: number;
  dy?: number;
  ddx?: number;
  ddy?: number;
  ttl?: number; anchor?: { x: number; y: number };
  children?: GameObject[];
  opacity?: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  update?: ((dt?: number) => void);
  render?: Function; 
  comps?: Component[];
}

const addGameObject = (world: W, eid: number, go: GameObject) => {
  addComponent(world, GameObjectComp, eid);
  world.actors[eid] = go;
};

export class ActorClass extends SpriteClass {
  static _w: W
  eid: number;
  currAnimationName: string | null;

  constructor(props: IProps) {
    const {w, comps: comps, ...rest} = props
    super(rest)
    this.currAnimationName = rest.animations ? Object.keys(rest.animations)[0] : null
    this.eid = props?.eid ? props.eid : addEntity(w)
    const eid = this.eid

    const components: Component[] = [
      Transform,
      ...(props?.animations ? [Animations] : []),
      ...(props?.comps || []),
    ];

    for (let c of components) addComponent(w, c, eid);

    Transform.w[eid] = this.width;
    Transform.h[eid] = this.height;
    Transform.x[eid] = this.x;
    Transform.y[eid] = this.y;
    Transform.ox[eid] = this.x;
    Transform.oy[eid] = this.y;

    addGameObject(w, eid, this);
  }

  getComponents(w: W) {
    return getEntityComponents(w, this.eid)
  }
  has(w: W, c: Component) {
    return hasComponent(w, c, this.eid)
  }
  add(w: W, c: Component) {
    return addComponent(w, c, this.eid)
  }
  remove(w: W, c: Component) {
    return removeComponent(w, c, this.eid)
  }

  playAnimation(name: string): void {
      this.currAnimationName = name;
      super.playAnimation(name)
  }

  animationFinished() {
    //@ts-ignore
    return this.currentAnimation._f === this.currentAnimation.frames.length - 1;;
  }

  destroy(w: W) {
    removeEntity(w, this.eid)
  }

  update(dt?: number | undefined): void {
    this.advance(dt)
    this.width =Transform.w[this.eid];
    this.height = Transform.h[this.eid];
    this.x = Transform.x[this.eid];
    this.y =Transform.y[this.eid];
  }

}

export function Actor(props: IProps) {
  return new ActorClass(props)
}

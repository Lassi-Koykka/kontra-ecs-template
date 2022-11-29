import { defineComponent, Types } from "bitecs"

const Vector2 = {x: Types.f32, y: Types.f32}
const PositionData = {...Vector2, ox: Types.f32, oy: Types.f32}
const SizeData = {w: Types.f32, h: Types.f32}
const TransformData = {...PositionData, ...SizeData}
const TileMovementData = {sx: Types.f32, sy: Types.f32, ex: Types.f32, ey: Types.f32}
const ColliderData = {anchor: Vector2, offset: Vector2, type: Types.ui8}
const BoxColliderData = {...SizeData, ...ColliderData}
const CircleColliderData = {r: Types.f32, ...ColliderData}
const ControlData = { dir: Vector2, action1: Types.ui8, action2: Types.ui8, action3: Types.ui8, action4: Types.f32, menu: Types.ui8 }

export const Player = defineComponent()
export const GameObjectComp = defineComponent()
export const InputListener = defineComponent()
export const Animations = defineComponent()

export const Transform = defineComponent(TransformData)
export const TileMovement = defineComponent(TileMovementData)
export const Speed = defineComponent({ val: Types.f32 });
export const Physics2D = defineComponent({jumpHeight: Types.f32, gravity: Types.f32, grounded: Types.ui8})
export const Velocity = defineComponent(Vector2);
export const BoxCollider = defineComponent(BoxColliderData)
export const CircleCollider = defineComponent(CircleColliderData)
export const Controls = defineComponent(ControlData)
export const Interact = defineComponent({range: Types.f32})
export const Interactable = defineComponent({range: Types.f32})

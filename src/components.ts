import { defineComponent, Types } from "bitecs"

const Vector2 = {x: Types.f32, y: Types.f32}
const PositionData = {...Vector2, ox: Types.f32, oy: Types.f32}
const SizeData = {w: Types.f32, h: Types.f32}
const TransformData = {...PositionData, ...SizeData}
const BoxColliderData = {...SizeData, anchor: Vector2, offset: Vector2}
const CircleColliderData = {r: Types.f32, offset: Vector2}
const ControlData = { dir: Vector2, action1: Types.ui8, action2: Types.ui8, action3: Types.ui8, action4: Types.f32, menu: Types.ui8 }

export const GameObjectComp = defineComponent()
export const InputListener = defineComponent()
export const Static = defineComponent()
export const Animations = defineComponent()

export const Transform = defineComponent(TransformData)
export const Speed = defineComponent({ val: Types.f32 });
export const Physics2D = defineComponent({jumpHeight: Types.f32, gravity: Types.f32, grounded: Types.ui8})
export const Velocity = defineComponent(Vector2);
export const BoxCollider = defineComponent(BoxColliderData)
export const CircleCollider = defineComponent(CircleColliderData)
export const Controls = defineComponent(ControlData)

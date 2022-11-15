import { defineComponent, Types } from "bitecs"

const Vector2 = {x: Types.f32, y: Types.f32}
const PositionData = {...Vector2, ox: Types.f32, oy: Types.f32}
const SizeData = {w: Types.f32, h: Types.f32}
const BoxColliderData = {...SizeData, anchor: Vector2, offset: Vector2}
const CircleColliderData = {r: Types.f32, offset: Vector2}
const ControlData = { dir: Vector2, action1: Types.ui8, action2: Types.ui8, action3: Types.ui8, action4: Types.f32, menu: Types.ui8 }

export const GameObjectComp = defineComponent()
export const InputListener = defineComponent()
export const Speed = defineComponent({ val: Types.f32 });
export const Position = defineComponent(PositionData);
export const Size = defineComponent(SizeData)
export const BoxCollider = defineComponent(BoxColliderData)
export const CircleCollider = defineComponent(CircleColliderData)
export const Controls = defineComponent(ControlData)

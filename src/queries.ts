import { defineQuery } from "bitecs";
import { BoxCollider, Controls, GameObjectComp, InputListener, Interactable, Player, Speed, TileMovement, Transform, Velocity } from "./components";

export const movementQuery = defineQuery([Transform, Speed, Velocity, Controls])
export const inputListenerQuery = defineQuery([InputListener, Controls])
export const boxColliderQuery = defineQuery([BoxCollider, Transform])
export const gameObjectQuery = defineQuery([GameObjectComp, Transform])
export const playerQuery = defineQuery([Player])
export const interactableQuery = defineQuery([Interactable])

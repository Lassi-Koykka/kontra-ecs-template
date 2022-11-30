# A minimalist template for developing games using Kontra.js and bitECS

## General info
- Types, including the World object and globalThis is defined in the `src/types.d.ts` file
- Image assets are located in the `public/images/` folder but you can place them where you want
- Audio assets are located in the `public/sound/` folder but you can place them where you want
- All rendering functions/systems are in the `src/rendering.ts` file
- All audio related functions and systems are in the `src/audio` folder
- Game controls are defined in the `src/input.ts` file
- Global enums are defined in the `src/enums.ts` file
- The `src/Actor.ts` an Actor class which extends the base Kontra Sprite class to allow for more ECS specific functionality

## The ECS
- Queries are defined in the `src/queries.ts` file
- Components are defined in the `src/components.ts` file
- Systems are defined in the `src/systems/` folder
- Functions for creating reusable entities such as player are defined in the `src/entities/` folder

## This template contains
- Three ready made movement systems for 2d games:
    - Simple top down movement
    - Simple arcade platformer physics (Requires Physics2D component on player)
    - Simple tile based movement (Requires TileMovement component on player)

- A basic rectangle based collision system
- Scrolling tilemap (Needs refactoring)
- A basic interaction system (Needs refactoring)

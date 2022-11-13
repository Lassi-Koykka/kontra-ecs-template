export const INPUT = {
  UP: ["w", "arrowup"],
  DOWN: ["s", "arrowdown"],
  LEFT: ["a", "arrowleft"],
  RIGHT: ["d", "arrowright"],
  ACTION1: [" ", "j"],
  ACTION2: ["k"],
  ACTION3: ["l"],
  ACTION4: ["ö", "'"],
  MENU: ["escape", "p"],
  RESTART: ["r"],
  SWITCH_WEAPON: ["q", "alt"],
  WEAPON_NUM: ["1", "2", "3"]
};

export const keyDown = (input: keyof typeof INPUT) =>
  INPUT[input].some((key) => KEYMAP[key]);
export const keyPress = (input: keyof typeof INPUT) =>
  INPUT[input].some((key) => KEYMAP[key]) &&
  INPUT[input].every((key) => !KEYMAP_PREV[key]);
export const keyUp = (input: keyof typeof INPUT) =>
  INPUT[input].some((key) => !KEYMAP[key]) &&
  INPUT[input].every((key) => KEYMAP_PREV[key]);


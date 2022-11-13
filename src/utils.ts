import { BufferLoader } from "./audio/bufferloader";
import { Align } from "./enums";

// Assets
export const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    let img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

export const loadAudioClips = (
  ctx: AudioContext,
  clips: { name: string; url: string }[]
): Promise<{ [name: string]: AudioBuffer }> =>
  new Promise((resolve) =>
    clips.length > 0 ? new BufferLoader(
      ctx,
      clips.map((clip) => clip.url),
      (buffers: AudioBuffer[]) => {
        const clipsEntries = buffers.map((buf, i) => [clips[i].name, buf]);
        const clipBuffers = Object.fromEntries(clipsEntries);

        resolve(clipBuffers);
      }
    ).load() : resolve([] as any)
  );

// Math
export const rotateVector = (vecX: number, vecY: number, angle: number) => {
  let dx = vecX * Math.cos(angle) - vecY * Math.sin(angle);
  let dy = vecX * Math.sin(angle) + vecY * Math.cos(angle);

  return { x: dx, y: dy };
};

export const normalizeVector = (vec: { x: number; y: number }) => {
  if (vec.x === 0 && vec.y === 0) return vec;
  let mag = Math.sqrt(vec.x ** 2 + vec.y ** 2);
  return {
    x: vec.x / mag,
    y: vec.y / mag,
  };
};

export const randomInt = (
  min: number = 0,
  max: number,
  wholeNum: boolean = true
): number => {
  return wholeNum
    ? Math.floor(Math.random() * (max - min + 1)) + min
    : Math.random() * (max - min + 1) + min;
};

export const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

export const scale = (
  number: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
) => {
  return ((number - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

export const toRadians = (deg: number) => {
  return (deg * Math.PI) / 180;
};

export const getOrigin = (
  { x, y }: { x: number; y: number },
  {
    width,
    height,
    horizontalAlign,
    verticalAlign,
  }: {
    width: number;
    height: number;
    horizontalAlign: Align;
    verticalAlign: Align;
  }
) => {
  return {
    x: removeOffset(x, width, horizontalAlign),
    y: removeOffset(y, height, verticalAlign),
  };
};

const removeOffset = (coord: number, size: number, align: Align) => {
  switch (align) {
    case Align.START:
      return coord;
    case Align.CENTER:
      return Math.floor(coord - size / 2);
    case Align.END:
      return coord - size;
    default:
      return coord;
  }
};

export const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max);

// Misc
export const clone = (instance: any) => {
  return Object.assign(
    Object.create(
      // Set the prototype of the new object to the prototype of the instance.
      // Used to allow new object behave like class instance.
      Object.getPrototypeOf(instance)
    ),
    // Prevent shallow copies of nested structures like arrays, etc
    JSON.parse(JSON.stringify(instance))
  );
};


export const indexChars = (str: string) => {
  let charIndexes: { [char: string]: number } = {};
  const chars = Array.from(str);
  for (let i = 0; i < chars.length; i++) {
    charIndexes = { ...charIndexes, [chars[i]]: i };
  }
  return charIndexes;
};

export const getDirKey = (dir: { x: number; y: number }) => {
  const { x, y } = dir;
  if (x === 0 && y === -1) return "N";
  else if (x === 1 && y === 0) return "E";
  else if (x === 0 && y === 1) return "S";
  else if (x === -1 && y === 0) return "W";
  else if (x > 0 && y < 0) return "NE";
  else if (x < 0 && y < 0) return "NW";
  else if (x > 0 && y > 0) return "SE";
  else if (x < 0 && y > 0) return "SW";
  return "default";
};

export const vecToDir = ({x,y}: {x: number, y: number}) => ({dirX: x, dirY: y})

export const setCanvasScale = () => {
  const aspectRatio = canvas.width / canvas.height;

  if (window.innerWidth < window.innerHeight * aspectRatio) {
    canvas.style.width = "100%";
    canvas.style.height = "auto";
  } else {
    canvas.style.width = "auto";
    canvas.style.height = "95vh";
  }
};

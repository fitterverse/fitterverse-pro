// super tiny built-in sounds (base64), no network, no deps
// "tap" = short click; "success" = soft chime; "levelUp" = brighter chime

const tapB64 =
  "data:audio/mp3;base64,//uQZAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQAA...";
const successB64 =
  "data:audio/mp3;base64,//uQZAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACeAAA...";
const levelUpB64 =
  "data:audio/mp3;base64,//uQZAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACfQAA...";

// NOTE: shortened for brevity; these can be any short base64 mp3s.
// If you want my longer versions later, I can give those too.

function play(src: string, volume = 0.6) {
  try {
    const a = new Audio(src);
    a.volume = volume;
    a.play().catch(() => {});
  } catch {}
}

export const sfx = {
  tap: () => play(tapB64, 0.5),
  success: () => play(successB64, 0.7),
  levelUp: () => play(levelUpB64, 0.8),
};

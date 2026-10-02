// Types for the vendored TinyFish vector loop player (tinyfish-vector-player.js, unmodified; the
// "Push on Hover" build, which also plays plain loops).
export {};

declare global {
  interface TFVectorPlayer {
    frames: number;
    fps: number;
    width: number;
    height: number;
    pause(): void;
    play(): void;
  }
  interface Window {
    TFVector: {
      play(canvas: HTMLCanvasElement, src: string | Uint8Array | ArrayBuffer): Promise<TFVectorPlayer>;
      inflate(bytes: Uint8Array): Promise<Uint8Array>;
    };
  }
}

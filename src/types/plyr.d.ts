// Plyr không kèm sẵn type declaration và chưa có gói @types/plyr trên npm.
// Khai báo tối thiểu, chỉ phủ phần API mà VideoPlayer.tsx thực sự dùng.
declare module "plyr" {
  interface PlyrQualityOptions {
    default?: number;
    options?: number[];
    forced?: boolean;
    onChange?: (quality: number) => void;
  }

  interface PlyrFullscreenOptions {
    enabled?: boolean;
    fallback?: boolean;
    iosNative?: boolean;
  }

  interface PlyrKeyboardOptions {
    focused?: boolean;
    global?: boolean;
  }

  interface PlyrOptions {
    controls?: string[];
    quality?: PlyrQualityOptions;
    i18n?: Record<string, unknown>;
    fullscreen?: PlyrFullscreenOptions;
    keyboard?: PlyrKeyboardOptions;
  }

  interface PlyrFullscreen {
    enter(): void;
    exit(): void;
  }

  export default class Plyr {
    constructor(target: HTMLElement, options?: PlyrOptions);
    fullscreen: PlyrFullscreen;
    toggleControls(show?: boolean): void;
    destroy(): void;
  }
}

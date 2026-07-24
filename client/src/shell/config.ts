/** Frozen logical resolution (art lock, Q5): 960×540, integer-friendly FIT + letterbox. */
export const LOGICAL_WIDTH = 960;
export const LOGICAL_HEIGHT = 540;

export interface ClientShellConfig {
  parent: string | HTMLElement;
  apiBaseUrl: string;
  debug?: {
    soloAutoJoin?: boolean;
    skipAttract?: boolean;
    showFps?: boolean;
  };
}

import Phaser from "phaser";

/**
 * Empty scene stubs for the C-01 scene registry (docs/components/client-shell/DESIGN.md §4.2).
 * Content lands with their own tasks (C01-T03 Title, T05 Credits, T06 HighScores,
 * T08 Lobby, T10 phase-bound hosts, T11 overlays). Registering them here now
 * lets the phase binder / navigator target these keys without runtime crashes.
 */

export class TitleScene extends Phaser.Scene {
  constructor() {
    super("Title");
  }
}

export class CreditsScene extends Phaser.Scene {
  constructor() {
    super("Credits");
  }
}

export class HighScoresScene extends Phaser.Scene {
  constructor() {
    super("HighScores");
  }
}

export class LobbyScene extends Phaser.Scene {
  constructor() {
    super("Lobby");
  }
}

export class InstructionsScene extends Phaser.Scene {
  constructor() {
    super("Instructions");
  }
}

export class LevelScene extends Phaser.Scene {
  constructor() {
    super("Level");
  }
}

export class ForkScene extends Phaser.Scene {
  constructor() {
    super("Fork");
  }
}

export class EndScene extends Phaser.Scene {
  constructor() {
    super("End");
  }
}

export class ConnectingScene extends Phaser.Scene {
  constructor() {
    super("Connecting");
  }
}

export class ErrorOverlayScene extends Phaser.Scene {
  constructor() {
    super("ErrorOverlay");
  }
}

export const STUB_SCENES = [
  TitleScene,
  CreditsScene,
  HighScoresScene,
  LobbyScene,
  InstructionsScene,
  LevelScene,
  ForkScene,
  EndScene,
  ConnectingScene,
  ErrorOverlayScene,
];

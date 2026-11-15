import "./styles.css";
import { applyCaretTheme, loadSettings } from "./engine/settings";
import type { SessionStats } from "./engine/stats";
import { appendSession } from "./engine/storage";
import { renderHome } from "./ui/home";
import { renderPlay } from "./ui/play";
import { renderResult } from "./ui/result";

applyCaretTheme(loadSettings().caretTheme);

const appEl = document.querySelector<HTMLElement>("#app");
if (!appEl) {
  throw new Error("#app が見つかりません");
}
const app: HTMLElement = appEl;

type Screen = "home" | "play" | "result";

let screen: Screen = "home";
let lastStats: SessionStats | null = null;

function goHome(): void {
  screen = "home";
  render();
}

function goPlay(): void {
  screen = "play";
  render();
}

function finishPlay(stats: SessionStats): void {
  appendSession(stats);
  lastStats = stats;
  screen = "result";
  render();
}

function render(): void {
  if (screen === "home") {
    renderHome(app, goPlay);
    return;
  }
  if (screen === "play") {
    renderPlay(app, finishPlay);
    return;
  }
  if (lastStats) {
    renderResult(app, lastStats, goHome, goPlay);
  } else {
    goHome();
  }
}

render();

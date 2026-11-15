import type { SessionStats } from "./stats";

const STORAGE_KEY = "typing_game_sessions_v1";

export type StoredPayload = {
  version: 1;
  /** 追記専用。削除 API は提供しない */
  sessions: SessionStats[];
};

function readRaw(): StoredPayload {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { version: 1, sessions: [] };
  }
  try {
    const parsed = JSON.parse(raw) as StoredPayload;
    if (parsed.version !== 1 || !Array.isArray(parsed.sessions)) {
      // 壊れていても上書き破棄しない: バックアップキーに退避
      localStorage.setItem(`${STORAGE_KEY}_backup_${Date.now()}`, raw);
      return { version: 1, sessions: [] };
    }
    return parsed;
  } catch {
    localStorage.setItem(`${STORAGE_KEY}_corrupt_${Date.now()}`, raw);
    return { version: 1, sessions: [] };
  }
}

function writeRaw(payload: StoredPayload): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

/** セッションを追記（削除しない） */
export function appendSession(session: SessionStats): void {
  const payload = readRaw();
  payload.sessions.push(session);
  writeRaw(payload);
}

export function loadAllSessions(): SessionStats[] {
  return readRaw().sessions;
}

/** JSON ダウンロード用（バックアップ）。消さない運用の保険 */
export function exportSessionsJson(): string {
  return JSON.stringify(readRaw(), null, 2);
}

export function downloadSessionsBackup(): void {
  const blob = new Blob([exportSessionsJson()], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `typing_game_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function sessionCount(): number {
  return readRaw().sessions.length;
}

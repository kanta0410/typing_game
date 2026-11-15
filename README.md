# ひらがなタイピング計測

1分間のローマ字入力で、次を測る超シンプルなブラウザアプリです。

- 文字数（CPM）
- 正確性
- ひらがなごとの **子音→母音の間隔 (CV)**
- **ひらがな→ひらがなのつなぎ間隔**（チャンク）

## 起動（ここが「Vite」）

```bash
cd C:\Users\kanta\workspace\projects\typing_game
npm install
npm run dev
```

ブラウザで `http://localhost:5173` を開く。

| 用語 | 意味 |
|---|---|
| **Vite** | 開発用の小さな Web サーバー＋バンドラ。`src/` の TypeScript をブラウザが読める JS に変換して配る |
| **localhost** | 自分の PC の中だけの住所。ネット公開ではない |
| **ブラウザ内** | 計算・計測・保存が全部 Chrome/Edge の中で動く。サーバー側の Python/DB は無い |
| **TypeScript** | JS に型を足した言語。ビルド時に普通の JS になる。Python は動かない |

バックエンドが無い理由: キー入力の時刻はブラウザにしか無い。計測は CPU 上の JS で足りる。結果は `localStorage`（ブラウザの保存領域）に追記する。

## 技術スタック

| 層 | 技術 |
|---|---|
| フロント | Vite + TypeScript（フレームワークなし） |
| バックエンド / API | なし |
| 永続化 | localStorage（追記のみ・削除 UI なし）＋ JSON バックアップ |
| テスト | Vitest（matcher / stats） |
| リモート | https://github.com/kanta0410/typing_game |

## アーキテクチャ

```
キー入力 (keydown)
  → TypingGame.handleKey
  → matcher.matchKey（ローマ字候補と照合）
  → stats に CV間隔・文字間間隔を記録
  → 60秒後 Result 画面
  → storage.appendSession（消さない）
```

| ファイル | 役割 |
|---|---|
| `src/data/romaji-map.ts` | ひらがな→許容ローマ字（shi/si, nn/xn など） |
| `src/engine/matcher.ts` | 1キーずつの正誤判定 |
| `src/engine/game.ts` | 1分タイマー・出題・計測ループ |
| `src/engine/stats.ts` | 集計・遅い文字/ペアのランキング |
| `src/engine/storage.ts` | localStorage 追記・バックアップ |
| `src/ui/*` | Home / Play / Result |

## PC リソース

| リソース | 役割 |
|---|---|
| CPU | JS のキー処理・集計・DOM 更新 |
| GPU | 画面の描画だけ |
| RAM | 出題と統計オブジェクト（数 MB） |
| ディスク | `node_modules` とソース。実行中の結果は localStorage |

## 注意

- **IME オフ**で半角英字ローマ字入力
- データは大事なので「削除」ボタンは無い。ホーム/結果の「データをバックアップ」で JSON を落とせる
- 後から AI で分析する想定。セッション JSON をそのまま渡せる形で溜める

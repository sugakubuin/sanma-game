# 🀄 Sanma Game （三人麻雀ゲーム）

ReactとTypeScriptで構築された、モダンなWebベースの三人麻雀（サンマ）ゲームです。  
現代的な麻雀アプリにインスパイアされたプレミアムなUIと、本格的なゲームロジックを特徴としています。

![Sanma Game](https://img.shields.io/badge/Status-Development-blue) ![License](https://img.shields.io/badge/License-MIT-green)

## ✨ 特徴

- **本格的な三人麻雀ルール**:
  - 使用牌: 112枚（萬子1/9、筒子・索子1-9、字牌）
  - **北牌（抜きドラ）**: 花牌として扱います。
  - **特殊牌**: 赤5、金5（5筒/5索/花牌）、白ポッチ（オールスター牌）。
- **リッチなスコアリングシステム**:
  - 50,000点持ち / 50,000点返し
  - ツモ損なし、オリジナルの点数計算表
  - 特殊役満（大車輪、人和、流しなど）対応
- **モダンなWeb技術**:
  - **Vite** による高速な開発環境
  - **TypeScript** による型安全なロジック
  - **Zustand** によるグローバル状態管理

## 🚀 始め方 (Getting Started)

### 必要条件
- Node.js (v18以降推奨)

### インストール手順

1. **リポジトリをクローン**
   ```bash
   git clone https://github.com/sugakubuin/sanma-game.git
   cd sanma-game
   ```

2. **依存パッケージのインストール**
   ```bash
   npm install
   ```

3. **開発サーバーの起動**
   ```bash
   npm run dev
   ```
   ブラウザで `http://localhost:5173` を開いてください。

## 🛠️ 技術スタック

- **フレームワーク**: [React](https://react.dev/)
- **ビルドツール**: [Vite](https://vitejs.dev/)
- **言語**: [TypeScript](https://www.typescriptlang.org/)
- **状態管理**: [Zustand](https://github.com/pmndrs/zustand)
- **スタイリング**: Vanilla CSS (グラスモーフィズム & プレミアムUIデザイン)

## 📜 ルール詳細

- **プレイヤー人数**: 3人 (東家・南家・西家)
- **ゲーム長**: 半荘戦 (東場・南場)
- **点数**: 50,000点持ち / 50,000点返し
- **ドラ**:
  - 赤ドラ: 5筒/5索 (各4枚)
  - 金ドラ: 5筒/5索/花牌 (各1枚)
  - 白ポッチ: リーチ後ツモでオールマイティ
- **積み棒**: 1本場につき1000点 (ロン+1000点 / ツモ+1000点オール)

詳細な仕様については、以下のドキュメントを参照してください:
[三人麻雀ゲームロジック仕様](./references/★三人麻雀ゲームロジック仕様_修正版.md)

---
*Created by sugakubuin*
---
description: UIレイアウトガイドライン - スクロール禁止・横画面強制
---

# UI開発ガイドライン

このプロジェクトでは、以下のUI要件を必ず守ってください。

## 1. スクロール禁止

**全ての画面で、スクロールが不要であること**

### 実装方法
- コンテナには `height: 100%` と `overflow: hidden` を使用
- `min-height: 100vh` ではなく `height: 100%` を使用
- コンテンツは常にビューポート内に収める
- 必要に応じて `.page-container` または `.screen-container` クラスを使用

### チェックリスト
- [ ] 縦スクロールバーが表示されていないこと
- [ ] 横スクロールバーが表示されていないこと
- [ ] 全コンテンツがビューポート内に収まっていること

---

## 2. モバイル横画面強制

**モバイルデバイスでは、自動的に横画面になること**

### 実装済みの機能
1. **CSS**: 縦画面時に回転促進オーバーレイを表示（`index.css`）
2. **JavaScript**: Screen Orientation Lock API でフルスクリーン時に横画面ロック（`main.tsx`）
3. **HTML**: `screen-orientation` metaタグ（`index.html`）

### 注意点
- モーダルやオーバーレイも横画面前提でデザインすること
- フォントサイズは横画面に最適化すること

---

## 3. アイコンの使用（絵文字禁止）

**絵文字は使用せず、lucide-reactアイコンを使用すること**

### 実装方法
```tsx
import { User, Settings, Home } from 'lucide-react'

// 使用例
<User size={20} />
<Settings className="icon-class" size={16} />
```

### よく使うアイコン
| 用途 | アイコン |
|------|----------|
| ユーザー | `User` |
| 設定 | `Settings` |
| ホーム | `Home` |
| コピー | `Copy` |
| ログアウト | `LogOut` |
| 戻る | `ArrowLeft` |
| ドア | `DoorOpen` |
| 王冠 | `Crown` |
| トロフィー | `Trophy` |

### 禁止事項
- 絵文字（例: 👤, ⚙️, 🏠）は使用禁止
- 絵文字が必要な場合は必ずlucide-reactアイコンで代替

---

## 新しい画面を追加する場合

```tsx
import { SomeIcon } from 'lucide-react'

const NewScreen: React.FC = () => {
    return (
        <div className="page-container">
            <SomeIcon size={20} />
            {/* コンテンツ */}
        </div>
    );
};
```

```css
.new-screen {
    height: 100%;
    width: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}
```

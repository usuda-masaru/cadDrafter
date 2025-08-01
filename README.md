# CAD Drafter - エンジニア向けダイアグラムツール

Draw.ioをベースにしたReact製のダイアグラム作成ツールです。エンジニア向けの機能を追加し、より使いやすくしました。

## 機能

### 基本機能（Draw.io互換）
- ✅ 基本図形の描画（矩形、円、三角形、菱形、直線、矢印）
- ✅ テキストの追加・編集
- ✅ 図形の選択・移動・リサイズ
- ✅ レイヤー管理
- ✅ ズーム・パン機能
- ✅ プロパティ編集（色、線幅、透明度等）
- ✅ ファイル保存・読み込み（JSON形式）
- ✅ エクスポート機能（SVG、PNG）

### エンジニア向け追加機能
- ✅ **専門図形ライブラリ**
  - フローチャート図形（開始/終了、処理、判定、データ）
  - UML図形（クラス、アクター、ユースケース）
  - ネットワーク図形（サーバー、データベース、クラウド）
  - 回路図形（抵抗、コンデンサ）

- ✅ **テンプレート機能**
  - 基本フローチャート
  - UMLクラス図
  - ネットワーク構成図
  - 電気回路図

- ✅ **エンジニアツールパネル**
  - 右側にフローティングパネル
  - 専門図形の素早い追加
  - テンプレートの読み込み

## 技術スタック

- **React 18** - UIフレームワーク
- **Canvas API** - 図形描画
- **Context API** - 状態管理
- **Webpack** - モジュールバンドラー
- **Babel** - トランスパイラー

## セットアップ

1. 依存関係のインストール
```bash
npm install
```

2. 開発サーバーの起動
```bash
npm start
# または
npm run dev
```

3. ブラウザでアクセス
```
http://localhost:3000
```

## 使い方

### 基本操作
1. **図形の描画**: 左パネルから図形を選択し、キャンバス上でドラッグして描画
2. **図形の選択**: 選択ツールで図形をクリック
3. **図形の移動**: 選択した図形をドラッグして移動
4. **プロパティ編集**: 右パネルで色、線幅、透明度などを変更
5. **ズーム**: マウスホイールまたは右上のズームボタン
6. **パン**: Ctrl+ドラッグで画面移動

### エンジニア機能
1. **専門図形**: 右側の⚙️ボタンからエンジニアツールを開く
2. **テンプレート**: エンジニアツールパネルからテンプレートを選択
3. **専門図形の追加**: グリッドから必要な図形をクリック

### ファイル操作
- **新規作成**: 📄ボタン
- **保存**: 💾ボタン（JSON形式）
- **読み込み**: 📁ボタン
- **エクスポート**: 📤ボタン（SVG/PNG形式）

## ファイル構造

```
src/
├── components/           # Reactコンポーネント
│   ├── Header.js        # ヘッダー・ツールバー
│   ├── LeftPanel.js     # 左パネル（図形ライブラリ・レイヤー）
│   ├── Canvas.js        # メインキャンバス
│   ├── RightPanel.js    # 右パネル（プロパティ）
│   └── EngineerTools.js # エンジニアツールパネル
├── contexts/            # React Context
│   └── AppContext.js    # アプリケーション状態管理
├── utils/               # ユーティリティ
│   └── fileUtils.js     # ファイル操作
├── styles/              # スタイル
│   └── index.css        # メインスタイル
├── App.js               # メインアプリケーション
└── index.js             # エントリーポイント
```

## 今後の拡張予定

### 追加予定機能
- [ ] コードブロック図形（関数、クラス、コメント）
- [ ] データベース設計図形（テーブル、リレーション）
- [ ] API設計図形（エンドポイント、レスポンス）
- [ ] インフラ構成図形（Docker、Kubernetes）
- [ ] アーキテクチャ図形（マイクロサービス、レイヤー）

### UX改善
- [ ] ショートカットキー
- [ ] グリッドスナップ
- [ ] 図形のグループ化
- [ ] undo/redo機能
- [ ] 複数選択
- [ ] 図形の複製

### 開発者向け機能
- [ ] プラグインシステム
- [ ] カスタム図形の作成
- [ ] テーマ機能
- [ ] 設定のエクスポート/インポート

## ライセンス

MIT License

## 貢献

プルリクエストやイシューの報告を歓迎します。
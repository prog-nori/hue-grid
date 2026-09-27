# HueGrid

複数の基準色へ共通のトーンルールを適用する、完全クライアントサイドの OKLCH パレット設計アプリ。
React + Vite + TypeScript + Tailwind CSS。バックエンド・API・DB は使用しません。

## 開発

Node.js 24 系を使用します（`.nvmrc`）。

```bash
npm ci
npm run dev
```

- `npm run build`: TypeScript 型チェックと本番ビルド
- `npm run lint`: Oxlint
- `npm test`: Node.js 標準テストランナーで色変換・入力・トーン生成・色域調整を検証
- `npm run preview`: 本番ビルドの確認

## 操作

1. HEX / RGB / OKLCH を選び、基準トーン（50〜950、初期値500）を指定して基準色を追加します。たとえば暗い文字色を900に指定すると、その色を保持しながら明るいボーダー色などを生成できます。補助カラーピッカーも利用できます。
2. 共通トーンルールを選択すると、すべての行が再計算されます。
3. 各セルにホバーまたはキーボードフォーカスすると詳細を表示し、クリックまたは Enter で表示色の HEX をコピーします。Escape で詳細を閉じます。
4. 行右上の削除ボタンでパレットを削除できます。
5. 初期テーマは OS 設定に従い、手動切替は localStorage に保持します。

初期の3色はサンプルです。追加色とルールはメモリ内だけで保持され、再読み込みで初期状態に戻ります。
入力範囲は RGB: 0〜255、OKLCH: L 0〜1 / C 0〜1 / H 0〜360°（360は0へ正規化）。透明色は対象外です。
HEX/RGB に切り替える場合は色域調整後の sRGB 値へ変換します。OKLCH のフォーム表示は小数点以下6桁です。

## 計算ルール（確認済みの MVP 仕様）

- トーン: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950
- 各行に基準トーン `anchorTone` を保持します。入力色の原値は選択した位置で保持します（色域外では表示のみ調整）。
- 距離は明部側で `x = (anchorTone - tone) / (anchorTone - 50)`、暗部側で `x = (tone - anchorTone) / (950 - anchorTone)` とします。基準位置は `x = 0`。50/950が基準の場合は反対側だけ生成するためゼロ除算はありません。
- ルールは全行共通ですが、基準位置は行ごとに独立します。500を指定した場合は従来の計算と同一です。
- L: 明部の端点 `max(base.L, 0.98)`、暗部の端点 `min(base.L, 0.14)` へ、基準値から相対補間します。
- C: `base.C × (1 - 0.85 × curve(x))`。基準位置以外の端点では基準彩度の15%になります。
- H: すべてのトーンで基準色の色相を維持します。RGB由来の無彩色は C/H を0に安定化します。
- リニア: `curve(x) = x`
- バランス / ハイコントラスト: `curve(x) = (atan(k(2x-1)) + atan(k)) / (2atan(k))`、k = 2 / 5
- L/C は独立した関数フィールドを持ちます。初期3種では同じ曲線を利用します。

色域外では L/H を固定し、C のみ48回の二分探索で縮小します。RGB の単純クリップで色域を合わせません。
これは独自の彩度縮小方式であり、CSS の local-MINDE アルゴリズムではありません。
計算前の色と表示用の色は別々に保持し、色域調整が入るセルには点と詳細説明を表示します。

## 構成

- `src/types/color.ts`: OKLCH/RGB・レコード・生成色の型とトーン定義
- `src/color/convert.ts`: HEX / RGB / OKLCH 変換
- `src/color/input.ts`: 入力形式とバリデーション
- `src/color/curves.ts`: 数学関数
- `src/color/gamut.ts`: sRGB 判定と彩度縮小
- `src/color/palette.ts`: 基準色と共通プリセットから派生値を生成
- `src/presets/tonePatterns.ts`: プリセット・係数
- `src/components/`: 入力・ルール選択・一覧・行・セル
- `src/hooks/useTheme.ts`: テーマ切替と保持
- `src/assets/lineicons/`: 提供された Lineicons 5.2 のフォントと使用グリフ
- `public/favicon.svg`: 黒背景・白文字 HG
- `tests/`: 変換と生成の回帰テスト

色変換は [Oklab 作者の公開行列](https://bottosson.github.io/posts/oklab/)と [CSS Color 4](https://www.w3.org/TR/css-color-4/) を参照しています。色ライブラリの追加依存はありません。
Lineicons は `src/assets/lineicons/` に必要なフォントと CSS を配置しています。配布アーカイブの展開先だった `tmp/` は削除済みで、Git の管理対象からも除外しています。

## GitHub Pages

`.github/workflows/deploy-pages.yml` で、`master` への push 時に自動デプロイします。
Node.js は `.nvmrc` に合わせ、`npm ci` → Lint → テスト → 型チェック・ビルド → 公開の順に実行します。
検証に失敗した場合は公開しません。`dist/` や `node_modules/` のコミットは不要です。

### 初回設定

1. [リポジトリの Settings → Pages](https://github.com/prog-nori/hue-grid/settings/pages) を開きます。
2. **Build and deployment → Source** を **GitHub Actions** にします。
3. このワークフローと README を `master` にコミットして push します。

```bash
git add .github/workflows/deploy-pages.yml README.md
git commit -m "Configure GitHub Pages deployment"
git push origin master
```

4. [Actions](https://github.com/prog-nori/hue-grid/actions) で **Deploy HueGrid to GitHub Pages** の `build` / `deploy` が成功することを確認します。
5. 実行結果の `github-pages` 環境リンクからサイトを開きます。カスタムドメイン未設定時の想定 URL は https://prog-nori.github.io/hue-grid/ です。

すでに push 済みの場合は、Source 設定後に Actions → 対象ワークフロー → **Run workflow** → `master` を選択して実行できます。
以降は `master` に push するだけで更新されます。公開ブランチを変更する場合はワークフローの `branches` と `deploy.if` も変更してください。

### パスと権限

ローカルでは `vite.config.ts` の `base: './'` を使用し、CI では `configure-pages` が返す `base_path` を Vite の `--base` に渡します。
そのため、`/hue-grid/` 配下の JavaScript・CSS・フォント・favicon を正しいパスで参照します。
ルーティングは使用していないため、サーバー側の SPA フォールバックは不要です。
公開には自動提供される `GITHUB_TOKEN` を使用し、手動のトークンや Secrets 登録は不要です。

Actions が無効な場合は Settings → Actions → General で GitHub Actions の実行を許可してください。
環境の保護ルールが設定されている場合は、Settings → Environments → github-pages で `master` からのデプロイが許可されていることを確認してください。

参考: [GitHub Pages のカスタムワークフロー](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)、[Vite のデプロイガイド](https://vite.dev/guide/static-deploy.html#github-pages)。

## 拡張

プリセットは `tonePatterns.ts` に追加できます。数学関数とUIは分離しています。
カスタム曲線・書き出し・共有・コントラスト解析は今回の対象外です。
追加の仕様判断が必要な未決事項はありません。

# Googleアカウント限定チャット (ブラウザ版)

Googleログインを使い、**許可メールアドレスのみアクセス可能**なシンプルチャットです。

- 認証: Firebase Authentication (Google)
- DB: Cloud Firestore
- 配備: Firebase Hosting (サーバーレス)
- 制約: URL送信禁止、ファイル添付禁止

## 1. 事前準備

1. Firebaseプロジェクトを作成
2. Authentication で Google を有効化
3. Firestore を作成
4. `src/app.js` の以下を編集
   - `firebaseConfig`
   - `ALLOWED_EMAILS`
5. `firestore.rules` の許可メールアドレスも同じ値に更新

## 2. サーバーレスで公開（推奨）

```bash
npm i -g firebase-tools
firebase login
firebase use --add
firebase deploy
```

## 3. Colabで一時起動する場合（検証用途）

Colabセルで次を実行すると簡易公開できます。

```bash
!python3 -m http.server 8000
```

別途 `ngrok` 等でトンネルを張れば外部アクセス可能です。

## 4. セキュリティ注意

- `ALLOWED_EMAILS` のクライアント判定だけでは不十分です。
- **必ず `firestore.rules` 側でも同じ許可メール判定**を有効にしてください。
- URL禁止はUIとルールの両方で制限しています。

## 5. 機能

- Googleログイン
- 許可メールアドレス以外は即ログアウト
- メッセージ投稿/表示（最新100件）
- URLを含む投稿を拒否
- ドラッグ&ドロップによるファイル添付操作を拒否

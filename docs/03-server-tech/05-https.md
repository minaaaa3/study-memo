# 3-5. HTTPSと証明書

## 例え話：鍵付きの手紙

HTTPは「はがき」、HTTPSは「鍵付きの封筒」です。

- **HTTP**: 配達員も途中の人も読める
- **HTTPS**: 受取人だけが開けられる封筒

さらに、HTTPSには「差出人の身元確認」もついています。

---

## 核心：なぜHTTPSが必要か

<WhyButton title="なぜHTTPではダメなのか？">

**HTTPは「丸見え」だからです。**

カフェのWiFiでログインすると：
- 隣の人がパスワードを見れる
- 偽のログインページに差し替えられる
- 送金先の口座番号を書き換えられる

HTTPSなら：
- 通信内容が暗号化される（読めない）
- 改ざんを検知できる
- 接続先が本物か証明される

「HTTP=はがき」「HTTPS=封印された封筒」と覚えてください。今日では**HTTPは使うべきでない**というのが常識です。

</WhyButton>

### HTTPの問題点

```
あなた ─────[パスワード: password123]───── サーバー
            ↑
         途中で盗聴可能

- カフェのWiFiで通信を見られる
- 途中のルーターで傍受される
- 内容を改ざんされる可能性
```

### HTTPSで解決

```
あなた ═════[暗号化されたデータ]═════ サーバー
            ↑
         読んでも意味不明
```

HTTPSが守るもの：
- **盗聴防止**: 途中で読まれない
- **改ざん防止**: 途中で書き換えられない
- **なりすまし防止**: 相手が本物か確認できる

---

## HTTPSの仕組み

### TLSハンドシェイク

ブラウザとサーバーが「暗号化の準備」をする過程です。

```
1. ブラウザ → サーバー
   「HTTPSで話したい。私はこれらの暗号方式に対応してます」

2. サーバー → ブラウザ
   「OK。この暗号方式を使いましょう。これが私の証明書です」

3. ブラウザ
   「証明書を確認...本物のexample.comだな」

4. ブラウザ → サーバー
   「共通の秘密鍵を作るための情報です」（公開鍵暗号で安全に送る）

5. 両者
   「共通の秘密鍵ができた。これで暗号化通信を開始」
```

### 公開鍵と共通鍵の組み合わせ

```
なぜ両方使う？

公開鍵暗号（非対称）:
- 安全に鍵を交換できる
- でも遅い

共通鍵暗号（対称）:
- 高速
- でも鍵をどうやって渡す？

→ 最初だけ公開鍵暗号で「共通鍵」を交換
→ その後は高速な共通鍵暗号で通信
```

---

## 証明書とは

### 役割

証明書は「このサーバーは本物のexample.comです」を証明するもの。

```
証明書の中身:
├── ドメイン名（example.com）
├── サーバーの公開鍵
├── 有効期限
├── 発行者（認証局）
└── 発行者の署名
```

### 認証局（CA）の役割

```
1. あなた: 「example.comの証明書をください」
2. 認証局: 「本当にexample.comの所有者？」（ドメイン確認）
3. 認証局: 「確認OK。署名入りの証明書です」

ブラウザには「信頼できる認証局リスト」が入っている
→ そのリストにある認証局が署名した証明書は信頼される
```

### 証明書チェーン

```
ルート証明書（OSやブラウザに入っている）
    ↓ 署名
中間証明書
    ↓ 署名
サーバー証明書（あなたのサイト）

ブラウザはこのチェーンをたどって検証する
```

---

## 証明書を取得する

### Let's Encrypt（無料）

```bash
# Certbotを使用（Ubuntu/Debianの例）
sudo apt install certbot

# Nginx用
sudo certbot --nginx -d example.com -d www.example.com

# 証明書は90日で期限切れ、自動更新を設定
sudo certbot renew --dry-run  # テスト
```

### Cloudflareなどのサービス

```
1. Cloudflareにドメインを登録
2. SSL/TLSを「Full」に設定
3. 勝手に証明書を管理してくれる
```

---

## コードで確認

### Node.jsでHTTPSサーバー

```javascript
const https = require('https');
const fs = require('fs');
const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('Hello HTTPS!');
});

// 証明書と秘密鍵を読み込み
const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/example.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/example.com/fullchain.pem')
};

https.createServer(options, app).listen(443, () => {
  console.log('HTTPS server running on port 443');
});

// HTTPからHTTPSへリダイレクト
const http = require('http');
http.createServer((req, res) => {
  res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
  res.end();
}).listen(80);
```

### 開発環境での自己署名証明書

```bash
# 自己署名証明書を作成（開発用）
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# 質問に適当に答える（開発用なので）
```

```javascript
// 開発サーバー
const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

// ブラウザで警告が出るが、開発では問題ない
```

---

## HTTPSの確認方法

### ブラウザで確認

```
1. URLバーの鍵アイコンをクリック
2. 「証明書」を選択
3. 有効期限、発行者などを確認
```

### コマンドで確認

```bash
# 証明書の情報を表示
openssl s_client -connect example.com:443 -servername example.com </dev/null 2>/dev/null | openssl x509 -text -noout

# 有効期限だけ確認
echo | openssl s_client -connect example.com:443 2>/dev/null | openssl x509 -noout -dates
```

### curlで確認

```bash
# 詳細な情報
curl -v https://example.com

# 証明書の検証をスキップ（開発時）
curl -k https://localhost:3000
```

---

## よくある問題

### 「この接続は安全ではありません」

```
原因：
├── 証明書の期限切れ
├── ドメインが証明書と一致しない
├── 認証局が信頼されていない（自己署名）
└── 中間証明書が欠けている

対策：
├── 証明書を更新
├── 正しいドメインで証明書を取得
├── 信頼できる認証局（Let's Encryptなど）を使う
└── fullchain.pemを使う（中間証明書含む）
```

### Mixed Content

```html
<!-- HTTPSのページでHTTPのリソースを読み込む -->
<img src="http://example.com/image.jpg">  <!-- ブロックされる -->

<!-- すべてHTTPSにする -->
<img src="https://example.com/image.jpg">  <!-- OK -->

<!-- または相対パス/プロトコル相対URL -->
<img src="//example.com/image.jpg">  <!-- ページと同じプロトコル -->
```

### HSTS（HTTP Strict Transport Security）

```javascript
// 「このサイトは常にHTTPSでアクセスしてね」とブラウザに伝える
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
```

---

## よくある誤解

### 「HTTPSなら完全に安全」？

HTTPSが守るのは「通信経路」だけ。

```
守れるもの：
✓ 途中で盗聴されない
✓ 途中で改ざんされない
✓ 相手が本物か確認

守れないもの：
✗ サーバーがハッキングされた
✗ SQLインジェクション
✗ XSS
✗ パスワードが弱い
```

### 「HTTPSは遅い」？

昔の話です。現在は：
- ハードウェアアクセラレーション
- HTTP/2（HTTPSでのみ使える高速プロトコル）
- TLS 1.3（高速なハンドシェイク）

むしろHTTPSの方が速いこともあります。

---

## まとめ

- **HTTPS** = HTTP + TLSによる暗号化
- **守るもの** = 盗聴、改ざん、なりすまし
- **証明書** = サーバーの身元を証明
- **Let's Encrypt** = 無料で証明書を取得できる
- **本番では必須** = HTTPは使わない


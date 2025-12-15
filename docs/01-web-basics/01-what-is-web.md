# 1-1. Webとは何か

## 例え話：郵便システムとして考える

<Callout type="info">
Webは「世界規模の郵便システム」だと考えてみてください。
</Callout>

```mermaid
graph LR
    A[ブラウザ<br/>郵便局の窓口] -->|URL<br/>住所| B[サーバー<br/>届け先の家]
    B -->|HTTP<br/>郵便のルール| A

    style A fill:#e3f2fd
    style B fill:#fff3e0
```

- **URL** = 住所（どこに届けるか）
- **ブラウザ** = 郵便局の窓口（送りたいものを預ける場所）
- **サーバー** = 届け先の家（情報を持っている場所）
- **HTTP** = 郵便のルール（封筒の書き方、切手の貼り方）

あなたがブラウザに `https://example.com/hello` と入力するのは、「example.comという住所の、helloという部屋にあるものを送ってください」と郵便局に依頼するようなものです。

---

## 核心：インターネットとWebの違い

### インターネット = 道路網

インターネットは「コンピュータ同士をつなぐネットワーク」です。
道路網のようなもので、データが行き来するための**インフラ**です。

### Web = その道路を走る車の一つ

Webは「インターネット上で動く仕組みの一つ」です。
インターネットという道路の上を走るサービスの一種にすぎません。

<WhyButton title="なぜインターネットとWebは違うの？">
インターネットは通信の基盤（道路網）で、Webはその上で動くサービス（車）の一つです。メールやファイル転送など、他のサービスも同じインターネット上で動いています。
</WhyButton>

```mermaid
graph TD
    Internet[インターネット<br/>道路網]
    Internet --> Web[Web HTTP/HTTPS<br/>これを学ぶ]
    Internet --> Email[メール<br/>SMTP, POP, IMAP]
    Internet --> FTP[ファイル転送<br/>FTP]
    Internet --> SSH[リモート接続<br/>SSH]
    Internet --> Other[その他いろいろ]

    style Internet fill:#e1f5ff
    style Web fill:#fff9c4
    style Email fill:#f0f0f0
    style FTP fill:#f0f0f0
    style SSH fill:#f0f0f0
    style Other fill:#f0f0f0
```

---

## URLの構造を理解する

URLを分解してみましょう：

```mermaid
graph LR
    URL["https://api.example.com:8080/users/123?sort=name#profile"]
    URL --> Protocol[スキーム/プロトコル<br/>https://]
    URL --> Host[ホスト名/ドメイン<br/>api.example.com]
    URL --> Port[ポート番号<br/>:8080]
    URL --> Path[パス<br/>/users/123]
    URL --> Query[クエリパラメータ<br/>?sort=name]
    URL --> Fragment[フラグメント<br/>#profile]

    style URL fill:#fff9c4
    style Protocol fill:#e3f2fd
    style Host fill:#e8f5e9
    style Port fill:#fce4ec
    style Path fill:#f3e5f5
    style Query fill:#fff3e0
    style Fragment fill:#e0f2f1
```

<Callout type="tip">
各パートには役割があります：
- **スキーム**: どんなルールで通信するか（https）
- **ホスト名**: どのサーバーか（api.example.com）
- **ポート**: どの窓口か（8080）
- **パス**: 何を取得するか（/users/123）
- **クエリ**: 検索条件など（?sort=name）
- **フラグメント**: ページ内の位置（#profile）
</Callout>

### コードで確認

```javascript
// ブラウザのコンソールで実行してみよう
const url = new URL('https://api.example.com:8080/users/123?sort=name#profile');

console.log('プロトコル:', url.protocol);  // "https:"
console.log('ホスト:', url.host);          // "api.example.com:8080"
console.log('ホスト名:', url.hostname);    // "api.example.com"
console.log('ポート:', url.port);          // "8080"
console.log('パス:', url.pathname);        // "/users/123"
console.log('クエリ:', url.search);        // "?sort=name"
console.log('フラグメント:', url.hash);   // "#profile"
```

---

## DNSの役割：住所録

`example.com` と入力しただけでサーバーに届くのはなぜでしょうか？

<Callout type="warning">
実は、コンピュータは `example.com` という名前を理解できません。
コンピュータが理解できるのは **IPアドレス**（例：`93.184.216.34`）だけです。
</Callout>

**DNS（Domain Name System）** は「名前→IPアドレス」の変換を行う電話帳のような仕組みです。

```mermaid
sequenceDiagram
    participant User as あなた
    participant DNS as DNSサーバー
    participant Server as Webサーバー

    User->>DNS: example.comのIPアドレスは？
    DNS-->>User: 93.184.216.34です
    User->>Server: 93.184.216.34に接続
    Server-->>User: 接続完了
```

### コードで確認（Node.js）

```javascript
// Node.jsで実行
const dns = require('dns');

dns.lookup('example.com', (err, address) => {
  console.log('example.comのIPアドレス:', address);
  // 例: "93.184.216.34"
});
```

---

## よくある誤解

### 「WebサイトとWebアプリは違う」？

厳密な定義はありませんが、一般的に：

| Webサイト | Webアプリ |
|----------|----------|
| 情報を**見る**のがメイン | 情報を**操作する**のがメイン |
| ニュースサイト、ブログ | Gmail、Slack、Notion |
| ページを見て回る | ログインして作業する |

技術的には同じ仕組みを使っています。違いは「何をさせるか」だけです。

### 「HTTPとHTTPSは別物」？

HTTPSは「HTTPに暗号化を追加したもの」です。
やり取りの内容は同じで、途中を暗号化しているかどうかの違いです。

```mermaid
graph LR
    A[あなた] -->|HTTP<br/>丸見え| B[サーバー]
    C[あなた] -->|HTTPS<br/>暗号化| D[サーバー]

    style A fill:#ffcdd2
    style B fill:#ffcdd2
    style C fill:#c8e6c9
    style D fill:#c8e6c9
```

<Callout type="error">
HTTPは通信内容が丸見えです。パスワードやクレジットカード情報を送る際は必ずHTTPSを使いましょう。
</Callout>

---

## まとめ

- **インターネット** = コンピュータをつなぐ道路網
- **Web** = その道路を使うサービスの一つ
- **URL** = 「どこの」「何を」取得するかを示す住所
- **DNS** = 名前をIPアドレスに変換する電話帳
- **HTTP/HTTPS** = Webでの通信ルール（HTTPSは暗号化付き）


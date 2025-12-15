export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  slug: string;
  title: string;
  questions: QuizQuestion[];
}

export const quizzes: Quiz[] = [
  // 第1部: Webの全体像を掴む
  {
    slug: '01-web-basics/01-what-is-web',
    title: 'Webとは何か',
    questions: [
      {
        id: 'q1',
        question: 'Webの正式名称は何ですか？',
        options: ['World Wide Web', 'Wireless Web', 'World Web Wide', 'Web Wide World'],
        correctIndex: 0,
        explanation: 'Webの正式名称は「World Wide Web（ワールドワイドウェブ）」です。略してWWWとも呼ばれます。',
      },
      {
        id: 'q2',
        question: 'WebサイトとWebアプリケーションの主な違いは何ですか？',
        options: ['デザインの違い', 'ユーザーとのインタラクションの有無', '使用する言語の違い', 'サーバーの種類の違い'],
        correctIndex: 1,
        explanation: 'Webサイトは主に情報を閲覧するもので、Webアプリケーションはユーザーの入力に応じて動的に変化するインタラクティブな機能を持ちます。',
      },
      {
        id: 'q3',
        question: 'HTTPSの「S」は何を意味しますか？',
        options: ['Speed', 'Secure', 'Simple', 'Standard'],
        correctIndex: 1,
        explanation: 'HTTPSの「S」は「Secure（セキュア）」を意味します。通信が暗号化され、安全に通信できることを示しています。',
      },
    ],
  },
  {
    slug: '01-web-basics/02-request-response',
    title: 'リクエストとレスポンス',
    questions: [
      {
        id: 'q1',
        question: 'HTTPリクエストを送るのは誰ですか？',
        options: ['サーバー', 'クライアント', 'データベース', 'ルーター'],
        correctIndex: 1,
        explanation: 'HTTPリクエストはクライアント（ブラウザなど）がサーバーに送ります。サーバーはそのリクエストに対してレスポンスを返します。',
      },
      {
        id: 'q2',
        question: 'HTTPステータスコード「404」の意味は？',
        options: ['サーバーエラー', '認証が必要', 'リソースが見つからない', '権限がない'],
        correctIndex: 2,
        explanation: '404は「Not Found」を意味し、リクエストされたリソース（ページなど）が見つからないことを示します。',
      },
      {
        id: 'q3',
        question: 'GETリクエストとPOSTリクエストの違いとして正しいのは？',
        options: ['GETは遅く、POSTは速い', 'GETはデータ取得、POSTはデータ送信に使う', 'GETは安全、POSTは危険', 'GETはHTTPS、POSTはHTTP'],
        correctIndex: 1,
        explanation: 'GETは主にサーバーからデータを取得する際に、POSTはサーバーにデータを送信する際に使用します。',
      },
    ],
  },
  {
    slug: '01-web-basics/03-server-client',
    title: 'サーバーとクライアント',
    questions: [
      {
        id: 'q1',
        question: 'サーバーの主な役割は何ですか？',
        options: ['ユーザーインターフェースの表示', 'リクエストを受けてレスポンスを返す', 'プログラムのコンパイル', 'ファイルの圧縮'],
        correctIndex: 1,
        explanation: 'サーバーは「サービスを提供する側」で、クライアントからのリクエストを受け取り、適切なレスポンスを返すのが主な役割です。',
      },
      {
        id: 'q2',
        question: 'クライアントサイドで実行される言語として最も一般的なのは？',
        options: ['Python', 'Java', 'JavaScript', 'Ruby'],
        correctIndex: 2,
        explanation: 'JavaScriptはブラウザで動作するクライアントサイド言語として最も広く使われています。',
      },
    ],
  },
  {
    slug: '01-web-basics/04-history',
    title: 'Webアプリの歴史',
    questions: [
      {
        id: 'q1',
        question: 'SPAの特徴として正しいのは？',
        options: ['ページ遷移のたびにサーバーからHTMLを取得する', 'ページ遷移なしで画面が切り替わる', 'サーバーサイドでのみ動作する', 'SEOに強い'],
        correctIndex: 1,
        explanation: 'SPA（Single Page Application）はページ遷移なしでJavaScriptによって画面を動的に更新するため、アプリのような操作感を実現できます。',
      },
      {
        id: 'q2',
        question: 'SSGの特徴として正しいのは？',
        options: ['リクエスト時にHTMLを生成する', 'ビルド時にHTMLを事前生成する', 'クライアント側でHTMLを生成する', 'HTMLを使用しない'],
        correctIndex: 1,
        explanation: 'SSG（Static Site Generation）はビルド時にHTMLを事前生成するため、リクエスト時は生成済みのHTMLを返すだけで高速です。',
      },
      {
        id: 'q3',
        question: 'ブログやドキュメントサイトに最適なレンダリング方式は？',
        options: ['SPA', 'SSG', '動的サイト', 'CSR'],
        correctIndex: 1,
        explanation: 'ブログやドキュメントサイトは内容がほぼ変わらず、SEOも重要なため、SSGが最適です。',
      },
    ],
  },

  // 第2部: サーバーの世界
  {
    slug: '02-server-world/01-what-is-server',
    title: 'サーバーとは',
    questions: [
      {
        id: 'q1',
        question: 'サーバーは常に専用のハードウェアが必要ですか？',
        options: ['はい、必ず専用サーバーが必要', 'いいえ、普通のPCでもサーバーとして動作可能', 'はい、データセンターにある必要がある', 'いいえ、スマートフォンでなければならない'],
        correctIndex: 1,
        explanation: 'サーバーとはソフトウェア的な概念で、普通のPCでもサーバープログラムを動かせばサーバーとして機能します。',
      },
      {
        id: 'q2',
        question: 'ポート番号80は何に使われますか？',
        options: ['SSH接続', 'HTTP（Web）', 'データベース', 'メール送信'],
        correctIndex: 1,
        explanation: 'ポート80はHTTP（Web）の標準ポートです。HTTPSは443を使用します。',
      },
      {
        id: 'q3',
        question: '同じポートで2つのサーバーを同時に動かすことは？',
        options: ['可能', '不可能', '設定次第', 'OSによる'],
        correctIndex: 1,
        explanation: '同じポートで2つのサーバーを動かすことはできません。「port already in use」エラーになります。',
      },
    ],
  },
  {
    slug: '02-server-world/02-build-server',
    title: 'サーバーを建てる',
    questions: [
      {
        id: 'q1',
        question: 'Expressの役割として正しいのは？',
        options: ['データベース管理', 'ルーティングやミドルウェアの機能提供', 'フロントエンドのUI構築', 'テスト実行'],
        correctIndex: 1,
        explanation: 'ExpressはNode.jsのWebフレームワークで、ルーティング、ミドルウェア、リクエスト/レスポンス処理などを簡単に実装できます。',
      },
      {
        id: 'q2',
        question: 'ミドルウェアとは何ですか？',
        options: ['データベースとサーバーの間のソフトウェア', 'リクエストを処理する途中に挟む共通処理', 'フロントエンドとバックエンドの中間', 'テスト用のモック'],
        correctIndex: 1,
        explanation: 'ミドルウェアはリクエストがルートハンドラに届く前に実行される共通処理で、ログ出力や認証チェックなどに使われます。',
      },
      {
        id: 'q3',
        question: '環境変数を使う主な理由は？',
        options: ['プログラムを高速化するため', 'コードを短くするため', '設定をコードの外に出し、セキュリティを確保するため', 'デバッグを簡単にするため'],
        correctIndex: 2,
        explanation: '環境変数を使うことで、パスワードなどの秘密情報をコードに含めずに管理でき、環境ごとに設定を変更することもできます。',
      },
    ],
  },
  {
    slug: '02-server-world/03-pull-communication',
    title: 'サーバー間の通信（Pull型）',
    questions: [
      {
        id: 'q1',
        question: 'REST APIの設計原則として正しいのは？',
        options: ['URLに動詞を含める', 'HTTPメソッドで操作を表現する', '全てPOSTリクエストを使う', 'XMLのみを使用する'],
        correctIndex: 1,
        explanation: 'REST APIではURLがリソースを、HTTPメソッド（GET, POST, PUT, DELETE）が操作を表現します。URLに動詞は含めません。',
      },
      {
        id: 'q2',
        question: 'GraphQLの特徴として正しいのは？',
        options: ['固定されたレスポンス形式', 'クライアントが欲しいデータを指定できる', 'HTTPメソッドでCRUDを表現', 'バイナリ形式のみ'],
        correctIndex: 1,
        explanation: 'GraphQLではクライアントがクエリで欲しいデータの形を指定できるため、オーバーフェッチを防げます。',
      },
      {
        id: 'q3',
        question: 'gRPCが主に使われる場面は？',
        options: ['ブラウザからの直接アクセス', 'マイクロサービス間の通信', 'SEOが重要なサイト', 'シンプルなCRUD API'],
        correctIndex: 1,
        explanation: 'gRPCは高速でスキーマ駆動のため、マイクロサービス間の通信に適しています。ブラウザからの直接アクセスは複雑です。',
      },
    ],
  },
  {
    slug: '02-server-world/04-push-communication',
    title: 'サーバー間の通信（Push型）',
    questions: [
      {
        id: 'q1',
        question: 'WebSocketの特徴として正しいのは？',
        options: ['一方向通信のみ', '双方向のリアルタイム通信', 'HTTPと同じプロトコル', '毎回接続を確立する'],
        correctIndex: 1,
        explanation: 'WebSocketは接続を維持して双方向にメッセージをやり取りできるため、チャットやリアルタイム通知に適しています。',
      },
      {
        id: 'q2',
        question: 'Webhookとは何ですか？',
        options: ['ブラウザとサーバー間のリアルタイム通信', 'イベント発生時にURLを呼び出すサーバー間通知', 'メッセージキューの一種', 'データベースの監視機能'],
        correctIndex: 1,
        explanation: 'Webhookは「イベントが起きたらURLに通知する」仕組みで、決済完了通知などサーバー間の連携に使われます。',
      },
      {
        id: 'q3',
        question: 'Message QueueとPub/Subの違いは？',
        options: ['同じもの', 'Queueは1対1、Pub/Subは1対多', 'Queueは遅い、Pub/Subは速い', 'Queueはプル型、Pub/Subはプッシュ型'],
        correctIndex: 1,
        explanation: 'Message Queueは1つのメッセージを1つのワーカーが処理し、Pub/Subは1つのメッセージを複数の購読者が受け取れます。',
      },
    ],
  },
  {
    slug: '02-server-world/05-database',
    title: 'データベースとの連携',
    questions: [
      {
        id: 'q1',
        question: 'SQLデータベースの特徴として正しいのは？',
        options: ['スキーマが柔軟', 'テーブル形式でデータを管理', 'JOINが苦手', '水平スケーリングが容易'],
        correctIndex: 1,
        explanation: 'SQLデータベース（RDBMS）はテーブル形式でデータを管理し、テーブル間のリレーションを表現できます。',
      },
      {
        id: 'q2',
        question: 'ORMを使うメリットは？',
        options: ['SQLを直接書ける', '型安全で、SQLを書かなくてもDB操作ができる', 'データベースが高速になる', 'スキーマ定義が不要になる'],
        correctIndex: 1,
        explanation: 'ORMを使うとSQLを直接書かずにオブジェクト指向でDBを操作でき、TypeScriptとの相性も良いです。',
      },
      {
        id: 'q3',
        question: 'トランザクションが必要な理由は？',
        options: ['クエリを高速化するため', '複数の操作をまとめて成功/失敗させ、整合性を保つため', 'データを暗号化するため', 'バックアップを取るため'],
        correctIndex: 1,
        explanation: 'トランザクションは複数の操作を「全部成功」か「全部失敗」にすることで、中途半端な状態を防ぎます。',
      },
    ],
  },

  // 第3部: サーバーサイドの技術
  {
    slug: '03-server-tech/01-auth',
    title: '認証と認可',
    questions: [
      {
        id: 'q1',
        question: '認証（Authentication）と認可（Authorization）の違いは？',
        options: ['同じ意味', '認証は「誰か」、認可は「何ができるか」', '認証は暗号化、認可は復号化', '認証はサーバー側、認可はクライアント側'],
        correctIndex: 1,
        explanation: '認証は「あなたは誰ですか？」を確認するプロセス、認可は「あなたは何ができますか？」を決定するプロセスです。',
      },
      {
        id: 'q2',
        question: 'HTTPステータスコード「401」と「403」の違いは？',
        options: ['同じ意味', '401は認証エラー、403は認可エラー', '401はクライアントエラー、403はサーバーエラー', '401は成功、403は失敗'],
        correctIndex: 1,
        explanation: '401 Unauthorizedは認証が必要または失敗、403 Forbiddenは認証済みでも権限がないことを示します。',
      },
      {
        id: 'q3',
        question: 'パスワード認証で「メールアドレスまたはパスワードが違います」と曖昧に返す理由は？',
        options: ['エラーメッセージを短くするため', '攻撃者に情報を与えないため', 'ユーザーの混乱を防ぐため', '国際化対応のため'],
        correctIndex: 1,
        explanation: '具体的なエラーを返すと攻撃者がメールアドレスの存在を特定できてしまうため、曖昧に返すことで情報漏洩を防ぎます。',
      },
    ],
  },
  {
    slug: '03-server-tech/02-session',
    title: 'セッション管理',
    questions: [
      {
        id: 'q1',
        question: 'セッションIDの保存場所として最も安全なのは？',
        options: ['localStorage', 'sessionStorage', 'httpOnly Cookie', 'URLパラメータ'],
        correctIndex: 2,
        explanation: 'httpOnly Cookieに保存するとJavaScriptからアクセスできないため、XSS攻撃でセッションIDを盗まれにくくなります。',
      },
      {
        id: 'q2',
        question: 'Cookieのhttponly属性の役割は？',
        options: ['HTTPSでのみ送信', 'JavaScriptからのアクセスを禁止', '有効期限を設定', 'ドメインを制限'],
        correctIndex: 1,
        explanation: 'httpOnly属性を設定するとJavaScriptからCookieにアクセスできなくなり、XSS攻撃からセッションIDを保護できます。',
      },
      {
        id: 'q3',
        question: 'セッションIDを推測されにくくするために必要なことは？',
        options: ['連番を使う', '暗号学的に安全な乱数を使う', 'ユーザーIDを含める', '時刻を含める'],
        correctIndex: 1,
        explanation: 'crypto.randomBytesなどの暗号学的に安全な乱数を使用することで、推測不可能なセッションIDを生成できます。',
      },
    ],
  },
  {
    slug: '03-server-tech/03-jwt',
    title: 'JWT（トークン認証）',
    questions: [
      {
        id: 'q1',
        question: 'JWTのペイロードは暗号化されていますか？',
        options: ['はい、暗号化されている', 'いいえ、Base64エンコードされているだけ', '署名によって暗号化', '設定による'],
        correctIndex: 1,
        explanation: 'JWTのペイロードは暗号化されておらず、Base64デコードすれば誰でも読めます。秘密情報を入れてはいけません。',
      },
      {
        id: 'q2',
        question: 'JWTの署名の役割は？',
        options: ['内容を暗号化する', '改ざんされていないことを証明する', 'トークンを圧縮する', '有効期限を設定する'],
        correctIndex: 1,
        explanation: 'JWTの署名は「ペイロードが改ざんされていないこと」を検証するためのもので、暗号化ではありません。',
      },
      {
        id: 'q3',
        question: 'JWTのログアウト問題の対策として正しいのは？',
        options: ['JWTを削除する', 'ブラックリストを作る', '有効期限を延長する', '署名を変更する'],
        correctIndex: 1,
        explanation: 'JWTは発行後に無効化できないため、ブラックリストを作成するか、短い有効期限+リフレッシュトークンの組み合わせで対策します。',
      },
    ],
  },
  {
    slug: '03-server-tech/04-hash-encryption',
    title: 'ハッシュと暗号化',
    questions: [
      {
        id: 'q1',
        question: 'ハッシュと暗号化の違いは？',
        options: ['同じもの', 'ハッシュは一方向、暗号化は双方向', 'ハッシュは遅い、暗号化は速い', 'ハッシュは可逆、暗号化は不可逆'],
        correctIndex: 1,
        explanation: 'ハッシュは元に戻せない一方向変換で、暗号化は鍵があれば元に戻せる双方向変換です。',
      },
      {
        id: 'q2',
        question: 'パスワードの保存には何を使うべきですか？',
        options: ['暗号化', 'Base64エンコード', 'ハッシュ化（bcrypt）', '平文のまま'],
        correctIndex: 2,
        explanation: 'パスワードは元に戻す必要がないため、bcryptなどのハッシュ化アルゴリズムを使用します。',
      },
      {
        id: 'q3',
        question: 'bcryptが単純なSHA-256より安全な理由は？',
        options: ['出力が長い', '意図的に遅く、ソルトを自動付与', 'より新しい', 'JavaScriptで使える'],
        correctIndex: 1,
        explanation: 'bcryptは意図的に遅く設計されており、ソルトを自動で付けてくれるため、総当たり攻撃やレインボーテーブル攻撃に強いです。',
      },
    ],
  },
  {
    slug: '03-server-tech/05-https',
    title: 'HTTPSと証明書',
    questions: [
      {
        id: 'q1',
        question: 'HTTPSが守るものとして正しいのは？',
        options: ['SQLインジェクション', '盗聴・改ざん・なりすまし', 'XSS攻撃', 'パスワードの強度'],
        correctIndex: 1,
        explanation: 'HTTPSは通信経路を暗号化することで、盗聴、改ざん、なりすましを防ぎます。ただしアプリの脆弱性は別問題です。',
      },
      {
        id: 'q2',
        question: 'SSL/TLS証明書の役割は？',
        options: ['データを圧縮する', 'サーバーの身元を証明する', 'パスワードを保存する', 'ファイルを暗号化する'],
        correctIndex: 1,
        explanation: '証明書は「このサーバーは本物のexample.comです」を証明するもので、認証局によって署名されています。',
      },
      {
        id: 'q3',
        question: 'Let\'s Encryptの特徴は？',
        options: ['有料だが高品質', '無料で証明書を取得できる', '自己署名証明書を提供', '大企業専用'],
        correctIndex: 1,
        explanation: 'Let\'s Encryptは無料でSSL/TLS証明書を取得できる認証局で、自動更新にも対応しています。',
      },
    ],
  },
  {
    slug: '03-server-tech/06-cache',
    title: 'キャッシュ',
    questions: [
      {
        id: 'q1',
        question: 'キャッシュの主な目的は？',
        options: ['データを暗号化する', '同じデータを繰り返し取得する時間を短縮する', 'データベースの容量を増やす', 'セキュリティを強化する'],
        correctIndex: 1,
        explanation: 'キャッシュは「一度取得したデータを保存しておいて、次回以降すぐに返す」仕組みです。同じデータを毎回サーバーに取りに行かなくて済むため、時間を短縮できます。',
      },
      {
        id: 'q2',
        question: 'ブラウザキャッシュの説明として正しいのは？',
        options: ['サーバー側でデータを保存する', 'ブラウザがファイルを一時的に保存し、再訪問時に速く表示できる', 'データベースの一種', '全てのユーザーで共有される'],
        correctIndex: 1,
        explanation: 'ブラウザキャッシュは、ブラウザがWebサイトのファイル（CSS、JavaScript、画像など）をあなたのパソコンに保存しておく仕組みです。次に同じサイトを見るとき、保存されたファイルを使うので速く表示できます。',
      },
      {
        id: 'q3',
        question: 'CDNキャッシュの利点は？',
        options: ['データを暗号化できる', '世界中に配置されたサーバーから近い場所で配信される', 'プログラムが高速になる', 'データベースが不要になる'],
        correctIndex: 1,
        explanation: 'CDN（Content Delivery Network）は世界中にサーバーを持っていて、ユーザーに一番近いサーバーからコンテンツを配信します。日本にいる人には日本のサーバーから、アメリカにいる人にはアメリカのサーバーから配信されるため、速くなります。',
      },
    ],
  },

  // 第4部: クライアントサイドの技術
  {
    slug: '04-client-tech/01-dom-rendering',
    title: 'DOMとレンダリング',
    questions: [
      {
        id: 'q1',
        question: 'HTMLとDOMの違いは？',
        options: ['同じもの', 'HTMLは文字列、DOMは操作可能なオブジェクト', 'HTMLはサーバー、DOMはクライアント', 'HTMLは新しい、DOMは古い'],
        correctIndex: 1,
        explanation: 'HTMLはただの文字列ですが、ブラウザがそれを解析してDOMというツリー構造のオブジェクトを作り、JavaScriptで操作できるようにします。',
      },
      {
        id: 'q2',
        question: 'ブラウザのレンダリングプロセスで最初に行われるのは？',
        options: ['ペイント', 'DOM構築', 'レイアウト計算', '合成'],
        correctIndex: 1,
        explanation: 'ブラウザはまずHTMLを解析してDOMツリーを構築し、その後CSS解析、レイアウト計算、ペイントと進みます。',
      },
      {
        id: 'q3',
        question: '仮想DOMの利点は？',
        options: ['メモリを節約できる', '実際のDOM操作を最小限に抑えてパフォーマンスを向上', 'サーバーサイドで動作する', 'CSSが不要になる'],
        correctIndex: 1,
        explanation: '仮想DOMは変更前後の差分を計算し、必要な部分だけ実際のDOMを更新するため、パフォーマンスが向上します。',
      },
    ],
  },
  {
    slug: '04-client-tech/02-state-management',
    title: '状態管理',
    questions: [
      {
        id: 'q1',
        question: 'Props drillingの問題点は？',
        options: ['パフォーマンスが悪い', '多くのコンポーネントを経由してデータを渡す必要がある', 'セキュリティリスク', 'TypeScriptで使えない'],
        correctIndex: 1,
        explanation: 'Props drillingは親から子へバケツリレーのようにデータを渡す必要があり、中間のコンポーネントが不要なpropsを受け取ることになります。',
      },
      {
        id: 'q2',
        question: 'React ContextはどのuseStateの問題を解決しますか？',
        options: ['パフォーマンス', 'コンポーネント間での状態共有', '非同期処理', 'スタイリング'],
        correctIndex: 1,
        explanation: 'React ContextはProps drillingなしに深いコンポーネントツリーで状態を共有できます。',
      },
      {
        id: 'q3',
        question: 'Zustandの特徴として正しいのは？',
        options: ['大きなボイラープレートが必要', 'シンプルなAPIでグローバル状態を管理', 'Reactでしか使えない', 'サーバーサイド専用'],
        correctIndex: 1,
        explanation: 'ZustandはReduxよりシンプルなAPIでグローバル状態を管理でき、Providerも不要です。',
      },
    ],
  },
  {
    slug: '04-client-tech/03-routing',
    title: 'ルーティング',
    questions: [
      {
        id: 'q1',
        question: 'SPAでのルーティングに使われるブラウザAPIは？',
        options: ['Fetch API', 'History API', 'DOM API', 'Storage API'],
        correctIndex: 1,
        explanation: 'History APIのpushStateを使うことで、ページ遷移なしにURLを変更し、SPAでのルーティングを実現します。',
      },
      {
        id: 'q2',
        question: 'Next.jsのApp Routerの特徴は？',
        options: ['設定ファイルでルートを定義', 'ファイルベースルーティング', 'URLを手動で管理', 'JavaScriptでルートを定義'],
        correctIndex: 1,
        explanation: 'Next.jsのApp Routerはファイルシステムに基づいたルーティングで、app/ディレクトリ構造がそのままURLになります。',
      },
      {
        id: 'q3',
        question: '動的ルーティングで[id]のようなフォルダ名を使う理由は？',
        options: ['ファイルを隠すため', 'URLのパラメータを受け取るため', 'セキュリティのため', 'パフォーマンス向上のため'],
        correctIndex: 1,
        explanation: '[id]のような角括弧フォルダは動的ルーティングを表し、/users/123のようなURLのパラメータを受け取れます。',
      },
    ],
  },
  {
    slug: '04-client-tech/04-styling',
    title: 'スタイリング',
    questions: [
      {
        id: 'q1',
        question: 'CSSモジュールの利点は？',
        options: ['グローバルスタイル', 'クラス名が自動でユニークになり衝突しない', 'CSSが不要になる', 'JavaScriptで書ける'],
        correctIndex: 1,
        explanation: 'CSSモジュールはクラス名を自動でユニークに変換するため、他のコンポーネントとの衝突を防げます。',
      },
      {
        id: 'q2',
        question: 'Tailwind CSSの特徴は？',
        options: ['CSSを書く必要がない', 'ユーティリティクラスを組み合わせてスタイリング', 'コンポーネントライブラリ', 'CSS-in-JSの一種'],
        correctIndex: 1,
        explanation: 'Tailwind CSSはユーティリティファーストのCSSフレームワークで、小さなクラスを組み合わせてスタイリングします。',
      },
      {
        id: 'q3',
        question: 'styled-componentsの特徴は？',
        options: ['設定ファイルが必要', 'JavaScriptでスタイルを定義できる', 'Tailwindと同じ', 'SSRで使えない'],
        correctIndex: 1,
        explanation: 'styled-componentsはCSS-in-JSライブラリで、JavaScriptの中でスタイルを定義し、動的なスタイリングが容易です。',
      },
    ],
  },
  {
    slug: '04-client-tech/05-async',
    title: '非同期処理',
    questions: [
      {
        id: 'q1',
        question: '非同期処理が必要な理由は？',
        options: ['コードを短くするため', '重い処理で画面がフリーズしないようにするため', 'メモリを節約するため', 'セキュリティのため'],
        correctIndex: 1,
        explanation: 'JavaScriptはシングルスレッドなので、同期的に重い処理を行うと画面がフリーズします。非同期処理でこれを防ぎます。',
      },
      {
        id: 'q2',
        question: 'async/awaitの利点は？',
        options: ['Promiseより高速', '同期的な見た目で非同期処理を書ける', 'コールバックが使える', 'エラー処理が不要'],
        correctIndex: 1,
        explanation: 'async/awaitを使うとPromiseチェーンより読みやすく、同期的な見た目で非同期処理を書けます。',
      },
      {
        id: 'q3',
        question: 'Promise.allの用途は？',
        options: ['Promiseを順番に実行', '複数のPromiseを並列実行して全て完了を待つ', 'Promiseをキャンセル', 'エラーを無視'],
        correctIndex: 1,
        explanation: 'Promise.allは複数のPromiseを並列に実行し、全てが完了するのを待ちます。1つでも失敗すると全体が失敗します。',
      },
    ],
  },
  {
    slug: '04-client-tech/06-form',
    title: 'フォームとバリデーション',
    questions: [
      {
        id: 'q1',
        question: 'フォームのバリデーションはどこで行うべき？',
        options: ['フロントエンドのみ', 'バックエンドのみ', 'フロントエンドとバックエンドの両方', 'データベース'],
        correctIndex: 2,
        explanation: 'フロントエンドのバリデーションはUX向上のため、バックエンドはセキュリティのため、両方で行う必要があります。',
      },
      {
        id: 'q2',
        question: 'React Hook Formの利点は？',
        options: ['HTMLのフォームが不要になる', '再レンダリングを最小限に抑える', 'バックエンドも処理できる', 'CSSが自動適用される'],
        correctIndex: 1,
        explanation: 'React Hook Formはuncontrolled componentsを活用し、入力ごとの再レンダリングを防ぐため、パフォーマンスが良いです。',
      },
      {
        id: 'q3',
        question: 'Zodの役割は？',
        options: ['フォームのUI構築', 'スキーマ定義とバリデーション', 'APIリクエスト', 'スタイリング'],
        correctIndex: 1,
        explanation: 'Zodはスキーマを定義してバリデーションを行うライブラリで、TypeScriptとの相性が良く型推論もできます。',
      },
    ],
  },
  {
    slug: '04-client-tech/07-data-fetching',
    title: 'データフェッチング',
    questions: [
      {
        id: 'q1',
        question: 'サーバー状態とクライアント状態の違いは？',
        options: ['同じもの', 'サーバー状態は非同期で取得し、他者が変更する可能性がある', 'クライアント状態はDBに保存される', 'サーバー状態はUI専用'],
        correctIndex: 1,
        explanation: 'サーバー状態はサーバーが「真実」を持ち、非同期で取得する必要があり、他のユーザーが変更する可能性があります。',
      },
      {
        id: 'q2',
        question: 'TanStack Queryの主な機能は？',
        options: ['フォーム処理', 'サーバー状態のキャッシュと同期', 'ルーティング', 'スタイリング'],
        correctIndex: 1,
        explanation: 'TanStack Queryはサーバー状態の取得、キャッシュ、更新、同期を効率的に管理するライブラリです。',
      },
      {
        id: 'q3',
        question: 'staleTimeの役割は？',
        options: ['エラー時のリトライ間隔', 'キャッシュが「新鮮」とみなされる時間', 'ローディング表示の時間', 'タイムアウト時間'],
        correctIndex: 1,
        explanation: 'staleTimeはキャッシュが「新鮮」とみなされる時間で、この期間中は再フェッチが行われません。',
      },
    ],
  },
  {
    slug: '04-client-tech/08-nextjs',
    title: 'Next.jsの基礎',
    questions: [
      {
        id: 'q1',
        question: 'Next.jsがReactに追加する主な機能は？',
        options: ['状態管理', 'ルーティング、SSR、APIルートなど', 'テストフレームワーク', 'データベース接続'],
        correctIndex: 1,
        explanation: 'Next.jsはReactにファイルベースルーティング、SSR/SSG、APIルート、画像最適化などを追加します。',
      },
      {
        id: 'q2',
        question: 'Server ComponentsとClient Componentsの違いは？',
        options: ['見た目の違い', 'Server Componentsはサーバーで実行され、バンドルに含まれない', 'Client Componentsは遅い', '同じもの'],
        correctIndex: 1,
        explanation: 'Server Componentsはサーバーでのみ実行され、JavaScriptバンドルに含まれないため、バンドルサイズを削減できます。',
      },
      {
        id: 'q3',
        question: '"use client"ディレクティブの意味は？',
        options: ['サーバーコンポーネントを宣言', 'クライアントコンポーネントを宣言', 'APIルートを宣言', 'ミドルウェアを宣言'],
        correctIndex: 1,
        explanation: '"use client"をファイルの先頭に書くと、そのコンポーネントはClient Componentとして扱われ、ブラウザで実行されます。',
      },
    ],
  },

  // 第5部: 開発を支える技術
  {
    slug: '05-dev-support/01-git',
    title: 'バージョン管理（Git）',
    questions: [
      {
        id: 'q1',
        question: 'git commitの役割は？',
        options: ['ファイルを削除', '変更のスナップショットを保存', 'リモートにプッシュ', 'ブランチを作成'],
        correctIndex: 1,
        explanation: 'git commitは現在のステージング状態のスナップショット（セーブポイント）を作成し、履歴として保存します。',
      },
      {
        id: 'q2',
        question: 'git branchを使う主な理由は？',
        options: ['ファイルをバックアップ', 'メインコードに影響を与えずに新機能を開発', 'コミット履歴を削除', 'リモートと同期'],
        correctIndex: 1,
        explanation: 'ブランチを使うことで、メインブランチに影響を与えずに新機能の開発やバグ修正ができます。',
      },
      {
        id: 'q3',
        question: 'プルリクエスト（PR）の目的は？',
        options: ['コードを自動デプロイ', '変更をレビューしてもらい、マージの許可を得る', 'ブランチを削除', 'コンフリクトを発生させる'],
        correctIndex: 1,
        explanation: 'プルリクエストは変更内容をチームにレビューしてもらい、承認を得てからマージするためのワークフローです。',
      },
    ],
  },
  {
    slug: '05-dev-support/02-testing',
    title: 'テスト',
    questions: [
      {
        id: 'q1',
        question: '単体テストの対象は？',
        options: ['システム全体', '関数やコンポーネント単体', 'UIの見た目', 'パフォーマンス'],
        correctIndex: 1,
        explanation: '単体テストは関数やコンポーネントなど、小さな単位を個別にテストします。',
      },
      {
        id: 'q2',
        question: 'テストピラミッドで最も多く書くべきテストは？',
        options: ['E2Eテスト', '結合テスト', '単体テスト', 'パフォーマンステスト'],
        correctIndex: 2,
        explanation: 'テストピラミッドでは、速くて安定している単体テストを最も多く、遅くて壊れやすいE2Eテストを少なく書きます。',
      },
      {
        id: 'q3',
        question: 'JestやVitestの役割は？',
        options: ['コードフォーマット', 'テストの実行と結果の判定', 'デプロイ', 'パッケージ管理'],
        correctIndex: 1,
        explanation: 'JestやVitestはJavaScriptのテストフレームワークで、テストの実行、アサーション、モックなどの機能を提供します。',
      },
    ],
  },
  {
    slug: '05-dev-support/03-ci-cd',
    title: 'CI/CD',
    questions: [
      {
        id: 'q1',
        question: 'CI（継続的インテグレーション）で自動化されることは？',
        options: ['コードレビュー', 'リンター実行、テスト、ビルド', '要件定義', 'デザイン作成'],
        correctIndex: 1,
        explanation: 'CIではコードがプッシュされると自動でリンター、テスト、ビルドが実行され、問題があれば通知されます。',
      },
      {
        id: 'q2',
        question: 'GitHub Actionsのワークフローはどこに定義しますか？',
        options: ['package.json', '.github/workflows/*.yml', 'README.md', 'src/'],
        correctIndex: 1,
        explanation: 'GitHub Actionsのワークフローは.github/workflows/ディレクトリにYAMLファイルとして定義します。',
      },
      {
        id: 'q3',
        question: 'CD（継続的デプロイ）の利点は？',
        options: ['手動でのデプロイミスを防ぐ', 'コードを書く量が減る', 'テストが不要になる', 'GitHubが不要になる'],
        correctIndex: 0,
        explanation: 'CDはテストが通ったコードを自動でデプロイするため、手動操作によるミスを防ぎ、迅速にリリースできます。',
      },
    ],
  },
  {
    slug: '05-dev-support/04-environment',
    title: '環境構築',
    questions: [
      {
        id: 'q1',
        question: '.envファイルをGitにコミットしてはいけない理由は？',
        options: ['ファイルサイズが大きい', '秘密情報が含まれるから', 'ファイル形式が特殊', 'パフォーマンスに影響'],
        correctIndex: 1,
        explanation: '.envにはAPIキーやパスワードなどの秘密情報が含まれることが多いため、公開リポジトリにコミットしてはいけません。',
      },
      {
        id: 'q2',
        question: 'Dockerの主な利点は？',
        options: ['コードが高速になる', '環境を再現可能にし「私のPCでは動く」問題を解決', 'Gitが不要になる', 'テストが自動化される'],
        correctIndex: 1,
        explanation: 'Dockerは環境をコンテナとしてパッケージ化するため、誰がどこで動かしても同じ環境を再現できます。',
      },
      {
        id: 'q3',
        question: 'Dockerfileの役割は？',
        options: ['環境変数を定義', 'コンテナイメージの構築手順を定義', 'コンテナを起動', 'ネットワーク設定'],
        correctIndex: 1,
        explanation: 'Dockerfileにはベースイメージ、インストールするパッケージ、コピーするファイルなど、イメージの構築手順を記述します。',
      },
    ],
  },
  {
    slug: '05-dev-support/05-debugging',
    title: 'デバッグ',
    questions: [
      {
        id: 'q1',
        question: 'デバッグの最初のステップは？',
        options: ['すぐにコードを修正', '問題を再現する', 'コードを全部書き直す', 'ログを全削除'],
        correctIndex: 1,
        explanation: 'デバッグの最初のステップは問題を再現することです。再現できなければ原因特定も修正確認もできません。',
      },
      {
        id: 'q2',
        question: 'スタックトレースから読み取れる情報は？',
        options: ['CPUの使用率', 'エラーが発生した場所と呼び出し経路', 'メモリ使用量', 'ネットワーク状態'],
        correctIndex: 1,
        explanation: 'スタックトレースにはエラーが発生したファイル、行番号、関数名と、どこから呼び出されたかの経路が含まれます。',
      },
      {
        id: 'q3',
        question: 'ブレークポイントの役割は？',
        options: ['プログラムを終了', '指定した行で実行を一時停止して状態を確認', 'ファイルを削除', 'コンパイルを高速化'],
        correctIndex: 1,
        explanation: 'ブレークポイントを設定すると、その行で実行が一時停止し、変数の値や呼び出し履歴を確認できます。',
      },
    ],
  },
  {
    slug: '05-dev-support/06-cloud',
    title: 'クラウドコンピューティング',
    questions: [
      {
        id: 'q1',
        question: 'クラウドの一番の特徴は？',
        options: ['自分でサーバーを買う必要がある', '必要な分だけ借りて使える', '無料で使える', 'インターネットが不要'],
        correctIndex: 1,
        explanation: 'クラウドは「必要な分だけ借りて使える」サービスです。自分でサーバーを買わなくても、インターネット経由で必要な時に必要な分だけ使えます。',
      },
      {
        id: 'q2',
        question: 'PaaSの説明として正しいのは？',
        options: ['サーバーを自分で管理する必要がある', 'コードを書くだけでアプリが動く環境', '完成済みのソフトウェアを使う', 'ネットワークの設定が必要'],
        correctIndex: 1,
        explanation: 'PaaS（Platform as a Service）は「コードを書くだけで動く環境」を提供します。サーバーの管理やOSのアップデートなどはクラウド側がやってくれます。Vercelがその代表例です。',
      },
      {
        id: 'q3',
        question: 'サーバーレスの特徴は？',
        options: ['サーバーが存在しない', 'サーバーの管理が不要で、使った分だけ料金がかかる', '常に同じ料金', 'オフラインで動く'],
        correctIndex: 1,
        explanation: 'サーバーレスは「サーバーがない」わけではなく、「サーバーを意識しなくていい」という意味です。リクエストがあったときだけ動き、使った分だけ料金がかかります。',
      },
    ],
  },

  // 第6部: 実装演習
  {
    slug: '06-practice/01-auth-system',
    title: '認証システムを作る',
    questions: [
      {
        id: 'q1',
        question: '自前で認証を実装する意義は？',
        options: ['ライブラリより高性能', 'ライブラリが何を解決しているか理解できる', 'コードが短くなる', 'セキュリティが向上'],
        correctIndex: 1,
        explanation: '自前で実装することで、NextAuthなどのライブラリが何を抽象化し、何を解決しているか深く理解できます。',
      },
      {
        id: 'q2',
        question: 'パスワードをDBに保存する前に行うべきことは？',
        options: ['Base64エンコード', 'bcryptでハッシュ化', '暗号化', '圧縮'],
        correctIndex: 1,
        explanation: 'パスワードは元に戻す必要がないため、bcryptでハッシュ化して保存します。暗号化ではありません。',
      },
      {
        id: 'q3',
        question: 'NextAuth.jsの利点は？',
        options: ['認証ロジックを自分で書く必要がある', '複数プロバイダー対応やセッション管理が簡単', 'パフォーマンスが向上', 'データベースが不要'],
        correctIndex: 1,
        explanation: 'NextAuth.jsはGoogleやGitHubなど複数の認証プロバイダーに対応し、セッション管理も自動で行ってくれます。',
      },
    ],
  },
  {
    slug: '06-practice/02-state-management',
    title: '状態管理を実装する',
    questions: [
      {
        id: 'q1',
        question: 'useStateのみで状態管理する場合の限界は？',
        options: ['パフォーマンスが悪い', '複数コンポーネント間での共有が難しい', 'TypeScriptで使えない', 'Reactで使えない'],
        correctIndex: 1,
        explanation: 'useStateはそのコンポーネント内のローカル状態のため、複数コンポーネントで共有するにはProps drillingが必要になります。',
      },
      {
        id: 'q2',
        question: 'useReducerを使うのに適した場面は？',
        options: ['単純なboolean状態', '複雑な状態遷移がある場合', 'APIからのデータ取得', 'スタイリング'],
        correctIndex: 1,
        explanation: 'useReducerは複雑な状態遷移がある場合に適しており、アクションとリデューサーで状態変更を明確に記述できます。',
      },
      {
        id: 'q3',
        question: 'Zustandのcreate関数で定義するものは？',
        options: ['Reactコンポーネント', 'ストア（状態と更新関数）', 'APIエンドポイント', 'CSSスタイル'],
        correctIndex: 1,
        explanation: 'Zustandのcreate関数でストア（初期状態と状態を更新する関数）を定義し、任意のコンポーネントから使用できます。',
      },
    ],
  },
  {
    slug: '06-practice/03-api-client',
    title: 'APIクライアントを作る',
    questions: [
      {
        id: 'q1',
        question: '素のfetchを毎回書く問題点は？',
        options: ['パフォーマンスが悪い', 'ヘッダー設定やエラー処理の重複', 'セキュリティリスク', 'TypeScriptで使えない'],
        correctIndex: 1,
        explanation: '素のfetchを毎回書くと、認証ヘッダーの設定やエラーハンドリングなど同じコードを何度も書くことになります。',
      },
      {
        id: 'q2',
        question: 'APIクライアントラッパーで実装すべき機能は？',
        options: ['UI描画', 'ベースURL設定、認証ヘッダー自動付与、エラー処理', 'データベース接続', 'ルーティング'],
        correctIndex: 1,
        explanation: 'APIクライアントではベースURL、認証トークンの自動付与、共通のエラーハンドリングなどを実装します。',
      },
      {
        id: 'q3',
        question: 'Axiosとfetchの違いとして正しいのは？',
        options: ['Axiosは遅い', 'Axiosは自動でJSONパースやエラー処理をする', 'fetchの方が高機能', '同じもの'],
        correctIndex: 1,
        explanation: 'Axiosはレスポンスを自動でJSONパースし、ステータスコードによるエラー判定も自動で行います。fetchはこれらを手動で行う必要があります。',
      },
    ],
  },
  {
    slug: '06-practice/04-form',
    title: 'フォームを作る',
    questions: [
      {
        id: 'q1',
        question: '素のuseStateでフォームを管理する問題点は？',
        options: ['パフォーマンスが良すぎる', 'フィールドが増えるとuseStateが増え、コードが冗長になる', 'Reactで使えない', 'バリデーションができない'],
        correctIndex: 1,
        explanation: 'フィールドごとにuseStateを追加する必要があり、バリデーションロジックも散らばってコードが複雑になります。',
      },
      {
        id: 'q2',
        question: 'React Hook Formのregister関数の役割は？',
        options: ['ユーザー登録', 'フォームフィールドをReact Hook Formに登録', 'APIリクエスト', 'スタイル適用'],
        correctIndex: 1,
        explanation: 'register関数でinput要素をReact Hook Formに登録し、値の追跡やバリデーションを自動で行えるようにします。',
      },
      {
        id: 'q3',
        question: 'Zodスキーマでバリデーションエラーメッセージをカスタマイズするには？',
        options: ['エラーを無視する', 'messageオプションを指定する', 'console.logを使う', '別のライブラリを使う'],
        correctIndex: 1,
        explanation: 'z.string().min(8, { message: "8文字以上必要です" })のようにmessageオプションでエラーメッセージをカスタマイズできます。',
      },
    ],
  },
  {
    slug: '06-practice/05-mini-app',
    title: 'ミニアプリを作る',
    questions: [
      {
        id: 'q1',
        question: 'TanStack QueryのuseQueryで取得したデータはどこに保存される？',
        options: ['localStorage', 'TanStack Queryのキャッシュ', 'データベース', 'セッション'],
        correctIndex: 1,
        explanation: 'useQueryで取得したデータはTanStack Queryのキャッシュに保存され、同じキーで再度取得するとキャッシュから返されます。',
      },
      {
        id: 'q2',
        question: 'useMutationの主な用途は？',
        options: ['データの取得', 'データの作成・更新・削除', 'スタイリング', 'ルーティング'],
        correctIndex: 1,
        explanation: 'useMutationはPOST、PUT、DELETEなどのデータ変更操作に使用し、成功時にキャッシュの無効化なども行えます。',
      },
      {
        id: 'q3',
        question: 'invalidateQueriesの役割は？',
        options: ['クエリを削除', '指定したキーのキャッシュを無効化して再取得', 'エラーを発生させる', 'ローディングを表示'],
        correctIndex: 1,
        explanation: 'invalidateQueriesは指定したキーのキャッシュを無効化し、そのデータを使用しているコンポーネントで再取得を発生させます。',
      },
    ],
  },
];

export function getQuizBySlug(slug: string): Quiz | undefined {
  return quizzes.find((quiz) => quiz.slug === slug);
}

export function getAllQuizSlugs(): string[] {
  return quizzes.map((quiz) => quiz.slug);
}

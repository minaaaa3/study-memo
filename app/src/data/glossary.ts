export interface GlossaryTerm {
  id: string;
  term: string;
  reading?: string; // ふりがな
  description: string;
  relatedTerms?: string[]; // 関連用語のID
  category: string;
}

export const glossaryTerms: GlossaryTerm[] = [
  // Web基礎
  {
    id: 'web',
    term: 'Web',
    reading: 'ウェブ',
    description:
      'World Wide Webの略。インターネット上で文書や画像などの情報を公開・閲覧するための仕組み。',
    relatedTerms: ['http', 'html', 'url'],
    category: 'Web基礎',
  },
  {
    id: 'http',
    term: 'HTTP',
    reading: 'エイチティーティーピー',
    description:
      'HyperText Transfer Protocolの略。WebブラウザとWebサーバー間でデータをやり取りするためのプロトコル。',
    relatedTerms: ['https', 'request', 'response'],
    category: 'Web基礎',
  },
  {
    id: 'https',
    term: 'HTTPS',
    reading: 'エイチティーティーピーエス',
    description:
      'HTTP over SSL/TLSの略。HTTPの通信を暗号化し、安全にデータをやり取りするためのプロトコル。',
    relatedTerms: ['http', 'ssl-tls'],
    category: 'Web基礎',
  },
  {
    id: 'url',
    term: 'URL',
    reading: 'ユーアールエル',
    description:
      'Uniform Resource Locatorの略。Web上のリソースの場所を示すアドレス。',
    relatedTerms: ['uri', 'domain'],
    category: 'Web基礎',
  },
  {
    id: 'uri',
    term: 'URI',
    reading: 'ユーアールアイ',
    description:
      'Uniform Resource Identifierの略。リソースを識別するための文字列。URLはURIの一種。',
    relatedTerms: ['url'],
    category: 'Web基礎',
  },
  {
    id: 'html',
    term: 'HTML',
    reading: 'エイチティーエムエル',
    description:
      'HyperText Markup Languageの略。Webページの構造を記述するためのマークアップ言語。',
    relatedTerms: ['css', 'javascript', 'dom'],
    category: 'フロントエンド',
  },
  {
    id: 'css',
    term: 'CSS',
    reading: 'シーエスエス',
    description:
      'Cascading Style Sheetsの略。HTMLの要素にスタイル（見た目）を適用するための言語。',
    relatedTerms: ['html', 'responsive'],
    category: 'フロントエンド',
  },
  {
    id: 'javascript',
    term: 'JavaScript',
    reading: 'ジャバスクリプト',
    description:
      'Webブラウザで動作するプログラミング言語。動的なWebページを作成するために使用される。',
    relatedTerms: ['typescript', 'dom', 'nodejs'],
    category: 'プログラミング言語',
  },
  {
    id: 'typescript',
    term: 'TypeScript',
    reading: 'タイプスクリプト',
    description:
      'JavaScriptに静的型付けを追加したプログラミング言語。大規模開発での保守性向上に役立つ。',
    relatedTerms: ['javascript'],
    category: 'プログラミング言語',
  },

  // クライアント・サーバー
  {
    id: 'client',
    term: 'クライアント',
    description:
      'サービスを利用する側。Webの場合はブラウザなど、サーバーにリクエストを送る側を指す。',
    relatedTerms: ['server', 'request'],
    category: 'Web基礎',
  },
  {
    id: 'server',
    term: 'サーバー',
    description:
      'サービスを提供する側。クライアントからのリクエストを受け、レスポンスを返すコンピュータやプログラム。',
    relatedTerms: ['client', 'response', 'web-server'],
    category: 'サーバー',
  },
  {
    id: 'request',
    term: 'リクエスト',
    description:
      'クライアントからサーバーへの要求。HTTPメソッド、ヘッダー、ボディなどで構成される。',
    relatedTerms: ['response', 'http-method'],
    category: 'Web基礎',
  },
  {
    id: 'response',
    term: 'レスポンス',
    description:
      'サーバーからクライアントへの応答。ステータスコード、ヘッダー、ボディなどで構成される。',
    relatedTerms: ['request', 'status-code'],
    category: 'Web基礎',
  },
  {
    id: 'http-method',
    term: 'HTTPメソッド',
    description:
      'リクエストの種類を示すもの。GET（取得）、POST（作成）、PUT（更新）、DELETE（削除）などがある。',
    relatedTerms: ['request', 'rest-api'],
    category: 'Web基礎',
  },
  {
    id: 'status-code',
    term: 'ステータスコード',
    description:
      'レスポンスの結果を示す3桁の数字。200（成功）、404（見つからない）、500（サーバーエラー）など。',
    relatedTerms: ['response'],
    category: 'Web基礎',
  },

  // サーバーサイド
  {
    id: 'web-server',
    term: 'Webサーバー',
    description:
      'HTTPリクエストを受け取り、HTMLやその他のコンテンツを返すサーバーソフトウェア。Apache、Nginxなど。',
    relatedTerms: ['server', 'http'],
    category: 'サーバー',
  },
  {
    id: 'nodejs',
    term: 'Node.js',
    reading: 'ノードジェイエス',
    description:
      'サーバーサイドでJavaScriptを実行するためのランタイム環境。',
    relatedTerms: ['javascript', 'npm'],
    category: 'サーバー',
  },
  {
    id: 'npm',
    term: 'npm',
    reading: 'エヌピーエム',
    description:
      'Node Package Managerの略。Node.jsのパッケージ管理ツール。',
    relatedTerms: ['nodejs', 'package-json'],
    category: 'ツール',
  },

  // API
  {
    id: 'api',
    term: 'API',
    reading: 'エーピーアイ',
    description:
      'Application Programming Interfaceの略。ソフトウェア同士がやり取りするためのインターフェース。',
    relatedTerms: ['rest-api', 'endpoint'],
    category: 'API',
  },
  {
    id: 'rest-api',
    term: 'REST API',
    reading: 'レストエーピーアイ',
    description:
      'RESTの原則に基づいて設計されたAPI。HTTPメソッドを使ってリソースを操作する。',
    relatedTerms: ['api', 'http-method', 'endpoint'],
    category: 'API',
  },
  {
    id: 'endpoint',
    term: 'エンドポイント',
    description:
      'APIでアクセス可能なURL。特定のリソースや機能にアクセスするためのポイント。',
    relatedTerms: ['api', 'url'],
    category: 'API',
  },
  {
    id: 'json',
    term: 'JSON',
    reading: 'ジェイソン',
    description:
      'JavaScript Object Notationの略。データを交換するための軽量なテキスト形式。',
    relatedTerms: ['api', 'javascript'],
    category: 'データ形式',
  },

  // 認証・セキュリティ
  {
    id: 'authentication',
    term: '認証',
    reading: 'にんしょう',
    description:
      'ユーザーが誰であるかを確認するプロセス。ログイン処理などで行われる。',
    relatedTerms: ['authorization', 'session', 'jwt'],
    category: 'セキュリティ',
  },
  {
    id: 'authorization',
    term: '認可',
    reading: 'にんか',
    description:
      'ユーザーが何をできるかを決定するプロセス。権限管理で行われる。',
    relatedTerms: ['authentication'],
    category: 'セキュリティ',
  },
  {
    id: 'session',
    term: 'セッション',
    description:
      'サーバー側でユーザーの状態を保持する仕組み。ログイン状態の維持などに使用される。',
    relatedTerms: ['cookie', 'authentication'],
    category: 'セキュリティ',
  },
  {
    id: 'cookie',
    term: 'Cookie',
    reading: 'クッキー',
    description:
      'ブラウザに保存される小さなデータ。セッション管理やユーザー設定の保存に使用される。',
    relatedTerms: ['session'],
    category: 'セキュリティ',
  },
  {
    id: 'jwt',
    term: 'JWT',
    reading: 'ジェイダブリューティー',
    description:
      'JSON Web Tokenの略。認証情報を含むトークン。サーバーレスな認証に適している。',
    relatedTerms: ['authentication', 'token'],
    category: 'セキュリティ',
  },
  {
    id: 'token',
    term: 'トークン',
    description:
      '認証や認可に使用される文字列。アクセストークン、リフレッシュトークンなどがある。',
    relatedTerms: ['jwt', 'oauth'],
    category: 'セキュリティ',
  },
  {
    id: 'oauth',
    term: 'OAuth',
    reading: 'オーオース',
    description:
      '認可のための標準プロトコル。他のサービスの権限を安全に委譲できる。',
    relatedTerms: ['authentication', 'token'],
    category: 'セキュリティ',
  },
  {
    id: 'ssl-tls',
    term: 'SSL/TLS',
    reading: 'エスエスエル・ティーエルエス',
    description:
      '通信を暗号化するためのプロトコル。HTTPSで使用される。',
    relatedTerms: ['https'],
    category: 'セキュリティ',
  },

  // データベース
  {
    id: 'database',
    term: 'データベース',
    description:
      'データを効率的に保存・管理するためのシステム。RDBMSやNoSQLなどがある。',
    relatedTerms: ['sql', 'nosql', 'orm'],
    category: 'データベース',
  },
  {
    id: 'sql',
    term: 'SQL',
    reading: 'エスキューエル',
    description:
      'Structured Query Languageの略。リレーショナルデータベースを操作するための言語。',
    relatedTerms: ['database', 'rdbms'],
    category: 'データベース',
  },
  {
    id: 'rdbms',
    term: 'RDBMS',
    reading: 'アールディービーエムエス',
    description:
      'Relational Database Management Systemの略。テーブル形式でデータを管理するデータベース。',
    relatedTerms: ['sql', 'database'],
    category: 'データベース',
  },
  {
    id: 'nosql',
    term: 'NoSQL',
    reading: 'ノーエスキューエル',
    description:
      '非リレーショナルデータベースの総称。MongoDB、Redisなどがある。',
    relatedTerms: ['database'],
    category: 'データベース',
  },
  {
    id: 'orm',
    term: 'ORM',
    reading: 'オーアールエム',
    description:
      'Object-Relational Mappingの略。オブジェクトとデータベースのテーブルを対応付ける技術。',
    relatedTerms: ['database', 'sql'],
    category: 'データベース',
  },

  // フロントエンド
  {
    id: 'dom',
    term: 'DOM',
    reading: 'ドム',
    description:
      'Document Object Modelの略。HTMLをプログラムから操作するためのインターフェース。',
    relatedTerms: ['html', 'javascript'],
    category: 'フロントエンド',
  },
  {
    id: 'spa',
    term: 'SPA',
    reading: 'エスピーエー',
    description:
      'Single Page Applicationの略。ページ遷移なしに動的にコンテンツを更新するWebアプリケーション。',
    relatedTerms: ['react', 'javascript'],
    category: 'フロントエンド',
  },
  {
    id: 'react',
    term: 'React',
    reading: 'リアクト',
    description:
      'Meta社が開発したUIライブラリ。コンポーネントベースでUIを構築する。',
    relatedTerms: ['javascript', 'spa', 'nextjs'],
    category: 'フレームワーク',
  },
  {
    id: 'nextjs',
    term: 'Next.js',
    reading: 'ネクストジェイエス',
    description:
      'Reactベースのフレームワーク。SSR、SSG、APIルートなどの機能を提供する。',
    relatedTerms: ['react', 'ssr', 'ssg'],
    category: 'フレームワーク',
  },
  {
    id: 'responsive',
    term: 'レスポンシブデザイン',
    description:
      '画面サイズに応じてレイアウトを変化させるデザイン手法。',
    relatedTerms: ['css'],
    category: 'フロントエンド',
  },

  // レンダリング
  {
    id: 'ssr',
    term: 'SSR',
    reading: 'エスエスアール',
    description:
      'Server-Side Renderingの略。サーバー側でHTMLを生成してクライアントに送信する方式。',
    relatedTerms: ['ssg', 'csr', 'nextjs'],
    category: 'レンダリング',
  },
  {
    id: 'ssg',
    term: 'SSG',
    reading: 'エスエスジー',
    description:
      'Static Site Generationの略。ビルド時にHTMLを事前生成する方式。',
    relatedTerms: ['ssr', 'nextjs'],
    category: 'レンダリング',
  },
  {
    id: 'csr',
    term: 'CSR',
    reading: 'シーエスアール',
    description:
      'Client-Side Renderingの略。クライアント側でJavaScriptを使ってHTMLを生成する方式。',
    relatedTerms: ['ssr', 'spa'],
    category: 'レンダリング',
  },

  // その他
  {
    id: 'domain',
    term: 'ドメイン',
    description:
      'インターネット上の住所にあたる名前。example.comのような形式。',
    relatedTerms: ['url', 'dns'],
    category: 'Web基礎',
  },
  {
    id: 'dns',
    term: 'DNS',
    reading: 'ディーエヌエス',
    description:
      'Domain Name Systemの略。ドメイン名をIPアドレスに変換するシステム。',
    relatedTerms: ['domain'],
    category: 'Web基礎',
  },
  {
    id: 'package-json',
    term: 'package.json',
    reading: 'パッケージジェイソン',
    description:
      'Node.jsプロジェクトの設定ファイル。依存関係やスクリプトを定義する。',
    relatedTerms: ['npm', 'nodejs'],
    category: 'ツール',
  },
];

// カテゴリ一覧を取得
export function getAllCategories(): string[] {
  const categories = new Set(glossaryTerms.map((term) => term.category));
  return Array.from(categories).sort();
}

// IDで用語を取得
export function getTermById(id: string): GlossaryTerm | undefined {
  return glossaryTerms.find((term) => term.id === id);
}

// カテゴリで用語をフィルタリング
export function getTermsByCategory(category: string): GlossaryTerm[] {
  return glossaryTerms.filter((term) => term.category === category);
}

// 検索
export function searchTerms(query: string): GlossaryTerm[] {
  const lowerQuery = query.toLowerCase();
  return glossaryTerms.filter(
    (term) =>
      term.term.toLowerCase().includes(lowerQuery) ||
      term.description.toLowerCase().includes(lowerQuery) ||
      term.reading?.toLowerCase().includes(lowerQuery)
  );
}

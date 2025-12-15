# 6-4. フォームを作る

## 目標

フォームのバリデーションを自前とライブラリで比較する。

---

## 1. 素のuseState

```jsx
function RegisterForm() {
  const [values, setValues] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    // 入力時にエラーをクリア
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!values.email) {
      newErrors.email = 'メールは必須です';
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      newErrors.email = 'メール形式が正しくありません';
    }

    if (!values.password) {
      newErrors.password = 'パスワードは必須です';
    } else if (values.password.length < 8) {
      newErrors.password = 'パスワードは8文字以上必要です';
    }

    if (values.password !== values.confirmPassword) {
      newErrors.confirmPassword = 'パスワードが一致しません';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await api.post('/api/register', values);
      alert('登録完了！');
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          name="email"
          type="email"
          value={values.email}
          onChange={handleChange}
          placeholder="メールアドレス"
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>

      <div>
        <input
          name="password"
          type="password"
          value={values.password}
          onChange={handleChange}
          placeholder="パスワード"
        />
        {errors.password && <span className="error">{errors.password}</span>}
      </div>

      <div>
        <input
          name="confirmPassword"
          type="password"
          value={values.confirmPassword}
          onChange={handleChange}
          placeholder="パスワード（確認）"
        />
        {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
      </div>

      {errors.submit && <div className="error">{errors.submit}</div>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '送信中...' : '登録'}
      </button>
    </form>
  );
}
```

**問題点**: フィールドが増えると管理が大変。バリデーションロジックが散らばる。

---

## 2. React Hook Form + Zod

```jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// スキーマでバリデーションルールを定義
const schema = z.object({
  email: z
    .string()
    .min(1, 'メールは必須です')
    .email('メール形式が正しくありません'),
  password: z
    .string()
    .min(1, 'パスワードは必須です')
    .min(8, 'パスワードは8文字以上必要です'),
  confirmPassword: z
    .string()
    .min(1, 'パスワード（確認）は必須です'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'パスワードが一致しません',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await api.post('/api/register', data);
      alert('登録完了！');
    } catch (error) {
      setError('root', { message: error.message });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <input
          {...register('email')}
          type="email"
          placeholder="メールアドレス"
        />
        {errors.email && <span className="error">{errors.email.message}</span>}
      </div>

      <div>
        <input
          {...register('password')}
          type="password"
          placeholder="パスワード"
        />
        {errors.password && <span className="error">{errors.password.message}</span>}
      </div>

      <div>
        <input
          {...register('confirmPassword')}
          type="password"
          placeholder="パスワード（確認）"
        />
        {errors.confirmPassword && <span className="error">{errors.confirmPassword.message}</span>}
      </div>

      {errors.root && <div className="error">{errors.root.message}</div>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '送信中...' : '登録'}
      </button>
    </form>
  );
}
```

---

## Zodスキーマの例

```typescript
import { z } from 'zod';

// 基本
const userSchema = z.object({
  name: z.string().min(1, '名前は必須'),
  age: z.number().min(0).max(150),
  email: z.string().email(),
});

// オプショナル
const profileSchema = z.object({
  bio: z.string().optional(),
  website: z.string().url().optional(),
});

// 配列
const tagsSchema = z.array(z.string()).min(1, '1つ以上のタグが必要');

// Union
const statusSchema = z.enum(['draft', 'published', 'archived']);

// 条件付きバリデーション
const paymentSchema = z.object({
  method: z.enum(['card', 'bank']),
  cardNumber: z.string().optional(),
  bankAccount: z.string().optional(),
}).refine((data) => {
  if (data.method === 'card') return !!data.cardNumber;
  if (data.method === 'bank') return !!data.bankAccount;
  return true;
}, {
  message: '支払い情報を入力してください',
});

// 型の推論
type User = z.infer<typeof userSchema>;
// { name: string; age: number; email: string; }
```

---

## React Hook Form の便利機能

### フィールド配列

```jsx
import { useFieldArray } from 'react-hook-form';

function DynamicForm() {
  const { control, register } = useForm({
    defaultValues: {
      items: [{ name: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  return (
    <form>
      {fields.map((field, index) => (
        <div key={field.id}>
          <input {...register(`items.${index}.name`)} />
          <button type="button" onClick={() => remove(index)}>削除</button>
        </div>
      ))}
      <button type="button" onClick={() => append({ name: '' })}>
        追加
      </button>
    </form>
  );
}
```

### ウォッチ

```jsx
const { watch } = useForm();

// 特定のフィールドを監視
const email = watch('email');

// 全フィールドを監視
const allValues = watch();

// 条件付き表示
const method = watch('paymentMethod');
return (
  <>
    {method === 'card' && <CardFields />}
    {method === 'bank' && <BankFields />}
  </>
);
```

---

## 比較

| 観点 | useState | React Hook Form + Zod |
|------|----------|----------------------|
| コード量 | 多い | 少ない |
| 再レンダリング | 多い | 最小限 |
| バリデーション | 手動 | 宣言的 |
| 型安全 | 手動 | 自動 |
| エラー管理 | 手動 | 自動 |
| フィールド配列 | 大変 | 簡単 |

---

## 選び方

```
「2-3フィールドの単純なフォーム」
  → useState で十分

「複雑なフォーム」「バリデーションが多い」
  → React Hook Form + Zod

「サーバーサイドでも同じバリデーション」
  → Zod（フロント/バック共通で使える）
```

---

## よくある誤解

### 「React Hook Formは複雑」？

実際は**素のuseStateより簡単**です。

```jsx
// useState版: 10行以上のボイラープレート
const [values, setValues] = useState({});
const [errors, setErrors] = useState({});
const [touched, setTouched] = useState({});
const handleChange = (e) => { ... };
const handleBlur = (e) => { ... };
const validate = () => { ... };

// RHF版: 3行
const { register, handleSubmit, formState: { errors } } = useForm();
```

### 「バリデーションはフロントだけでいい」？

**絶対にサーバーでもバリデーションが必要**です。

```javascript
// フロントのバリデーションは簡単に回避できる
// DevToolsで直接APIを叩けばスキップされる

// サーバー側でも必ずチェック
app.post('/api/users', (req, res) => {
  const result = userSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.errors });
  }
  // ...
});
```

### 「Zodはフロントエンド専用」？

Zodは**サーバーでも使える**ので、スキーマを共通化できます。

```typescript
// shared/schemas.ts（フロント/バック共通）
export const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
```

---

## まとめ

- **useState**: シンプルだがフィールド増加で破綻
- **React Hook Form**: 再レンダリング最小、状態管理自動化
- **Zod**: 宣言的バリデーション、型推論
- **RHF + Zod**: 最強の組み合わせ（推奨）
- **フロント・サーバー両方でバリデーション**

---

## セットアップ

```bash
# React Hook Form + Zod
npm install react-hook-form zod @hookform/resolvers
```

---

## 演習

1. useStateで登録フォームを作る
2. React Hook Form + Zodに書き換える
3. フィールド追加時のコード量を比較する
4. サーバーサイドでも同じZodスキーマでバリデーション

---

## サンプルコード

この章の内容を実際に動かして試せるサンプルコードを用意しています。

- [フォーム比較サンプル](/samples/practice/03-form-comparison) - 素のuseState / React Hook Form / RHF+Zod の比較


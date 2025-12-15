/**
 * 03-with-zod.jsx
 *
 * React Hook Form + Zod でフォームを実装
 * → スキーマでバリデーションを定義、TypeScriptと相性抜群
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// ========================================
// Zodスキーマを定義
// ========================================

const registerSchema = z.object({
  name: z
    .string()
    .min(1, '名前を入力してください')
    .min(2, '名前は2文字以上で入力してください')
    .max(50, '名前は50文字以下で入力してください'),

  email: z
    .string()
    .min(1, 'メールアドレスを入力してください')
    .email('正しいメールアドレスを入力してください'),

  password: z
    .string()
    .min(1, 'パスワードを入力してください')
    .min(8, 'パスワードは8文字以上で入力してください')
    .regex(/[A-Z]/, '大文字を含めてください')
    .regex(/[a-z]/, '小文字を含めてください')
    .regex(/[0-9]/, '数字を含めてください'),

  confirmPassword: z
    .string()
    .min(1, 'パスワード（確認）を入力してください'),

  age: z
    .number({ invalid_type_error: '年齢を入力してください' })
    .min(18, '18歳以上である必要があります')
    .max(120, '120歳以下で入力してください'),

  newsletter: z.boolean(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'パスワードが一致しません',
  path: ['confirmPassword'],
});

// 型を自動生成（TypeScript）
// type RegisterFormData = z.infer<typeof registerSchema>;

// ========================================
// フォームコンポーネント
// ========================================

function RegisterForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      age: 20,
      newsletter: false,
    },
  });

  const onSubmit = async (data) => {
    console.log('送信データ:', data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('登録完了！');
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form">
      <h2>登録フォーム（React Hook Form + Zod）</h2>

      <div className="field">
        <label>名前</label>
        <input {...register('name')} />
        {errors.name && <p className="error">{errors.name.message}</p>}
      </div>

      <div className="field">
        <label>メールアドレス</label>
        <input type="email" {...register('email')} />
        {errors.email && <p className="error">{errors.email.message}</p>}
      </div>

      <div className="field">
        <label>パスワード</label>
        <input type="password" {...register('password')} />
        {errors.password && <p className="error">{errors.password.message}</p>}
      </div>

      <div className="field">
        <label>パスワード（確認）</label>
        <input type="password" {...register('confirmPassword')} />
        {errors.confirmPassword && (
          <p className="error">{errors.confirmPassword.message}</p>
        )}
      </div>

      <div className="field">
        <label>年齢</label>
        <input
          type="number"
          {...register('age', { valueAsNumber: true })}
        />
        {errors.age && <p className="error">{errors.age.message}</p>}
      </div>

      <div className="field">
        <label>
          <input type="checkbox" {...register('newsletter')} />
          ニュースレターを受け取る
        </label>
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '送信中...' : '登録'}
      </button>
    </form>
  );
}

// ========================================
// より複雑なスキーマ例
// ========================================

// ログインスキーマ
const loginSchema = z.object({
  email: z.string().email('正しいメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください'),
  rememberMe: z.boolean().optional(),
});

// プロフィール更新スキーマ
const profileSchema = z.object({
  displayName: z.string().min(1).max(50),
  bio: z.string().max(500).optional(),
  website: z.string().url().optional().or(z.literal('')),
  birthDate: z.coerce.date().optional(),
});

// 住所スキーマ（ネストしたオブジェクト）
const addressSchema = z.object({
  postalCode: z.string().regex(/^\d{3}-?\d{4}$/, '正しい郵便番号を入力'),
  prefecture: z.string().min(1, '都道府県を選択してください'),
  city: z.string().min(1, '市区町村を入力してください'),
  street: z.string().min(1, '番地を入力してください'),
  building: z.string().optional(),
});

// 配列を含むスキーマ
const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
  })).min(1, '商品を1つ以上選択してください'),
  shippingAddress: addressSchema,
  paymentMethod: z.enum(['credit', 'bank', 'cod']),
});

// ========================================
// 条件付きバリデーション
// ========================================

const conditionalSchema = z.object({
  userType: z.enum(['individual', 'company']),
  name: z.string().min(1),

  // 法人の場合のみ必須
  companyName: z.string().optional(),
  registrationNumber: z.string().optional(),
}).refine((data) => {
  if (data.userType === 'company') {
    return !!data.companyName && !!data.registrationNumber;
  }
  return true;
}, {
  message: '法人の場合は会社名と登録番号が必要です',
  path: ['companyName'],
});

// ========================================
// Zodの利点
// ========================================

/*
 * ✅ Zodの利点:
 *    - スキーマとして定義（宣言的）
 *    - TypeScript の型を自動生成
 *    - バリデーションロジックの再利用
 *    - フロントとバックで同じスキーマを使える
 *    - 複雑なバリデーションも表現しやすい
 *
 * 📦 使い分け:
 *    - シンプルなフォーム → React Hook Form だけ
 *    - 複雑なフォーム → React Hook Form + Zod
 *    - TypeScript プロジェクト → 必ず Zod を使う
 */

export { RegisterForm, loginSchema, profileSchema, addressSchema, orderSchema };

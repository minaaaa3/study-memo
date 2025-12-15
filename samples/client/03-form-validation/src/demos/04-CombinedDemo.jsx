/**
 * React Hook Form + Zod
 * 最強の組み合わせ: RHFのフォーム管理 + Zodの宣言的バリデーション
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";

// Zodスキーマ
const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, "メールは必須です")
      .email("メール形式が正しくありません"),
    password: z
      .string()
      .min(1, "パスワードは必須です")
      .min(8, "パスワードは8文字以上必要です"),
    confirmPassword: z.string().min(1, "確認用パスワードは必須です"),
    age: z.coerce
      .number({ invalid_type_error: "数値を入力してください" })
      .min(0, "0以上を入力してください")
      .max(150, "150以下を入力してください")
      .optional()
      .or(z.literal("")),
    terms: z.literal(true, {
      errorMap: () => ({ message: "利用規約に同意してください" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "パスワードが一致しません",
    path: ["confirmPassword"],
  });

// スキーマから型を自動生成！
// type FormData = z.infer<typeof registerSchema>;

export default function CombinedDemo() {
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      age: "",
      terms: false,
    },
  });

  const onSubmit = async (data) => {
    setIsSuccess(false);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("送信データ:", data);
    setIsSuccess(true);
    reset();
  };

  return (
    <div>
      <h2 className="demo-title">React Hook Form + Zod（推奨）</h2>

      {isSuccess && (
        <div className="success-message">登録が完了しました！</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label htmlFor="email">メールアドレス</label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className={errors.email ? "error" : ""}
            placeholder="example@email.com"
          />
          {errors.email && (
            <div className="error-message">{errors.email.message}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password">パスワード</label>
          <input
            id="password"
            type="password"
            {...register("password")}
            className={errors.password ? "error" : ""}
            placeholder="8文字以上"
          />
          {errors.password && (
            <div className="error-message">{errors.password.message}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">パスワード（確認）</label>
          <input
            id="confirmPassword"
            type="password"
            {...register("confirmPassword")}
            className={errors.confirmPassword ? "error" : ""}
            placeholder="もう一度入力"
          />
          {errors.confirmPassword && (
            <div className="error-message">{errors.confirmPassword.message}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="age">年齢（任意）</label>
          <input
            id="age"
            type="number"
            {...register("age")}
            className={errors.age ? "error" : ""}
            placeholder="20"
          />
          {errors.age && (
            <div className="error-message">{errors.age.message}</div>
          )}
        </div>

        <div className="form-group">
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" {...register("terms")} />
            利用規約に同意する
          </label>
          {errors.terms && (
            <div className="error-message">{errors.terms.message}</div>
          )}
        </div>

        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          {isSubmitting ? "送信中..." : "登録"}
        </button>
      </form>

      <div className="code-hint">
        {`// Zodスキーマ
const schema = z.object({
  email: z.string().min(1, 'メールは必須です').email('メール形式が正しくありません'),
  password: z.string().min(8, '8文字以上必要です'),
}).refine(
  (data) => data.password === data.confirmPassword,
  { message: 'パスワードが一致しません', path: ['confirmPassword'] }
);

// スキーマから型を自動生成
type FormData = z.infer<typeof schema>;

// zodResolverでRHFと連携
const { register, handleSubmit } = useForm<FormData>({
  resolver: zodResolver(schema),
});

// registerにバリデーションルールを書かなくていい！
<input {...register('email')} />

// メリット:
// - バリデーションルールが一箇所にまとまる
// - TypeScriptの型が自動生成される
// - サーバーサイドでも同じスキーマを使える`}
      </div>
    </div>
  );
}

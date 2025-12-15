/**
 * Zod - スキーマバリデーション
 * バリデーションルールを宣言的に定義
 */

import { useState } from "react";
import { z } from "zod";

// スキーマを定義（バリデーションルールが一箇所にまとまる！）
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
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "パスワードが一致しません",
    path: ["confirmPassword"],
  });

export default function ZodDemo() {
  const [values, setValues] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    // エラーをクリア
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSuccess(false);

    // Zodでバリデーション
    const result = registerSchema.safeParse(values);

    if (!result.success) {
      // エラーをフィールドごとに整理
      const fieldErrors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0];
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    // 送信処理
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("送信データ:", result.data); // 型安全なデータ
    setIsSubmitting(false);
    setIsSuccess(true);
    setValues({ email: "", password: "", confirmPassword: "" });
    setErrors({});
  };

  return (
    <div>
      <h2 className="demo-title">Zod - スキーマバリデーション</h2>

      {isSuccess && (
        <div className="success-message">登録が完了しました！</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">メールアドレス</label>
          <input
            id="email"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            className={errors.email ? "error" : ""}
            placeholder="example@email.com"
          />
          {errors.email && <div className="error-message">{errors.email}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="password">パスワード</label>
          <input
            id="password"
            name="password"
            type="password"
            value={values.password}
            onChange={handleChange}
            className={errors.password ? "error" : ""}
            placeholder="8文字以上"
          />
          {errors.password && (
            <div className="error-message">{errors.password}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">パスワード（確認）</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={values.confirmPassword}
            onChange={handleChange}
            className={errors.confirmPassword ? "error" : ""}
            placeholder="もう一度入力"
          />
          {errors.confirmPassword && (
            <div className="error-message">{errors.confirmPassword}</div>
          )}
        </div>

        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          {isSubmitting ? "送信中..." : "登録"}
        </button>
      </form>

      <div className="code-hint">
        {`// Zodでスキーマを定義（宣言的！）
const registerSchema = z.object({
  email: z.string()
    .min(1, 'メールは必須です')
    .email('メール形式が正しくありません'),
  password: z.string()
    .min(1, 'パスワードは必須です')
    .min(8, 'パスワードは8文字以上必要です'),
  confirmPassword: z.string().min(1, '確認用パスワードは必須です'),
}).refine(
  (data) => data.password === data.confirmPassword,
  { message: 'パスワードが一致しません', path: ['confirmPassword'] }
);

// バリデーション実行
const result = registerSchema.safeParse(values);
if (result.success) {
  console.log(result.data); // 型安全なデータ
} else {
  console.log(result.error.errors); // エラー情報
}

// 型の自動推論
type FormData = z.infer<typeof registerSchema>;`}
      </div>
    </div>
  );
}

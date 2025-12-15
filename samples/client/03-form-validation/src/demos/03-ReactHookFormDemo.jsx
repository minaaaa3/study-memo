/**
 * React Hook Form - フォーム状態管理
 * 再レンダリングを最小限に抑える設計
 */

import { useForm } from "react-hook-form";
import { useState } from "react";

export default function ReactHookFormDemo() {
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // パスワードを監視（confirmPasswordのバリデーションで使う）
  const password = watch("password");

  const onSubmit = async (data) => {
    setIsSuccess(false);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("送信データ:", data);
    setIsSuccess(true);
    reset();
  };

  return (
    <div>
      <h2 className="demo-title">React Hook Form - フォーム状態管理</h2>

      {isSuccess && (
        <div className="success-message">登録が完了しました！</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label htmlFor="email">メールアドレス</label>
          <input
            id="email"
            type="email"
            {...register("email", {
              required: "メールは必須です",
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: "メール形式が正しくありません",
              },
            })}
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
            {...register("password", {
              required: "パスワードは必須です",
              minLength: {
                value: 8,
                message: "パスワードは8文字以上必要です",
              },
            })}
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
            {...register("confirmPassword", {
              required: "確認用パスワードは必須です",
              validate: (value) =>
                value === password || "パスワードが一致しません",
            })}
            className={errors.confirmPassword ? "error" : ""}
            placeholder="もう一度入力"
          />
          {errors.confirmPassword && (
            <div className="error-message">{errors.confirmPassword.message}</div>
          )}
        </div>

        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          {isSubmitting ? "送信中..." : "登録"}
        </button>
      </form>

      <div className="code-hint">
        {`// React Hook Formの基本
const { register, handleSubmit, formState: { errors } } = useForm();

// registerでinputを登録
<input {...register('email', {
  required: 'メールは必須です',
  pattern: {
    value: /\\S+@\\S+\\.\\S+/,
    message: 'メール形式が正しくありません',
  },
})} />

// register('email') は以下を返す
{
  name: 'email',
  onChange: [Function],
  onBlur: [Function],
  ref: [Function],
}

// メリット:
// - useStateが不要（内部で管理）
// - 再レンダリングが最小限
// - formState.isSubmitting などの状態が自動管理`}
      </div>
    </div>
  );
}

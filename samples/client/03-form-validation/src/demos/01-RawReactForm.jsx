/**
 * 素のReactでフォームバリデーション
 * 全部自分で管理する必要がある
 */

import { useState } from "react";

export default function RawReactForm() {
  const [values, setValues] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // バリデーションルール
  const validate = (name, value) => {
    switch (name) {
      case "email":
        if (!value) return "メールは必須です";
        if (!/\S+@\S+\.\S+/.test(value)) return "メール形式が正しくありません";
        return "";
      case "password":
        if (!value) return "パスワードは必須です";
        if (value.length < 8) return "パスワードは8文字以上必要です";
        return "";
      case "confirmPassword":
        if (!value) return "確認用パスワードは必須です";
        if (value !== values.password) return "パスワードが一致しません";
        return "";
      default:
        return "";
    }
  };

  // 入力時
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));

    // 既にエラーがあればリアルタイムでチェック
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
    }
  };

  // フォーカスが外れたとき
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
  };

  // 送信時
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSuccess(false);

    // 全フィールドをチェック
    const newErrors = {};
    Object.keys(values).forEach((name) => {
      const error = validate(name, values[name]);
      if (error) newErrors[name] = error;
    });

    setErrors(newErrors);
    setTouched({ email: true, password: true, confirmPassword: true });

    if (Object.keys(newErrors).length > 0) return;

    // 送信処理
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // 擬似API
    console.log("送信データ:", values);
    setIsSubmitting(false);
    setIsSuccess(true);
    setValues({ email: "", password: "", confirmPassword: "" });
    setTouched({});
  };

  return (
    <div>
      <h2 className="demo-title">素のReact - 全部手動で管理</h2>

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
            onBlur={handleBlur}
            className={touched.email && errors.email ? "error" : ""}
            placeholder="example@email.com"
          />
          {touched.email && errors.email && (
            <div className="error-message">{errors.email}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password">パスワード</label>
          <input
            id="password"
            name="password"
            type="password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            className={touched.password && errors.password ? "error" : ""}
            placeholder="8文字以上"
          />
          {touched.password && errors.password && (
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
            onBlur={handleBlur}
            className={
              touched.confirmPassword && errors.confirmPassword ? "error" : ""
            }
            placeholder="もう一度入力"
          />
          {touched.confirmPassword && errors.confirmPassword && (
            <div className="error-message">{errors.confirmPassword}</div>
          )}
        </div>

        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          {isSubmitting ? "送信中..." : "登録"}
        </button>
      </form>

      <div className="code-hint">
        {`// 素のReactでの問題点
// - useStateが多い（values, errors, touched, isSubmitting...）
// - バリデーションロジックが分散
// - フィールドが増えると管理が大変
// - 似たようなコードの繰り返し

const [values, setValues] = useState({ email: '', password: '' });
const [errors, setErrors] = useState({});
const [touched, setTouched] = useState({});

const validate = (name, value) => {
  switch (name) {
    case 'email':
      if (!value) return 'メールは必須です';
      if (!/\\S+@\\S+\\.\\S+/.test(value)) return 'メール形式が正しくありません';
      return '';
    // ... 他のフィールド
  }
};`}
      </div>
    </div>
  );
}

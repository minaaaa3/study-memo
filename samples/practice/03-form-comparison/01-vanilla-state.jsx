/**
 * 01-vanilla-state.jsx
 *
 * useStateのみでフォームを実装（自前実装）
 * → 大変さを体験する
 */

import { useState } from 'react';

// ========================================
// シンプルなフォーム（問題を理解）
// ========================================

function SimpleForm() {
  // フィールドごとにuseState（冗長）
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // エラーもフィールドごとに管理
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // バリデーション関数（自分で書く）
  const validate = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = '名前を入力してください';
    } else if (name.length < 2) {
      newErrors.name = '名前は2文字以上で入力してください';
    }

    if (!email.trim()) {
      newErrors.email = 'メールアドレスを入力してください';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = '正しいメールアドレスを入力してください';
    }

    if (!password) {
      newErrors.password = 'パスワードを入力してください';
    } else if (password.length < 8) {
      newErrors.password = 'パスワードは8文字以上で入力してください';
    }

    if (password !== confirmPassword) {
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
      // API呼び出し（仮）
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('登録完了！');
      // フォームをリセット
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      alert('エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>登録フォーム（useState）</h2>

      <div>
        <label>名前</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {errors.name && <p className="error">{errors.name}</p>}
      </div>

      <div>
        <label>メールアドレス</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {errors.email && <p className="error">{errors.email}</p>}
      </div>

      <div>
        <label>パスワード</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {errors.password && <p className="error">{errors.password}</p>}
      </div>

      <div>
        <label>パスワード（確認）</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '送信中...' : '登録'}
      </button>
    </form>
  );
}

// ========================================
// 少し改善（オブジェクトで状態管理）
// ========================================

function ImprovedForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 汎用的な変更ハンドラ
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // 入力時にエラーをクリア
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // フォーカスが外れたとき
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, formData[name]);
  };

  // 個別フィールドのバリデーション
  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'name':
        if (!value.trim()) error = '名前を入力してください';
        else if (value.length < 2) error = '名前は2文字以上';
        break;
      case 'email':
        if (!value.trim()) error = 'メールアドレスを入力してください';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = '正しいメールアドレスを入力';
        break;
      case 'password':
        if (!value) error = 'パスワードを入力してください';
        else if (value.length < 8) error = 'パスワードは8文字以上';
        break;
      case 'confirmPassword':
        if (value !== formData.password) error = 'パスワードが一致しません';
        break;
    }

    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateAll = () => {
    let isValid = true;
    Object.keys(formData).forEach(key => {
      if (!validateField(key, formData[key])) {
        isValid = false;
      }
    });
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('登録完了！');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>登録フォーム（改善版）</h2>

      {['name', 'email', 'password', 'confirmPassword'].map(field => (
        <div key={field}>
          <label>{field}</label>
          <input
            type={field.includes('password') ? 'password' : field === 'email' ? 'email' : 'text'}
            name={field}
            value={formData[field]}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {touched[field] && errors[field] && (
            <p className="error">{errors[field]}</p>
          )}
        </div>
      ))}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '送信中...' : '登録'}
      </button>
    </form>
  );
}

// ========================================
// 問題点まとめ
// ========================================

/*
 * ❌ 自前実装の問題点:
 *    - コードが冗長（フィールド追加のたびにコードが増える）
 *    - バリデーションロジックが散らばる
 *    - 再レンダリングが多い（入力のたびに全体が再レンダリング）
 *    - エラーハンドリングが複雑
 *    - フォーカス制御、タッチ状態の管理が大変
 *
 * → だから React Hook Form を使う！
 */

export { SimpleForm, ImprovedForm };

/**
 * 02-react-hook-form.jsx
 *
 * React Hook Form でフォームを実装
 * → コードがシンプルに、パフォーマンスも向上
 */

import { useForm } from 'react-hook-form';

// ========================================
// 基本的な使い方
// ========================================

function BasicForm() {
  const {
    register,     // input を登録
    handleSubmit, // フォーム送信
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    console.log('送信データ:', data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('登録完了！');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2>登録フォーム（React Hook Form）</h2>

      <div>
        <label>名前</label>
        <input
          {...register('name', {
            required: '名前を入力してください',
            minLength: { value: 2, message: '名前は2文字以上' },
          })}
        />
        {errors.name && <p className="error">{errors.name.message}</p>}
      </div>

      <div>
        <label>メールアドレス</label>
        <input
          type="email"
          {...register('email', {
            required: 'メールアドレスを入力してください',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: '正しいメールアドレスを入力してください',
            },
          })}
        />
        {errors.email && <p className="error">{errors.email.message}</p>}
      </div>

      <div>
        <label>パスワード</label>
        <input
          type="password"
          {...register('password', {
            required: 'パスワードを入力してください',
            minLength: { value: 8, message: 'パスワードは8文字以上' },
          })}
        />
        {errors.password && <p className="error">{errors.password.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '送信中...' : '登録'}
      </button>
    </form>
  );
}

// ========================================
// より詳細な使い方
// ========================================

function AdvancedForm() {
  const {
    register,
    handleSubmit,
    watch,        // 値を監視
    reset,        // フォームをリセット
    setValue,     // 値を設定
    getValues,    // 値を取得
    formState: {
      errors,
      isSubmitting,
      isDirty,      // 変更されたか
      isValid,      // 全てのバリデーションが通ったか
      touchedFields // フォーカスが当たったフィールド
    },
  } = useForm({
    mode: 'onBlur',  // バリデーションのタイミング
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      age: 20,
      newsletter: false,
    },
  });

  // パスワードを監視（確認用）
  const password = watch('password');

  const onSubmit = async (data) => {
    console.log('送信データ:', data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('登録完了！');
    reset(); // フォームをリセット
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2>登録フォーム（詳細版）</h2>

      <div>
        <label>名前</label>
        <input
          {...register('name', {
            required: '名前を入力してください',
            minLength: { value: 2, message: '名前は2文字以上' },
            maxLength: { value: 50, message: '名前は50文字以下' },
          })}
        />
        {errors.name && <p className="error">{errors.name.message}</p>}
      </div>

      <div>
        <label>メールアドレス</label>
        <input
          type="email"
          {...register('email', {
            required: 'メールアドレスを入力してください',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: '正しいメールアドレスを入力してください',
            },
          })}
        />
        {errors.email && <p className="error">{errors.email.message}</p>}
      </div>

      <div>
        <label>パスワード</label>
        <input
          type="password"
          {...register('password', {
            required: 'パスワードを入力してください',
            minLength: { value: 8, message: 'パスワードは8文字以上' },
            pattern: {
              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
              message: '大文字、小文字、数字を含めてください',
            },
          })}
        />
        {errors.password && <p className="error">{errors.password.message}</p>}
      </div>

      <div>
        <label>パスワード（確認）</label>
        <input
          type="password"
          {...register('confirmPassword', {
            required: 'パスワード（確認）を入力してください',
            validate: (value) =>
              value === password || 'パスワードが一致しません',
          })}
        />
        {errors.confirmPassword && (
          <p className="error">{errors.confirmPassword.message}</p>
        )}
      </div>

      <div>
        <label>年齢</label>
        <input
          type="number"
          {...register('age', {
            required: '年齢を入力してください',
            min: { value: 18, message: '18歳以上である必要があります' },
            max: { value: 120, message: '120歳以下で入力してください' },
            valueAsNumber: true, // 数値として取得
          })}
        />
        {errors.age && <p className="error">{errors.age.message}</p>}
      </div>

      <div>
        <label>
          <input type="checkbox" {...register('newsletter')} />
          ニュースレターを受け取る
        </label>
      </div>

      <div>
        <button type="submit" disabled={isSubmitting || !isValid}>
          {isSubmitting ? '送信中...' : '登録'}
        </button>
        <button type="button" onClick={() => reset()}>
          リセット
        </button>
      </div>

      <div>
        <p>変更あり: {isDirty ? 'Yes' : 'No'}</p>
        <p>有効: {isValid ? 'Yes' : 'No'}</p>
      </div>
    </form>
  );
}

// ========================================
// カスタムバリデーション
// ========================================

function CustomValidationForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  // 非同期バリデーション（APIでユーザー名の重複チェックなど）
  const checkUsernameAvailable = async (username) => {
    // 実際はAPIを叩く
    await new Promise(resolve => setTimeout(resolve, 500));
    const taken = ['admin', 'user', 'test'];
    return !taken.includes(username.toLowerCase()) || 'このユーザー名は使用できません';
  };

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2>カスタムバリデーション</h2>

      <div>
        <label>ユーザー名</label>
        <input
          {...register('username', {
            required: 'ユーザー名を入力してください',
            validate: checkUsernameAvailable,
          })}
        />
        {errors.username && <p className="error">{errors.username.message}</p>}
      </div>

      <button type="submit">登録</button>
    </form>
  );
}

export { BasicForm, AdvancedForm, CustomValidationForm };

'use client';

/**
 * Counter（Client Component）
 *
 * 'use client' を先頭に書くとClient Componentになる。
 * useState, useEffectなどのフックが使える。
 */

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => setCount(c => c - 1)}
        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
      >
        -
      </button>

      <span className="text-xl font-bold w-12 text-center">{count}</span>

      <button
        onClick={() => setCount(c => c + 1)}
        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
      >
        +
      </button>
    </div>
  );
}

/*
 * Client Component の使い方:
 *
 * 1. 'use client' を必ず先頭に
 *
 * 2. Client Component が必要なケース:
 *    - useState, useEffect などのフック
 *    - onClick などのイベントハンドラ
 *    - ブラウザAPI（localStorage, window等）
 *    - クラスコンポーネント
 *
 * 3. Server Component から Client Component を import 可能
 *    逆は不可（Client → Server の import はNG）
 *
 * 4. props で Server → Client にデータ渡し可能
 *    ただしシリアライズ可能なデータのみ
 *    （関数やクラスインスタンスは不可）
 */

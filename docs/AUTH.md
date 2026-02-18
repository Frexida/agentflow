# AgentFlow 認証システム

## 概要

AgentFlow は Supabase Auth を使用した認証システムを採用。

## 技術スタック

- **認証プロバイダ**: Supabase Auth
- **パッケージ**: `@supabase/ssr`, `@supabase/supabase-js`
- **フレームワーク**: Next.js 14 (App Router)

## 認証方法

### 対応済み

- Email/Password（サインアップ + ログイン）
- GitHub OAuth

### 将来対応予定

- Google OAuth
- Magic Link

## アーキテクチャ

```
┌─────────────────────────────────────────────┐
│  Client (Browser)                           │
│  ├── /login                                 │
│  ├── /signup                                │
│  └── /auth/callback (OAuth redirect)        │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│  Next.js Middleware                         │
│  ├── セッション検証                           │
│  ├── 保護ルート: /dashboard, /editor, /settings │
│  └── 未認証 → /login にリダイレクト            │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│  Supabase Auth                              │
│  ├── ユーザー管理                            │
│  ├── セッション管理                          │
│  └── OAuth プロバイダ連携                     │
└─────────────────────────────────────────────┘
```

## ファイル構成

```
v2/
├── lib/
│   └── supabase/
│       ├── client.ts      # Browser client
│       └── server.ts      # Server client
├── middleware.ts          # 認証ミドルウェア
└── app/
    ├── login/
    │   └── page.tsx       # ログインページ
    ├── signup/
    │   └── page.tsx       # サインアップページ
    └── auth/
        └── callback/
            └── route.ts   # OAuth コールバック
```

## Supabase Client

### Browser Client (`lib/supabase/client.ts`)

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Server Client (`lib/supabase/server.ts`)

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}
```

## 保護ルート

`middleware.ts` で以下のルートを保護：

- `/dashboard`
- `/editor`
- `/editor/*`
- `/settings`

未認証ユーザーは `/login` にリダイレクト。

## 環境変数

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## セキュリティ考慮事項

1. **service_role key** は絶対にクライアントに公開しない
2. RLS (Row Level Security) を有効にする
3. OAuth callback URL を正しく設定する
4. HTTPS を必須にする

---

*Implemented by: nix (2026-02-18)*
*Commit: 34ab5f4*

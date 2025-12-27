export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export default function TestPage() {
  const env = {
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasMicroCMSKey: !!process.env.MICROCMS_API_KEY,
    hasMicroCMSDomain: !!process.env.MICROCMS_SERVICE_DOMAIN,
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: 'black',
      color: 'white',
      padding: '20px',
      fontFamily: 'monospace'
    }}>
      <div style={{ 
        border: '1px solid white', 
        padding: '20px',
        maxWidth: '600px'
      }}>
        <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>環境テスト</h1>
        <pre style={{ fontSize: '12px', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(env, null, 2)}
        </pre>
        <p style={{ marginTop: '20px', fontSize: '14px' }}>
          このページが表示されれば、Edge Runtimeは動作しています。
        </p>
      </div>
    </div>
  )
}


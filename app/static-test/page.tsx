export default function StaticTestPage() {
  return (
    <html>
      <head>
        <title>Static Test</title>
      </head>
      <body style={{ 
        margin: 0,
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: 'black',
        color: 'white',
        fontFamily: 'monospace'
      }}>
        <div style={{ 
          border: '1px solid white', 
          padding: '40px',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>✅ 静的ページテスト</h1>
          <p style={{ fontSize: '16px' }}>
            このページが表示されれば、基本的なデプロイは成功しています。
          </p>
        </div>
      </body>
    </html>
  )
}


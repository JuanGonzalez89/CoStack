async function main() {
  const res = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test2', email: 'test2@test.com', password: 'password123' })
  })
  const text = await res.text()
  console.log(res.status, text)
}
main()

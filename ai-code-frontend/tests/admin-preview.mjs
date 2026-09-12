// 仅用于本地 UI 验证：全部数据在内存中，不连接真实后端。
// node tests/admin-preview.mjs，然后访问 http://127.0.0.1:5176
import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

let users = Array.from({ length: 23 }, (_, index) => ({
  id: index + 1,
  userAccount: index === 0 ? 'admin' : `demo${index + 1}`,
  userName: ['林知远', '陈思雨', '周予安', '许星河', '苏沐'][index % 5],
  userRole: index === 0 || index === 5 ? 'admin' : 'user',
  userAvatar: '',
  userProfile: index % 3 === 0 ? '这是用于界面验证的示例用户资料。' : '',
  createTime: `2026-09-${String(12 - (index % 10)).padStart(2, '0')}T09:30:00`,
}))
let nextId = 24
const server = await createServer({
  configFile: false,
  resolve: { alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) } },
  server: { host: '127.0.0.1', port: 5176, strictPort: true },
  plugins: [
    vue(),
    {
      name: 'admin-preview-fixtures',
      enforce: 'pre',
      transform(source, id) {
        if (id.replaceAll('\\', '/').endsWith('/src/request.ts'))
          return source.replace('http://localhost:8123/api', '/api')
      },
      configureServer(vite) {
        vite.middlewares.use(async (req, res, next) => {
          if (req.url?.startsWith('/__preview/role/')) {
            const role = req.url.split('/').at(-1)
            res.setHeader('Set-Cookie', `previewRole=${role}; Path=/; SameSite=Lax`)
            res.writeHead(302, { Location: '/admin/userManage' })
            res.end()
            return
          }
          if (!req.url?.startsWith('/api/')) return next()
          const role =
            /previewRole=(admin|user|guest)/.exec(req.headers.cookie ?? '')?.[1] ?? 'admin'
          const send = (data, code = 0, message = 'ok') => {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ code, data, message }))
          }
          const endpoint = req.url.replace('/api', '').split('?')[0]
          const chunks = []
          for await (const chunk of req) chunks.push(chunk)
          let body
          try {
            body = JSON.parse(Buffer.concat(chunks).toString() || '{}')
          } catch {
            send(null, 40000, '参数错误')
            return
          }
          if (endpoint === '/user/get/login') {
            send(
              role === 'guest' ? null : { ...users[role === 'admin' ? 0 : 1], userRole: role },
              role === 'guest' ? 40100 : 0,
            )
            return
          }
          if (endpoint === '/user/logout') {
            res.setHeader('Set-Cookie', 'previewRole=guest; Path=/; SameSite=Lax')
            send(true)
            return
          }
          if (endpoint === '/user/login') {
            const loginRole = body.userAccount === 'admin' ? 'admin' : 'user'
            res.setHeader('Set-Cookie', `previewRole=${loginRole}; Path=/; SameSite=Lax`)
            send({ ...users[loginRole === 'admin' ? 0 : 1], userRole: loginRole })
            return
          }
          if (role !== 'admin') {
            send(null, role === 'guest' ? 40100 : 40101, '无访问权限')
            return
          }
          if (endpoint === '/user/list/page/vo') {
            let matches = users.filter(
              (item) =>
                (!body.userAccount || item.userAccount.includes(body.userAccount)) &&
                (!body.userName || item.userName.includes(body.userName)) &&
                (!body.userRole || item.userRole === body.userRole),
            )
            matches = [...matches].sort(
              (a, b) =>
                a.createTime.localeCompare(b.createTime) * (body.sortOrder === 'ascend' ? 1 : -1),
            )
            send({
              records: matches.slice(
                (body.pageNum - 1) * body.pageSize,
                body.pageNum * body.pageSize,
              ),
              totalRow: matches.length,
            })
            return
          }
          if (endpoint === '/user/add') {
            if (users.some((item) => item.userAccount === body.userAccount)) {
              send(null, 40000, '账号已存在')
              return
            }
            const id = nextId++
            users.push({ ...body, id, createTime: new Date().toISOString() })
            send(id)
            return
          }
          if (endpoint === '/user/update') {
            users = users.map((item) => (item.id === body.id ? { ...item, ...body } : item))
            send(true)
            return
          }
          if (endpoint === '/user/delete') {
            users = users.filter((item) => item.id !== body.id)
            send(true)
            return
          }
          send(null, 40400, '接口不存在')
        })
      },
    },
  ],
})
await server.listen()
server.printUrls()

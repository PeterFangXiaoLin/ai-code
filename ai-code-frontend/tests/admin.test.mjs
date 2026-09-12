import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { effectScope } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'

let server, routes, createAccessGuard, getVisibleNavigation, useUserManagement, request
before(async () => {
  server = await createServer({
    configFile: false,
    plugins: [vue()],
    server: { middlewareMode: true, ws: false },
    optimizeDeps: { noDiscovery: true, include: [] },
    resolve: { alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) } },
  })
  ;({ routes } = await server.ssrLoadModule('/src/router/routes.ts'))
  ;({ createAccessGuard } = await server.ssrLoadModule('/src/router/accessGuard.ts'))
  ;({ getVisibleNavigation } = await server.ssrLoadModule('/src/config/menu.ts'))
  ;({ useUserManagement } = await server.ssrLoadModule('/src/composables/useUserManagement.ts'))
  ;({ default: request } = await server.ssrLoadModule('/src/request.ts'))
})
after(async () => {
  await server?.close()
})

const admin = { id: 1, userRole: 'admin' }
const user = { id: 2, userRole: 'user' }
function routerFor(loginUser, fetchLoginUser = async () => {}) {
  const store = { loginUser, fetchLoginUser }
  const router = createRouter({ history: createMemoryHistory(), routes })
  router.beforeEach(createAccessGuard(() => store))
  return { router, store }
}
function createManagement(t) {
  const scope = effectScope()
  t.after(() => scope.stop())
  return scope.run(() => useUserManagement())
}
function reply(config, data) {
  return { config, data, status: 200, statusText: 'OK', headers: {} }
}
const emptyPage = { code: 0, data: { records: [], totalRow: 0 } }

test('菜单按角色隔离，admin 字符串必须来自已登录用户', () => {
  assert.deepEqual(
    getVisibleNavigation(admin).map((item) => item.path),
    ['/admin/userManage'],
  )
  for (const visitor of [{}, user, { userRole: 'admin' }, { id: 3, userRole: 'ADMIN' }]) {
    assert.deepEqual(
      getVisibleNavigation(visitor).map((item) => item.path),
      ['/'],
    )
  }
})

test('游客直接访问管理 URL 跳登录，并保留完整来源', async () => {
  const { router } = routerFor({})
  await router.push('/admin/userManage?page=2#list')
  assert.equal(router.currentRoute.value.path, '/user/login')
  assert.equal(router.currentRoute.value.query.redirect, '/admin/userManage?page=2#list')
})

test('普通用户、未知角色不能直接访问管理页或管理子路径', async () => {
  for (const visitor of [user, { id: 3, userRole: 'ADMIN' }]) {
    for (const path of ['/admin', '/admin/userManage', '/admin/future-page']) {
      const { router } = routerFor(visitor)
      await router.push(path)
      assert.equal(router.currentRoute.value.path, '/forbidden')
      assert.equal(
        router.currentRoute.value.matched.some((record) => record.meta.requiresAdmin),
        false,
      )
    }
  }
})

test('管理员只能进入管理工作区，首页和认证页自动转入用户管理', async () => {
  const { router } = routerFor(admin)
  for (const path of ['/', '/user/login', '/user/register', '/future-page', '/admin/userManage']) {
    await router.push(path)
    assert.equal(router.currentRoute.value.path, '/admin/userManage')
    assert.equal(router.currentRoute.value.meta.requiresAdmin, true)
  }
})

test('刷新管理页会等待登录态加载，不提前拒绝管理员', async () => {
  let release
  const pending = new Promise((resolve) => {
    release = resolve
  })
  const { router, store } = routerFor({}, () => pending)
  const navigation = router.push('/admin/userManage')
  await new Promise((resolve) => setTimeout(resolve, 10))
  assert.equal(router.currentRoute.value.matched.length, 0)
  store.loginUser = admin
  release()
  await navigation
  assert.equal(router.currentRoute.value.path, '/admin/userManage')
})

test('退出登录后重新访问管理地址必须登录', async () => {
  const { router, store } = routerFor(admin)
  await router.push('/admin/userManage')
  store.loginUser = {}
  await router.replace('/')
  await router.push('/admin/userManage')
  assert.equal(router.currentRoute.value.path, '/user/login')
})

test('分页和过滤参数发送到后端，失败时清空旧数据', async (t) => {
  const management = createManagement(t)
  request.defaults.adapter = async (config) => {
    const body = JSON.parse(config.data)
    assert.equal(body.userRole, 'user')
    assert.equal(body.pageSize, 20)
    return reply(config, { code: 0, data: { records: [user], totalRow: 27 } })
  }
  await management.loadUsers({ pageNum: 2, pageSize: 20, userRole: 'user' })
  assert.equal(management.total.value, 27)
  assert.equal(management.records.value.length, 1)
  request.defaults.adapter = async (config) => reply(config, { code: 40101, message: '无权限' })
  await management.loadUsers()
  assert.equal(management.records.value.length, 0)
  assert.equal(management.error.value, '无权限')
  assert.equal(management.loading.value, false)
})

test('快速连续查询只展示最后一次结果', async (t) => {
  const management = createManagement(t)
  let release, started
  const ready = new Promise((resolve) => {
    started = resolve
  })
  request.defaults.adapter = (config) => {
    const body = JSON.parse(config.data)
    if (body.userName === 'old')
      return new Promise((resolve) => {
        release = () =>
          resolve(reply(config, { code: 0, data: { records: [{ id: 1 }], totalRow: 1 } }))
        started()
      })
    return Promise.resolve(reply(config, { code: 0, data: { records: [{ id: 2 }], totalRow: 1 } }))
  }
  const old = management.loadUsers({ userName: 'old' })
  await ready
  await management.loadUsers({ userName: 'new' })
  release()
  await old
  assert.equal(management.records.value[0].id, 2)
  assert.equal(management.error.value, '')
})

const editor = {
  userAccount: 'demo',
  userName: ' 示例 ',
  userAvatar: '',
  userProfile: '',
  userRole: 'user',
}
test('新增使用添加接口，编辑不发送账号，成功后刷新列表', async (t) => {
  const management = createManagement(t)
  const calls = []
  request.defaults.adapter = async (config) => {
    calls.push([config.url, JSON.parse(config.data)])
    return reply(
      config,
      config.url.includes('/list/')
        ? emptyPage
        : { code: 0, data: config.url === '/user/add' ? 4 : true },
    )
  }
  assert.equal(await management.saveUser(editor, admin), true)
  assert.equal(calls[0][0], '/user/add')
  assert.equal(calls[0][1].userName, '示例')
  assert.equal(calls[1][0], '/user/list/page/vo')
  calls.length = 0
  assert.equal(await management.saveUser(editor, admin, 2), true)
  assert.equal(calls[0][0], '/user/update')
  assert.equal(calls[0][1].id, 2)
  assert.equal('userAccount' in calls[0][1], false)
})

test('重复账号错误保留失败状态，可继续重试', async (t) => {
  const management = createManagement(t)
  request.defaults.adapter = async (config) => reply(config, { code: 40000, message: '账号已存在' })
  await assert.rejects(management.saveUser(editor, admin), /账号已存在/)
  assert.equal(management.saving.value, false)
})

test('禁止删除或降级自己，不发送写请求', async (t) => {
  const management = createManagement(t)
  request.defaults.adapter = async () => assert.fail('不应发送请求')
  await assert.rejects(management.removeUser(1, admin), /不能删除/)
  await assert.rejects(management.saveUser(editor, admin, 1), /不能修改/)
})

test('删除最后一页的最后一条后回退到有效页码', async (t) => {
  const management = createManagement(t)
  management.query.pageNum = 2
  const requestedPages = []
  request.defaults.adapter = async (config) => {
    if (config.url === '/user/delete') return reply(config, { code: 0, data: true })
    const body = JSON.parse(config.data)
    requestedPages.push(body.pageNum)
    return reply(config, {
      code: 0,
      data: { records: body.pageNum === 1 ? [user] : [], totalRow: 10 },
    })
  }
  assert.equal(await management.removeUser(11, admin), true)
  assert.deepEqual(requestedPages, [2, 1])
  assert.equal(management.query.pageNum, 1)
  assert.equal(management.deletingId.value, undefined)
})

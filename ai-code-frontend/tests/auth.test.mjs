import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { createPinia } from 'pinia'
import { createServer } from 'vite'

let server
let useLoginUserStore
let request
let getSafeRedirect
let getAuthRedirect

before(async () => {
  server = await createServer({
    configFile: false,
    server: { middlewareMode: true, ws: false },
    optimizeDeps: { noDiscovery: true, include: [] },
    resolve: { alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) } },
  })
  ;({ useLoginUserStore } = await server.ssrLoadModule('/src/stores/loginUser.ts'))
  ;({ default: request } = await server.ssrLoadModule('/src/request.ts'))
  ;({ getSafeRedirect, getAuthRedirect } = await server.ssrLoadModule(
    '/src/router/authRedirect.ts',
  ))
})

after(async () => {
  await server?.close()
})

function response(config, data) {
  return { config, data, status: 200, statusText: 'OK', headers: {} }
}

test('初始化登录信息只请求一次，并共享登录状态', async () => {
  let calls = 0
  request.defaults.adapter = async (config) => {
    calls++
    assert.equal(config.url, '/user/get/login')
    return response(config, { code: 0, data: { id: 1, userName: '测试用户' } })
  }
  const store = useLoginUserStore(createPinia())
  await Promise.all([store.fetchLoginUser(), store.fetchLoginUser()])
  await store.fetchLoginUser()
  assert.equal(calls, 1)
  assert.equal(store.loginUser.id, 1)
  assert.equal(store.loading, false)
})

test('未登录和网络失败均结束加载，保持游客状态', async () => {
  for (const failure of ['anonymous', 'network']) {
    request.defaults.adapter = async (config) => {
      if (failure === 'network') throw new Error('offline')
      return response(config, { code: 40100, message: '未登录' })
    }
    const store = useLoginUserStore(createPinia())
    await store.fetchLoginUser()
    assert.equal(store.loginUser.id, undefined)
    assert.equal(store.loading, false)
  }
})

test('较晚完成的初始化不能覆盖新登录或退出后的状态', async () => {
  for (const action of ['login', 'logout']) {
    let finish
    let started
    const ready = new Promise((resolve) => {
      started = resolve
    })
    request.defaults.adapter = (config) =>
      new Promise((resolve) => {
        finish = () => resolve(response(config, { code: 0, data: { id: 1 } }))
        started()
      })
    const store = useLoginUserStore(createPinia())
    const pending = store.fetchLoginUser()
    await ready
    store.setLoginUser({ id: 2, userName: '新用户' })
    if (action === 'logout') store.resetLoginUser()
    finish()
    await pending
    assert.equal(store.loginUser.id, action === 'login' ? 2 : undefined)
  }
})

test('来源地址保留查询参数和锚点，登录注册切换后仍返回原页面', () => {
  const original = '/admin/userManage?page=2&search=a%26b#list'
  const from = { path: '/admin/userManage', fullPath: original, query: {} }
  const login = { path: '/user/login', fullPath: '/user/login', query: {} }
  const redirect = getAuthRedirect(login, from)
  assert.equal(redirect, original)
  const register = { path: '/user/register', fullPath: '/user/register', query: {} }
  assert.equal(getAuthRedirect(register, { ...login, query: { redirect } }), original)
  assert.equal(getAuthRedirect({ ...login, query: { redirect } }, register), original)
  assert.equal(getAuthRedirect(login, register), '/')
})

test('拒绝外部地址、认证页面和异常输入', () => {
  for (const value of [
    undefined,
    ['/'],
    'https://evil.example',
    '//evil.example',
    '/\\evil.example',
    '/%2f%2fevil.example',
    '/%5cevil.example',
    '/user/login?redirect=/',
    '/user/register/',
    '/user/%6cogin',
    '/foo/../user/login',
    '/bad%zz',
    '/\n/evil.example',
  ]) {
    assert.equal(getSafeRedirect(value), undefined, String(value))
  }
  assert.equal(getSafeRedirect('/?q=hello%20world#home'), '/?q=hello%20world#home')
})

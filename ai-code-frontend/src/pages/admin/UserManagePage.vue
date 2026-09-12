<template>
  <div id="userManagePage">
    <header class="page-heading">
      <div>
        <p class="eyebrow">USER DIRECTORY</p>
        <h1>用户管理</h1>
        <p class="page-description">管理平台用户、账号资料与访问角色。</p>
      </div>
      <a-button type="primary" size="large" @click="openEditor()"
        ><span aria-hidden="true">＋</span> 新增用户</a-button
      >
    </header>
    <section class="filter-panel" aria-label="筛选用户">
      <a-form name="user-search" layout="vertical" :model="filters" @finish="search">
        <div class="filter-grid">
          <a-form-item label="账号" name="userAccount"
            ><a-input
              v-model:value="filters.userAccount"
              allow-clear
              placeholder="搜索用户账号"
              :maxlength="32"
          /></a-form-item>
          <a-form-item label="昵称" name="userName"
            ><a-input
              v-model:value="filters.userName"
              allow-clear
              placeholder="搜索用户昵称"
              :maxlength="256"
          /></a-form-item>
          <a-form-item label="角色" name="userRole"
            ><a-select
              v-model:value="filters.userRole"
              allow-clear
              placeholder="全部角色"
              :options="roleOptions"
          /></a-form-item>
          <div class="filter-actions">
            <a-button type="primary" html-type="submit" :loading="loading">查询</a-button
            ><a-button @click="resetSearch">重置</a-button>
          </div>
        </div>
      </a-form>
    </section>
    <section class="users-panel" aria-labelledby="users-title">
      <div class="table-toolbar">
        <div class="table-title">
          <h2 id="users-title">用户列表</h2>
          <span v-if="!error" class="result-count" aria-live="polite">{{
            loading ? '加载中…' : `共 ${total} 位用户`
          }}</span>
        </div>
        <a-button :loading="loading" @click="loadUsers()">刷新列表</a-button>
      </div>
      <a-alert
        v-if="error"
        class="list-error"
        type="error"
        show-icon
        message="暂时无法加载用户"
        :description="error"
        ><template #action
          ><a-button size="small" @click="loadUsers()">重试</a-button></template
        ></a-alert
      >
      <a-table
        :columns="columns"
        :data-source="records"
        row-key="id"
        :loading="loading"
        :pagination="pagination"
        :scroll="{ x: 1000 }"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'user'"
            ><div class="identity">
              <a-avatar :src="safeAvatar(record.userAvatar)" :size="38" class="user-avatar">{{
                (record.userName || record.userAccount || '用').slice(0, 1)
              }}</a-avatar>
              <div class="identity-text">
                <span class="display-name"
                  >{{ record.userName || '未设置昵称' }}
                  <a-tag v-if="record.id === loginStore.loginUser.id" class="self-tag"
                    >当前账号</a-tag
                  ></span
                ><span class="user-id">ID: {{ record.id }}</span>
              </div>
            </div></template
          >
          <template v-else-if="column.key === 'role'"
            ><a-tag :color="record.userRole === 'admin' ? 'blue' : 'default'">{{
              roleLabel(record.userRole)
            }}</a-tag></template
          >
          <template v-else-if="column.key === 'profile'"
            ><span class="profile-text">{{ record.userProfile || '—' }}</span></template
          >
          <template v-else-if="column.key === 'createTime'"
            ><span class="date-text">{{ formatDate(record.createTime) }}</span></template
          >
          <template v-else-if="column.key === 'actions'"
            ><a-space :size="4"
              ><a-button
                type="link"
                size="small"
                :disabled="record.id == null"
                @click="openEditor(record)"
                >编辑</a-button
              ><a-button
                type="link"
                danger
                size="small"
                :disabled="
                  record.id == null ||
                  record.id === loginStore.loginUser.id ||
                  deletingId !== undefined
                "
                :loading="deletingId === record.id"
                @click="confirmDelete(record)"
                >删除</a-button
              ></a-space
            ></template
          >
        </template>
        <template #emptyText
          ><a-empty
            :image="Empty.PRESENTED_IMAGE_SIMPLE"
            :description="error ? '列表加载失败，请重试' : '暂无符合条件的用户'"
            ><a-button v-if="!error && hasFilters" @click="resetSearch">清空筛选</a-button></a-empty
          ></template
        >
      </a-table>
    </section>
    <a-drawer
      :open="editorOpen"
      :title="editingId === undefined ? '新增用户' : '编辑用户'"
      width="min(480px, 100vw)"
      :root-style="{ maxWidth: '100vw' }"
      :closable="!saving"
      :mask-closable="!saving"
      :keyboard="!saving"
      @close="closeEditor"
    >
      <a-alert
        v-if="editingId === undefined"
        type="info"
        show-icon
        message="新账号的初始密码为 12345678"
        class="editor-note"
      />
      <a-form
        id="user-editor-form"
        name="user-editor"
        ref="editorForm"
        :model="editor"
        :rules="editorRules"
        layout="vertical"
        :disabled="saving"
        @finish="submitEditor"
      >
        <a-form-item
          label="账号"
          name="userAccount"
          :extra="editingId === undefined ? '4–32 位，可用于登录' : '账号创建后不可修改'"
          ><a-input
            v-model:value="editor.userAccount"
            :disabled="editingId !== undefined"
            :maxlength="32"
            placeholder="请输入用户账号"
            autocomplete="off"
        /></a-form-item>
        <a-form-item label="昵称" name="userName"
          ><a-input v-model:value="editor.userName" :maxlength="256" placeholder="用户的显示名称"
        /></a-form-item>
        <a-form-item
          label="角色"
          name="userRole"
          :extra="editingSelf ? '当前登录账号的管理员角色不可修改' : undefined"
          ><a-select v-model:value="editor.userRole" :options="roleOptions" :disabled="editingSelf"
        /></a-form-item>
        <a-form-item label="头像链接" name="userAvatar"
          ><a-input
            v-model:value="editor.userAvatar"
            :maxlength="1024"
            placeholder="https://example.com/avatar.png"
        /></a-form-item>
        <a-form-item label="简介" name="userProfile"
          ><a-textarea
            v-model:value="editor.userProfile"
            :rows="4"
            :maxlength="512"
            show-count
            placeholder="简单介绍这位用户（选填）"
        /></a-form-item>
      </a-form>
      <template #footer
        ><div class="editor-footer">
          <a-button :disabled="saving" @click="closeEditor">取消</a-button
          ><a-button type="primary" :loading="saving" html-type="submit" form="user-editor-form">{{
            editingId === undefined ? '创建用户' : '保存修改'
          }}</a-button>
        </div></template
      >
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref } from 'vue'
import { Empty, Modal, message } from 'ant-design-vue'
import type { FormInstance, Rule } from 'ant-design-vue/es/form'
import type { TableProps } from 'ant-design-vue'
import dayjs from 'dayjs'
import { useLoginUserStore } from '@/stores/loginUser'
import { useUserManagement, type UserEditor } from '@/composables/useUserManagement'

const loginStore = useLoginUserStore()
const {
  records,
  total,
  loading,
  error,
  saving,
  deletingId,
  query,
  loadUsers,
  saveUser,
  removeUser,
} = useUserManagement()
const filters = reactive({
  userAccount: '',
  userName: '',
  userRole: undefined as string | undefined,
})
const roleOptions = [
  { label: '普通用户', value: 'user' },
  { label: '管理员', value: 'admin' },
]
const hasFilters = computed(() => Boolean(query.userAccount || query.userName || query.userRole))
const pagination = computed(() => ({
  current: query.pageNum,
  pageSize: query.pageSize,
  total: total.value,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50'],
  showTotal: (count: number) => `共 ${count} 条`,
  showQuickJumper: true,
}))
const columns = computed<TableProps['columns']>(() => [
  { title: '用户', key: 'user', width: 250 },
  { title: '账号', dataIndex: 'userAccount', key: 'account', width: 160, ellipsis: true },
  { title: '角色', key: 'role', width: 110 },
  { title: '简介', key: 'profile', width: 220 },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 180,
    sorter: true,
    sortOrder: query.sortOrder === 'ascend' ? 'ascend' : 'descend',
  },
  { title: '操作', key: 'actions', width: 130, fixed: 'right' },
])

function search() {
  void loadUsers({
    pageNum: 1,
    userAccount: filters.userAccount.trim() || undefined,
    userName: filters.userName.trim() || undefined,
    userRole: filters.userRole,
  })
}
function resetSearch() {
  Object.assign(filters, { userAccount: '', userName: '', userRole: undefined })
  search()
}
const handleTableChange: TableProps['onChange'] = (page, _filters, sorter, extra) => {
  const sort = Array.isArray(sorter) ? sorter[0] : sorter
  void loadUsers({
    pageNum: extra.action === 'sort' || page.pageSize !== query.pageSize ? 1 : page.current,
    pageSize: page.pageSize,
    sortField: 'createTime',
    sortOrder: sort?.order || 'descend',
  })
}
function formatDate(value?: string) {
  return value && dayjs(value).isValid() ? dayjs(value).format('YYYY-MM-DD HH:mm') : '—'
}
function roleLabel(value?: string) {
  return roleOptions.find((option) => option.value === value)?.label ?? '未知角色'
}
function safeAvatar(value?: string) {
  return value && /^https?:\/\//i.test(value) ? value : undefined
}

const editorOpen = ref(false)
const editingId = ref<number>()
const editorForm = ref<FormInstance>()
const editor = reactive<UserEditor>({
  userAccount: '',
  userName: '',
  userRole: 'user',
  userAvatar: '',
  userProfile: '',
})
const editingSelf = computed(
  () => editingId.value !== undefined && editingId.value === loginStore.loginUser.id,
)
const editorRules = computed<Record<string, Rule[]>>(() => ({
  userAccount:
    editingId.value === undefined
      ? [
          { required: true, whitespace: true, message: '请输入账号' },
          { min: 4, max: 32, message: '账号长度为 4–32 位', trigger: 'blur' },
        ]
      : [],
  userName: [{ max: 256, message: '昵称不能超过 256 字' }],
  userRole: [{ required: true, message: '请选择角色' }],
  userAvatar: [
    {
      validator: async (_rule, value: string) => {
        if (!value.trim()) return
        try {
          const url = new URL(value.trim())
          if (['https:', 'http:'].includes(url.protocol)) return
        } catch {
          /* 统一由下面的校验提示处理。 */
        }
        throw new Error('请输入有效的 HTTP 或 HTTPS 图片链接')
      },
      trigger: 'blur',
    },
  ],
  userProfile: [{ max: 512, message: '简介不能超过 512 字' }],
}))

async function openEditor(user?: API.UserVO) {
  editingId.value = user?.id
  Object.assign(editor, {
    userAccount: user?.userAccount ?? '',
    userName: user?.userName ?? '',
    userRole: user?.userRole ?? 'user',
    userAvatar: user?.userAvatar ?? '',
    userProfile: user?.userProfile ?? '',
  })
  editorOpen.value = true
  await nextTick()
  editorForm.value?.clearValidate()
}
function closeEditor() {
  if (!saving.value) editorOpen.value = false
}
async function submitEditor() {
  const values = { ...editor }
  try {
    if (!(await saveUser(values, loginStore.loginUser, editingId.value))) return
    if (editingSelf.value)
      loginStore.setLoginUser({
        ...loginStore.loginUser,
        userName: values.userName.trim(),
        userAvatar: values.userAvatar.trim(),
        userProfile: values.userProfile.trim(),
      })
    message.success(editingId.value === undefined ? '用户创建成功' : '用户资料已更新')
    editorOpen.value = false
  } catch (reason) {
    message.error(reason instanceof Error ? reason.message : '保存失败，请稍后重试')
  }
}
function confirmDelete(user: API.UserVO) {
  if (user.id == null || user.id === loginStore.loginUser.id) return
  const id = user.id
  Modal.confirm({
    title: '删除这个用户？',
    content: `将删除用户「${user.userName || user.userAccount || id}」（ID: ${id}）。此操作无法在页面中撤销。`,
    okText: '确认删除',
    cancelText: '取消',
    okButtonProps: { danger: true },
    async onOk() {
      try {
        if (await removeUser(id, loginStore.loginUser)) message.success('用户已删除')
      } catch (reason) {
        message.error(reason instanceof Error ? reason.message : '删除失败，请稍后重试')
        throw reason
      }
    },
  })
}

void loadUsers()
</script>

<style scoped>
#userManagePage {
  color: #17233d;
}
.page-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 28px;
}
.eyebrow {
  margin: 0 0 8px;
  color: #697a99;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 2px;
}
h1 {
  margin: 0;
  color: #15213a;
  font-size: 28px;
  font-weight: 650;
  letter-spacing: -0.5px;
}
.page-description {
  margin: 8px 0 0;
  color: #748198;
}
.filter-panel,
.users-panel {
  background: #fff;
  border: 1px solid #e9edf4;
  border-radius: 12px;
}
.filter-panel {
  margin-bottom: 24px;
  padding: 24px;
}
.filter-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 180px auto;
  gap: 20px;
  align-items: end;
}
.filter-grid :deep(.ant-form-item) {
  min-width: 0;
  margin-bottom: 0;
}
.filter-actions {
  display: flex;
  gap: 8px;
}
.users-panel {
  overflow: hidden;
}
.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 24px;
}
.table-title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}
h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}
.result-count {
  color: #748198;
  font-size: 13px;
}
.list-error {
  margin: 0 24px 20px;
}
.identity {
  display: flex;
  align-items: center;
  gap: 12px;
}
.identity-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.display-name {
  color: #25334c;
  overflow-wrap: anywhere;
  font-weight: 500;
}
.user-id {
  color: #8995a8;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}
.user-avatar {
  flex-shrink: 0;
  background: #eaf0ff;
  color: #3968cb;
}
.self-tag {
  margin: 0;
  font-size: 11px;
}
.profile-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  overflow-wrap: anywhere;
  color: #69768c;
}
.date-text {
  color: #69768c;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}
.users-panel :deep(.ant-table-thead > tr > th) {
  background: #f8fafd;
  color: #6a7890;
  font-weight: 500;
}
.users-panel :deep(.ant-table-pagination) {
  padding: 0 24px;
}
.editor-note {
  margin-bottom: 24px;
}
.editor-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
@media (max-width: 1199px) {
  .filter-grid {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 575px) {
  .page-heading {
    align-items: flex-start;
    flex-direction: column;
  }
  h1 {
    font-size: 24px;
  }
  .filter-panel {
    padding: 20px 16px;
  }
  .filter-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .table-toolbar {
    padding: 20px 16px;
  }
  .users-panel :deep(.ant-table-pagination) {
    padding: 0 12px;
  }
}
</style>

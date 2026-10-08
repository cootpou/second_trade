<template>
  <div class="dashboard-container">
    <div class="container">
      <div class="tableBar" style="display: inline-block; width: 100%">
        <label style="margin-right: 10px">用户名：</label>
        <el-input
          v-model="name"
          placeholder="请输入用户名"
          style="width: 15%"
          clearable
          @clear="init"
          @keyup.enter.native="init"
        />
        <el-button class="normal-btn continue" @click="init(true)">查询</el-button>
      </div>

      <el-table v-if="tableData.length" :data="tableData" stripe class="tableBox">
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column prop="username" label="用户名" width="120" align="center" />
        <el-table-column prop="realName" label="姓名" width="100" align="center" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="phone" label="手机号" width="130" align="center" />
        <el-table-column prop="studentId" label="学号" width="120" align="center" />
        <el-table-column prop="creditScore" label="信用分" width="80" align="center" />
        <el-table-column label="状态" width="90" align="center">
          <template slot-scope="scope">
            <div class="tableColumn-status" :class="{ 'stop-use': scope.row.status !== 'active' }">
              {{ scope.row.status === 'active' ? '正常' : '禁用' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="注册时间" width="160" align="center" />
        <el-table-column label="操作" width="100" align="center">
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              :class="{ blueBug: scope.row.status !== 'active', delBut: scope.row.status === 'active' }"
              @click="statusHandle(scope.row)"
            >
              {{ scope.row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <Empty v-else :is-search="isSearch" />
      <el-pagination
        v-if="counts > 10"
        class="pageList"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="counts"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Empty from '@/components/Empty/index.vue'

@Component({
  name: 'User',
  components: { Empty }
})
export default class extends Vue {
  private name: string = ''
  private counts: number = 0
  private page: number = 1
  private pageSize: number = 10
  private tableData: any[] = []
  private isSearch: boolean = false

  // 模拟数据（管理后台暂未对接管理员用户接口，用 mock 展示）
  private mockData: any[] = [
    { id: 1, username: 'testuser', realName: '测试用户', email: 'test@example.com', phone: '13800000001', studentId: '2024001', creditScore: 100, status: 'active', createdAt: '2026-08-20 10:00:00' },
    { id: 2, username: 'zhangsan', realName: '张三', email: 'zhangsan@example.com', phone: '13900139000', studentId: '2024002', creditScore: 100, status: 'active', createdAt: '2026-08-22 14:30:00' },
    { id: 3, username: 'lisi', realName: '李四', email: 'lisi@example.com', phone: '13800138000', studentId: '2024003', creditScore: 95, status: 'active', createdAt: '2026-08-25 09:20:00' },
    { id: 4, username: 'wangwu', realName: '王五', email: 'wangwu@example.com', phone: '13700137000', studentId: '2024004', creditScore: 90, status: 'disabled', createdAt: '2026-08-28 16:45:00' },
    { id: 5, username: 'zhaoliu', realName: '赵六', email: 'zhaoliu@example.com', phone: '13600136000', studentId: '2024005', creditScore: 100, status: 'active', createdAt: '2026-09-01 11:10:00' },
    { id: 6, username: 'sunqi', realName: '孙七', email: 'sunqi@example.com', phone: '13500135000', studentId: '2024006', creditScore: 85, status: 'active', createdAt: '2026-09-03 08:50:00' },
    { id: 7, username: 'zhouba', realName: '周八', email: 'zhouba@example.com', phone: '13400134000', studentId: '2024007', creditScore: 100, status: 'active', createdAt: '2026-09-05 13:25:00' },
    { id: 8, username: 'wujiu', realName: '吴九', email: 'wujiu@example.com', phone: '13300133000', studentId: '2024008', creditScore: 92, status: 'disabled', createdAt: '2026-09-07 17:40:00' },
    { id: 9, username: 'zhengshi', realName: '郑十', email: 'zhengshi@example.com', phone: '13200132000', studentId: '2024009', creditScore: 100, status: 'active', createdAt: '2026-09-09 10:15:00' },
    { id: 10, username: 'chenyi', realName: '陈一', email: 'chenyi@example.com', phone: '13100131000', studentId: '2024010', creditScore: 88, status: 'active', createdAt: '2026-09-11 15:30:00' },
    { id: 11, username: 'liuer', realName: '刘二', email: 'liuer@example.com', phone: '13000130000', studentId: '2024011', creditScore: 96, status: 'active', createdAt: '2026-09-13 09:00:00' },
    { id: 12, username: 'yang_san', realName: '杨三', email: 'yang@example.com', phone: '13900139001', studentId: '2024012', creditScore: 78, status: 'disabled', createdAt: '2026-09-15 12:40:00' }
  ]

  created() {
    this.init()
  }

  private init(isSearch?: boolean) {
    this.isSearch = !!isSearch
    let list = [...this.mockData]
    if (this.name) {
      list = list.filter((u) => u.username.indexOf(this.name) !== -1)
    }
    this.counts = list.length
    const start = (this.page - 1) * this.pageSize
    this.tableData = list.slice(start, start + this.pageSize)
  }

  private statusHandle(row: any) {
    const tip = row.status === 'active' ? '确认禁用该用户？' : '确认启用该用户？'
    this.$confirm(tip, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      row.status = row.status === 'active' ? 'disabled' : 'active'
      this.$message.success('操作成功！')
      this.init()
    })
  }

  private handleSizeChange(val: any) {
    this.pageSize = val
    this.init()
  }
  private handleCurrentChange(val: any) {
    this.page = val
    this.init()
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
    .container {
      background: #fff;
      position: relative;
      z-index: 1;
      padding: 30px 28px;
      border-radius: 4px;
      .tableBar {
        display: flex;
        margin-bottom: 20px;
        justify-content: space-between;
      }
      .tableBox {
        width: 100%;
        border: 1px solid $gray-5;
        border-bottom: 0;
      }
      .pageList {
        text-align: center;
        margin-top: 30px;
      }
      .normal-btn {
        background: #333333;
        color: white;
        margin-left: 20px;
      }
    }
  }
}
</style>

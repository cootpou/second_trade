<template>
  <div class="dashboard-container">
    <div class="container">
      <div class="tableBar" style="display: inline-block; width: 100%">
        <label style="margin-right: 10px">订单号：</label>
        <el-input
          v-model="orderNumber"
          placeholder="请输入订单号"
          style="width: 20%"
          clearable
          @clear="init"
          @keyup.enter.native="init"
        />
        <label style="margin-right: 5px; margin-left: 20px">订单状态：</label>
        <el-select
          v-model="status"
          placeholder="请选择状态"
          clearable
          style="width: 15%"
          @clear="init"
        >
          <el-option label="待付款" value="pending" />
          <el-option label="已付款" value="paid" />
          <el-option label="已完成" value="completed" />
          <el-option label="已取消" value="cancelled" />
        </el-select>
        <el-button class="normal-btn continue" @click="init(true)">查询</el-button>
      </div>

      <el-table v-if="tableData.length" :data="tableData" stripe class="tableBox">
        <el-table-column prop="orderNumber" label="订单号" min-width="180" />
        <el-table-column prop="productTitle" label="商品" min-width="140" show-overflow-tooltip />
        <el-table-column prop="buyerName" label="买家" width="100" align="center" />
        <el-table-column prop="sellerName" label="卖家" width="100" align="center" />
        <el-table-column prop="price" label="金额" width="90" align="center">
          <template slot-scope="scope">
            <span>￥{{ scope.row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template slot-scope="scope">
            <div class="tableColumn-status" :class="{ 'stop-use': scope.row.status === 'cancelled' }">
              {{ statusText(scope.row.status) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="deliveryMethod" label="交易方式" width="90" align="center" />
        <el-table-column prop="createdAt" label="下单时间" width="160" align="center" />
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
  name: 'Order',
  components: { Empty }
})
export default class extends Vue {
  private orderNumber: string = ''
  private status: string = ''
  private counts: number = 0
  private page: number = 1
  private pageSize: number = 10
  private tableData: any[] = []
  private isSearch: boolean = false

  // 模拟数据（管理后台暂未对接管理员订单接口，用 mock 展示）
  private mockData: any[] = [
    {
      orderNumber: 'SO20260905001',
      productTitle: '线性代数教材',
      buyerName: '李四',
      sellerName: '张三',
      price: 15.0,
      status: 'completed',
      deliveryMethod: '面交',
      createdAt: '2026-09-05 10:20:00'
    },
    {
      orderNumber: 'SO20260905002',
      productTitle: 'AirPods Pro 二代',
      buyerName: '王五',
      sellerName: '赵六',
      price: 1299.0,
      status: 'paid',
      deliveryMethod: '自提',
      createdAt: '2026-09-05 11:40:00'
    },
    {
      orderNumber: 'SO20260906001',
      productTitle: '高数辅导书',
      buyerName: '张三',
      sellerName: '李四',
      price: 20.0,
      status: 'pending',
      deliveryMethod: '面交',
      createdAt: '2026-09-06 09:15:00'
    },
    {
      orderNumber: 'SO20260906002',
      productTitle: '机械键盘 87键',
      buyerName: '刘七',
      sellerName: '王五',
      price: 189.0,
      status: 'completed',
      deliveryMethod: '邮寄',
      createdAt: '2026-09-06 14:30:00'
    },
    {
      orderNumber: 'SO20260907001',
      productTitle: '台灯护眼',
      buyerName: '孙八',
      sellerName: '张三',
      price: 45.0,
      status: 'cancelled',
      deliveryMethod: '自提',
      createdAt: '2026-09-07 08:50:00'
    },
    {
      orderNumber: 'SO20260907002',
      productTitle: '小米手环7',
      buyerName: '周九',
      sellerName: '赵六',
      price: 160.0,
      status: 'paid',
      deliveryMethod: '面交',
      createdAt: '2026-09-07 16:05:00'
    },
    {
      orderNumber: 'SO20260908001',
      productTitle: '网球拍',
      buyerName: '吴十',
      sellerName: '李四',
      price: 88.0,
      status: 'pending',
      deliveryMethod: '面交',
      createdAt: '2026-09-08 10:00:00'
    },
    {
      orderNumber: 'SO20260908002',
      productTitle: '六级真题卷',
      buyerName: '郑一',
      sellerName: '王五',
      price: 12.0,
      status: 'completed',
      deliveryMethod: '邮寄',
      createdAt: '2026-09-08 13:25:00'
    },
    {
      orderNumber: 'SO20260909001',
      productTitle: '瑜伽垫',
      buyerName: '冯二',
      sellerName: '张三',
      price: 35.0,
      status: 'completed',
      deliveryMethod: '自提',
      createdAt: '2026-09-09 09:40:00'
    },
    {
      orderNumber: 'SO20260909002',
      productTitle: '蓝牙音箱',
      buyerName: '陈三',
      sellerName: '赵六',
      price: 99.0,
      status: 'paid',
      deliveryMethod: '面交',
      createdAt: '2026-09-09 15:10:00'
    },
    {
      orderNumber: 'SO20260910001',
      productTitle: '考研英语网课资料',
      buyerName: '褚四',
      sellerName: '李四',
      price: 60.0,
      status: 'cancelled',
      deliveryMethod: '邮寄',
      createdAt: '2026-09-10 11:00:00'
    },
    {
      orderNumber: 'SO20260910002',
      productTitle: '显示器 27寸',
      buyerName: '卫五',
      sellerName: '王五',
      price: 520.0,
      status: 'completed',
      deliveryMethod: '自提',
      createdAt: '2026-09-10 18:30:00'
    }
  ]

  created() {
    this.init()
  }

  private statusText(s: string) {
    const map: any = {
      pending: '待付款',
      paid: '已付款',
      completed: '已完成',
      cancelled: '已取消'
    }
    return map[s] || s
  }

  private init(isSearch?: boolean) {
    this.isSearch = !!isSearch
    let list = [...this.mockData]
    if (this.orderNumber) {
      list = list.filter((o) => o.orderNumber.indexOf(this.orderNumber) !== -1)
    }
    if (this.status) {
      list = list.filter((o) => o.status === this.status)
    }
    this.counts = list.length
    const start = (this.page - 1) * this.pageSize
    this.tableData = list.slice(start, start + this.pageSize)
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

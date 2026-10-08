<template>
  <div class="dashboard-container">
    <div class="container">
      <div class="tableBar" style="display: inline-block; width: 100%">
        <label style="margin-right: 10px">商品名称：</label>
        <el-input
          v-model="name"
          placeholder="请输入商品名称"
          style="width: 15%"
          clearable
          @clear="init"
          @keyup.enter.native="init"
        />

        <label style="margin-right: 5px; margin-left: 20px">商品分类：</label>
        <el-select
          v-model="category"
          placeholder="请选择分类"
          clearable
          style="width: 15%"
          @clear="init"
        >
          <el-option
            v-for="item in categoryOptions"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>

        <label style="margin-right: 5px; margin-left: 20px">商品状态：</label>
        <el-select
          v-model="status"
          placeholder="请选择状态"
          clearable
          style="width: 15%"
          @clear="init"
        >
          <el-option label="待上架" value="pending" />
          <el-option label="在售" value="active" />
          <el-option label="已下架" value="offline" />
          <el-option label="已售出" value="sold" />
        </el-select>

        <el-button class="normal-btn continue" @click="init(true)">查询</el-button>
      </div>

      <el-table
        v-if="tableData.length"
        :data="tableData"
        stripe
        class="tableBox"
      >
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column prop="title" label="商品名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="100" align="center" />
        <el-table-column prop="price" label="价格" width="90" align="center">
          <template slot-scope="scope">
            <span>￥{{ scope.row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="originalPrice" label="原价" width="90" align="center">
          <template slot-scope="scope">
            <span>￥{{ scope.row.originalPrice }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="condition" label="成色" width="80" align="center" />
        <el-table-column prop="sellerName" label="卖家" width="100" align="center" />
        <el-table-column label="状态" width="90" align="center">
          <template slot-scope="scope">
            <div
              class="tableColumn-status"
              :class="{ 'stop-use': scope.row.status !== 'active' }"
            >
              {{ statusText(scope.row.status) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="viewCount" label="浏览量" width="80" align="center" />
        <el-table-column prop="createdAt" label="发布时间" width="160" align="center" />
        <el-table-column label="操作" width="240" align="center">
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              class="blueBug"
              @click="detailHandle(scope.row)"
            >
              详情
            </el-button>
            <el-button
              v-if="scope.row.status === 'active'"
              type="text"
              size="small"
              class="delBut"
              @click="statusHandle(scope.row, 'offline')"
            >
              下架
            </el-button>
            <el-button
              v-if="scope.row.status === 'offline' || scope.row.status === 'pending'"
              type="text"
              size="small"
              class="blueBug"
              @click="statusHandle(scope.row, 'active')"
            >
              上架
            </el-button>
            <el-button
              type="text"
              size="small"
              class="delBut"
              @click="deleteHandle(scope.row.id)"
            >
              删除
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

    <!-- 商品详情弹窗 -->
    <el-dialog
      title="商品详情"
      :visible.sync="detailVisible"
      width="45%"
    >
      <el-descriptions :column="2" border v-if="detailData.id">
        <el-descriptions-item label="商品ID">{{ detailData.id }}</el-descriptions-item>
        <el-descriptions-item label="分类">{{ detailData.category }}</el-descriptions-item>
        <el-descriptions-item label="商品名称">{{ detailData.title }}</el-descriptions-item>
        <el-descriptions-item label="成色">{{ detailData.condition }}</el-descriptions-item>
        <el-descriptions-item label="价格">￥{{ detailData.price }}</el-descriptions-item>
        <el-descriptions-item label="原价">￥{{ detailData.originalPrice }}</el-descriptions-item>
        <el-descriptions-item label="卖家">{{ detailData.sellerName || ('用户#' + detailData.sellerId) }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ statusText(detailData.status) }}</el-descriptions-item>
        <el-descriptions-item label="所在地">{{ detailData.location }}</el-descriptions-item>
        <el-descriptions-item label="浏览量">{{ detailData.viewCount }}</el-descriptions-item>
        <el-descriptions-item label="发布时间">{{ detailData.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">{{ detailData.description }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Empty from '@/components/Empty/index.vue'
import {
  getProductPage,
  getProductDetail,
  enableOrDisableProduct,
  deleProduct,
  getCategories
} from '@/api/product'

@Component({
  name: 'Product',
  components: { Empty }
})
export default class extends Vue {
  private name: string = ''
  private category: string = ''
  private status: string = ''
  private counts: number = 0
  private page: number = 1
  private pageSize: number = 10
  private tableData: any[] = []
  private isSearch: boolean = false
  private detailVisible: boolean = false
  private detailData: any = {}
  private categoryOptions: string[] = []

  created() {
    this.loadCategories()
    this.init()
  }

  private statusText(s: string) {
    const map: any = {
      pending: '待上架',
      active: '在售',
      offline: '已下架',
      sold: '已售出'
    }
    return map[s] || s
  }

  // 加载分类
  private async loadCategories() {
    try {
      const res: any = await getCategories()
      if (res.data.code === 1) {
        this.categoryOptions = res.data.data || []
      }
    } catch (e) {
      // 分类加载失败不影响列表
    }
  }

  // 初始化列表
  private async init(isSearch?: boolean) {
    this.isSearch = !!isSearch
    try {
      const res: any = await getProductPage({
        page: this.page,
        pageSize: this.pageSize,
        category: this.category || undefined,
        status: this.status || undefined,
        keyword: this.name || undefined
      })
      if (String(res.data.code) === '1') {
        this.tableData = res.data.data.records || []
        this.counts = Number(res.data.data.total || 0)
      } else {
        this.$message.error(res.data.msg || res.data.desc)
      }
    } catch (err: any) {
      this.$message.error('请求出错了：' + err.message)
    }
  }

  // 详情
  private async detailHandle(row: any) {
    this.detailData = {}
    this.detailVisible = true
    try {
      const res: any = await getProductDetail(row.id)
      if (String(res.data.code) === '1') {
        this.detailData = res.data.data
      } else {
        this.$message.error(res.data.msg)
      }
    } catch (err: any) {
      this.$message.error('请求出错了：' + err.message)
    }
  }

  // 上下架
  private statusHandle(row: any, status: string) {
    const tip = status === 'offline' ? '确认下架该商品？' : '确认上架该商品？'
    this.$confirm(tip, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      enableOrDisableProduct({ id: row.id, status })
        .then((res: any) => {
          if (String(res.data.code) === '1') {
            this.$message.success('操作成功！')
            this.init()
          } else {
            this.$message.error(res.data.msg)
          }
        })
        .catch((err: any) => {
          this.$message.error('请求出错了：' + err.message)
        })
    })
  }

  // 删除
  private deleteHandle(id: any) {
    this.$confirm('此操作将永久删除该商品，是否继续？', '确定删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      deleProduct(id)
        .then((res: any) => {
          if (String(res.data.code) === '1') {
            this.$message.success('删除成功！')
            this.init()
          } else {
            this.$message.error(res.data.msg)
          }
        })
        .catch((err: any) => {
          this.$message.error('请求出错了：' + err.message)
        })
    })
  }

  // 分页
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

<template>
  <div class="dashboard-container">
    <div class="container">
      <div class="tableBar" style="display: inline-block; width: 100%">
        <label style="margin-right: 10px">分类名称：</label>
        <el-input
          v-model="name"
          placeholder="请填写分类名称"
          style="width: 20%"
          clearable
          @clear="init"
          @keyup.enter.native="init"
        />
        <el-button class="normal-btn continue" @click="init(true)">查询</el-button>
      </div>

      <el-table v-if="tableData.length" :data="tableData" stripe class="tableBox">
        <el-table-column prop="name" label="分类名称" min-width="150" />
        <el-table-column label="序号" width="100" align="center">
          <template slot-scope="scope">
            <span>{{ scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="商品数量" width="100" align="center">
          <template slot-scope="scope">
            <span>—</span>
          </template>
        </el-table-column>
      </el-table>
      <Empty v-else :is-search="isSearch" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Empty from '@/components/Empty/index.vue'
import { getCategories } from '@/api/product'

@Component({
  name: 'Category',
  components: { Empty }
})
export default class extends Vue {
  private name: string = ''
  private tableData: any[] = []
  private isSearch: boolean = false
  private fullData: any[] = []

  created() {
    this.init()
  }

  private async init(isSearch?: boolean) {
    this.isSearch = !!isSearch
    try {
      const res: any = await getCategories()
      if (String(res.data.code) === '1') {
        this.fullData = res.data.data || []
        if (this.name) {
          this.tableData = this.fullData.filter((c: any) => c.indexOf(this.name) !== -1)
        } else {
          this.tableData = [...this.fullData]
        }
      } else {
        this.$message.error(res.data.msg || res.data.desc)
      }
    } catch (err: any) {
      this.$message.error('请求出错了：' + err.message)
    }
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
      .normal-btn {
        background: #333333;
        color: white;
        margin-left: 20px;
      }
    }
  }
}
</style>

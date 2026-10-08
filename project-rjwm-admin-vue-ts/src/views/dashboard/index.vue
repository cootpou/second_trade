<template>
  <div class="dashboard-container home">
    <!-- 统计卡片 -->
    <div class="overview-cards">
      <div class="ov-card">
        <div class="ov-title">商品总数</div>
        <div class="ov-value">{{ stats.productTotal }}</div>
        <div class="ov-sub">全平台在架商品</div>
      </div>
      <div class="ov-card">
        <div class="ov-title">订单总数</div>
        <div class="ov-value">{{ stats.orderTotal }}</div>
        <div class="ov-sub">累计订单</div>
      </div>
      <div class="ov-card">
        <div class="ov-title">用户总数</div>
        <div class="ov-value">{{ stats.userTotal }}</div>
        <div class="ov-sub">注册用户</div>
      </div>
      <div class="ov-card">
        <div class="ov-title">成交金额</div>
        <div class="ov-value">￥{{ stats.tradeAmount }}</div>
        <div class="ov-sub">已完成订单总额</div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="chart-row">
      <div class="chart-box">
        <div class="chart-title">商品分类占比</div>
        <div ref="categoryChart" class="chart"></div>
      </div>
      <div class="chart-box">
        <div class="chart-title">近30日订单趋势</div>
        <div ref="orderChart" class="chart"></div>
      </div>
    </div>
    <div class="chart-row">
      <div class="chart-box">
        <div class="chart-title">订单状态分布</div>
        <div ref="statusChart" class="chart"></div>
      </div>
      <div class="chart-box">
        <div class="chart-title">热门分类销量</div>
        <div ref="topChart" class="chart"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({
  name: 'Dashboard'
})
export default class extends Vue {
  private stats: any = {
    productTotal: 128,
    orderTotal: 356,
    userTotal: 520,
    tradeAmount: '8,760'
  }

  private categoryData: any = {
    names: ['书籍教材', '数码电子', '生活用品', '服饰鞋包', '运动户外', '其他'],
    values: [35, 28, 18, 8, 6, 5]
  }

  private orderTrendData: any = {
    dates: [],
    values: []
  }

  private statusData: any = {
    names: ['待付款', '已付款', '已完成', '已取消'],
    values: [30, 48, 240, 38]
  }

  private topData: any = {
    names: ['书籍教材', '数码电子', '生活用品', '运动户外', '美妆护肤'],
    values: [42, 31, 20, 12, 8]
  }

  mounted() {
    this.genTrendData()
    this.$nextTick(() => {
      this.drawCategoryChart()
      this.drawOrderChart()
      this.drawStatusChart()
      this.drawTopChart()
    })
    window.addEventListener('resize', this.resizeCharts)
  }

  beforeDestroy() {
    window.removeEventListener('resize', this.resizeCharts)
  }

  private genTrendData() {
    const dates: string[] = []
    const values: number[] = []
    const now = new Date()
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 3600 * 1000)
      const md = (d.getMonth() + 1) + '/' + d.getDate()
      dates.push(md)
      values.push(6 + Math.floor(Math.random() * 15))
    }
    this.orderTrendData.dates = dates
    this.orderTrendData.values = values
  }

  private resizeCharts() {
    ;(this as any).$echarts.getInstanceByDom(this.$refs.categoryChart as any)?.resize()
    ;(this as any).$echarts.getInstanceByDom(this.$refs.orderChart as any)?.resize()
    ;(this as any).$echarts.getInstanceByDom(this.$refs.statusChart as any)?.resize()
    ;(this as any).$echarts.getInstanceByDom(this.$refs.topChart as any)?.resize()
  }

  private drawCategoryChart() {
    const chart = (this as any).$echarts.init(this.$refs.categoryChart)
    chart.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: 0 },
      series: [
        {
          name: '分类占比',
          type: 'pie',
          radius: ['30%', '60%'],
          center: ['50%', '45%'],
          data: this.categoryData.names.map((n: string, i: number) => ({
            name: n,
            value: this.categoryData.values[i]
          }))
        }
      ]
    })
  }

  private drawOrderChart() {
    const chart = (this as any).$echarts.init(this.$refs.orderChart)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 40, right: 20, top: 30, bottom: 30 },
      xAxis: {
        type: 'category',
        data: this.orderTrendData.dates,
        axisLabel: { interval: 4 }
      },
      yAxis: { type: 'value' },
      series: [
        {
          name: '订单数',
          type: 'line',
          smooth: true,
          data: this.orderTrendData.values,
          areaStyle: { opacity: 0.15 }
        }
      ]
    })
  }

  private drawStatusChart() {
    const chart = (this as any).$echarts.init(this.$refs.statusChart)
    chart.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: 0 },
      series: [
        {
          name: '订单状态',
          type: 'pie',
          radius: '60%',
          center: ['50%', '45%'],
          data: this.statusData.names.map((n: string, i: number) => ({
            name: n,
            value: this.statusData.values[i]
          }))
        }
      ]
    })
  }

  private drawTopChart() {
    const chart = (this as any).$echarts.init(this.$refs.topChart)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 40, right: 20, top: 30, bottom: 30 },
      xAxis: { type: 'category', data: this.topData.names },
      yAxis: { type: 'value' },
      series: [
        {
          name: '销量',
          type: 'bar',
          barWidth: 30,
          data: this.topData.values,
          itemStyle: { color: '#409EFF' }
        }
      ]
    })
  }
}
</script>

<style lang="scss" scoped>
.home {
  padding: 20px;

  .overview-cards {
    display: flex;
    gap: 16px;
    margin-bottom: 20px;

    .ov-card {
      flex: 1;
      background: #fff;
      border-radius: 6px;
      padding: 20px;
      text-align: center;

      .ov-title {
        font-size: 14px;
        color: #666;
        margin-bottom: 10px;
      }
      .ov-value {
        font-size: 28px;
        font-weight: 700;
        color: #333;
        margin-bottom: 8px;
      }
      .ov-sub {
        font-size: 12px;
        color: #999;
      }
    }
  }

  .chart-row {
    display: flex;
    gap: 16px;
    margin-bottom: 20px;

    .chart-box {
      flex: 1;
      background: #fff;
      border-radius: 6px;
      padding: 16px;

      .chart-title {
        font-size: 14px;
        font-weight: 600;
        color: #333;
        margin-bottom: 10px;
      }
      .chart {
        width: 100%;
        height: 300px;
      }
    }
  }
}
</style>

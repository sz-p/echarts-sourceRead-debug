<template>
  <div>
    <div class="chartBox" ref="chartBox"></div>
    <D3LineChart :xData="xData" :yData="yData" :padding="grid" :max="max"/>
  </div>
</template>

<script>
import * as echarts from "echarts";
import D3LineChart from "./d3LineChart"
export default {
  name: "AxisExtent",
  components:{
    D3LineChart,
  },
  data() {
    return {
      xData: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      yData: [0, 0 ,0, 0 ,0, 100, 0],
      grid: {
        left: 90,
        top: 30,
        bottom: 30,
        right: 30
      },
      max: 100
    };
  },
  mounted() {
    const chartDom = this.$refs.chartBox;
    const myChart = echarts.init(chartDom, undefined, { renderer: "svg" });
    const option = {
      xAxis: {
        type: "category",
        data: this.xData
      },
      yAxis: {
        type: "value"
      },
      series: [
        {
          data: this.yData,
          type: "line",
          smooth: true
        }
      ],
      grid:this.grid
    };
    option && myChart.setOption(option);
  }
};
</script>
<style lang="less" scoped>
.chartBox {
  width: 1200px;
  height: 300px;
}
</style>

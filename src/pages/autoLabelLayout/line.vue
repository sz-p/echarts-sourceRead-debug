<template>
  <div>
    <div class="chartBox" ref="chartBox"></div>
  </div>
</template>

<script>
import * as echarts from "echarts";
export default {
  name: "EChartsLine",
  data() {
    return {};
  },
  mounted() {
    const chartDom = this.$refs.chartBox;
    const myChart = echarts.init(chartDom);

    const createXYData = function(dataLength) {
      const xData = [];
      const yData = [];
      for (let i = 0; i < dataLength; i++) {
        xData.push(i.toString());
        yData.push(100);
      }
      return { xData, yData };
    };

    const { xData, yData } = createXYData(1000);
    const option = {
      xAxis: {
        type: "category",
        data: xData
      },
      yAxis: {
        type: "value"
      },
      series: [
        {
          data: yData,
          type: "line"
        }
      ]
    };
    option && myChart.setOption(option);
  }
};
</script>
<style lang="less" scoped>
.chartBox {
  width: 600px;
  height: 600px;
}
</style>

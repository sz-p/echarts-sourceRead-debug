<template>
  <div>
    <div class="chartBox" ref="chartBox"></div>
  </div>
</template>

<script>
import * as echarts from "echarts";
export default {
  name: "AxisExtent",
  data() {
    return {};
  },
  mounted() {
    const chartDom = this.$refs.chartBox;
    const myChart = echarts.init(chartDom);
    const option = {
      xAxis: {
        type: "category",
        data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      },
      yAxis: {
        type: "value",
      },
      series: [
        {
          data: [150, 230, 224, 218, 135, 147, 260],
          type: "line",
        },
      ],
    };

    option && myChart.setOption(option);
  },
};
</script>
<style lang="less" scoped>
.chartBox {
  width: 600px;
  height: 600px;
}
</style>

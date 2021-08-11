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
    const doSomeThingLongTimeSync = function() {
      for (let i = 0; i < 10000; i++) {
        console.log(i);
      }
    };
    const chartDom = this.$refs.chartBox;
    const myChart = echarts.init(chartDom);
    const option = {
      lazyUpdate: true,
      xAxis: {
        type: "category",
        data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      },
      yAxis: {
        type: "value"
      },
      series: [
        {
          data: [10, 10, 10, 10, 10, 10, 10],
          type: "line"
        }
      ]
    };
    const option1 = {
      xAxis: {
        type: "category",
        data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      },
      yAxis: {
        type: "value"
      },
      series: [
        {
          data: [150, 230, 224, 218, 135, 147, 260],
          type: "line"
        }
      ]
    };
    option1 && myChart.setOption(option1, false, true);
    doSomeThingLongTimeSync();
    option && myChart.setOption(option, false, true);
    setTimeout(() => {
      option && myChart.setOption(option, false, true);
    }, 1000);
  }
};
</script>
<style lang="less" scoped>
.chartBox {
  width: 600px;
  height: 600px;
}
</style>

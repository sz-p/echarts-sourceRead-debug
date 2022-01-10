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
    const myChart = echarts.init(chartDom,undefined,{renderer:"svg"});

    const option = {
      title: {
        text: "Referer of a Website",
        subtext: "Fake Data",
        left: "center"
      },
      tooltip: {
        trigger: "item"
      },
      legend: {
        orient: "vertical",
        left: "left"
      },
      series: [
        {
          name: "Access From",
          type: "pie",
          radius: "50%",
          data: [
            { value: 1048, name: "Search Engine" },
            { value: 735, name: "Direct" },
            { value: 580, name: "Email" },
            { value: 484, name: "Union Ads" },
            { value: 300, name: "Video Ads" }
          ],
          label: {
            backgroundColor: "#ccc",
            padding: 10,
            borderRadius: 20
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)"
            }
          }
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

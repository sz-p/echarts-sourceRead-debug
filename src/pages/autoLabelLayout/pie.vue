<template>
  <div>
    <div class="chartBox" ref="chartBox"></div>
  </div>
</template>

<script>
import * as echarts from "echarts";
export default {
  name: "Pie",
  data() {
    return {};
  },
  mounted() {
    const chartDom = this.$refs.chartBox;
    const myChart = echarts.init(chartDom);
    const createData = function(dataLength) {
      const data = [];
      for (let i = 0; i < dataLength; i++) {
        data.push({
          value: 1,
          name: i
        });
      }
      return data;
    };

    const option = {
      title: {
        text: "某站点用户访问来源",
        subtext: "纯属虚构",
        left: "center"
      },
      tooltip: {
        trigger: "item"
      },
      legend: {
        show: false,
        orient: "vertical",
        left: "left"
      },

      series: [
        {
          name: "访问来源",
          type: "pie",
          radius: "50%",
          data: createData(100),
          label: {
            show: true
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)"
            },
            labelLine: {
              show: false
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

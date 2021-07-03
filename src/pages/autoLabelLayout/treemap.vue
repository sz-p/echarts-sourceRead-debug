<template>
  <div>
    <div class="chartBox" ref="chartBox"></div>
  </div>
</template>

<script>
import * as echarts from "echarts";
import rawData from "./ec-option-doc-statistics-201604.json";
export default {
  name: "TreeMap",
  data() {
    return {};
  },
  mounted() {
    const chartDom = this.$refs.chartBox;
    const myChart = echarts.init(chartDom);

    function convert(source, target, basePath) {
      for (var key in source) {
        var path = basePath ? basePath + "." + key : key;
        if (!key.match(/^\$/)) {
          target.children = target.children || [];
          var child = {
            name: path
          };
          target.children.push(child);
          convert(source[key], child, path);
        }
      }

      if (!target.children) {
        target.value = source.$count || 1;
      } else {
        target.children.push({
          name: basePath,
          value: source.$count
        });
      }
    }

    var data = [];

    convert(rawData, data, "");

    const option = {
      title: {
        text: "ECharts 配置项查询分布",
        subtext: "2016/04",
        left: "leafDepth"
      },
      tooltip: {},
      series: [
        {
          name: "option",
          type: "treemap",
          visibleMin: 300,
          data: data.children,
          leafDepth: 2,
          levels: [
            {
              itemStyle: {
                borderColor: "#555",
                borderWidth: 4,
                gapWidth: 4
              }
            },
            {
              colorSaturation: [0.3, 0.6],
              itemStyle: {
                borderColorSaturation: 0.7,
                gapWidth: 2,
                borderWidth: 2
              }
            },
            {
              colorSaturation: [0.3, 0.5],
              itemStyle: {
                borderColorSaturation: 0.6,
                gapWidth: 1
              }
            },
            {
              colorSaturation: [0.3, 0.5]
            }
          ]
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

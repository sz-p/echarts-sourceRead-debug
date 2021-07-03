<template>
  <div>
    <Pie />
    <EChartsLine />
    <TreeMap />
  </div>
</template>

<script>
import Pie from "./pie";
import EChartsLine from "./line";
import TreeMap from "./treemap";
export default {
  name: "AxisExtent",
  components: { Pie, EChartsLine, TreeMap },
  data() {
    return {};
  },
  mounted() {}
};
</script>
<style lang="less" scoped>
.chartBox {
  width: 600px;
  height: 600px;
}
</style>

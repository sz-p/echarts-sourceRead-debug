<template>
  <div ref="chartBox" class="chartBox"></div>
</template>
<script>
import * as d3 from "d3";
export default {
  props: {
    xData: {
      type: Array,
    },
    yData: {
      type: Array,
    },
    padding: {
      type: Object,
    },
    max: {
      type: Number
    }
  },
  methods: {
    layout() {
      this.yScale = d3
        .scaleLinear()
        .domain([0, this.max])
        .range([this.height - this.padding.bottom, this.padding.top]);
      this.xScale = d3
        .scaleBand()
        .domain(this.xData)
        .range([this.padding.left, this.width - this.padding.right]);
      this.xAxis = d3
        .axisBottom()
        .scale(this.xScale)
        .tickValues(this.xScale.domain());
      this.yAxis = d3
        .axisLeft()
        .scale(this.yScale)
      this.bezierLine = d3.line()
        .x((d) => this.xScale(d.x))
        .y((d) => this.yScale(d.y))
        .curve(d3.curveMonotoneX)
      this.line = d3.line()
        .x((d) => this.xScale(d.x))
        .y((d) => this.yScale(d.y))
    },
    render() {
      const svg = d3
        .select(this.dom)
        .append("svg")
        .attr("width", this.width)
        .attr("height", this.height);
      svg
        .append("g")
        .call(this.xAxis)
        .attr(
          "transform",
          "translate(0," + (this.height - this.padding.bottom) + ")"
        )
        .attr("color", "black");
      svg
        .append("g")
        .call(this.yAxis)
        .attr("transform", "translate(" + this.padding.left + ",0)")
        .attr("color", "black");
      svg
        .append("g")
        .append("path")
        .datum(this.data) // 10. Binds data to the line
        .attr("class", "line") // Assign a class for styling
        .attr("d", this.bezierLine) // 11. Calls the line generator
        .attr("fill", "none")
        .attr("transform", () => {
          return (
            "translate(" + (this.xScale.bandwidth()/2) + ",0)"
          );
        })
        .attr("stroke", "black");

      svg
        .append("g")
        .attr("transform", () => {
          return (
            "translate(" + (this.xScale.bandwidth()/2) + ",0)"
          );
        })
        .selectAll(".dot")
        .data(this.data)
        .enter().append("circle") // Uses the enter().append() method
        .attr("class", "dot") // Assign a class for styling
        .attr("cx", d => this.xScale(d.x))
        .attr("cy", d => this.yScale(d.y))
        .attr("r", 2);
    }
  },
  mounted() {
    this.dom = this.$refs.chartBox;
    this.data = [];
    for (let i = 0; i < this.xData.length; i++) {
      this.data.push({
        x: this.xData[i],
        y: this.yData[i]
      })
    }
    this.width = 1200;
    this.height = 300;
    this.layout();
    this.render();
  }
};
</script>
<style lang="less" scoped>
.chartBox {
  width: 1200px;
  height: 300px;
}
</style>

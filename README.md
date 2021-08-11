# ECharts 源码解析系列文章将及辅助项目

本项目主要用于针对性的探究一些`ECharts`比较有趣的功能实现。具体方式为**提出维问题**、**跟踪源码**、**尝试解答**。

`/src/pages`目录下为各个问题和对应的示例、文档。

## 目录

### 功能设计与实现
#### [fileIndex](./src/pages/fileIndex/README.md)

`ECharts`源码阅读系列的准备工作，、熟悉代码组织结构，了解核心模块。

#### [niceTick,niceExtent](./src/pages/axisExtent/README.md)

如何在笛卡尔坐标系下实现实现优美、整体的轴间隔(最大值默认是整数且通常为10的倍数，对人类友好)。

#### [findHover](./src/pages/findHover/README.md)

如何去做`Canvas`内部的事件响应，以及一旦`Canvas`中的元素多起来如何去做性能优化。

#### [setOption](./src/pages/setOptionMoreThanOnce/README.md)

`lazyUpdate`模式如何实现多次执行`setOption`,仅对最终的`option`渲染一次。

#### [canvasLayer](./src/pages/canvasLayer/README.md)

在大规模数据场景下如何做渲染性能优化。
TODO
#### [autoLabelLayout](./src/pages/autoLabelLayout/README.md)

如何解决标签重叠、自适应问题。
TODO

#### set多个Options仅渲染一次如何实现

#### 标签文字的AutoAnimation如何实现

### API实现

#### [focusNodeAdjacency](./src/pages/focusNodeAdjacency/README.md)

[focusNodeAdjacency](https://echarts.apache.org/zh/option.html#series-graph.focusNodeAdjacency)：主要在关系图及桑基图中应用，表示是否在鼠标移到节点上的时候突出显示节点以及节点的边和邻接节点。具体操作为修改其余节点的透明度。

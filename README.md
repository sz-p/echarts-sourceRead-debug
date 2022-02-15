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

#### [性能优化](./src/pages/ECharts之性能优化/README.md)

在大规模数据场景下如何做渲染性能优化。

#### [setOptionMoreThanOnce](./src/pages/setOptionMoreThanOnce/README.md)

set多个Options仅渲染一次如何实现

#### [canvasLayer](./src/pages/canvasLayer/README.md)

如何应用多层画布解决性能问题

#### [autoLabelLayout](./src/pages/autoLabelLayout/README.md)

如何解决标签重叠、自适应问题。

#### [progressiveRender](./src/pages/progressiveRender/README.md)

如何应用渐进渲染解决性能问题

#### [svgBackground](./src/pages/svgBackground/README.md)

如何在`SVG`渲染器下实现`Text`背景

#### [svgRender](./src/pages/svgRender/README.md)

如何同时支持`SVG`及`canvas`渲染器

#### [textBoundingRect](./src/pages/textBoundingRect/README.md)

如何计算文字的外层包围盒

#### [eventful](./src/pages/eventful/README.md)

echarts的事件系统是如何工作的

#### [svgRender-add-tag](./src/pages/svgRender-add-tag/README.md)

echarts图元拾取

#### 标签文字的AutoAnimation如何实现

如何实现 标签动画 字体大小可以随着图形元素的大小动态变化

### API实现

#### [focusNodeAdjacency](./src/pages/focusNodeAdjacency/README.md)

[focusNodeAdjacency](https://echarts.apache.org/zh/option.html#series-graph.focusNodeAdjacency)：主要在关系图及桑基图中应用，表示是否在鼠标移到节点上的时候突出显示节点以及节点的边和邻接节点。具体操作为修改其余节点的透明度。

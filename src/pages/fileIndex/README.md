# ECharts源码解析之代码组织结构

## 版本：V5.0.2

## 背景

Echarts源码阅读系列文章的前置任务，学习优秀开源框架、熟悉代码组织结构，了解核心模块。

## 代码组织结构

```js
.
├── .github                              
├── .vscode
├── asset
├── benchmark // 基准测试 测试echarts在不同环境下的运行情况
│   ├── dep
│   │   ├── bootstrap
│   │   │   ├── bootstrap.min.css
│   │   │   └── bootstrap.min.js
│   │   ├── filesaver
│   │   │   └── FileSaver.min.js
│   │   ├── jquery
│   │   │   └── jquery-2.2.4.js
│   │   ├── lodash
│   │   │   └── lodash.js
│   │   └── vue
│   │       └── vue.min.js
│   ├── src
│   │   ├── app.js
│   │   ├── testCase.js
│   │   ├── testFactory.js
│   │   └── testManager.js
│   ├── gulpfile.js
│   └── index.html
├── build // build echarts的一些脚本
├── dist // echarts的build产物
├── extension-src // 一些插件的代码 例如百度地图的插件
├── i18n // 一些echarts内部内置的文本的国际化
├── licenses // 开源协议 这里用的BSD-3
│   └── LICENSE-d3
├── src // 核心源码
│   ├── action
│   │   └── roamHelper.ts
│   ├── chart // 一些图表实现
│   │   ├── bar // 柱状图
│   │   │   ├── BarSeries.ts
│   │   │   ├── BarView.ts
│   │   │   ├── BaseBarSeries.ts
│   │   │   ├── install.ts
│   │   │   ├── installPictorialBar.ts
│   │   │   ├── PictorialBarSeries.ts
│   │   │   └── PictorialBarView.ts
│   │   ├── boxplot // 盒须图
│   │   │   ├── boxplotLayout.ts
│   │   │   ├── BoxplotSeries.ts
│   │   │   ├── boxplotTransform.ts
│   │   │   ├── BoxplotView.ts
│   │   │   ├── boxplotVisual.ts
│   │   │   ├── install.ts
│   │   │   └── prepareBoxplotData.ts
│   │   ├── candlestick // k 线图
│   │   │   ├── candlestickLayout.ts
│   │   │   ├── CandlestickSeries.ts
│   │   │   ├── CandlestickView.ts
│   │   │   ├── candlestickVisual.ts
│   │   │   ├── install.ts
│   │   │   └── preprocessor.ts
│   │   ├── custom // 自定义图表
│   │   │   └── install.ts
│   │   ├── effectScatter //特效气泡图
│   │   │   ├── EffectScatterSeries.ts
│   │   │   ├── EffectScatterView.ts
│   │   │   └── install.ts
│   │   ├── funnel // 日历图
│   │   │   ├── funnelLayout.ts
│   │   │   ├── FunnelSeries.ts
│   │   │   ├── FunnelView.ts
│   │   │   └── install.ts
│   │   ├── gauge // 仪表盘
│   │   │   ├── GaugeSeries.ts
│   │   │   ├── GaugeView.ts
│   │   │   ├── install.ts
│   │   │   └── PointerPath.ts
│   │   ├── graph // 图布局
│   │   │   ├── adjustEdge.ts
│   │   │   ├── categoryFilter.ts
│   │   │   ├── categoryVisual.ts
│   │   │   ├── circularLayout.ts
│   │   │   ├── circularLayoutHelper.ts
│   │   │   ├── createView.ts
│   │   │   ├── edgeVisual.ts
│   │   │   ├── forceHelper.ts
│   │   │   ├── forceLayout.ts // 力学图布局
│   │   │   ├── graphHelper.ts
│   │   │   ├── GraphSeries.ts
│   │   │   ├── GraphView.ts
│   │   │   ├── install.ts
│   │   │   ├── simpleLayout.ts
│   │   │   └── simpleLayoutHelper.ts
│   │   ├── heatmap// 热力图
│   │   │   ├── HeatmapLayer.ts
│   │   │   ├── HeatmapSeries.ts
│   │   │   ├── HeatmapView.ts
│   │   │   └── install.ts
│   │   ├── helper // 一些图表辅助器
│   │   │   ├── createClipPathFromCoordSys.ts
│   │   │   ├── createGraphFromNodeEdge.ts
│   │   │   ├── createListFromArray.ts
│   │   │   ├── createListSimply.ts
│   │   │   ├── createRenderPlanner.ts
│   │   │   ├── EffectLine.ts
│   │   │   ├── EffectPolyline.ts
│   │   │   ├── EffectSymbol.ts
│   │   │   ├── enableAriaDecalForTree.ts
│   │   │   ├── labelHelper.ts
│   │   │   ├── LargeLineDraw.ts
│   │   │   ├── LargeSymbolDraw.ts
│   │   │   ├── Line.ts
│   │   │   ├── LineDraw.ts
│   │   │   ├── LinePath.ts
│   │   │   ├── multipleGraphEdgeHelper.ts
│   │   │   ├── pieHelper.ts
│   │   │   ├── Polyline.ts
│   │   │   ├── Symbol.ts
│   │   │   ├── SymbolDraw.ts
│   │   │   ├── treeHelper.ts
│   │   │   └── whiskerBoxCommon.ts
│   │   ├── line // 折线图
│   │   │   ├── helper.ts
│   │   │   ├── install.ts
│   │   │   ├── lineAnimationDiff.ts
│   │   │   ├── LineSeries.ts
│   │   │   ├── LineView.ts
│   │   │   └── poly.ts
│   │   ├── lines // 地图上的 线路图
│   │   │   ├── install.ts
│   │   │   ├── linesLayout.ts
│   │   │   ├── LinesSeries.ts
│   │   │   ├── LinesView.ts
│   │   │   └── linesVisual.ts
│   │   ├── map // 地图
│   │   │   ├── install.ts
│   │   │   ├── mapDataStatistic.ts
│   │   │   ├── MapSeries.ts
│   │   │   ├── mapSymbolLayout.ts
│   │   │   └── MapView.ts
│   │   ├── parallel //平行坐标系 
│   │   │   ├── install.ts
│   │   │   ├── ParallelSeries.ts
│   │   │   ├── ParallelView.ts
│   │   │   └── parallelVisual.ts
│   │   ├── pie // 饼图
│   │   │   ├── install.ts
│   │   │   ├── labelLayout.ts
│   │   │   ├── pieLayout.ts
│   │   │   ├── PieSeries.ts
│   │   │   └── PieView.ts
│   │   ├── radar // 雷达图
│   │   │   ├── backwardCompat.ts
│   │   │   ├── install.ts
│   │   │   ├── radarLayout.ts
│   │   │   ├── RadarSeries.ts
│   │   │   └── RadarView.ts
│   │   ├── sankey // 桑吉图
│   │   │   ├── install.ts
│   │   │   ├── sankeyLayout.ts
│   │   │   ├── SankeySeries.ts
│   │   │   ├── SankeyView.ts
│   │   │   └── sankeyVisual.ts
│   │   ├── scatter // 散点图
│   │   │   ├── install.ts
│   │   │   ├── ScatterSeries.ts
│   │   │   └── ScatterView.ts
│   │   ├── sunburst // 旭日图
│   │   │   ├── install.ts
│   │   │   ├── sunburstAction.ts
│   │   │   ├── sunburstLayout.ts
│   │   │   ├── SunburstPiece.ts
│   │   │   ├── SunburstSeries.ts
│   │   │   ├── SunburstView.ts
│   │   │   └── sunburstVisual.ts
│   │   ├── themeRiver // 主题河流图
│   │   │   ├── install.ts
│   │   │   ├── themeRiverLayout.ts
│   │   │   ├── ThemeRiverSeries.ts
│   │   │   └── ThemeRiverView.ts
│   │   ├── tree // 树图
│   │   │   ├── install.ts
│   │   │   ├── layoutHelper.ts
│   │   │   ├── traversalHelper.ts
│   │   │   ├── treeAction.ts
│   │   │   ├── treeLayout.ts
│   │   │   ├── TreeSeries.ts
│   │   │   ├── TreeView.ts
│   │   │   └── treeVisual.ts
│   │   ├── treemap // 矩形树图
│   │   │   ├── Breadcrumb.ts
│   │   │   ├── install.ts
│   │   │   ├── treemapAction.ts
│   │   │   ├── treemapLayout.ts
│   │   │   ├── TreemapSeries.ts
│   │   │   ├── TreemapView.ts
│   │   │   └── treemapVisual.ts
│   │   ├── bar.ts // 以下均是一些注册函数 将上述图表注册进echarts
│   │   ├── boxplot.ts
│   │   ├── candlestick.ts
│   │   ├── custom.ts
│   │   ├── effectScatter.ts
│   │   ├── funnel.ts
│   │   ├── gauge.ts
│   │   ├── graph.ts
│   │   ├── heatmap.ts
│   │   ├── line.ts
│   │   ├── lines.ts
│   │   ├── map.ts
│   │   ├── parallel.ts
│   │   ├── pictorialBar.ts
│   │   ├── pie.ts
│   │   ├── radar.ts
│   │   ├── sankey.ts
│   │   ├── scatter.ts
│   │   ├── sunburst.ts
│   │   ├── themeRiver.ts
│   │   ├── tree.ts
│   │   └── treemap.ts
│   ├── component // 一些公共组件、模块
│   │   ├── aria // 无障碍模块
│   │   │   ├── install.ts
│   │   │   └── preprocessor.ts
│   │   ├── axis // 坐标轴
│   │   │   ├── AngleAxisView.ts
│   │   │   ├── AxisBuilder.ts
│   │   │   ├── axisSplitHelper.ts
│   │   │   ├── AxisView.ts
│   │   │   ├── CartesianAxisView.ts
│   │   │   ├── parallelAxisAction.ts
│   │   │   ├── ParallelAxisView.ts
│   │   │   ├── RadiusAxisView.ts
│   │   │   └── SingleAxisView.ts
│   │   ├── axisPointer // 坐标轴指示器
│   │   │   ├── AxisPointer.ts
│   │   │   ├── AxisPointerModel.ts
│   │   │   ├── AxisPointerView.ts
│   │   │   ├── axisTrigger.ts
│   │   │   ├── BaseAxisPointer.ts
│   │   │   ├── CartesianAxisPointer.ts
│   │   │   ├── findPointFromSeries.ts
│   │   │   ├── globalListener.ts
│   │   │   ├── install.ts
│   │   │   ├── modelHelper.ts
│   │   │   ├── PolarAxisPointer.ts
│   │   │   ├── SingleAxisPointer.ts
│   │   │   └── viewHelper.ts
│   │   ├── brush // 刷子
│   │   │   ├── BrushModel.ts
│   │   │   ├── BrushView.ts
│   │   │   ├── install.ts
│   │   │   ├── preprocessor.ts
│   │   │   ├── selector.ts
│   │   │   └── visualEncoding.ts
│   │   ├── calendar // 日历坐标组件
│   │   │   ├── CalendarView.ts
│   │   │   └── install.ts
│   │   ├── dataset // 数据集组件
│   │   │   └── install.ts
│   │   ├── dataZoom // 区域缩放组件
│   │   │   ├── AxisProxy.ts
│   │   │   ├── dataZoomAction.ts
│   │   │   ├── DataZoomModel.ts
│   │   │   ├── dataZoomProcessor.ts
│   │   │   ├── DataZoomView.ts
│   │   │   ├── helper.ts
│   │   │   ├── history.ts
│   │   │   ├── InsideZoomModel.ts
│   │   │   ├── InsideZoomView.ts
│   │   │   ├── install.ts
│   │   │   ├── installCommon.ts
│   │   │   ├── installDataZoomInside.ts
│   │   │   ├── installDataZoomSelect.ts
│   │   │   ├── installDataZoomSlider.ts
│   │   │   ├── roams.ts
│   │   │   ├── SelectZoomModel.ts
│   │   │   ├── SelectZoomView.ts
│   │   │   ├── SliderZoomModel.ts
│   │   │   └── SliderZoomView.ts
│   │   ├── geo // 地理信息组件
│   │   │   ├── GeoView.ts
│   │   │   └── install.ts
│   │   ├── graphic // 原生图形元素组件
│   │   │   └── install.ts
│   │   ├── grid // 坐标轴 网格
│   │   │   ├── install.ts
│   │   │   └── installSimple.ts
│   │   ├── helper // 一些辅助器
│   │   │   ├── BrushController.ts
│   │   │   ├── brushHelper.ts
│   │   │   ├── BrushTargetManager.ts
│   │   │   ├── cursorHelper.ts
│   │   │   ├── interactionMutex.ts
│   │   │   ├── listComponent.ts
│   │   │   ├── MapDraw.ts
│   │   │   ├── RoamController.ts
│   │   │   ├── roamHelper.ts
│   │   │   └── sliderMove.ts
│   │   ├── legend // 图例
│   │   │   ├── install.ts
│   │   │   ├── installLegendPlain.ts
│   │   │   ├── installLegendScroll.ts
│   │   │   ├── legendAction.ts
│   │   │   ├── legendFilter.ts
│   │   │   ├── LegendModel.ts
│   │   │   ├── LegendView.ts
│   │   │   ├── scrollableLegendAction.ts
│   │   │   ├── ScrollableLegendModel.ts
│   │   │   └── ScrollableLegendView.ts
│   │   ├── marker // 标记 markerLine markerPoint
│   │   │   ├── installMarkArea.ts
│   │   │   ├── installMarkLine.ts
│   │   │   ├── installMarkPoint.ts
│   │   │   ├── MarkAreaModel.ts
│   │   │   ├── MarkAreaView.ts
│   │   │   ├── markerHelper.ts
│   │   │   ├── MarkerModel.ts
│   │   │   ├── MarkerView.ts
│   │   │   ├── MarkLineModel.ts
│   │   │   ├── MarkLineView.ts
│   │   │   ├── MarkPointModel.ts
│   │   │   └── MarkPointView.ts
│   │   ├── parallel // 平行坐标系
│   │   │   ├── install.ts
│   │   │   └── ParallelView.ts
│   │   ├── polar // 极坐标系
│   │   │   └── install.ts
│   │   ├── radar // 雷达图
│   │   │   ├── install.ts
│   │   │   └── RadarView.ts
│   │   ├── singleAxis // 单一坐标轴
│   │   │   └── install.ts
│   │   ├── timeline // 时间切换器
│   │   │   ├── install.ts
│   │   │   ├── preprocessor.ts
│   │   │   ├── SliderTimelineModel.ts
│   │   │   ├── SliderTimelineView.ts
│   │   │   ├── timelineAction.ts
│   │   │   ├── TimelineAxis.ts
│   │   │   ├── TimelineModel.ts
│   │   │   └── TimelineView.ts
│   │   ├── title // 标题组件
│   │   │   └── install.ts
│   │   ├── toolbox // 工具箱
│   │   │   ├── feature
│   │   │   │   ├── Brush.ts
│   │   │   │   ├── DataView.ts
│   │   │   │   ├── DataZoom.ts
│   │   │   │   ├── MagicType.ts
│   │   │   │   ├── Restore.ts
│   │   │   │   └── SaveAsImage.ts
│   │   │   ├── featureManager.ts
│   │   │   ├── install.ts
│   │   │   ├── ToolboxModel.ts
│   │   │   └── ToolboxView.ts
│   │   ├── tooltip // 提示框
│   │   │   ├── helper.ts
│   │   │   ├── install.ts
│   │   │   ├── seriesFormatTooltip.ts
│   │   │   ├── TooltipHTMLContent.ts
│   │   │   ├── tooltipMarkup.ts
│   │   │   ├── TooltipModel.ts
│   │   │   ├── TooltipRichContent.ts
│   │   │   └── TooltipView.ts
│   │   ├── transform // 数据转换器
│   │   │   ├── filterTransform.ts
│   │   │   ├── install.ts
│   │   │   └── sortTransform.ts
│   │   ├── visualMap // 视觉映射组件
│   │   │   ├── ContinuousModel.ts
│   │   │   ├── ContinuousView.ts
│   │   │   ├── helper.ts
│   │   │   ├── install.ts
│   │   │   ├── installCommon.ts
│   │   │   ├── installVisualMapContinuous.ts
│   │   │   ├── installVisualMapPiecewise.ts
│   │   │   ├── PiecewiseModel.ts
│   │   │   ├── PiecewiseView.ts
│   │   │   ├── preprocessor.ts
│   │   │   ├── typeDefaulter.ts
│   │   │   ├── visualEncoding.ts
│   │   │   ├── visualMapAction.ts
│   │   │   ├── VisualMapModel.ts
│   │   │   └── VisualMapView.ts
│   │   ├── aria.ts // 以下均是一些注册函数 将上述组件注册进echarts 
│   │   ├── axisPointer.ts
│   │   ├── brush.ts
│   │   ├── calendar.ts
│   │   ├── dataset.ts
│   │   ├── dataZoom.ts
│   │   ├── dataZoomInside.ts
│   │   ├── dataZoomSelect.ts
│   │   ├── dataZoomSlider.ts
│   │   ├── geo.ts
│   │   ├── graphic.ts
│   │   ├── grid.ts
│   │   ├── gridSimple.ts
│   │   ├── legend.ts
│   │   ├── legendPlain.ts
│   │   ├── legendScroll.ts
│   │   ├── markArea.ts
│   │   ├── markLine.ts
│   │   ├── markPoint.ts
│   │   ├── parallel.ts
│   │   ├── polar.ts
│   │   ├── radar.ts
│   │   ├── singleAxis.ts
│   │   ├── timeline.ts
│   │   ├── title.ts
│   │   ├── toolbox.ts
│   │   ├── tooltip.ts
│   │   ├── transform.ts
│   │   ├── visualMap.ts
│   │   ├── visualMapContinuous.ts
│   │   └── visualMapPiecewise.ts
│   ├── coord // 一些坐标系布局算法
│   │   ├── calendar // 日历图坐标系
│   │   │   ├── Calendar.ts
│   │   │   ├── CalendarModel.ts
│   │   │   └── prepareCustom.ts
│   │   ├── cartesian // 笛卡尔坐标系
│   │   │   ├── Axis2D.ts
│   │   │   ├── AxisModel.ts
│   │   │   ├── Cartesian.ts
│   │   │   ├── Cartesian2D.ts
│   │   │   ├── cartesianAxisHelper.ts
│   │   │   ├── defaultAxisExtentFromData.ts
│   │   │   ├── Grid.ts
│   │   │   ├── GridModel.ts
│   │   │   └── prepareCustom.ts
│   │   ├── geo // 地理信息坐标系
│   │   │   ├── fix
│   │   │   │   ├── diaoyuIsland.ts
│   │   │   │   ├── geoCoord.ts
│   │   │   │   ├── nanhai.ts
│   │   │   │   └── textCoord.ts
│   │   │   ├── Geo.ts
│   │   │   ├── geoCreator.ts
│   │   │   ├── geoJSONLoader.ts
│   │   │   ├── GeoModel.ts
│   │   │   ├── geoSourceManager.ts
│   │   │   ├── geoSVGLoader.ts
│   │   │   ├── geoTypes.ts
│   │   │   ├── mapDataStorage.ts
│   │   │   ├── parseGeoJson.ts
│   │   │   ├── prepareCustom.ts
│   │   │   └── Region.ts
│   │   ├── parallel // 平行坐标系
│   │   │   ├── AxisModel.ts
│   │   │   ├── Parallel.ts
│   │   │   ├── ParallelAxis.ts
│   │   │   ├── parallelCreator.ts
│   │   │   ├── ParallelModel.ts
│   │   │   └── parallelPreprocessor.ts
│   │   ├── polar // 极坐标系
│   │   │   ├── AngleAxis.ts
│   │   │   ├── AxisModel.ts
│   │   │   ├── Polar.ts
│   │   │   ├── polarCreator.ts
│   │   │   ├── PolarModel.ts
│   │   │   ├── prepareCustom.ts
│   │   │   └── RadiusAxis.ts
│   │   ├── radar // 雷达图坐标系
│   │   │   ├── IndicatorAxis.ts
│   │   │   ├── Radar.ts
│   │   │   └── RadarModel.ts
│   │   ├── single // 单轴坐标系
│   │   │   ├── AxisModel.ts
│   │   │   ├── prepareCustom.ts
│   │   │   ├── Single.ts
│   │   │   ├── SingleAxis.ts
│   │   │   ├── singleAxisHelper.ts
│   │   │   └── singleCreator.ts
│   │   ├── Axis.ts
│   │   ├── AxisBaseModel.ts
│   │   ├── axisCommonTypes.ts
│   │   ├── axisDefault.ts
│   │   ├── axisHelper.ts
│   │   ├── axisModelCommonMixin.ts
│   │   ├── axisModelCreator.ts
│   │   ├── axisTickLabelBuilder.ts
│   │   ├── CoordinateSystem.ts
│   │   ├── scaleRawExtentInfo.ts
│   │   └── View.ts
│   ├── core // 核心代码
│   │   ├── CoordinateSystem.ts
│   │   ├── echarts.ts
│   │   ├── ExtensionAPI.ts
│   │   ├── locale.ts
│   │   ├── Scheduler.ts
│   │   └── task.ts
│   ├── data // 数据处理
│   │   ├── helper // 一些辅助器 类似utils
│   │   │   ├── completeDimensions.ts
│   │   │   ├── createDimensions.ts
│   │   │   ├── dataProvider.ts
│   │   │   ├── dataStackHelper.ts
│   │   │   ├── dataValueHelper.ts
│   │   │   ├── dimensionHelper.ts
│   │   │   ├── linkList.ts
│   │   │   ├── sourceHelper.ts
│   │   │   ├── sourceManager.ts
│   │   │   └── transform.ts
│   │   ├── DataDiffer.ts
│   │   ├── DataDimensionInfo.ts
│   │   ├── Graph.ts
│   │   ├── List.ts
│   │   ├── OrdinalMeta.ts
│   │   ├── Source.ts
│   │   └── Tree.ts
│   ├── export // 这里将一些内置模块和组件抛了出来
│   │   ├── api
│   │   │   ├── format.ts
│   │   │   ├── graphic.ts
│   │   │   ├── helper.ts
│   │   │   ├── number.ts
│   │   │   ├── time.ts
│   │   │   └── util.ts
│   │   ├── all.ts
│   │   ├── api.ts
│   │   ├── charts.ts
│   │   ├── components.ts
│   │   ├── core.ts
│   │   ├── option.ts
│   │   └── renderers.ts
│   ├── i18n // 国际化
│   │   ├── langCS.ts
│   │   ├── langDE.ts
│   │   ├── langEN.ts
│   │   ├── langES.ts
│   │   ├── langFI.ts
│   │   ├── langFR.ts
│   │   ├── langJA.ts
│   │   ├── langTH.ts
│   │   └── langZH.ts
│   ├── label // 标题
│   │   ├── labelGuideHelper.ts
│   │   ├── labelLayoutHelper.ts
│   │   ├── LabelManager.ts
│   │   └── labelStyle.ts
│   ├── layout // 布局
│   │   ├── barGrid.ts
│   │   ├── barPolar.ts
│   │   └── points.ts
│   ├── legacy // 不清楚是啥
│   │   ├── dataSelectAction.ts
│   │   └── getTextRect.ts
│   ├── loading
│   │   └── default.ts
│   ├── model // 一些算不上组件的小型模块
│   │   ├── mixin
│   │   │   ├── areaStyle.ts
│   │   │   ├── dataFormat.ts
│   │   │   ├── itemStyle.ts
│   │   │   ├── lineStyle.ts
│   │   │   ├── makeStyleMapper.ts
│   │   │   ├── palette.ts
│   │   │   └── textStyle.ts
│   │   ├── Component.ts
│   │   ├── Global.ts
│   │   ├── globalDefault.ts
│   │   ├── internalComponentCreator.ts
│   │   ├── Model.ts
│   │   ├── OptionManager.ts
│   │   ├── referHelper.ts
│   │   └── Series.ts
│   ├── preprocessor // 预处理器
│   │   ├── helper
│   │   │   └── compatStyle.ts
│   │   └── backwardCompat.ts
│   ├── processor // 数据处理器
│   │   ├── dataFilter.ts
│   │   ├── dataSample.ts
│   │   └── dataStack.ts
│   ├── renderer // svg和canvas渲染器
│   │   ├── installCanvasRenderer.ts
│   │   └── installSVGRenderer.ts
│   ├── scale // 好像是时间缩放相关
│   │   ├── helper.ts
│   │   ├── Interval.ts
│   │   ├── Log.ts
│   │   ├── Ordinal.ts
│   │   ├── Scale.ts
│   │   └── Time.ts
│   ├── theme // 两套主题
│   │   ├── dark.ts
│   │   └── light.ts
│   ├── util // 一些公共方法
│   │   ├── shape
│   │   │   └── sausage.ts
│   │   ├── animation.ts
│   │   ├── clazz.ts
│   │   ├── component.ts
│   │   ├── conditionalExpression.ts
│   │   ├── decal.ts
│   │   ├── ECEventProcessor.ts
│   │   ├── event.ts
│   │   ├── format.ts
│   │   ├── graphic.ts
│   │   ├── innerStore.ts
│   │   ├── KDTree.ts
│   │   ├── layout.ts
│   │   ├── log.ts
│   │   ├── model.ts
│   │   ├── number.ts
│   │   ├── quickSelect.ts
│   │   ├── states.ts
│   │   ├── styleCompat.ts
│   │   ├── symbol.ts
│   │   ├── throttle.ts
│   │   ├── time.ts
│   │   ├── types.ts
│   │   └── vendor.ts
│   ├── view 
│   │   ├── Chart.ts
│   │   └── Component.ts
│   ├── visual // visual map 相关实现
│   │   ├── aria.ts
│   │   ├── commonVisualTypes.ts
│   │   ├── decal.ts
│   │   ├── helper.ts
│   │   ├── LegendVisualProvider.ts
│   │   ├── style.ts
│   │   ├── symbol.ts
│   │   ├── visualDefault.ts
│   │   ├── VisualMapping.ts
│   │   └── visualSolution.ts
│   ├── .eslintrc.yaml
│   ├── echarts.all.ts // 把所有内置图表挂载在echarts上
│   ├── echarts.blank.ts // 整合统一抛出
│   ├── echarts.common.ts // 抛出echarts的子组件
│   ├── echarts.simple.ts // 把基础图表挂载在echarts上
│   ├── echarts.ts // 入口文件
│   ├── extension.ts // 一些扩展
│   └── global.d.ts
├── test // 一些测试脚本暂不深入
├── theme // 一些内置的主题包
├── .asf.yaml
├── .editorconfig
├── .eslintignore
├── .eslintrc-common.yaml
├── .gitattributes
├── .gitignore
├── .headerignore
├── .huskyrc
├── .jshintrc-dist
├── .lgtm.yml
├── .npmignore
├── CONTRIBUTING.md
├── index.d.ts
├── KEYS
├── LICENSE
├── NOTICE
├── package-lock.json
├── package.json
├── README.md
└── tsconfig.json
```



## 小结

以下统计了`echarts@5.0.2`src下的文件及代码详情。

```shell
Language                     files          blank        comment           code
-------------------------------------------------------------------------------
TypeScript                     519          14654          23507          71969
YAML                             1              3             27             18
-------------------------------------------------------------------------------
SUM:                           520          14657          23534          71987
-------------------------------------------------------------------------------
```


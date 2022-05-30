---
layout: posts
title: ECharts源码解析之focusNodeAdjacency
date: 2020-09-21 16:16:41
updated: 2020-09-21 16:16:41
tags: 
 - 源码解读
 - ECharts源码解析
 - ECharts
 - 可视化
categories: 
 - 学习
 - 源码解读
 - ECharts
---

##  版本：V5.3.2

##  背景

由于SVG Text标签并无`background-*`属性所以要实现文字背景，尤其是圆角矩形的背景相对比较困难，虽然有一定的[方案](https://stackoverflow.com/questions/56172331/svg-text-with-background-color-and-rounded-borders)但仍存在各种各样的局限性，最终表现效果并不理想。反观ECharts则实现的非常完美。通过本文我们简单探究下echarts是如何实现SVG圆角矩形背景的。

![image-20220526100211246](./echarts-svg-background.png)

<!-- more -->

## 简单查看

![image-20220526100734493](./echarts-svg-background-1.png)

通过审查DOM元素简单看下，发现ECharts的实现方案是使用`Path`来绘制一个圆角矩形并放置在`Text`的下方，这种方案有两个难点，一个是各种属性，例如`Padding`,`borderRadius`等如何解析为`Path`的路径属性，二是如何判定文字的大小以及具体坐标，如何准确的将绘制的圆角矩形放置在文字下方。

##  源码

Path:  [/src/chart/sankey/SankeyView.js](https://github.com/apache/incubator-echarts/blob/5e67f6897b4833df1a0be5c7e6ac61b2ecc9a87d/src/chart/sankey/SankeyView.js) 或 [/src/chart/graph/GraphView.js](https://github.com/apache/incubator-echarts/blob/65a68e33446e4c5822054e28ded9091bd0c3bbff/src/chart/graph/GraphView.js)

```javascript

```


##  参考 & 引用

[SVG - Text with background color and rounded borders - Stack Overflow](https://stackoverflow.com/questions/56172331/svg-text-with-background-color-and-rounded-borders)

[css - Background color of text in SVG - Stack Overflow](https://stackoverflow.com/questions/15500894/background-color-of-text-in-svg)

[Examples - Apache ECharts](https://echarts.apache.org/examples/zh/editor.html?c=pie-simple)

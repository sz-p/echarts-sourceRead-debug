---
layout: posts
title: ECharts源码解析之图元拾取
date: 2022-08-12 16:16:41
updated: 2022-08-12 16:16:41
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

##  版本：V5.3.3

##  背景

`ECharts`作为一个配置的图表引擎，同时默认的渲染器又是`Canvas`。如果想要对`ECharts`的某个图元做一些自定义的编辑，如果`ECharts`并有没开发配置项、或者配置项的粒度不够，这时候就会变的比较困难。本文尝试探寻有没有方式可以拾取`ECharts`的图元，拾取之后是否有一定的方式可以针对图元做特定的编辑。


![image-20220813214919165](https://img.sz-p.cn/image-20220813214919165.png)

<!-- more -->

##  方案

### [术语速查手册](https://echarts.apache.org/zh/cheat-sheet.html)方案分析

> 一种走不通的方案，这里简单做下解惑，以免产生【官网是如何实现的】这种疑问。

 简单查了下源码[cheat-sheet.js — apache/echarts-www — GitHub1s](https://github1s.com/apache/echarts-www/blob/HEAD/js/cheat-sheet.js)，发现官网实例的实现方式为：

1. 绘制静态图表
2. 人工分析图元，区域、名称、配置项。
3. 创建对应的`Graphic`(Rect)
4. 给`Graphic`添加必要的事件(覆盖：填充颜色，点击：渲染配置项类型)
5. 基于`ECharts`渲染`Graphic`

#### 结论

由于方案本质为人工分析的静态图表，即不具备推广价值。

### 基于SVG渲染器-自定义标签

既然基于`Canvas`图元拾取相对困难且`ECharts`支持`SVG`渲染器，接下来尝试基于`SVG`Dom元素去做图元拾取。

#### ECharts SVG Dom 分析

![image-20220813234011083](/Users/szp/Desktop/个人/echarts-sourceRead-debug/src/pages/svgRender-add-tag/README.assets/image-20220813234011083.png)

从[SVGRender](https://sz-p.cn/blog/2022/02/21/学习/源码解读/echarts/ECharts源码解析之SVGRender/)中已知，`ECharts`为了使指令转译层尽量单薄仅抽象了三个`svg`标签即`path`,`tspan`,`image`。绝大多数元素都使用path来渲染。

通过探查渲染结果发现`SVG Dom`中未包含任何与配置项相关的属性信息，由于无法判断`path`标签究竟是通过哪个配置项来生成的，这就给图元拾取造成了一定的困扰。

既然`ECharts`渲染的`SVG` `Dom`未包含配置项相关的属性信息，接下来尝试对`ECharts` `Pipeline`进行代码侵入，尝试在构建和渲染过程中使最终结果包含配置项信息。

#### ECharts 待渲染元素属性分析

![image-20220813235226771](/Users/szp/Desktop/个人/echarts-sourceRead-debug/src/pages/svgRender-add-tag/README.assets/image-20220813235226771.png)

通过对`ECharts` 待渲染元素属性进行分析，发现只有最顶层元素包含`__ecComponentInfo`属性。底层元素仍不可知。

#### 结论

![image-20220813235437046](/Users/szp/Desktop/个人/echarts-sourceRead-debug/src/pages/svgRender-add-tag/README.assets/image-20220813235437046.png)

通过对ECharts渲染流程做代码侵入，以获取`Dom`元素通过哪个配置项得来的方式存在理论可行性，但由于`ECharts` 【待渲染元素属性】只有最顶层元素包含配置项信息，所以仅侵入渲染器代码并不能很准确的识别到图元信息。若想扩充【待渲染元素属性】使其底层元素同样包含配置项信息则需要对整个渲染流程做代码侵入，侵入规模将不可控。

### 基于ECharts事件系统的扩充

`ECharts`内部本身包含一套事件系统，提供了`series` 的 `click`,`dbclick`等事件。本方案尝试对`ECharts`的事件系统进行扩充以支持所有元素的回调，并且在回调中抛出具体的图元信息。

#### ECharts 事件系统分析

`ECharts`首先构建了一个`handerProxy`事件代理器将`Dom`的事件代理至`ECharts`内部的元素。当对应的事件触发是会通过`findHover`来获取触发事件的元素，如果元素为非静默模式(`SILENT`)将会在该元素上对事件进行向上冒泡，最终冒泡至`ECharts`对象。`ECharts`对象会根据触发事件的对象来获取`ECharts Data`，如果触发事件的对象确定包含`ECharts Data`则会在最外层的`Dom`上抛出所对应的事件。至此完成整个事件冒泡。

#### ECharts事件对象分析

![image-20220817205659316](/Users/szp/Desktop/个人/echarts-sourceRead-debug/src/pages/svgRender-add-tag/README.assets/image-20220817205659316.png)

#### 结论

殊途同归，`ECharts`事件对象仍是`ECharts` 【待渲染元素属性】。事件对象里不包含图元信息通过改造事件系统同样做不到元素拾取。

### 扩充 ECharts【待渲染元素属性】

本节尝试调研对`ECharts` `Axis`模块进行扩充使其包含 `__ecComponentInfo`属性，对 `Axis`模块的侵入规模以及成本。

#### 新增`__ecComponentInfo`属性

以`Axis name`为例。

有个技巧，可以搜索`.add`方法。`add`方法就是将图源添加进`Group`的动作。在添加之前必然可以获取被添加的图元。人工分析该图元对应的配置项属性，添加`__ecComponentInfo`属性以描述其配置项属性即可。

![image-20220818164452074](/Users/szp/Desktop/个人/echarts-sourceRead-debug/src/pages/svgRender-add-tag/README.assets/image-20220818164452074.png)

#### 改动量

##### ECharts新增`__ecComponentInfo`属性

`Axis`模块涉及五个文件，**14**处改动。

![image-20220818164533625](/Users/szp/Desktop/个人/echarts-sourceRead-debug/src/pages/svgRender-add-tag/README.assets/image-20220818164533625.png)

##### `.d.ts`

根据提示修改即可。

具体过程略。整体规模与新增`__ecComponentInfo`属性所改动的文件大致相同。

##### ZRenderSVG渲染器

> 一个非常粗糙的示例具体内容待商榷

新增添加图元信息到`SVG`属性的方法

```javascript
function setElInforIntoAttrs(el,attrs){
  let infor = ""
  if(el.__ecComponentInfo && el.__ecComponentInfo.mainType){
    infor = el.__ecComponentInfo.mainType
  }
  while(el.parent){
    if(el.parent && el.parent.__ecComponentInfo && el.parent.__ecComponentInfo.mainType){
      if(infor!==''){
        infor+= "-"
      }
      infor += el.parent.__ecComponentInfo.mainType
    }
    el = el.parent
  }
  attrs.elTarget = infor
}
```

在渲染过程中调用`setElInforIntoAttrs`方法

```javascript
export function brushSVGPath(el, scope) {
  ...
  setElInforIntoAttrs(el,attrs)
}
...
export function brushSVGImage(el, scope) {
  ...
  setElInforIntoAttrs(el,attrs)
}
...
export function brushSVGTSpan(el, scope) {
  ...
  setElInforIntoAttrs(el,attrs)
}
```

#### 测试用例

略

#### 结论

对信息的注入不可避免

![image-20220818165902160](/Users/szp/Desktop/个人/echarts-sourceRead-debug/src/pages/svgRender-add-tag/README.assets/image-20220818165902160.png)

## 结论

针对图元拾取：

可行，但对信息的注入不可避免，改动规模较大，对`ECharts`代码进行二次侵入的方式不可行。需`ECharts`团队配合确定新增属性的字段，提交`PR`并合入`ECharts`代码。

针对图元修改：

基于回调的方式，触发`mouseOver`事件或者`click`事件后重新`setOption`的方式修改样式难度过大，且可能存在性能问题。这部分会基于`SVG`渲染器，交由Dom操作来修改。


##  参考 & 引用

[术语速查手册](https://echarts.apache.org/zh/cheat-sheet.html)

[cheat-sheet.js](https://github1s.com/apache/echarts-www/blob/HEAD/js/cheat-sheet.js)

[ECharts源码解析之SVGRender](https://sz-p.cn/blog/2022/02/21/学习/源码解读/echarts/ECharts源码解析之SVGRender/)

# ECharts源码解析之focusNodeAdjacency

## 版本：V4.6.0

## API介绍

[focusNodeAdjacency](https://echarts.apache.org/zh/option.html#series-graph.focusNodeAdjacency)：主要在关系图及桑基图中应用，表示是否在鼠标移到节点上的时候突出显示节点以及节点的边和邻接节点。具体操作为修改其余节点的透明度。

## 背景

设计师认为突出节点时其余点透明度过低，使用该API发现无法修改被忽略节点及连线的透明度。

## 源码

Path:  [/src/chart/sankey/SankeyView.js](https://github.com/apache/incubator-echarts/blob/5e67f6897b4833df1a0be5c7e6ac61b2ecc9a87d/src/chart/sankey/SankeyView.js) 或 [/src/chart/graph/GraphView.js](https://github.com/apache/incubator-echarts/blob/65a68e33446e4c5822054e28ded9091bd0c3bbff/src/chart/graph/GraphView.js)

```javascript
/**
 *
 * 隐藏对象
 * @param {*} item 要隐藏的对象
 * @param {*} opacityPath 获取透明度属性的路径
 * @param {*} opacityRatio 透明度比例
 */
function fadeOutItem(item, opacityPath, opacityRatio) {
  var el = item.getGraphicEl();
  // 根据路径获取透明度
  var opacity = getItemOpacity(item, opacityPath);

  // 计算新的透明度
  if (opacityRatio != null) {
      opacity == null && (opacity = 1);
      opacity *= opacityRatio;
  }

  el.downplay && el.downplay();
  // 写入样式
  el.traverse(function (child) {
      if (!child.isGroup) {
          var opct = child.lineLabelOriginalOpacity;
          if (opct == null || opacityRatio != null) {
              opct = opacity;
          }
          child.setStyle('opacity', opct);
      }
  });
}
/**
 *
 * 显示对象
 * @param {*} item 要显示的对象
 * @param {*} opacityPath 获取透明度属性的路径
 */
function fadeInItem(item, opacityPath) {
  // 这里获取了对象原本的透明度
  var opacity = getItemOpacity(item, opacityPath);
  var el = item.getGraphicEl();
  // Should go back to normal opacity first, consider hoverLayer,
  // where current state is copied to elMirror, and support
  // emphasis opacity here.
  el.traverse(function (child) {
      !child.isGroup && child.setStyle('opacity', opacity);
  });
  el.highlight && el.highlight();
}
/**
 * 聚焦节点及邻接
 *
 * @param {*} seriesModel:ExtendedClass
 * @param {*} ecModel:ExtendedClass
 * @param {*} api:ExtensionAPI
 * @param {*} payload:Object
 * @returns
 */
focusNodeAdjacency: function (seriesModel, ecModel, api, payload) {
  var data = seriesModel.getData();
  var graph = data.graph;
  var dataIndex = payload.dataIndex;
  var edgeDataIndex = payload.edgeDataIndex;

  var node = graph.getNodeByIndex(dataIndex);
  var edge = graph.getEdgeByIndex(edgeDataIndex);

  if (!node && !edge) {
      return;
  }

  // 隐藏所有Node对象
  graph.eachNode(function (node) {
      // 这里调了一个 MagicNumber 0.1 所以真的无法修改
      fadeOutItem(node, nodeOpacityPath, 0.1);
  });
  // 隐藏所有Edge对象
  graph.eachEdge(function (edge) {
      fadeOutItem(edge, lineOpacityPath, 0.1);
  });


  if (node) {
    fadeInItem(node, hoverNodeOpacityPath);
    var focusNodeAdj = itemModel.get('focusNodeAdjacency');
    // 这里根据输入的参数分了几种情况 对 选中的节点恢复原本的透明度
    if (focusNodeAdj === 'outEdges') {
        zrUtil.each(node.outEdges, function (edge) {
            if (edge.dataIndex < 0) {
                return;
            }
            // 显示对象
            fadeInItem(edge, hoverLineOpacityPath);
            fadeInItem(edge.node2, hoverNodeOpacityPath);
        });
    }
    else if (focusNodeAdj === 'inEdges') {
        zrUtil.each(node.inEdges, function (edge) {
            if (edge.dataIndex < 0) {
                return;
            }
            fadeInItem(edge, hoverLineOpacityPath);
            fadeInItem(edge.node1, hoverNodeOpacityPath);
        });
    }
    else if (focusNodeAdj === 'allEdges') {
        zrUtil.each(node.edges, function (edge) {
            if (edge.dataIndex < 0) {
                return;
            }
            fadeInItem(edge, hoverLineOpacityPath);
            (edge.node1 !== node) && fadeInItem(edge.node1, hoverNodeOpacityPath);
            (edge.node2 !== node) && fadeInItem(edge.node2, hoverNodeOpacityPath);
        });
    }
  }
  if (edge) {
    fadeInItem(edge, hoverLineOpacityPath);
    fadeInItem(edge.node1, hoverNodeOpacityPath);
    fadeInItem(edge.node2, hoverNodeOpacityPath);
  }
}
```


## 小结

由于魔数的存在所以真的无法修改。

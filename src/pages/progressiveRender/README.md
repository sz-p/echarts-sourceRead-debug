# ECharts源码解析之渐进渲染

## 版本：V5.0.2

## 背景

`ECharts`在大规模数据渲染下采用了**多层画布**技术，对于背景元素、数据元素、交互提示类元素做分层处理对于样式稳定的元素单独绘制，不再重绘。用于性能优化。

`ECharts`如何去实现**多层画布**的？我们尝试从`ECharts`的源码中来一探究竟。

![image-20211018022203998](./echarts-canvasLayer-1.png)

![image-20211018022308673](./echarts-canvasLayer-2.png)

![image-20211018022338439](./echarts-canvasLayer-3.png)

![image-20211018022407968](./echarts-canvasLayer-4.png)

## 定位实现代码

过程不再赘述,这里只是将具体文件列出。

[canvas.ts](https://github1s.com/ecomfe/zrender/blob/HEAD/src/canvas/canvas.ts)： `zrender` 的 `canvas`渲染器。

[Painter.ts](https://github1s.com/ecomfe/zrender/blob/HEAD/src/canvas/Painter.ts)：渲染器的输出装置。

[Layer.ts](https://github1s.com/ecomfe/zrender/blob/HEAD/src/canvas/Layer.ts)：图层类。

## 核心逻辑

[Painter.ts](https://github1s.com/ecomfe/zrender/blob/HEAD/src/canvas/Painter.ts)：渲染器的输出装置。这里创建了各个层并在这里确定了各个层有哪些元素。

```typescript
_updateLayerStatus(list: Displayable[]/* 待渲染的元素集合 */) {

    this.eachBuiltinLayer(function (layer, z) {
        layer.__dirty = layer.__used = false;
    });
    
    function updatePrevLayer(idx: number) {
        if (prevLayer) {
            if (prevLayer.__endIndex !== idx) {
                prevLayer.__dirty = true;
            }
            // 这里确定了上一个图层内最后一个元素的下标。
            prevLayer.__endIndex = idx;
        }
    }

    if (this._singleCanvas) {
        for (let i = 1; i < list.length; i++) {
            const el = list[i];
            if (el.zlevel !== list[i - 1].zlevel || el.incremental) {
                this._needsManuallyCompositing = true;
                break;
            }
        }
    }

    let prevLayer: Layer = null;
    let incrementalLayerCount = 0;
    let prevZlevel;
    let i;
    
    // list 即为要渲染的element(图形元素)列表。
    for (i = 0; i < list.length; i++) {
        const el = list[i];
        // el 内部其实并未维护zlevel信息（均为0）
        // 但维护了 incremental 信息
        const zlevel = el.zlevel;
        let layer;

        if (prevZlevel !== zlevel) {
            prevZlevel = zlevel;
            incrementalLayerCount = 0;
        }

        // TODO Not use magic number on zlevel.
        // Each layer with increment element can be separated to 3 layers.
        //          (Other Element drawn after incremental element)
        // -----------------zlevel + EL_AFTER_INCREMENTAL_INC--------------------
        //                      (Incremental element)
        // ----------------------zlevel + INCREMENTAL_INC------------------------
        //              (Element drawn before incremental element)
        // --------------------------------zlevel--------------------------------
        
        // this.getLayer 会根据ID返回图层，如果无该图层则会创建图层并返回
        // 如果el.incremental为true则创建新的图层
        if (el.incremental) {
            layer = this.getLayer(zlevel + INCREMENTAL_INC /* 0.001 */, this._needsManuallyCompositing);
            layer.incremental = true;
            incrementalLayerCount = 1;
        }
        // incremental 元素之后的元素 将会在下一个图层创建。
        else {
            layer = this.getLayer(
                zlevel + (incrementalLayerCount > 0 ? EL_AFTER_INCREMENTAL_INC /* 0.01 */ : 0),
                this._needsManuallyCompositing
            );
        }
        // 以上将图层分为了三层，el.incremental的图层以及 el.incremental之前和之后的图层
        // el.incremental图层即增量数据图层
        if (!layer.__builtin__) {
            util.logError('ZLevel ' + zlevel + ' has been used by unkown layer ' + layer.id);
        }

        if (layer !== prevLayer) {
            layer.__used = true;
            if (layer.__startIndex !== i) {
                layer.__dirty = true;
            }
            // 这里确定了当前图层一个元素的下标。
            // 结合 updatePrevLayer(i) 更新上一个图层，
            // 确定了所有图层要渲染[待渲染的元素集合]中的哪一部分。
            layer.__startIndex = i;
            if (!layer.incremental) {
                layer.__drawIndex = i;
            }
            else {
                // Mark layer draw index needs to update.
                layer.__drawIndex = -1;
            }
            updatePrevLayer(i);
            prevLayer = layer;
        }
        if ((el.__dirty & REDRAW_BIT) && !el.__inHover) {  // Ignore dirty elements in hover layer.
            layer.__dirty = true;
            if (layer.incremental && layer.__drawIndex < 0) {
                // Start draw from the first dirty element.
                layer.__drawIndex = i;
            }
        }
    }

    updatePrevLayer(i);

    this.eachBuiltinLayer(function (layer, z) {
        // Used in last frame but not in this frame. Needs clear
        if (!layer.__used && layer.getElementCount() > 0) {
            layer.__dirty = true;
            layer.__startIndex = layer.__endIndex = layer.__drawIndex = 0;
        }
        // For incremental layer. In case start index changed and no elements are dirty.
        if (layer.__dirty && layer.__drawIndex < 0) {
            layer.__drawIndex = layer.__startIndex;
        }
    });
}
```



[LargeSymbolDraw.ts]([LargeSymbolDraw.ts - apache/echarts - GitHub1s](https://github1s.com/apache/echarts/blob/HEAD/src/chart/helper/LargeSymbolDraw.ts#L225-L226))：在数据量大时，采用了`IncrementalDisplayable`类来区分图层。

```typescript
incrementalPrepareUpdate(data: SeriesData) {
    this.group.removeAll();

    this._clearIncremental();
    // Only use incremental displayables when data amount is larger than 2 million.
    // PENDING Incremental data?
    // 在数据量大时，采用了IncrementalDisplayable类来区分图层。
    if (data.count() > 2e6) {
        if (!this._incremental) {
            this._incremental = new IncrementalDisplayable({
                silent: true
            });
        }
        this.group.add(this._incremental);
    }
    else {
        this._incremental = null;
    }
}
```

[IncrementalDisplayable.ts](https://github1s.com/ecomfe/zrender/blob/HEAD/src/graphic/IncrementalDisplayable.ts#L18)：确定了元素的`incremental = true`

```typescript
export default class IncrementalDisplayable extends Displayble {

    notClear: boolean = true

    incremental = true

    private _displayables: Displayble[] = []
    private _temporaryDisplayables: Displayble[] = []
    
    ...
    
}
```

## 总结 

在数据量小时，`ECharts`仍然采用单图层渲染。在数据量大时`ECharts`采用了标记增量数据所表示的图形的方式，来区分，数据元素、数据之前的元素、数据之后的元素。并由此分为三层`canvas`来渲染。


## 参考 & 引用

[IncrementalDisplayable.ts - ecomfe/zrender - GitHub1s](https://github1s.com/ecomfe/zrender/blob/HEAD/src/graphic/IncrementalDisplayable.ts#L18-L25)

[LargeSymbolDraw.ts - apache/echarts - GitHub1s](https://github1s.com/apache/echarts/blob/HEAD/src/chart/helper/LargeSymbolDraw.ts)

[installCanvasRenderer.ts - apache/echarts - GitHub1s](https://github1s.com/apache/echarts/blob/HEAD/src/renderer/installCanvasRenderer.ts)

[宿爽 - 16毫秒的挑战_图表库渲染优化](https://www.bilibili.com/video/BV1344y1y7mY?from=search&seid=10961982352971093195&spm_id_from=333.337.0.0)

[Examples - Apache ECharts](https://echarts.apache.org/examples/zh/editor.html?c=scatter-large)

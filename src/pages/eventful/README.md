---

layout: posts
title: ECharts源码解析事件系统
date: 2022-08-17 16:16:41
updated: 2022-08-17 16:16:41
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

本文浅析`ECharts`的事件系统是如何工作的，点击一个`series`之后，`ECharts`是如何执行的回调方法，非`series`元素是否可以设置事件，事件回调又是如何做性能优化的。

![eventful](https://img.sz-p.cn/niceExtent-1.png)

<!-- more -->

### 源码

#### 事件代理

[zrender.ts —zrender.ts#L127-L128](https://github1s.com/ecomfe/zrender/blob/HEAD/src/zrender.ts#L127-L128)

在zrender的构造函数中 注册了事件代理

```typescript
constructor(id: number, dom?: HTMLElement, opts?: ZRenderInitOpt) {
  ...
  // 在zrender的构造函数中 注册了事件代理
  const handerProxy = (!env.node && !env.worker && !ssrMode)
    ? new HandlerProxy(painter.getViewportRoot(), painter.root)
  : null;
  this.handler = new Handler(storage, painter, handerProxy, painter.root);
  ...
}
```

[HandlerProxy.ts#L593-L594](https://github1s.com/ecomfe/zrender/blob/HEAD/src/dom/HandlerProxy.ts#L593)

在事件代理中装载了本地事件的监听

```typescript
export default class HandlerDomProxy extends Eventful {
    ... 
    constructor(dom: HTMLElement, painterRoot: HTMLElement) {
        ···
        // 
        this._localHandlerScope = new DOMHandlerScope(dom, localDOMHandlers);
        ...
        // 在事件代理中装载了本地事件的监听
        mountLocalDOMEventListeners(this, this._localHandlerScope);
        ...
    }
    ...
}
```

[HandlerProxy.ts#L419-L420](https://github1s.com/ecomfe/zrender/blob/HEAD/src/dom/HandlerProxy.ts#L419-L420)

将`DOM`的鼠标或触摸事件全部代理至图形元素上

```typescript
// 事件名称列表
const localNativeListenerNames = (function () {
    const mouseHandlerNames = [
        'click', 'dblclick', 'mousewheel', 'wheel', 'mouseout',
        'mouseup', 'mousedown', 'mousemove', 'contextmenu'
    ];
    const touchHandlerNames = [
        'touchstart', 'touchend', 'touchmove'
    ];
    const pointerEventNameMap = {
        pointerdown: 1, pointerup: 1, pointermove: 1, pointerout: 1
    };
    const pointerHandlerNames = zrUtil.map(mouseHandlerNames, function (name) {
        const nm = name.replace('mouse', 'pointer');
        return pointerEventNameMap.hasOwnProperty(nm) ? nm : name;
    });

    return {
        mouse: mouseHandlerNames,
        touch: touchHandlerNames,
        pointer: pointerHandlerNames
    };
})();
// 装载本地DOM事件监听器
function mountLocalDOMEventListeners(instance: HandlerDomProxy, scope: DOMHandlerScope) {
  ...
  zrUtil.each(localNativeListenerNames.pointer, function (nativeEventName) {
    mountSingleDOMEventListener(scope, nativeEventName, function (event) {
      // markTriggeredFromLocal(event);
      domHandlers[nativeEventName].call(instance, event);
    });
  });
  ...
}
// 装载单个事件
function mountSingleDOMEventListener(
    scope: DOMHandlerScope,
    nativeEventName: string,
    listener: EventListener,
    opt?: boolean | AddEventListenerOptions
) {
    scope.mounted[nativeEventName] = listener;
    scope.listenerOpts[nativeEventName] = opt;
    addEventListener(scope.domTarget, nativeEventName, listener, opt);
}
// 事件回调列表
const localDOMHandlers: DomHandlersMap = {
  ... 
  mousedown(event: ZRRawEvent) {
    event = normalizeEvent(this.dom, event);

    this.__mayPointerCapture = [event.zrX, event.zrY];

    this.trigger('mousedown', event);
  },

  mousemove(event: ZRRawEvent) {
    event = normalizeEvent(this.dom, event);

    const downPoint = this.__mayPointerCapture;
    if (downPoint && (event.zrX !== downPoint[0] || event.zrY !== downPoint[1])) {
      this.__togglePointerCapture(true);
    }

    this.trigger('mousemove', event);
  }
  ...
};

```

#### 事件分发

[HandlerProxy.ts#L192-L193](https://github1s.com/ecomfe/zrender/blob/HEAD/src/dom/HandlerProxy.ts#L192-L193)

具体的事件触发

```typescript
// 事件回调列表
const localDOMHandlers: DomHandlersMap = {
  
  ... 
  mousedown(event: ZRRawEvent) {
    // 对事件对象做了个格式化，使坐标信息之类更符合图表内场景。 
    event = normalizeEvent(this.dom, event);

    this.__mayPointerCapture = [event.zrX, event.zrY];

    this.trigger('mousedown', event);
  },

  mousemove(event: ZRRawEvent) {
    event = normalizeEvent(this.dom, event);

    const downPoint = this.__mayPointerCapture;
    if (downPoint && (event.zrX !== downPoint[0] || event.zrY !== downPoint[1])) {
      this.__togglePointerCapture(true);
    }

    this.trigger('mousemove', event);
  }
  ...
};
```

[Eventful.ts#L208-L209](https://github1s.com/ecomfe/zrender/blob/HEAD/src/core/Eventful.ts#L208-L209)

触发事件

```typescript
trigger<EvtNm extends keyof EvtDef>(
  eventType: EvtNm,
  ...args: Parameters<EvtDef[EvtNm]>
  ): this {
    if (!this._$handlers) {
      return this;
    }
    
    // 获取 事件对应的回调列表
    const _h = this._$handlers[eventType as string];
    const eventProcessor = this._$eventProcessor;

    if (_h) {
      // 获取参数的长度
      const argLen = args.length;

      const len = _h.length;
      for (let i = 0; i < len; i++) {
        const hItem = _h[i];
        if (eventProcessor
            && eventProcessor.filter
            && hItem.query != null
            && !eventProcessor.filter(eventType, hItem.query)
           ) {
          continue;
        }

        // 触发事件所对应的具体回调
        switch (argLen) {
          case 0:
            hItem.h.call(hItem.ctx);
            break;
          case 1:
            hItem.h.call(hItem.ctx, args[0]);
            break;
          case 2:
            hItem.h.call(hItem.ctx, args[0], args[1]);
            break;
          default:
            // have more than 2 given arguments
            hItem.h.apply(hItem.ctx, args);
            break;
        }
      }
    }

    eventProcessor && eventProcessor.afterTrigger
    && eventProcessor.afterTrigger(eventType);

    return this;
  }
```

通用事件
```typescript
util.each(['click', 'mousedown', 'mouseup', 'mousewheel', 'dblclick', 'contextmenu'], function (name: HandlerName) {
    Handler.prototype[name] = function (event) {
        const x = event.zrX;
        const y = event.zrY;
        const isOutside = isOutsideBoundary(this, x, y);

        let hovered;
        let hoveredTarget;

        if (name !== 'mouseup' || !isOutside) {
            // 再次查找悬停以避免手动调度单击事件。或者在没有鼠标悬停的情况下触发单击
            // 这里给予findHover找到了最终触发事件的元素 
            // findHover 相关解析 见 参考 & 引用 findHover
            hovered = this.findHover(x, y);
            hoveredTarget = hovered.target;
        }

        if (name === 'mousedown') {
            this._downEl = hoveredTarget;
            this._downPoint = [event.zrX, event.zrY];
            this._upEl = hoveredTarget;
        }
        else if (name === 'mouseup') {
            this._upEl = hoveredTarget;
        }
        else if (name === 'click') {
            if (this._downEl !== this._upEl
                || !this._downPoint
                || vec2.dist(this._downPoint, [event.zrX, event.zrY]) > 4
            ) {
                return;
            }
            this._downPoint = null;
        }
        // 分发事件
        // 这里 将 事件对象、事件名称、事件属性 分发至了具体的对象
        this.dispatchToElement(hovered, name, event);
    };
});
```

事件对象确认

[Handler.ts#L337-L338](https://github1s.com/ecomfe/zrender/blob/HEAD/src/Handler.ts#L337-L338)

```typescript
findHover(x: number, y: number, exclude?: Displayable): HoveredResult {
  const list = this.storage.getDisplayList();
  const out = new HoveredResult(x, y);

  for (let i = list.length - 1; i >= 0; i--) {
    let hoverCheckResult;
    if (list[i] !== exclude
        && !list[i].ignore
        && (hoverCheckResult = isHover(list[i], x, y))
       ) {
      !out.topTarget && (out.topTarget = list[i]);
      // 顶层元素如果不是 静默状态 则抛出 target 对象
      if (hoverCheckResult !== SILENT) {
        out.target = list[i];
        break;
      }
    }
  }

  return out;
}
```

事件分发

```typescript
/**
  * 事件分发代理
  *
  * @private
  * @param {Object} targetInfo {target, topTarget} 目标图形元素
  * @param {string} eventName 事件名称
  * @param {Object} event 事件对象
  */
dispatchToElement(targetInfo: {
                  target?: Element
                  topTarget?: Element
                  }, eventName: ElementEventName, event: ZRRawEvent) {

  targetInfo = targetInfo || {};

  let el = targetInfo.target as Element;
  if (el && el.silent) {
    return;
  }
  const eventKey = ('on' + eventName) as ElementEventNameWithOn;
  const eventPacket = makeEventPacket(eventName, targetInfo, event);

  while (el) {
    el[eventKey]
    && (eventPacket.cancelBubble = !!el[eventKey].call(el, eventPacket));
    
    // 将事件分发至具体的元素
    el.trigger(eventName, eventPacket);

    // 不断的将事件向上传播 最终传播至echarts对象。
    el = el.__hostTarget ? el.__hostTarget : el.parent;

    if (eventPacket.cancelBubble) {
      break;
    }
  }

  if (!eventPacket.cancelBubble) {
    // 冒泡到顶级 zrender 对象
    this.trigger(eventName, eventPacket);
    // 分发事件到用户自定义层
    // 用户有可能在全局 click 事件中 dispose，所以需要判断下 painter 是否存在
    if (this.painter && (this.painter as CanvasPainter).eachOtherLayer) {
      (this.painter as CanvasPainter).eachOtherLayer(function (layer) {
        if (typeof (layer[eventKey]) === 'function') {
          layer[eventKey].call(layer, eventPacket);
        }
        if (layer.trigger) {
          layer.trigger(eventName, eventPacket);
        }
      });
    }
  }
}
```

#### 回调执行

[echarts.ts#L1045-L1152](https://github1s.com/apache/echarts/blob/HEAD/src/core/echarts.ts#L1045-L1152)

```typescript
private _initEvents(): void {
  each(MOUSE_EVENT_NAMES, (eveName) => {
  const handler = (e: ElementEvent) => {
    ...
    else {
      el && findEventDispatcher(el, (parent) => {
        // 根据el来获取echartsData
        const ecData = getECData(parent);
        if (ecData && ecData.dataIndex != null) {
          const dataModel = ecData.dataModel || ecModel.getSeriesByIndex(ecData.seriesIndex);
          params = (
            dataModel && dataModel.getDataParams(ecData.dataIndex, ecData.dataType) || {}
          ) as ECElementEvent;
          return true;
        }
        //对象包含自定义的事件Data
        else if (ecData.eventData) {
          params = extend({}, ecData.eventData) as ECElementEvent;
          return true;
        }
      }, true);
    }
    if (params) {
      ...
      // 执行最终的回调
      this.trigger(eveName, params);
      ...
    }
  };
  ... 
}
```

## 小结

`ECharts`首先构建了一个`handerProxy`事件代理器将`Dom`的事件代理至`ECharts`内部的元素。当对应的事件触发是会通过`findHover`来获取触发事件的元素，如果元素为非静默模式(`SILENT`)将会在该元素上对事件进行向上冒泡，最终冒泡至`ECharts`对象。`ECharts`对象会根据触发事件的对象来获取`ECharts Data`，如果触发事件的对象确定包含`ECharts Data`则会在最外层的`Dom`上抛出所对应的事件。至此完成整个事件冒泡。


##  参考 & 引用

[ECharts源码解析之图形选择(FindHover)](https://sz-p.cn/blog/2021/07/23/学习/源码解读/echarts/ECharts源码解析之FindHover/)


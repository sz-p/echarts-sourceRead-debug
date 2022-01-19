---
layout: posts
title: ECharts源码解析之SVG渲染器
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

ECharts底层渲染引擎为[zrender](https://github.com/ecomfe/zrender)。`zrender`的默认渲染器为`canvas`。但同时支持`svg`渲染。本文通过一个简单的饼图示例来简单探究下`echarts`或`zrender`是如何实现同时支持`canvas`和`svg`渲染的。


![image-20220526100211246](./echarts-svg-background.png)

<!-- more -->

##  源码

Path: [/src/svg/Painter.ts](https://github1s.com/ecomfe/zrender/blob/HEAD/src/svg/Painter.ts#L220-L275),

```typescript
// 这里将 待渲染的元素做了渲染
_paintList(list: Displayable[], scope: BrushScope, out?: SVGVNode[]) {
    const listLen = list.length;

    const clipPathsGroupsStack: SVGVNode[] = [];
    let clipPathsGroupsStackDepth = 0;
    let currentClipPathGroup;
    let prevClipPaths: Path[];
    let clipGroupNodeIdx = 0;
    for (let i = 0; i < listLen; i++) {
        const displayable = list[i];
        if (!displayable.invisible) {
            const clipPaths = displayable.__clipPaths;
            const len = clipPaths && clipPaths.length || 0;
            const prevLen = prevClipPaths && prevClipPaths.length || 0;
            let lca;
            // Find the lowest common ancestor
            for (lca = Math.max(len - 1, prevLen - 1); lca >= 0; lca--) {
                if (clipPaths && prevClipPaths
                    && clipPaths[lca] === prevClipPaths[lca]
                ) {
                    break;
                }
            }
            // pop the stack
            for (let i = prevLen - 1; i > lca; i--) {
                clipPathsGroupsStackDepth--;
                // svgEls.push(closeGroup);
                currentClipPathGroup = clipPathsGroupsStack[clipPathsGroupsStackDepth - 1];
            }
            // Pop clip path group for clipPaths not match the previous.
            for (let i = lca + 1; i < len; i++) {
                const groupAttrs: SVGVNodeAttrs = {};
                setClipPath(
                    clipPaths[i],
                    groupAttrs,
                    scope
                );
                const g = createVNode(
                    'g',
                    'clip-g-' + clipGroupNodeIdx++,
                    groupAttrs,
                    []
                );
                (currentClipPathGroup ? currentClipPathGroup.children : out).push(g);
                clipPathsGroupsStack[clipPathsGroupsStackDepth++] = g;
                currentClipPathGroup = g;
            }
            prevClipPaths = clipPaths;
            // 这里在渲染待渲染的元素
            const ret = brush(displayable, scope);
            if (ret) {
                (currentClipPathGroup ? currentClipPathGroup.children : out).push(ret);
            }
        }
    }
}
```
Path:[/src/svg/graphic.ts](https://github1s.com/ecomfe/zrender/blob/HEAD/src/svg/graphic.ts#L327-L328)

```typescript
// 这里将待渲染的元素分为了三类 path image 和 tspan
// 由于echarts本身是基于canvas在渲染 所以 这里将大多数元素都作为path来渲染了
// 将moveTo lineTo等命令解析成 svg 的 path属性相对容易
export function brush(el: Displayable, scope: BrushScope): SVGVNode {
    if (el instanceof Path) {
        return brushSVGPath(el, scope);
    }
    else if (el instanceof ZRImage) {
        return brushSVGImage(el, scope);
    }
    else if (el instanceof TSpan) {
        return brushSVGTSpan(el, scope);
    }
}
```

Path:[/src/svg/graphic.ts](https://github1s.com/ecomfe/zrender/blob/HEAD/src/svg/graphic.ts#L149-L150)

```typescript
// 这里在渲染SVG的Path
export function brushSVGPath(el: Path, scope: BrushScope) {
    const style = el.style;
    const shape = el.shape;
    const builtinShpDef = buitinShapesDef[el.type];
    const attrs: SVGVNodeAttrs = {};
    const needsAnimate = scope.animation;
    let svgElType = 'path';
    const strokePercent = el.style.strokePercent;
    const precision = (scope.compress && getPathPrecision(el)) || 4;
    // Using SVG builtin shapes if possible
    if (builtinShpDef
        // Force to use path if it will update later.
        // To avoid some animation(like morph) fail
        && !scope.willUpdate
        && !(builtinShpDef[1] && !builtinShpDef[1](shape))
        // use `path` to simplify the animate element creation logic.
        && !(needsAnimate && hasShapeAnimation(el))
        && !(strokePercent < 1)
    ) {
        svgElType = el.type;
        const mul = Math.pow(10, precision);
        builtinShpDef[0](shape, attrs, mul);
    }
    else {
        if (!el.path) {
            el.createPathProxy();
        }
        const path = el.path;

        if (el.shapeChanged()) {
            // 这里在创建了Path canvas 指令数组
            path.beginPath();
            el.buildPath(path, el.shape);
            el.pathUpdated();
        }
        const pathVersion = path.getVersion();
        const elExt = el as PathWithSVGBuildPath;

        let svgPathBuilder = elExt.__svgPathBuilder;
        if (elExt.__svgPathVersion !== pathVersion
            || !svgPathBuilder
            || strokePercent !== elExt.__svgPathStrokePercent
        ) {
            if (!svgPathBuilder) {
                svgPathBuilder = elExt.__svgPathBuilder = new SVGPathRebuilder();
            }
            svgPathBuilder.reset(precision);
            // 这里将 canvas 的指令数组 转译成了 svg Path的d属性
            path.rebuildPath(svgPathBuilder, strokePercent);
            svgPathBuilder.generateStr();
            elExt.__svgPathVersion = pathVersion;
            elExt.__svgPathStrokePercent = strokePercent;
        }

        attrs.d = svgPathBuilder.getStr();
    }

    setTransform(attrs, el.transform);
    setStyleAttrs(attrs, style, el, scope);

    scope.animation && createCSSAnimation(el, attrs, scope);

    return createVNode(svgElType, el.id + '', attrs);
}
```

Path: [/src/graphic/shape/Rect.ts](https://github1s.com/ecomfe/zrender/blob/HEAD/src/graphic/shape/Rect.ts#L30-L31)

```typescript
// 这里在创建 Path
buildPath(ctx: CanvasRenderingContext2D, shape: RectShape) {
    let x: number;
    let y: number;
    let width: number;
    let height: number;

    if (this.subPixelOptimize) {
        const optimizedShape = subPixelOptimizeRect(subPixelOptimizeOutputShape, shape, this.style);
        x = optimizedShape.x;
        y = optimizedShape.y;
        width = optimizedShape.width;
        height = optimizedShape.height;
        optimizedShape.r = shape.r;
        shape = optimizedShape;
    }
    else {
        x = shape.x;
        y = shape.y;
        width = shape.width;
        height = shape.height;
    }

    if (!shape.r) {
        ctx.rect(x, y, width, height);
    }
    else {
        // 这里在创建 圆角矩形的Path
        roundRectHelper.buildPath(ctx, shape);
    }
}
```

Path:[/src/graphic/helper/roundRect.ts](https://github1s.com/ecomfe/zrender/blob/HEAD/src/graphic/helper/roundRect.ts#L3-L88)

```typescript
// 这里在创建圆角矩形的path
export function buildPath(ctx: CanvasRenderingContext2D | PathProxy, shape: {
    x: number
    y: number
    width: number
    height: number
    r?: number | number[]
}) {
    let x = shape.x;
    let y = shape.y;
    let width = shape.width;
    let height = shape.height;
    let r = shape.r;
    let r1;
    let r2;
    let r3;
    let r4;

    // Convert width and height to positive for better borderRadius
    if (width < 0) {
        x = x + width;
        width = -width;
    }
    if (height < 0) {
        y = y + height;
        height = -height;
    }

    if (typeof r === 'number') {
        r1 = r2 = r3 = r4 = r;
    }
    else if (r instanceof Array) {
        if (r.length === 1) {
            r1 = r2 = r3 = r4 = r[0];
        }
        else if (r.length === 2) {
            r1 = r3 = r[0];
            r2 = r4 = r[1];
        }
        else if (r.length === 3) {
            r1 = r[0];
            r2 = r4 = r[1];
            r3 = r[2];
        }
        else {
            r1 = r[0];
            r2 = r[1];
            r3 = r[2];
            r4 = r[3];
        }
    }
    else {
        r1 = r2 = r3 = r4 = 0;
    }

    let total;
    if (r1 + r2 > width) {
        total = r1 + r2;
        r1 *= width / total;
        r2 *= width / total;
    }
    if (r3 + r4 > width) {
        total = r3 + r4;
        r3 *= width / total;
        r4 *= width / total;
    }
    if (r2 + r3 > height) {
        total = r2 + r3;
        r2 *= height / total;
        r3 *= height / total;
    }
    if (r1 + r4 > height) {
        total = r1 + r4;
        r1 *= height / total;
        r4 *= height / total;
    }
    // 这里在执行 构建圆角矩形的指令
    ctx.moveTo(x + r1, y);
    ctx.lineTo(x + width - r2, y);
    r2 !== 0 && ctx.arc(x + width - r2, y + r2, r2, -Math.PI / 2, 0);
    ctx.lineTo(x + width, y + height - r3);
    r3 !== 0 && ctx.arc(x + width - r3, y + height - r3, r3, 0, Math.PI / 2);
    ctx.lineTo(x + r4, y + height);
    r4 !== 0 && ctx.arc(x + r4, y + height - r4, r4, Math.PI / 2, Math.PI);
    ctx.lineTo(x, y + r1);
    r1 !== 0 && ctx.arc(x + r1, y + r1, r1, Math.PI, Math.PI * 1.5);
}
```

Path: [/src/core/PathProxy.ts](https://github1s.com/ecomfe/zrender/blob/HEAD/src/core/PathProxy.ts)

```typescript
// 由于 PathProxy 的指令较多 这里只拿moveTo来举例
moveTo(x: number, y: number) {
    // Add pending point for previous path.
    this._drawPendingPt();

    this.addData(CMD.M, x, y);
    this._ctx && this._ctx.moveTo(x, y);

    // x0, y0, xi, yi 是记录在 _dashedXXXXTo 方法中使用
    // xi, yi 记录当前点, x0, y0 在 closePath 的时候回到起始点。
    // 有可能在 beginPath 之后直接调用 lineTo，这时候 x0, y0 需要
    // 在 lineTo 方法中记录，这里先不考虑这种情况，dashed line 也只在 IE10- 中不支持
    this._x0 = x;
    this._y0 = y;

    this._xi = x;
    this._yi = y;

    return this;
}
/**
 * 填充 Path 数据。
 * 尽量复用而不申明新的数组。大部分图形重绘的指令数据长度都是不变的。
 */
addData(
    cmd: number,
    a?: number,
    b?: number,
    c?: number,
    d?: number,
    e?: number,
    f?: number,
    g?: number,
    h?: number
) {
    if (!this._saveData) {
        return;
    }

    let data = this.data;
    if (this._len + arguments.length > data.length) {
        // 因为之前的数组已经转换成静态的 Float32Array
        // 所以不够用时需要扩展一个新的动态数组
        this._expandData();
        data = this.data;
    }
    for (let i = 0; i < arguments.length; i++) {
        // 这里复写了 data 中的指令行
        data[this._len++] = arguments[i];
    }
}
// 指令集
// const CMD = {  M: 1,  L: 2,  C: 3,  Q: 4,  A: 5,  Z: 6, R: 7};

// 构建 canvas path 指令集 的结果举例：
// [  1,  16,  -16,  2,  37.40794372558594,  -16,  5,  37.40794372558594,  0,  16,  16,  4.71238898038469,  1.5707963267948966,  0,  1,  2,  53.40794372558594,  0,  5,  37.40794372558594,  0,  16,  16,  0,  1.5707963267948966,  0,  1,  2,  16,  16,  5,  16,  0,  16,  16,  1.5707963267948966,  1.5707963267948966,  0,  1,  2,  0,  0,  5,  16,  0,  16,  16,  3.141592653589793,  1.5707963267948966,  0,  1 ]

// 翻译为 svg path 的 d 属性为
// [  "M16 -16",  "L37.4079 -16",  "A16 16 0 0 1 53.4079 0",  "L53.4079 0",  "A16 16 0 0 1 37.4079 16",  "L16 16",  "A16 16 0 0 1 0 0",  "L0 0",  "A16 16 0 0 1 16 -16"]
```

Path: [/src/core/PathProxy.ts](https://github1s.com/ecomfe/zrender/blob/HEAD/src/core/PathProxy.ts#L728-L729)

```typescript
// 这里的 ctx 已经不是类 canvas 的 ctx 而是类Svg的ctx
  rebuildPath(ctx: PathRebuilder, percent: number) {
      const d = this.data;
      const ux = this._ux;
      const uy = this._uy;
      const len = this._len;
      let x0;
      let y0;
      let xi;
      let yi;
      let x;
      let y;

      const drawPart = percent < 1;
      let pathSegLen;
      let pathTotalLen;
      let accumLength = 0;
      let segCount = 0;
      let displayedLength;

      let pendingPtDist = 0;
      let pendingPtX: number;
      let pendingPtY: number;


      if (drawPart) {
          if (!this._pathSegLen) {
              this._calculateLength();
          }
          pathSegLen = this._pathSegLen;
          pathTotalLen = this._pathLen;
          displayedLength = percent * pathTotalLen;

          if (!displayedLength) {
              return;
          }
      }
      // 这里在遍历指令集
      lo: for (let i = 0; i < len;) {
          const cmd = d[i++];
          const isFirst = i === 1;

          if (isFirst) {
              // 如果第一个命令是 L, C, Q
              // 则 previous point 同绘制命令的第一个 point
              // 第一个命令为 Arc 的情况下会在后面特殊处理
              xi = d[i];
              yi = d[i + 1];

              x0 = xi;
              y0 = yi;
          }
          // Only lineTo support ignoring small segments.
          // Otherwise if the pending point should always been flushed.
          if (cmd !== CMD.L && pendingPtDist > 0) {
              ctx.lineTo(pendingPtX, pendingPtY);
              pendingPtDist = 0;
          }
          switch (cmd) {
              case CMD.M:
                  x0 = xi = d[i++];
                  y0 = yi = d[i++];
                  // 这里调用了svg的ctx的moveTo
                  ctx.moveTo(xi, yi);
                  break;
              case CMD.L: {
                  x = d[i++];
                  y = d[i++];
                  const dx = mathAbs(x - xi);
                  const dy = mathAbs(y - yi);
                  // Not draw too small seg between
                  if (dx > ux || dy > uy) {
                      if (drawPart) {
                          const l = pathSegLen[segCount++];
                          if (accumLength + l > displayedLength) {
                              const t = (displayedLength - accumLength) / l;
                              ctx.lineTo(xi * (1 - t) + x * t, yi * (1 - t) + y * t);
                              break lo;
                          }
                          accumLength += l;
                      }

                      ctx.lineTo(x, y);
                      xi = x;
                      yi = y;
                      pendingPtDist = 0;
                  }
                  else {
                      const d2 = dx * dx + dy * dy;
                      // Only use the farthest pending point.
                      if (d2 > pendingPtDist) {
                          pendingPtX = x;
                          pendingPtY = y;
                          pendingPtDist = d2;
                      }
                  }
                  break;
              }
              case CMD.C: {
                  const x1 = d[i++];
                  const y1 = d[i++];
                  const x2 = d[i++];
                  const y2 = d[i++];
                  const x3 = d[i++];
                  const y3 = d[i++];
                  if (drawPart) {
                      const l = pathSegLen[segCount++];
                      if (accumLength + l > displayedLength) {
                          const t = (displayedLength - accumLength) / l;
                          cubicSubdivide(xi, x1, x2, x3, t, tmpOutX);
                          cubicSubdivide(yi, y1, y2, y3, t, tmpOutY);
                          ctx.bezierCurveTo(tmpOutX[1], tmpOutY[1], tmpOutX[2], tmpOutY[2], tmpOutX[3], tmpOutY[3]);
                          break lo;
                      }
                      accumLength += l;
                  }

                  ctx.bezierCurveTo(x1, y1, x2, y2, x3, y3);
                  xi = x3;
                  yi = y3;
                  break;
              }
              case CMD.Q: {
                  const x1 = d[i++];
                  const y1 = d[i++];
                  const x2 = d[i++];
                  const y2 = d[i++];

                  if (drawPart) {
                      const l = pathSegLen[segCount++];
                      if (accumLength + l > displayedLength) {
                          const t = (displayedLength - accumLength) / l;
                          quadraticSubdivide(xi, x1, x2, t, tmpOutX);
                          quadraticSubdivide(yi, y1, y2, t, tmpOutY);
                          ctx.quadraticCurveTo(tmpOutX[1], tmpOutY[1], tmpOutX[2], tmpOutY[2]);
                          break lo;
                      }
                      accumLength += l;
                  }

                  ctx.quadraticCurveTo(x1, y1, x2, y2);
                  xi = x2;
                  yi = y2;
                  break;
              }
              case CMD.A:
                  const cx = d[i++];
                  const cy = d[i++];
                  const rx = d[i++];
                  const ry = d[i++];
                  let startAngle = d[i++];
                  let delta = d[i++];
                  const psi = d[i++];
                  const anticlockwise = !d[i++];
                  const r = (rx > ry) ? rx : ry;
                  // const scaleX = (rx > ry) ? 1 : rx / ry;
                  // const scaleY = (rx > ry) ? ry / rx : 1;
                  const isEllipse = mathAbs(rx - ry) > 1e-3;
                  let endAngle = startAngle + delta;
                  let breakBuild = false;

                  if (drawPart) {
                      const l = pathSegLen[segCount++];
                      if (accumLength + l > displayedLength) {
                          endAngle = startAngle + delta * (displayedLength - accumLength) / l;
                          breakBuild = true;
                      }
                      accumLength += l;
                  }
                  if (isEllipse && ctx.ellipse) {
                      ctx.ellipse(cx, cy, rx, ry, psi, startAngle, endAngle, anticlockwise);
                  }
                  else {
                      ctx.arc(cx, cy, r, startAngle, endAngle, anticlockwise);
                  }

                  if (breakBuild) {
                      break lo;
                  }

                  if (isFirst) {
                      // 直接使用 arc 命令
                      // 第一个命令起点还未定义
                      x0 = mathCos(startAngle) * rx + cx;
                      y0 = mathSin(startAngle) * ry + cy;
                  }
                  xi = mathCos(endAngle) * rx + cx;
                  yi = mathSin(endAngle) * ry + cy;
                  break;
              case CMD.R:
                  x0 = xi = d[i];
                  y0 = yi = d[i + 1];

                  x = d[i++];
                  y = d[i++];
                  const width = d[i++];
                  const height = d[i++];

                  if (drawPart) {
                      const l = pathSegLen[segCount++];
                      if (accumLength + l > displayedLength) {
                          let d = displayedLength - accumLength;
                          ctx.moveTo(x, y);
                          ctx.lineTo(x + mathMin(d, width), y);
                          d -= width;
                          if (d > 0) {
                              ctx.lineTo(x + width, y + mathMin(d, height));
                          }
                          d -= height;
                          if (d > 0) {
                              ctx.lineTo(x + mathMax(width - d, 0), y + height);
                          }
                          d -= width;
                          if (d > 0) {
                              ctx.lineTo(x, y + mathMax(height - d, 0));
                          }
                          break lo;
                      }
                      accumLength += l;
                  }
                  ctx.rect(x, y, width, height);
                  break;
              case CMD.Z:
                  if (drawPart) {
                      const l = pathSegLen[segCount++];
                      if (accumLength + l > displayedLength) {
                          const t = (displayedLength - accumLength) / l;
                          ctx.lineTo(xi * (1 - t) + x0 * t, yi * (1 - t) + y0 * t);
                          break lo;
                      }
                      accumLength += l;
                  }

                  ctx.closePath();
                  xi = x0;
                  yi = y0;
          }
      }
  }
```

Path: [/src/svg/SVGPathRebuilder.ts](https://github1s.com/ecomfe/zrender/blob/HEAD/src/svg/SVGPathRebuilder.ts#L27-L29)

```typescript
// 由于 SVGPathRebuilder 的指令较多 这里只拿moveTo来举例
moveTo(x: number, y: number) {
    this._add('M', x, y);
}
_add(cmd: string, a?: number, b?: number, c?: number, d?: number, e?: number, f?: number, g?: number, h?: number) {
    const vals = [];
    const p = this._p;
    for (let i = 1; i < arguments.length; i++) {
        const val = arguments[i];
        if (isNaN(val)) {
            this._invalid = true;
            return;
        }
        // 这里svg指令集中新增了新的指令
        vals.push(Math.round(val * p) / p);
    }
    this._d.push(cmd + vals.join(' '));
    this._start = cmd === 'Z';
}
```

Path: [/src/svg/core.ts](https://github1s.com/ecomfe/zrender/blob/HEAD/src/svg/core.ts#L26)
```typescript
// 这里渲染了 svg 标签
export function createVNode(
    tag: string,
    key: string,
    attrs?: SVGVNodeAttrs,
    children?: SVGVNode[],
    text?: string
): SVGVNode {
    return {
        tag,
        attrs: attrs || {},
        children,
        text,
        key
    };
}
```

## 小结

在使用`svg`进行渲染时首先对元素的类型进行了区分，以使用不同的`svg`标签，这里为了使指令转译层尽量单薄仅抽象了三个`svg`标签即`path`,`tspan`,`image`。绝大多数元素都使用path来渲染。

`zrender`在`canvas`的API之上抽象了一层指令层例如将`moveTo(x, y)`,`lineTo(x1, y1)`等抽象为了`[1,x,y,2,x1,y1]`。

在使用`canvas`渲染时直接将指令层解析成指令进行渲染。

在使用`svg`渲染时首先`svg渲染器`实现了一道`canvas like`的api。渲染之前会首先调用这个api时会构建对应的`svg`标签属性。之后会基于`svg`的标签和属性进行正常的`svg`元素渲染。


##  参考 & 引用

[SVG - Text with background color and rounded borders - Stack Overflow](https://stackoverflow.com/questions/56172331/svg-text-with-background-color-and-rounded-borders)

[css - Background color of text in SVG - Stack Overflow](https://stackoverflow.com/questions/15500894/background-color-of-text-in-svg)

[Examples - Apache ECharts](https://echarts.apache.org/examples/zh/editor.html?c=pie-simple)

---
layout: posts
title: ECharts源码解析之文字包围盒
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

由于SVG Text标签并无`background-*`属性所以要实现文字背景相对比较困难，`ECharts`实现`Text`的方案是基于`Text`的外层包围盒，来绘制矩形实现文字背景的。 通过本文我们简单探究下echarts是如何实现获取`Text`的包围盒的。

![image-20220526100211246](./echarts-svg-background.png)

<!-- more -->

##  源码
Path: [/src/contain/text.ts](https://github1s.com/ecomfe/zrender/blob/HEAD/src/contain/text.ts#L50-L51)

```typescript
/**
 *
 * Get bounding rect for outer usage. Compatitable with old implementation
 * Which includes text newline.
 */
export function getBoundingRect(
    text: string,
    font: string,
    textAlign?: TextAlign,
    textBaseline?: TextVerticalAlign
) {
    const textLines = ((text || '') + '').split('\n');
    const len = textLines.length;
    //  区分单行和多行文字
    if (len === 1) {
        return innerGetBoundingRect(textLines[0], font, textAlign, textBaseline);
    }
    else {
        const uniondRect = new BoundingRect(0, 0, 0, 0);
        for (let i = 0; i < textLines.length; i++) {
            const rect = innerGetBoundingRect(textLines[i], font, textAlign, textBaseline);
            i === 0 ? uniondRect.copy(rect) : uniondRect.union(rect);
        }
        return uniondRect;
    }
}

/**
 *
 * Get bounding rect for inner usage(TSpan)
 * Which not include text newline.
 */
export function innerGetBoundingRect(
    text: string,
    font: string,
    textAlign?: TextAlign,
    textBaseline?: TextVerticalAlign
): BoundingRect {
    // 获取 宽高信息
    const width = getWidth(text, font);
    const height = getLineHeight(font);

    // 获取xy信息
    const x = adjustTextX(0, width, textAlign);
    const y = adjustTextY(0, height, textBaseline);

    // 写入外层包围盒
    const rect = new BoundingRect(x, y, width, height);

    return rect;
}

export function getWidth(text: string, font: string): number {
    font = font || DEFAULT_FONT;
    let cacheOfFont = textWidthCache[font];
    if (!cacheOfFont) {
        cacheOfFont = textWidthCache[font] = new LRU(500);
    }
    let width = cacheOfFont.get(text);
    if (width == null) {
        //这里在计算宽度
        width = platformApi.measureText(text, font).width;
        cacheOfFont.put(text, width);
    }

    return width;
}

// 这个计算高度的方式挺诡异 但似乎有效
export function getLineHeight(font?: string): number {
    // FIXME A rough approach.
    return getWidth('国', font);
}

export function adjustTextX(x: number, width: number, textAlign: TextAlign): number {
    // TODO Right to left language
    if (textAlign === 'right') {
        x -= width;
    }
    else if (textAlign === 'center') {
        x -= width / 2;
    }
    return x;
}

export function adjustTextY(y: number, height: number, verticalAlign: TextVerticalAlign): number {
    if (verticalAlign === 'middle') {
        y -= height / 2;
    }
    else if (verticalAlign === 'bottom') {
        y -= height;
    }
    return y;
}
```

Path: [/core/platform.ts](https://github1s.com/ecomfe/zrender/blob/HEAD/src/core/platform.ts)

```typescript
  measureText: (function () {
      let _ctx: CanvasRenderingContext2D;
      let _cachedFont: string;
      return (text: string, font?: string) => {
          if (!_ctx) {
              const canvas = platformApi.createCanvas();
              _ctx = canvas && canvas.getContext('2d');
          }
          if (_ctx) {
              if (_cachedFont !== font) {
                  _cachedFont = _ctx.font = font || DEFAULT_FONT;
              }
              // 这里使用了 canvas 的 measureText API来获取text的宽度
              return _ctx.measureText(text);
          }
          else {
              text = text || '';
              font = font || DEFAULT_FONT;
              // Use font size if there is no other method can be used.
              const res = /^([0-9]*?)px$/.exec(font);
              const fontSize = +(res && res[1]) || DEFAULT_FONT_SIZE;
              let width = 0;
              if (font.indexOf('mono') >= 0) {   // is monospace
                  width = fontSize * text.length;
              }
              else {
                  for (let i = 0; i < text.length; i++) {
                      const preCalcWidth = DEFAULT_TEXT_WIDTH_MAP[text[i]];
                      width += preCalcWidth == null ? fontSize : (preCalcWidth * fontSize);
                  }
              }
              return { width };
          }
      };
  })(),
```

## 小结

`SVG`下`Text`宽高计算本质上还是使用`Canvas`的方式来计算的。

`Text`的宽度计算是基于`canvas`的`measureText`API来实现的。高度计算是计算了一个类矩形文字的宽度来实现的(这里采用了'国'字)。`X，Y`的计算则依赖了`Text`本身的位置以及左右和上下对齐的方式来重新计算的。

##  参考 & 引用

[SVG - Text with background color and rounded borders - Stack Overflow](https://stackoverflow.com/questions/56172331/svg-text-with-background-color-and-rounded-borders)

[css - Background color of text in SVG - Stack Overflow](https://stackoverflow.com/questions/15500894/background-color-of-text-in-svg)

[Examples - Apache ECharts](https://echarts.apache.org/examples/zh/editor.html?c=pie-simple)

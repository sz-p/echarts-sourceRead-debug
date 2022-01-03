# ECharts源码解析之autoLabelLayout

## 版本：V5.1.1

## 背景

饼图、折线图、柱状图、矩形树图等图表都可能采用**标签**来展示详细数据。但在大数据量下针对不同的图表可能存在(包含但不仅限)如下情况:

1. 饼图要防止标签的位置已存在标签，需要对当前待绘制的标签移动位置以防止重叠。
2. 折线图数据间隔过短导致标签重叠，需要间隔显示。
3. 矩形树图数据块太小无法容纳标签需要隐藏。

面对上述情况应该如何应对？我们尝试从ECharts的源码中来一探究竟。

## 结论

### 饼图

饼图的`label`防重大致步骤如下：

1. 根据饼图的**半径**,**指示线的长度**初步计算标签的位置。
2. 分左右处理标签的重叠问题
3. 在垂直方向将标签在可用空间内无重叠分布
4. 如果无重叠分布后所需空间大于可用空间则均匀分布
5. 分上下分别计算所需空间与标签半径(饼图的半径加指示线的长度)的大小以较大的作为长轴，标签半径作为短轴构建椭圆。
6. 将标签均匀分布在椭圆方程上
7. 渲染时候如果标签仍会与已有标签重叠则隐藏该部分标签，如果标签文字的长度大于标签的空间大小则对标签文字进行截断

### 折线图与矩形树图

折线图与矩形树图则相对简单，只经过了对标签的简单布局以及[LabelManager.ts](https://github1s.com/apache/echarts/blob/master/src/label/LabelManager.ts)中对仍重叠的标签的隐藏处理，即饼图防重中的步骤7。

> 以下不再体现折线图与矩形树图的具体过程。

## 定位实现代码

### 饼图

过程不再赘述,这里只是将具体文件列出。

[labelLayout.ts](https://github.com/apache/echarts/blob/master/src/chart/pie/labelLayout.ts)： 饼图`label`布局模块。

[LabelManager.ts](https://github1s.com/apache/echarts/blob/master/src/label/LabelManager.ts): label的渲染模块

[labelLayoutHelper.ts](https://github1s.com/apache/echarts/blob/master/src/label/labelLayoutHelper.ts#L232): 一些标签布局的通用方法

## 核心逻辑

### 饼图

```typescript
// 隐藏仍然重叠的部分
export function hideOverlap(labelList: LabelLayoutInfo[]) {
    const displayedLabels: LabelLayoutInfo[] = [];

    // TODO, render overflow visible first, put in the displayedLabels.
    labelList.sort(function (a, b) {
        return b.priority - a.priority;
    });

    const globalRect = new BoundingRect(0, 0, 0, 0);

    function hideEl(el: Element) {
        if (!el.ignore) {
            // Show on emphasis.
            const emphasisState = el.ensureState('emphasis');
            if (emphasisState.ignore == null) {
                emphasisState.ignore = false;
            }
        }

        el.ignore = true;
    }

    for (let i = 0; i < labelList.length; i++) {
        const labelItem = labelList[i];
        const isAxisAligned = labelItem.axisAligned;
        const localRect = labelItem.localRect;
        const transform = labelItem.transform;
        const label = labelItem.label;
        const labelLine = labelItem.labelLine;
        globalRect.copy(labelItem.rect);
        // Add a threshold because layout may be aligned precisely.
        globalRect.width -= 0.1;
        globalRect.height -= 0.1;
        globalRect.x += 0.05;
        globalRect.y += 0.05;

        let obb = labelItem.obb;
        let overlapped = false;
        for (let j = 0; j < displayedLabels.length; j++) {
            const existsTextCfg = displayedLabels[j];
            // Fast rejection.
            if (!globalRect.intersect(existsTextCfg.rect)) {
                continue;
            }

            if (isAxisAligned && existsTextCfg.axisAligned) {   // Is overlapped
                overlapped = true;
                break;
            }

            if (!existsTextCfg.obb) { // If self is not axis aligned. But other is.
                existsTextCfg.obb = new OrientedBoundingRect(existsTextCfg.localRect, existsTextCfg.transform);
            }

            if (!obb) { // If self is axis aligned. But other is not.
                obb = new OrientedBoundingRect(localRect, transform);
            }

            if (obb.intersect(existsTextCfg.obb)) {
                overlapped = true;
                break;
            }
        }

        // TODO Callback to determine if this overlap should be handled?
        if (overlapped) {
            hideEl(label);
            labelLine && hideEl(labelLine);
        }
        else {
            label.attr('ignore', labelItem.defaultAttr.ignore);
            labelLine && labelLine.attr('ignore', labelItem.defaultAttr.labelGuideIgnore);

            displayedLabels.push(labelItem);
        }
    }
}
interface LabelLayout {
    label: ZRText
    labelLine: Polyline
    position: PieSeriesOption['label']['position']
    len: number
    len2: number
    minTurnAngle: number
    maxSurfaceAngle: number
    surfaceNormal: Point
    linePoints: VectorArray[]
    textAlign: HorizontalAlign
    labelDistance: number
    labelAlignTo: PieSeriesOption['label']['alignTo']
    edgeDistance: number
    bleedMargin: PieSeriesOption['label']['bleedMargin']
    rect: BoundingRect
    /**
     * user-set style.width.
     * This is useful because label.style.width might be changed
     * by constrainTextWidth.
     */
    labelStyleWidth: number
    unconstrainedWidth: number
    targetTextWidth?: number
}

function adjustSingleSide(
    list: LabelLayout[],
    cx: number,
    cy: number,
    r: number,
    dir: -1 | 1,
    viewWidth: number,
    viewHeight: number,
    viewLeft: number,
    viewTop: number,
    farthestX: number// 最左或最右的坐标
) {
    if (list.length < 2) {
        return;
    }

    interface SemiInfo {
        list: LabelLayout[]
        rB: number
        maxY: number
    };

    function recalculateXOnSemiToAlignOnEllipseCurve(semi: SemiInfo) {
        const rB = semi.rB;
        const rB2 = rB * rB;
        for (let i = 0; i < semi.list.length; i++) {
            const item = semi.list[i];
            const dy = Math.abs(item.label.y - cy);
            // 水平r始终与原始r相同，因为x不变。
            const rA = r + item.len;
            const rA2 = rA * rA;
            // 使用椭圆隐式函数计算x
            const dx = Math.sqrt((1 - Math.abs(dy * dy / rB2)) * rA2);
            const newX = cx + (dx + item.len2) * dir;
            const deltaX = newX - item.label.x;
            const newTargetWidth = item.targetTextWidth - deltaX * dir;
            // 标签的横坐标已更改，因此需要重新计算宽度。
            constrainTextWidth(item, newTargetWidth, true);
            item.label.x = newX;
        }
    }

    // 根据移动的y调整X。使紧标签在椭圆曲线上对齐。
    function recalculateX(items: LabelLayout[]) {
        // Extremes of
        const topSemi = { list: [], maxY: 0} as SemiInfo;
        const bottomSemi = { list: [], maxY: 0 } as SemiInfo;

        for (let i = 0; i < items.length; i++) {
            if (items[i].labelAlignTo !== 'none') {
                continue;
            }
            const item = items[i];
            const semi = item.label.y > cy ? bottomSemi : topSemi;
            const dy = Math.abs(item.label.y - cy);
            if (dy >= semi.maxY) {
                const dx = item.label.x - cx - item.len2 * dir;
                // 短轴长度 即水平长度不变 恒为半径加指示线长度
                const rA = r + item.len;
                // 根据最高和最低数据来计算 长轴长
                const rB = Math.abs(dx) < rA
                    ? Math.sqrt(dy * dy / (1 - dx * dx / rA / rA))
                    : rA;
                semi.rB = rB;
                semi.maxY = dy;
            }
            semi.list.push(item);
        }

        recalculateXOnSemiToAlignOnEllipseCurve(topSemi);
        recalculateXOnSemiToAlignOnEllipseCurve(bottomSemi);
    }

    const len = list.length;
    for (let i = 0; i < len; i++) {
        if (list[i].position === 'outer' && list[i].labelAlignTo === 'labelLine') {
            // 距离最外侧的距离
            const dx = list[i].label.x - farthestX;
            list[i].linePoints[1][0] += dx;
            list[i].label.x = farthestX;
        }
    }

    if (shiftLayoutOnY(list, viewTop, viewTop + viewHeight)) {
        recalculateX(list);
    }
}

function avoidOverlap(
    labelLayoutList: LabelLayout[],
    cx: number,
    cy: number,
    r: number,
    viewWidth: number,
    viewHeight: number,
    viewLeft: number,
    viewTop: number
) {
    const leftList = [];
    const rightList = [];
    let leftmostX = Number.MAX_VALUE;
    let rightmostX = -Number.MAX_VALUE;
    // 对标签区分了左右，并计算了最靠左和最靠右的坐标
    for (let i = 0; i < labelLayoutList.length; i++) {
        const label = labelLayoutList[i].label;
        if (isPositionCenter(labelLayoutList[i])) {
            continue;
        }
        if (label.x < cx) {
            leftmostX = Math.min(leftmostX, label.x);
            leftList.push(labelLayoutList[i]);
        }
        else {
            rightmostX = Math.max(rightmostX, label.x);
            rightList.push(labelLayoutList[i]);
        }
    }

    // 这里根据剩余的空间和当前的标签布局信息重新计算了标签实际的宽度
    for (let i = 0; i < labelLayoutList.length; i++) {
        const layout = labelLayoutList[i];
        if (!isPositionCenter(layout) && layout.linePoints) {
            if (layout.labelStyleWidth != null) {
                continue;
            }

            const label = layout.label;
            const linePoints = layout.linePoints;

            let targetTextWidth;
            if (layout.labelAlignTo === 'edge') {
                if (label.x < cx) {
                    targetTextWidth = linePoints[2][0] - layout.labelDistance
                            - viewLeft - layout.edgeDistance;
                }
                else {
                    targetTextWidth = viewLeft + viewWidth - layout.edgeDistance
                            - linePoints[2][0] - layout.labelDistance;
                }
            }
            else if (layout.labelAlignTo === 'labelLine') {
                if (label.x < cx) {
                    targetTextWidth = leftmostX - viewLeft - layout.bleedMargin;
                }
                else {
                    targetTextWidth = viewLeft + viewWidth - rightmostX - layout.bleedMargin;
                }
            }
            else {
                if (label.x < cx) {
                    targetTextWidth = label.x - viewLeft - layout.bleedMargin;
                }
                else {
                    targetTextWidth = viewLeft + viewWidth - label.x - layout.bleedMargin;
                }
            }
            layout.targetTextWidth = targetTextWidth;

            constrainTextWidth(layout, targetTextWidth);
        }
    }

    // 对左右两边分别进行重布局
    adjustSingleSide(rightList, cx, cy, r, 1, viewWidth, viewHeight, viewLeft, viewTop, rightmostX);
    adjustSingleSide(leftList, cx, cy, r, -1, viewWidth, viewHeight, viewLeft, viewTop, leftmostX);

    // 根据新的坐标重写了 标签指示线的节点坐标
    for (let i = 0; i < labelLayoutList.length; i++) {
        const layout = labelLayoutList[i];
        if (!isPositionCenter(layout) && layout.linePoints) {
            const label = layout.label;
            const linePoints = layout.linePoints;
            const isAlignToEdge = layout.labelAlignTo === 'edge';
            const padding = label.style.padding as number[];
            const paddingH = padding ? padding[1] + padding[3] : 0;
            // textRect.width already contains paddingH if bgColor is set
            const extraPaddingH = label.style.backgroundColor ? 0 : paddingH;
            const realTextWidth = layout.rect.width + extraPaddingH;
            const dist = linePoints[1][0] - linePoints[2][0];
            if (isAlignToEdge) {
                if (label.x < cx) {
                    linePoints[2][0] = viewLeft + layout.edgeDistance + realTextWidth + layout.labelDistance;
                }
                else {
                    linePoints[2][0] = viewLeft + viewWidth - layout.edgeDistance
                            - realTextWidth - layout.labelDistance;
                }
            }
            else {
                if (label.x < cx) {
                    linePoints[2][0] = label.x + layout.labelDistance;
                }
                else {
                    linePoints[2][0] = label.x - layout.labelDistance;
                }
                linePoints[1][0] = linePoints[2][0] + dist;
            }
            linePoints[1][1] = linePoints[2][1] = label.y;
        }
    }
}

/**
 * Set max width of each label, and then wrap each label to the max width.
 *
 * @param layout label layout
 * @param availableWidth max width for the label to display
 * @param forceRecalculate recaculate the text layout even if the current width
 * is smaller than `availableWidth`. This is useful when the text was previously
 * wrapped by calling `constrainTextWidth` but now `availableWidth` changed, in
 * which case, previous wrapping should be redo.
 */
function constrainTextWidth(
    layout: LabelLayout,
    availableWidth: number,
    forceRecalculate: boolean = false
) {
    if (layout.labelStyleWidth != null) {
        // User-defined style.width has the highest priority.
        return;
    }

    const label = layout.label;
    const style = label.style;
    const textRect = layout.rect;
    const bgColor = style.backgroundColor;
    const padding = style.padding as number[];
    const paddingH = padding ? padding[1] + padding[3] : 0;
    const overflow = style.overflow;

    // textRect.width already contains paddingH if bgColor is set
    const oldOuterWidth = textRect.width + (bgColor ? 0 : paddingH);
    if (availableWidth < oldOuterWidth || forceRecalculate) {
        const oldHeight = textRect.height;
        if (overflow && overflow.match('break')) {
            // Temporarily set background to be null to calculate
            // the bounding box without backgroud.
            label.setStyle('backgroundColor', null);
            // Set constraining width
            label.setStyle('width', availableWidth - paddingH);

            // This is the real bounding box of the text without padding
            const innerRect = label.getBoundingRect();

            label.setStyle('width', Math.ceil(innerRect.width));
            label.setStyle('backgroundColor', bgColor);
        }
        else {
            const availableInnerWidth = availableWidth - paddingH;
            const newWidth = availableWidth < oldOuterWidth
                // Current text is too wide, use `availableWidth` as max width.
                ? availableInnerWidth
                : (
                    // Current available width is enough, but the text may have
                    // already been wrapped with a smaller available width.
                    forceRecalculate
                        ? (availableInnerWidth > layout.unconstrainedWidth
                            // Current available is larger than text width,
                            // so don't constrain width (otherwise it may have
                            // empty space in the background).
                            ? null
                            // Current available is smaller than text width, so
                            // use the current available width as constraining
                            // width.
                            : availableInnerWidth
                        )
                    // Current available width is enough, so no need to
                    // constrain.
                    : null
                );
            label.setStyle('width', newWidth);
        }

        const newRect = label.getBoundingRect();
        textRect.width = newRect.width;
        const margin = (label.style.margin || 0) + 2.1;
        textRect.height = newRect.height + margin;
        textRect.y -= (textRect.height - oldHeight) / 2;
    }
}

function isPositionCenter(sectorShape: LabelLayout) {
    // Not change x for center label
    return sectorShape.position === 'center';
}

/**
 * 饼图的标签布局
 *
 * @export
 * @param {PieSeriesModel} seriesModel seriesModel
 */
export default function pieLabelLayout(
    seriesModel: PieSeriesModel
) {
    // 这里及一下几行代码
    // 从 seriesModel 获取了计算标签布局所必要的信息
    const data = seriesModel.getData();
    const labelLayoutList: LabelLayout[] = [];
    let cx;
    let cy;
    let hasLabelRotate = false;
    const minShowLabelRadian = (seriesModel.get('minShowLabelAngle') || 0) * RADIAN;
    const viewRect = data.getLayout('viewRect') as RectLike;
    const r = data.getLayout('r') as number;

    // 容器宽高
    const viewWidth = viewRect.width;
    const viewLeft = viewRect.x;
    const viewTop = viewRect.y;
    const viewHeight = viewRect.height;

    function setNotShow(el: {ignore: boolean}) {
        el.ignore = true;
    }

    function isLabelShown(label: ZRText) {
        if (!label.ignore) {
            return true;
        }
        for (const key in label.states) {
            if (label.states[key].ignore === false) {
                return true;
            }
        }
        return false;
    }


    // 第一次遍历所有数据(标签数据和数据本身为一体)对其进行布局
    // 这里对所有的标签做了基础布局(即不解决重叠问题，仅根据给出的参数计算标签的位置)
    data.each(function (idx) {
        // 一下几行代码仍在获取必要信息
        const sector = data.getItemGraphicEl(idx) as Sector;
        const sectorShape = sector.shape;
        const label = sector.getTextContent();
        const labelLine = sector.getTextGuideLine();

        const itemModel = data.getItemModel<PieDataItemOption>(idx);
        const labelModel = itemModel.getModel('label');
        // Use position in normal or emphasis
        const labelPosition = labelModel.get('position') || itemModel.get(['emphasis', 'label', 'position']);
        const labelDistance = labelModel.get('distanceToLabelLine');
        const labelAlignTo = labelModel.get('alignTo');
        const edgeDistance = parsePercent(labelModel.get('edgeDistance'), viewWidth);
        const bleedMargin = labelModel.get('bleedMargin');

        const labelLineModel = itemModel.getModel('labelLine');
        let labelLineLen = labelLineModel.get('length');
        labelLineLen = parsePercent(labelLineLen, viewWidth);
        let labelLineLen2 = labelLineModel.get('length2');
        labelLineLen2 = parsePercent(labelLineLen2, viewWidth);

        // 这里在判断图形的角度是否小于最小展示标签角度，小于则不展示标签
        if (Math.abs(sectorShape.endAngle - sectorShape.startAngle) < minShowLabelRadian) {
            each(label.states, setNotShow);
            label.ignore = true;
            return;
        }

        if (!isLabelShown(label)) {
            return;
        }

        // 获取图形中心的角度
        const midAngle = (sectorShape.startAngle + sectorShape.endAngle) / 2;
        const nx = Math.cos(midAngle);
        const ny = Math.sin(midAngle);

        let textX;
        let textY;
        let linePoints;
        let textAlign: ZRTextAlign;

        cx = sectorShape.cx;
        cy = sectorShape.cy;


        const isLabelInside = labelPosition === 'inside' || labelPosition === 'inner';
        // 位置为中心时单独计算
        if (labelPosition === 'center') {
            textX = sectorShape.cx;
            textY = sectorShape.cy;
            textAlign = 'center';
        }

        else {
            // 这里分情况计算了饼图标签的起始位置
            // 如果标签显示在图形内部 则该坐标为扇形的中心点(角度取平均，内外半径取平均)
            // 如果图表显示在图形外部 则该坐标为扇形的外边缘中心点(角度取平均，半径取外半径)

            // sectorShape.r 图形外半径
            // sectorShape.r0 图形内半径
            const x1 = (isLabelInside ? (sectorShape.r + sectorShape.r0) / 2 * nx : sectorShape.r * nx) + cx;
            const y1 = (isLabelInside ? (sectorShape.r + sectorShape.r0) / 2 * ny : sectorShape.r * ny) + cy;

            textX = x1 + nx * 3;
            textY = y1 + ny * 3;

            // 如果标签在图形外部 则还需要计算标签指示线的中间点以及结束点(两段指示线长度分别对应labelLineLen和labelLineLen2参数)
            if (!isLabelInside) {
                // 中间点即增加半径
                const x2 = x1 + nx * (labelLineLen + r - sectorShape.r);
                const y2 = y1 + ny * (labelLineLen + r - sectorShape.r);

                // 结束点则只进行水平位移
                const x3 = x2 + ((nx < 0 ? -1 : 1) * labelLineLen2);
                const y3 = y2;

                if (labelAlignTo === 'edge') {
                    // Adjust textX because text align of edge is opposite
                    textX = nx < 0
                        ? viewLeft + edgeDistance
                        : viewLeft + viewWidth - edgeDistance;
                }
                else {
                    textX = x3 + (nx < 0 ? -labelDistance : labelDistance);
                }
                textY = y3;
                linePoints = [[x1, y1], [x2, y2], [x3, y3]];
            }

            textAlign = isLabelInside
                ? 'center'
                : (labelAlignTo === 'edge'
                    ? (nx > 0 ? 'right' : 'left')
                    : (nx > 0 ? 'left' : 'right'));
        }

        // 已下在计算标签的渲染信息
        let labelRotate;
        const rotate = labelModel.get('rotate');
        if (typeof rotate === 'number') {
            labelRotate = rotate * (Math.PI / 180);
        }
        else if (labelPosition === 'center') {
            labelRotate = 0;
        }
        else {
            const radialAngle = nx < 0 ? -midAngle + Math.PI : -midAngle;
            if (rotate === 'radial' || rotate === true) {
                labelRotate = radialAngle;
            }
            else if (rotate === 'tangential'
                && labelPosition !== 'outside'
                && labelPosition !== 'outer'
            ) {
                labelRotate = radialAngle + Math.PI / 2;
                if (labelRotate > Math.PI / 2) {
                    labelRotate -= Math.PI;
                }
            }
            else {
                labelRotate = 0;
            }
        }

        hasLabelRotate = !!labelRotate;

        label.x = textX;
        label.y = textY;
        label.rotation = labelRotate;

        label.setStyle({
            verticalAlign: 'middle'
        });

        // 将计算的结果推入 labelLayoutList
        if (!isLabelInside) {
            const textRect = label.getBoundingRect().clone();
            textRect.applyTransform(label.getComputedTransform());
            // Text has a default 1px stroke. Exclude this.
            const margin = (label.style.margin || 0) + 2.1;
            textRect.y -= margin / 2;
            textRect.height += margin;

            labelLayoutList.push({
                label,
                labelLine,
                position: labelPosition,
                len: labelLineLen,
                len2: labelLineLen2,
                minTurnAngle: labelLineModel.get('minTurnAngle'),
                maxSurfaceAngle: labelLineModel.get('maxSurfaceAngle'),
                surfaceNormal: new Point(nx, ny),
                linePoints: linePoints,
                textAlign: textAlign,
                labelDistance: labelDistance,
                labelAlignTo: labelAlignTo,
                edgeDistance: edgeDistance,
                bleedMargin: bleedMargin,
                rect: textRect,
                unconstrainedWidth: textRect.width,
                labelStyleWidth: label.style.width
            });
        }
        else {
            label.setStyle({
                align: textAlign
            });
            const selectState = label.states.select;
            if (selectState) {
                selectState.x += label.x;
                selectState.y += label.y;
            }
        }
        sector.setTextConfig({
            inside: isLabelInside
        });
    });

    // 这里对标签的坐标做了重新计算 解决标签重叠问题
    if (!hasLabelRotate && seriesModel.get('avoidLabelOverlap')) {
        avoidOverlap(labelLayoutList, cx, cy, r, viewWidth, viewHeight, viewLeft, viewTop);
    }

    // 这里在解决label的重叠问题后，所有的label再做了一次循环，以解决label指示线的坐标以及重新布局之后新的标签样式问题
    for (let i = 0; i < labelLayoutList.length; i++) {
        const layout = labelLayoutList[i];
        const label = layout.label;
        const labelLine = layout.labelLine;
        const notShowLabel = isNaN(label.x) || isNaN(label.y);
        if (label) {
            label.setStyle({
                align: layout.textAlign
            });
            if (notShowLabel) {
                each(label.states, setNotShow);
                label.ignore = true;
            }
            const selectState = label.states.select;
            if (selectState) {
                selectState.x += label.x;
                selectState.y += label.y;
            }
        }
        // 根据新计算的标签坐标 重写了指示线的节点坐标
        if (labelLine) {
            const linePoints = layout.linePoints;
            if (notShowLabel || !linePoints) {
                each(labelLine.states, setNotShow);
                labelLine.ignore = true;
            }
            else {
                // 减少附着到标签的线段，以限制两个线段之间的转角。
                limitTurnAngle(linePoints, layout.minTurnAngle);
                // 限制直线和曲面的角度
                limitSurfaceAngle(linePoints, layout.surfaceNormal, layout.maxSurfaceAngle);

                labelLine.setShape({ points: linePoints });

                // Set the anchor to the midpoint of sector
                label.__hostTarget.textGuideLineConfig = {
                    anchor: new Point(linePoints[0][0], linePoints[0][1])
                };
            }
        }
    }
}
```

## 参考 & 引用

https://github1s.com/apache/echarts/blob/master/src/label/labelLayoutHelper.ts

https://github1s.com/apache/echarts/blob/master/src/label/LabelManager.ts

https://github.com/apache/echarts/blob/master/src/chart/pie/labelLayout.ts

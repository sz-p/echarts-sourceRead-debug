# ECharts源码解析之SetOption批量更新

## 版本：V5.0.2

## 背景

使用`ECharts`的`lazyUpdate`模式多次执行`setOption`,仅对最终的`option`渲染一次。`ECharts`是和`React`一致自己单独实现了一套任务管理机制，还是基于`setTimeout`或`Promise`做的异步渲染？我们尝试从ECharts的源码中来一探究竟。

## 定位实现代码

> 极好定位这里不再赘述

[echarts.ts - apache/echarts](https://github1s.com/apache/echarts/blob/HEAD/src/core/echarts.ts#L582)

## 核心逻辑

```typescript
     setOption<Opt extends ECBasicOption>(option: Opt, notMerge?: boolean | SetOptionOpts, lazyUpdate?: boolean): void {
        if (__DEV__) {
            assert(!this[IN_MAIN_PROCESS_KEY], '`setOption` should not be called during main process.');
        }
        if (this._disposed) {
            disposedWarning(this.id);
            return;
        }

        let silent;
        let replaceMerge;
        let transitionOpt: SetOptionTransitionOpt;
        if (isObject(notMerge)) {
            lazyUpdate = notMerge.lazyUpdate;
            silent = notMerge.silent;
            replaceMerge = notMerge.replaceMerge;
            transitionOpt = notMerge.transition;
            notMerge = notMerge.notMerge;
        }

        this[IN_MAIN_PROCESS_KEY] = true;

        if (!this._model || notMerge) {
            const optionManager = new OptionManager(this._api);
            const theme = this._theme;
            const ecModel = this._model = new GlobalModel();
            ecModel.scheduler = this._scheduler;
            ecModel.init(null, null, null, theme, this._locale, optionManager);
        }

        this._model.setOption(option as ECBasicOption, { replaceMerge }, optionPreprocessorFuncs);

        const updateParams = {
            seriesTransition: transitionOpt,
            optionChanged: true
        } as UpdateLifecycleParams;

        // 批量更新、懒更新 标记
        if (lazyUpdate) {
            this[PENDING_UPDATE] = {
                silent: silent,
                updateParams: updateParams
            };
            // 这里把 主进程状态置为了 false
            this[IN_MAIN_PROCESS_KEY] = false;
            // this.getZr()直接返回了 zrender 对象 接下来看zrender的wakeUp方法(唤醒动画渲染)
            this.getZr().wakeUp();
        }
        else {
            prepare(this);

            updateMethods.update.call(this, null, updateParams);

            
            // 如果不是懒更新则直接flush图像
            this._zr.flush();

            this[PENDING_UPDATE] = null;
            this[IN_MAIN_PROCESS_KEY] = false;

            flushPendingActions.call(this, silent);
            triggerUpdatedEvent.call(this, silent);
        }
    }
    
    wakeUp() {
        // 这里启动了动画渲染
        this.animation.start();
        // Reset the frame count.
        this._stillFrameAccum = 0;
    }

    /**
     * Start animation.
     */
    start() {
        if (this._running) {
            return;
        }

        this._time = new Date().getTime();
        this._pausedTime = 0;
        
        // 开启渲染动画
        this._startLoop();
    }

    _startLoop() {
        const self = this;

        this._running = true;
        
         // 渲染帧
        function step() {
            if (self._running) {

                requestAnimationFrame(step);

                !self._paused && self.update();
            }
        }
        
        requestAnimationFrame(step);
    }
```

## 总结 

代码挺好跟，但涉及到`Even loop`深入理解起来会相对困难。简单说明就是采用`lazyUpdate`更新图表的话，图表会在下一个 `animation frame` 中更新而在下一个`animation frame`之前执行的`setOption`会根据`notMerge`参数来判断是合并`option`还是采用最后一次`option`直接渲染。



## 参考 & 引用

[react的setstate原理 (juejin.cn)](https://juejin.cn/post/6844903928509759496)

[requestAnimationFrame 详解 ](https://www.jianshu.com/p/a1c376457399)

[requestIdleCallback和requestAnimationFrame详解 ](https://juejin.cn/post/6844903848981577735)

[一帧剖析 ](https://github.com/Godiswill/blog/issues/14)

[requestAnimationFrame first tick (stackblitz.com)](https://stackblitz.com/edit/web-platform-wcpttg?file=script.js)

[requestAnimationFrame是一个宏任务么 ](https://ginobilee.github.io/blog/2019/02/01/requestAnimationFrame是一个宏任务么/)

<svg xmlns="http://www.w3.org/2000/svg" width="969" height="413" viewBox="0 0 969 413">
  <g fill="none" fill-rule="evenodd">
    <path d="M0 290h969v123H0V290z" fill="#FFF"/>
    <path d="M0 327h969v80H0v-80z" fill="#F3F3F3"/>
    <path d="M0 43h969v217H0V43z" fill="#FFF"/>
    <path d="M0 85h969v64H0V85zm0 68h969v31H0v-31zm0 37h969v64H0v-64z" fill="#F3F3F3"/>
    <text fill="#606060" font-family="Helvetica" font-size="13" transform="translate(0 -1)">
      <tspan x="10" y="70" fill="#000">Renderer Process</tspan>
    </text>
    <text fill="#5DA5F5" font-family="Helvetica-Bold, Helvetica" font-size="10" font-weight="bold" transform="translate(0 -1)">
      <tspan x="10" y="105" fill="#000">Compositor Thread</tspan>
    </text>
    <text fill="#5DA5F5" font-family="Helvetica-Bold, Helvetica" font-size="10" font-weight="bold" transform="translate(0 -1)">
      <tspan x="10" y="174" fill="#000">Compositor Tile Worker(s)</tspan>
    </text>
    <text fill="#5DA5F5" font-family="Helvetica-Bold, Helvetica" font-size="10" font-weight="bold" transform="translate(0 -1)">
      <tspan x="10" y="212" fill="#000">Main Thread</tspan>
    </text>
    <text fill="#5DA5F5" font-family="Helvetica-Bold, Helvetica" font-size="10" font-weight="bold" transform="translate(0 -1)">
      <tspan x="10" y="349" fill="#000">GPU Thread</tspan>
    </text>
    <text fill="#606060" font-family="Helvetica" font-size="13" transform="translate(0 -1)">
      <tspan x="10" y="314" fill="#000">GPU Process</tspan>
    </text>
    <path d="M125 94h48v44h-48V94z" stroke="#84A859" fill="#A3C37D"/>
    <path d="M148 199h69v44h-69v-44z" stroke="#EAD46F" fill="#F8E799"/>
    <path d="M183.5 119.5v73.11-73.11zm0 73.11l3-10.8h-6l3 10.8zm555 18.89v-71 71zm0-71l-3 10.8h6l-3-10.8zm163-16v211.334V124.5zm0 211.334l3-10.8h-6l3 10.8z" stroke="#282828" fill="#282828"/>
    <text fill="#5C3817" font-family="Helvetica" font-size="10" transform="translate(0 -1)">
      <tspan x="158.259" y="218" fill="#000">Input event</tspan>
    </text>
    <text fill="#5C3817" font-family="Helvetica" font-size="10" transform="translate(0 -1)">
      <tspan x="163.82" y="231" fill="#000">handlers</tspan>
    </text>
    <path d="M219 199h69v44h-69v-44z" stroke="#EAD46F" fill="#F8E799"/>
    <text fill="#5C3817" font-family="Helvetica" font-size="10" transform="translate(0 -1)">
      <tspan x="224.266" y="218" fill="#000">requestAnim-</tspan>
    </text>
    <text fill="#5C3817" font-family="Helvetica" font-size="10" transform="translate(0 -1)">
      <tspan x="228.712" y="231" fill="#000">ationFrame</tspan>
    </text>
    <path d="M290 199h69v44h-69v-44z" stroke="#69B1F5" fill="#8EC7F4"/>
    <text fill="#FFF" font-family="Helvetica" font-size="10" transform="translate(0 -1)">
      <tspan x="311.938" y="218" fill="#000">Parse</tspan>
    </text>
    <text fill="#FFF" font-family="Helvetica" font-size="10" transform="translate(0 -1)">
      <tspan x="311.389" y="231" fill="#000">HTML</tspan>
    </text>
    <path d="M361 199h69v44h-69v-44z" stroke="#9589C6" fill="#B1A7D6"/>
    <text fill="#FFF" font-family="Helvetica" font-size="10" transform="translate(0 -1)">
      <tspan x="380.217" y="218" fill="#000">Recalc</tspan>
    </text>
    <text fill="#FFF" font-family="Helvetica" font-size="10" transform="translate(0 -1)">
      <tspan x="381.884" y="231" fill="#000">Styles</tspan>
    </text>
    <path d="M432 199h69v44h-69v-44z" stroke="#9589C6" fill="#B1A7D6"/>
    <text fill="#FFF" font-family="Helvetica" font-size="10" transform="translate(0 -1)">
      <tspan x="451.488" y="225" fill="#000">Layout</tspan>
    </text>
    <path d="M503 199h69v44h-69v-44z" stroke="#9589C6" fill="#B1A7D6"/>
    <text fill="#FFF" font-family="Helvetica" font-size="10" transform="translate(0 -1)">
      <tspan x="521.377" y="218" fill="#000">Update</tspan>
    </text>
    <text fill="#FFF" font-family="Helvetica" font-size="10" transform="translate(0 -1)">
      <tspan x="513.594" y="231" fill="#000">Layer Tree</tspan>
    </text>
    <path d="M574 199h69v44h-69v-44z" stroke="#84A859" fill="#A3C37D"/>
    <text fill="#FFF" font-family="Helvetica" font-size="10" transform="translate(0 -1)">
      <tspan x="597.104" y="225" fill="#000">Paint</tspan>
    </text>
    <text fill="#FFF" font-family="Helvetica" font-size="10" transform="translate(0 -1)">
      <tspan x="135.054" y="114" fill="#000">Frame</tspan>
    </text>
    <text fill="#FFF" font-family="Helvetica" font-size="10" transform="translate(0 -1)">
      <tspan x="138.941" y="127" fill="#000">Start</tspan>
    </text>
    <path d="M645 199h69v44h-69v-44z" stroke="#84A859" fill="#A3C37D"/>
    <text fill="#FFF" font-family="Helvetica" font-size="10" transform="translate(0 -1)">
      <tspan x="655.601" y="225" fill="#000">Composite</tspan>
    </text>
    <path d="M705 93h69v44h-69V93z" stroke="#84A859" fill="#A3C37D"/>
    <text fill="#FFF" font-family="Helvetica" font-size="10" transform="translate(0 -1)">
      <tspan x="724.773" y="114" fill="#000">Raster</tspan>
    </text>
    <text fill="#FFF" font-family="Helvetica" font-size="10" transform="translate(0 -1)">
      <tspan x="715.87" y="127" fill="#000">Scheduled</tspan>
    </text>
    <path d="M764 158h74v22h-74v-22z" stroke="#84A859" fill="#A3C37D"/>
    <text fill="#FFF" font-family="Helvetica" font-size="10" transform="translate(0 -1)">
      <tspan x="778.882" y="173" fill="#000">Rasterize</tspan>
    </text>
    <path d="M827 93h48v44h-48V93z" stroke="#84A859" fill="#A3C37D"/>
    <text fill="#FFF" font-family="Helvetica" font-size="10" transform="translate(0 -1)">
      <tspan x="837.054" y="113" fill="#000">Frame</tspan>
    </text>
    <text fill="#FFF" font-family="Helvetica" font-size="10" transform="translate(0 -1)">
      <tspan x="842.604" y="126" fill="#000">End</tspan>
    </text>
    <path d="M763 199h111v44H763v-44z" stroke="#EAD46F" fill="#F8E799"/>
    <text fill="#5C3817" font-family="Helvetica" font-size="10" transform="translate(0 -1)">
      <tspan x="774.086" y="223" fill="#000">requestIdleCallback</tspan>
    </text>
    <path d="M822 344h125v44H822v-44z" stroke="#69B1F5" fill="#8EC7F4"/>
    <text fill="#FFF" font-family="Helvetica" font-size="10" transform="translate(0 -1)">
      <tspan x="834.688" y="363" fill="#000">Layer tiles uploaded to</tspan>
    </text>
    <text fill="#FFF" font-family="Helvetica" font-size="10" transform="translate(0 -1)">
      <tspan x="836.086" y="376" fill="#000">GPU and composited.</tspan>
    </text>
    <text fill="#606060" font-family="Helvetica" font-size="9" transform="translate(0 -1)">
      <tspan x="108.222" y="9" fill="#000">vsync and input data</tspan>
    </text>
    <text fill="#606060" font-family="Helvetica" font-size="9" transform="translate(0 -1)">
      <tspan x="724" y="223" fill="#000">commit</tspan>
    </text>
    <text fill="#606060" font-family="Helvetica" font-size="9" transform="translate(0 -1)">
      <tspan x="887" y="120" fill="#000">commit</tspan>
    </text>
    <path d="M148.5 17.5v73.11V17.5zm0 73.11l3-10.8h-6l3 10.8zm684 54.39v11.5V145H830l2.5-6 2.5 6h-2.5zm-62 5v-11.5V150h2.5l-2.5 6-2.5-6h2.5z" stroke="#282828" fill="#282828"/>
    <path d="M254.5 279.5v-32.016m0 0l-3 10.8h6l-3-10.8z" stroke="#D0011B" stroke-linecap="square" fill="#D0021B"/>
    <path d="M467.5 249.5v30m-72-30v30m72.002 0h-212.34" stroke="#D0011B" stroke-linecap="square"/>
  </g>
</svg>


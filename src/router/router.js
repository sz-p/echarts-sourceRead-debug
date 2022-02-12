import Router from "vue-router";

import About from "../pages/about/about";
import Index from "../pages/index/index";
import AxisExtent from "../pages/axisExtent/axisExtent";
import FindHover from "../pages/findHover/findHover";
import AutoLabelLayout from "../pages/autoLabelLayout/autoLabelLayout";
import SetOptionMoreThanOnce from "../pages/setOptionMoreThanOnce/setOptionMoreThanOnce";
import CanvasLayer from "../pages/canvasLayer/canvasLayer";
import SvgBackground from "../pages/svgBackground/svgBackground";
import BezierCurveOptimization from "../pages/bezierCurveOptimization/bezierCurveOptimization";
import svgRender from "../pages/svgRender/svgRender"
import TextBoundingRect from "../pages/textBoundingRect/textBoundingRect"
import SvgRenderAddTag from "../pages/svgRender-add-tag/svgRender-add-tag.vue"
import EventFul from "../pages/eventful/eventful.vue"
export default new Router({
  mode: "history",
  base: "/",
  routes: [
    {
      path: "/",
      name: "Index",
      component: Index
    },
    {
      path: "/about",
      name: "About",
      alias: "/",
      component: About
    },
    {
      path: "/axisExtent",
      name: "AxisExtent",
      component: AxisExtent
    },
    {
      path: "/findHover",
      name: "FindHover",
      component: FindHover
    },
    {
      path: "/autoLabelLayout",
      name: "AutoLabelLayout",
      component: AutoLabelLayout
    },
    {
      path: "/setOptionMoreThanOnce",
      name: "SetOptionMoreThanOnce",
      component: SetOptionMoreThanOnce
    },
    {
      path: "/canvasLayer",
      name: "CanvasLayer",
      component: CanvasLayer
    },
    {
      path: "/svgRender",
      name: "svgRender",
      component: svgRender
    },
    {
      path: "/svgBackground",
      name: "SvgBackground",
      component: SvgBackground
    },
    {
      path: "/textBoundingRect",
      name: "TextBoundingRect",
      component: TextBoundingRect
    },
    {
      path: "/bezierCurveOptimization",
      name: "BezierCurveOptimization",
      component: BezierCurveOptimization
    },
    {
      path: "/svgRenderAddTag",
      name: "svgRenderAddTag",
      component: SvgRenderAddTag
    },
    {
      path: "/eventFul",
      name: "eventFul",
      component: EventFul
    }
  ]
});

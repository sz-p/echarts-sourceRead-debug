import Router from "vue-router";

import About from "../pages/about/about";
import Index from "../pages/index/index";
import AxisExtent from "../pages/axisExtent/axisExtent";
import FindHover from "../pages/findHover/findHover";
import AutoLabelLayout from "../pages/autoLabelLayout/autoLabelLayout";
import SetOptionMoreThanOnce from "../pages/setOptionMoreThanOnce/setOptionMoreThanOnce";
import CanvasLayer from "../pages/canvasLayer/canvasLayer";
export default new Router({
  mode: "history",
  base: window.location.pathname,
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
    }
  ]
});

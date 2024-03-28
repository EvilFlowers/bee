import {IObject} from "@/types/interface"
import nProgress from "nprogress";
import {createRouter, createWebHashHistory, RouteLocationNormalized, RouteRecordRaw} from "vue-router";
import baseRoutes, {errorRoute} from "./base"
import {useAppStore} from "@/store";
import {getToken} from "@/utils/cache";
import emits from "@/utils/emits";
import {EMitt} from "@/constants/enum";
import {getBaseRouteToMeta, registerToRouter} from "@/utils/router";

interface dynamicRouteParams {
  path: string,
  query?: IObject;
  mete?: IObject;
}

nProgress.configure({showSpinner: false});

const router = createRouter({
  history: createWebHashHistory(),
  routes: baseRoutes
});

// 路由前置处理
router.beforeEach((to, from, next) => {
  // 外链
  if (to.meta.isNewPage) {
    if (to.query.pop != "true") {
      next(undefined);
      return false;
    }
  }

  const store = useAppStore();

  // token
  const token = getToken();
  // 新窗口打开内页
  const isPop = to.query.pop === "true";
  nProgress.start();
  if (to.path !== "/login") {
    if (store.state.routes.length) {
      if (to.name === "error") {
        const isMatched = autoRegisterDynamicToRouterAndNext(to);
        if (!isMatched) {
          store.updateState({appIsRender: true, appIsReady: true});
          next();
        }
      } else {
        if (!to.query.pop) {
          const routeMeta: IObject = store.state.routeToMeta[to.path];
          emits.emit(EMitt.OnPushMenuToTabs, {
            label: to.query._mt || routeMeta.title || to.path,
            value: to.fullPath,
            meta: routeMeta
          });
        }
        store.updateState({appIsRender: true, appIsReady: true});
        next();
      }
    } else {
      if (token) {
        store.initApp().then((res: Array<RouteRecordRaw>) => {
          const mergeRoute = baseRoutes.concat(res).concat(errorRoute);
          router.options.routes = mergeRoute;
          registerToRouter(router, mergeRoute);
          if (!to.matched.length) {
            registerDynamicToRouterAndNext({path: to.path, query: to.query});
          }
          store.updateState({
            appIsReady: true,
            routes: mergeRoute,
            routeToMeta: {...store.state.routeToMeta, ...getBaseRouteToMeta(baseRoutes)}
          });

          setTimeout(() => {
            store.updateState({appIsRender: true, appIsLogin: true});
          }, 600);
          next({...to, replace: true})
        });
      } else {
        if (isPop) {
          if (!to.matched.length) {
            registerDynamicToRouterAndNext({path: to.path, query: to.query});
            store.updateState({appIsRender: true, appIsReady: true});
            next(to.fullPath);
          } else {
            store.updateState({appIsRender: true, appIsReady: true});
            if (to.meta.requiresAuth) {
              next("/login");
            } else {
              next();
            }
          }
        } else {
          next("/login")
        }
      }
    }
  } else {
    store.updateState({appIsReady: true, appIsRender: true});
    next();
  }
});

/**
 * 路由加载后事件
 */
router.afterEach(() => {
  nProgress.done();
})

/**
 * 自动注册路由
 * @param to
 */
const autoRegisterDynamicToRouterAndNext = (to: RouteLocationNormalized): boolean => {
  if (to.redirectedFrom) {
    const path = to.redirectedFrom.path;
    const component = matchedSysRouteComponent(path);
    if (component) {
      registerToRouter(router, [{path: path, name: path, component, redirect: ""}]);
      router.push(to.redirectedFrom);
      return true;
    }
  }
  return false;
}

/**
 * 寻找视图组件
 * @param path
 */
const matchedSysRouteComponent = (path: string): any => {
  const sysRouteMap = getSysRouteMap();
  const component = sysRouteMap[toSysViewComponentPath(path)];
  if (!component) {
    console.log("实时注册动态路由失败，未找到组件路径", path);
  }
  return component;
}

/**
 * 获取系统视图路径映射
 */
export const getSysRouteMap = (): IObject => {
  return import.meta.glob("/src/views/**/*.vue");
}

/**
 * 根据path转换为系统视图组件
 * @param path
 */
export const toSysViewComponentPath = (path: string): string => {
  path = path.replace("_", "-");
  return `/src/view/${path}/vue`
}

/**
 * 寻找路由视图
 * @param path
 */
export const mathedSysRouteComponent = (path: string): any => {
  const sysRouteMap = getSysRouteMap();
  const component = sysRouteMap[toSysViewComponentPath(path)];
  if (!component) {
    console.error("注册实时动态路由失败，未找到组件路径", path);
  }
  return component;
}

/**
 * 实时注册动态路由并跳转
 * @param route
 */
export const registerDynamicToRouterAndNext = (route: dynamicRouteParams): void => {
  const component = matchedSysRouteComponent(route.path);
  const newRoute: RouteRecordRaw = {
    path: route.path,
    name: route.path,
    component,
    redirect: !component ? {path: "/error", query: {to: 404}, replace: true} : ""
  };
  registerToRouter(router, [newRoute]);
  router.push(route);
}

export default router;
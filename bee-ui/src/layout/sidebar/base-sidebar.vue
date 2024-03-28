<script lang="ts">
import {defineComponent, onMounted, reactive, ref, watch} from 'vue'
import SidebarMenusItems from "./sidebar-menus-items.vue"
import {RouteRecordRaw, useRoute, useRouter} from "vue-router";
import {useWindowSize} from "@vueuse/core";
import {toValidRoute} from "@/utils/router"
import {useAppStore} from "@/store";
import {EMitt, EThemeSetting} from "@/constants/enum";
import {getThemeConfigCacheByKey} from "@/utils/theme";
import { themeSetting } from '@/constants/config';
import { IObject } from '@/types/interface';
import emits from "@/utils/emits";
import Emits from "@/utils/emits";
import {getValueByKeys} from "@/utils/common";
import Layout from "@/layout/index.vue";

export default defineComponent({
  name: "BaseSidebar",
  components: { SidebarMenusItems },
  props: {
    mode: {
      type: String,
      default: "vertical"
    },
    menus: Array,
    currRout: String,
    router: Boolean,
    onSelect: Function,
    isMobile: Boolean,
  },
  setup(props) {
    const route = useRoute();
    const router = useRouter();
    const win = useWindowSize();
    const store = useAppStore();
    const defaultMenus = toValidRoute((props.menus ?? store.state.routes) as RouteRecordRaw[]);

    const getPopClassName = () => {
      const sidebarCache = getThemeConfigCacheByKey(EThemeSetting.Sidebar);
      return `rr-sidebar-menu-pop-${props.mode === "vertical" && sidebarCache === "dark" ? "dark" : "light"}`;
    };
    const state = reactive({
      collapseSidebar: getThemeConfigCacheByKey(EThemeSetting.SidebarCollapse),
      uniqueOpened: themeSetting.sidebarUniOpened,
      windowWidth: win.width || 800,
      hiddenIndex: -1,
      rawMenus: defaultMenus,
      menus: defaultMenus,
      popClassName: getPopClassName(),
      currRoute: props.currRout ?? route.path
    });
    const elm = ref({} as IObject);
    const li = ref({
      widths: [] as number[]
    });
    const initComputeSidebarLayout = (width: number) => {
      if (props.mode === "horizontal") {
        // 水平布局元素
        const  el = elm.value.$el;
        const lis = el.querySelectorAll("li");
        li.value.widths = [];
        lis.forEach((item: Element) => {
          li.value.widths.push(item.getBoundingClientRect().width);
        });
        initComputeSidebarLayout(width);
      }
    };

    onMounted(() => {
      initComputeSidebarLayout(state.windowWidth)
    });
    watch(
        () => props.menus,
        (vl) => {
          const ms = toValidRoute((vl ? vl : store.state.routes) as RouteRecordRaw[]);
          state.menus = ms;
          state.rawMenus = ms;
        }
    );
    watch(
        () => store.state.routes,
        (vl) => {
          const ms = toValidRoute(vl as RouteRecordRaw[]);
          state.rawMenus = ms;
          state.menus = ms;
        }
    );
    emits.on(EMitt.OnSwitchLeftSidebar, ()=> {
      state.collapseSidebar = !state.collapseSidebar;
    });
    emits.on(EMitt.OnSetThemeNotUniqueOpened, (vl) => {
      state.uniqueOpened = vl;
    });
    emits.on(EMitt.OnSetTheme, ([vl]) => {
      if (vl === EThemeSetting.Sidebar) {
        state.popClassName = getPopClassName();
      }
    });
    watch(
        () => route.path,
        (vl) => {
          const matchedRoute = getValueByKeys(getValueByKeys(router.currentRoute.value.meta, "matched", [])[0], "path", "");
          if (!route.query.pop && matchedRoute) {
            setTimeout(() => {
              state.currRoute = vl;
            }, 10)
          }
        }
    );
    watch(
        () => state.windowWidth,
        (vl) => {
          initComputeSidebarLayout(vl);
        }
    );

    const computeSidebarLayout = (windowWidth: number) => {
      if (props.mode === "horizontal" && windowWidth > 768 && elm.value.$el) {
        // 菜单水平方向过长，采用折叠效果
        const width = elm.value.$el.parentNode.getBoundingClientRect().width;
        let liWidth = 0;
        let index = -1;
        for (let i = 0; i < li.value.widths.length; i++) {
          liWidth += li.value.widths[i];
          if (liWidth > width) {
            index = i - 1;
            break;
          }
        }

        state.hiddenIndex = index;
        state.menus = index > -1 ? state.rawMenus.slice(0, index).concat({
          path: "/__more",
          component: Layout,
          meta: { title:"更多菜单", icon: false, isMore: true },
          children: state.rawMenus.slice(index)
        }) : state.rawMenus;
      }
    };

    return { elm, props, state };
  }
})

</script>

<template>
  <el-menu
      ref="elm"
      :default-active="props.currRoute ?? state.currRoute"
      :mode="props.mode"
      :collapse="props.isMobile ? false : props.mode === 'vertical' && state.collapseSidebar"
      :router="props.router"
      :unique-opened="state.uniqueOpened"
      :onSelect="props.onSelect"
      :collapse-transition="false"
      class="bee-sidebar-menu"
  >
    <sidebar-menus-items :class="state.popClassName" :menus="state.menus" :hiddenIndex="state.hiddenIndex"/>
  </el-menu>
</template>

<style scoped>

</style>
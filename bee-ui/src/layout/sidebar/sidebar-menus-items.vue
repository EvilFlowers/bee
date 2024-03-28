<script lang="ts">
import SvgIcon from '@/components/svg-icon/index.vue'
import classNames from 'classnames';
import {defineComponent, PropType} from 'vue'
import {RouteRecordRaw} from "vue-router";

export default defineComponent({
  name: "SidebarMenusItems",
  components: {SvgIcon},
  props: {
    menus: Array as PropType<RouteRecordRaw[]>,
    hiddenIndex: Number,
    className: String
  },
  setup(props) {
    const getStyle = (index: number): string => {
      const styles: Array<any> = [];
      const isHidden = props.hiddenIndex ? props.hiddenIndex > -1 && index > props.hiddenIndex : false;
      styles.push("display:" + (isHidden ? "none" : "block"));
      return styles.join(";");
    };
    return { props, classNames, getStyle }
  }
})
</script>

<template>
  <template v-for="(item, index) in props.menus || []" :key="item.path">
    <el-sub-menu v-if="item.children && item.children.length > 0" :index="item.path" :popper-class="props.className" :class="classNames({isMore: item.meta?.isMore})" :style="getStyle(index)">
      <template #title>
        <el-icon v-if="item.meta?.icon !== false">
          <svg-icon :name="`${item.meta?.icon || 'icon-file-fill'}`"/>
        </el-icon>
        <span><a>{{item.meta?.title}}</a></span>
      </template>
    </el-sub-menu>
    <el-menu-item v-else :index="item.meta?.isNewPage ? item.path : item.path" :class="classNames({isLink: !!item.meta?.isNewPage, isMore:item.meta?.isMore})" :style="getStyle(index)">
      <template #title>
        <a v-if="item.meta?.isNewPage" :href="`${item.meta.url}`" target="_blank" rel="opener">
          {{ item.meta.title }}
        </a>
        <a v-else>{{ item.meta?.title }}</a>
      </template>
      <el-icon v-if="item.meta?.icon !== false">
        <svg-icon :name="`${item.meta?.icon} || 'icon-file-fill'`"/>
      </el-icon>
    </el-menu-item>


  </template>
</template>

<style scoped>

</style>
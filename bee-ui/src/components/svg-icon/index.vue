<script lang="ts">
import { computed,defineComponent} from 'vue'

/**
 * 自定义svg图标，可将svg图标下载后存放在/src/assets/icon/svg目录下
 * 使用方式: <svg-icon name="earth" color="red"></svg-icon>
 */
export default defineComponent({
  name: "SvgIcon",
  props: {
    prefix: {
      type: String,
      default: "icon"
    },
    name: {
      type: String,
      required: true
    },
    color: {
      type: String,
      default: ""
    },
    className: {
      type: String,
      default: ""
    },
    style: {
      type: String,
      default: ""
    },
    width: String,
    height: String
  },
  setup(props) {
    const symbolId = computed(() => `#${props.prefix}-${props.name.replace("icon", "")}`);
    return { symbolId }
  }
})
</script>

<template>
  <svg aria-hidden="true" :class="`iconfont ${className}`" :style="`width:${width};height:${height};color:${color};${style}`">
    <use :xlink:href="symbolId"/>
  </svg>

</template>

<style scoped>

</style>
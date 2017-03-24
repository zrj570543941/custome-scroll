
##功能：实现元素的自定义滚动的组件（类似手淘首页的滚动）

## 配置项说明
 + scroll_axes（必须）:"X" OR "Y" 指定滚动方向
 + wrapper（必须）:指明包裹滚动元素的直接父级元素,
 + speed（可选）：指定自定义在手指释放后惯性运动的速度的数值，数值越大，惯性运动越快，默认1000

## 怎样添删自定义事件
 + 添加自定义事件：scrolled_elem.addHandler(eventType, callback)
 + 移除自定义事件：scrolled_elem.removeHandler(eventType, callback)

## 一些支持的自定义事件种类列表：指定某些特殊时间瞬间的回调函数

  - touchstart 手指按下的回调函数
  - moving 滑动中的回调函数
  - touchend 手指抬起的回调函数
  - moveover 滑动结束的回调函数

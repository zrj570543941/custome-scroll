# custome-scroll
模拟手淘首页的自定义滚动，
目前实现了可选择水平还是垂直滚动(scroll_axes里配置)，
然后可以自定义在手指释放后惯性运动的速度（speed里配置），
以及可选的（callback_obj） 
  touchstart 手指按下的回调函数
	moving 滑动中的回调函数
	touchend 手指抬起的回调函数
	moveover 滑动结束的回调函数

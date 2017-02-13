function cssTransform(el,attr,val) {
	if(!el.transform){
		el.transform = {};
	}
	if(arguments.length>2) {
		el.transform[attr] = val;
		var sVal = "";
		for(var s in el.transform){
			switch(s) {
				case "rotate":
				case "skewX":
				case "skewY":
					sVal +=s+"("+el.transform[s]+"deg) ";
					break;
				case "translateX":
				case "translateY":
				case "translateZ":
					sVal +=s+"("+el.transform[s]+"px) ";
					break;
				case "scaleX":
				case "scaleY":
				case "scale":
					sVal +=s+"("+el.transform[s]+") ";
					break;	
			}
			el.style.WebkitTransform = el.style.transform = sVal;
		}
	} else {
		val  = el.transform[attr];
		if(typeof val == "undefined" ) {
			if(attr == "scale" || attr == "scaleX" || attr == "scaleY"  ) {
				val = 1;
			} else {
				val = 0;
			}
		}
		return val;
	}
}
/*
wrapper:是包裹滚动元素的直接父级元素,
scroll_axies:代表滚动元素的滚动方向，'X'为水平方向，'Y'为竖直方向
speed：控制手指移开时做的惯性运动的速度
callback_obj_obj中相应属性的意思
	touchstart 手指按下的回调函数
	moving 滑动中的回调函数
	touchend 手指抬起的回调函数
	moveover 滑动结束的回调函数

注意，若想随时清掉滚动元素的动画效果，可以clearInterval(scrolled_elem.scrolltimer)
*/
function customScrollElemVer3(wrapper, scroll_axes, speed, callback_obj) {
	"use strict";
	var scrolled_elem = wrapper.children[0];
	var i_last_scrollend_trans_val = 0,
		i_start_scroll_trans_val = 0,
		i_prev_touchmove_trans_val = 0,
		i_prevprev_touchmove_trans_val = 0,
		i_cur_touch_move_trans_val = 0,
		changing_attr = "translate" + scroll_axes; //在滚动元素时一直要改变的是translateX还是translateY


	var doc = document,
	html = doc.documentElement,
	wrapper_hei = wrapper.clientHeight,
	wrapper_wid = wrapper.clientWidth,
	scrolled_direction_len = scroll_axes === 'X' ? wrapper_wid : wrapper_hei;


	var max_trans_val,
	min_trans_val;


	var i_hand_pos_dix_between_startscroll_and_scrolling = 0,
		i_start_scroll_hand_pos = 0,
		i_critical_point_hand_pos = 0;


	var i_start_scroll_time,
		i_scrolling_time,
		i_scroll_end_time;
		
	scrolled_elem.scrolltimer = null;



	var Tween = {
		easeOut: function(t, b, c, d){
			return -c * ((t=t/d-1)*t*t*t - 1) + b;
		},
		backOut: function(t, b, c, d, s){
			if (typeof s == 'undefined') {
				s = 1.70158;  
			}
			return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
		} 
	};


    
	function decideCriticalTransVal() {
		if (scroll_axes === "Y") {
			max_trans_val = 0;
			min_trans_val = wrapper_hei - scrolled_elem.offsetHeight;
		} else {
			max_trans_val = 0;
			min_trans_val = wrapper_wid - scrolled_elem.offsetWidth;
		}
		
	}

	//注意这里的min_trans_val可能会随着滑动元素的子元素的动态增减而动态变化，所以需要每次touchstart时更新一下
	scrolled_elem.addEventListener("touchstart", function(event) {
		decideCriticalTransVal();
	});
	decideCriticalTransVal();
	// 确定用户达到临界值时手指所在的位置，即确定i_critical_point_hand_pos的值
	function decideCriticalPointHandPos() {
		// 表示用户刚开始touchstart就准备让元素滑过临界值的状态
		scrolled_elem.addEventListener("touchstart", function(event) {

			i_start_scroll_hand_pos = event.changedTouches[0]["page" + scroll_axes];

			
			if (i_prev_touchmove_trans_val >= max_trans_val || i_prev_touchmove_trans_val <= min_trans_val) {
				i_critical_point_hand_pos = i_start_scroll_hand_pos;
			}
		});

		// 前前次未达临界点，前次达到临界点，表示用户之前已经滑动过很多区域才使此元素达到临界点的状态，
		// 注意：这个方法中i_prevprev_touchmove_trans_val是在再下面那个touchmove的event handler最后几行决定的
		scrolled_elem.addEventListener("touchmove", function(event) {
			var i_scrolling_hand_pos = event.touches[0]["page" + scroll_axes];
			i_prev_touchmove_trans_val = cssTransform(scrolled_elem, changing_attr);
			
			if ( (i_prev_touchmove_trans_val < min_trans_val && i_prevprev_touchmove_trans_val > min_trans_val) || (i_prev_touchmove_trans_val > max_trans_val && i_prevprev_touchmove_trans_val < max_trans_val) ) {
				i_critical_point_hand_pos = i_scrolling_hand_pos;
			}
		});
	}


	
	decideCriticalPointHandPos();
	scrolled_elem.addEventListener("touchstart", function(event) {
		event.preventDefault();
		i_start_scroll_time = new Date();
		clearInterval(scrolled_elem.scrolltimer);
		
		i_start_scroll_trans_val = cssTransform(scrolled_elem, changing_attr);
		i_start_scroll_hand_pos = event.changedTouches[0]["page" + scroll_axes];


		if (i_prev_touchmove_trans_val >= max_trans_val || i_prev_touchmove_trans_val <= min_trans_val) {
			i_critical_point_hand_pos = i_start_scroll_hand_pos;
		}

		if(callback_obj&&callback_obj.touchstart){
			callback_obj.touchstart();
		}

	});
	// 随着手指的移动滑动元素也随之移动
	scrolled_elem.addEventListener("touchmove", function(event) {
		var i_scrolling_hand_pos = event.touches[0]["page" + scroll_axes];

		// i_prev_touchmove_trans_val = cssTransform(elem, changing_attr);
		i_scrolling_time = new Date();
		if (i_prev_touchmove_trans_val <= max_trans_val && i_prev_touchmove_trans_val >= min_trans_val) {
			i_hand_pos_dix_between_startscroll_and_scrolling = i_scrolling_hand_pos - i_start_scroll_hand_pos;
			i_cur_touch_move_trans_val = i_start_scroll_trans_val + i_hand_pos_dix_between_startscroll_and_scrolling;
		}  else if (i_prev_touchmove_trans_val > max_trans_val || i_prev_touchmove_trans_val < min_trans_val) {
			i_cur_touch_move_trans_val = frictionMove(i_scrolling_hand_pos, i_critical_point_hand_pos, i_prev_touchmove_trans_val);
		}
		
		
		i_prevprev_touchmove_trans_val = i_prev_touchmove_trans_val;
		cssTransform(scrolled_elem, changing_attr, i_cur_touch_move_trans_val);		

		if(callback_obj&&callback_obj.moving){
			callback_obj.moving();
		}
	});


	// 当被滚动的元素滑到临界的trans_val时，手指继续滑下去将做有阻力的摩擦运动
	// 大致实现原理就是计算得到摩擦系数，月超过临界，系数越小，阻力越大。
	// 然后计算得到当前hand_pos与临界点hand_pos的差值，
	// 差值*不断变化的系数就是在有阻力情况下的trans_val值
	function frictionMove(i_scrolling_hand_pos, i_critical_point_hand_pos, i_prev_touchmove_trans_val) {
		var friction_factor;
		var i_cur_touch_move_trans_val;
		// 当transval大于0后当前hand_pos值与当tranval等于0时的handpos的差值

		var i_another_hand_dix = i_scrolling_hand_pos - i_critical_point_hand_pos;
		if (i_prev_touchmove_trans_val > max_trans_val) {
			friction_factor = 1 - i_prev_touchmove_trans_val / scrolled_direction_len;
			i_cur_touch_move_trans_val = max_trans_val + i_another_hand_dix * friction_factor;
		} else if (i_prev_touchmove_trans_val < min_trans_val) {
			friction_factor = 1 - Math.abs(i_prev_touchmove_trans_val - min_trans_val) / scrolled_direction_len;
			i_cur_touch_move_trans_val = min_trans_val + i_another_hand_dix * friction_factor;
		}
		
		
		return i_cur_touch_move_trans_val;
	}


	scrolled_elem.addEventListener("touchend", function(event) {
		i_scroll_end_time = new Date();

		var i_scrollmoveend_trans_val = cssTransform(scrolled_elem, changing_attr),
		

		// 做惯性运动需要的距离和时间等变量或者可以称为tween中cd的相关变量
		i_inertia_move_dis,
		i_inertia_move_time,
		i_inertia_move_end_trans_val,

		// tween中b的变量以及tween的动画种类的相关变量
		i_start_inertia_move_trans_val = i_scrollmoveend_trans_val,
		animation_type;


		
		//超出临界值时手指放开做回弹运动,要弹单至临界点	
		if (i_start_inertia_move_trans_val > max_trans_val || i_start_inertia_move_trans_val < min_trans_val) {
			animation_type = "backOut";

			
			// 计算做惯性运动需要的距离和时间以及结束时的trans_val值
			if (i_start_inertia_move_trans_val > max_trans_val) {
				i_inertia_move_dis = max_trans_val - i_start_inertia_move_trans_val;
				i_inertia_move_end_trans_val = max_trans_val;
			} else {
				i_inertia_move_dis = min_trans_val - i_start_inertia_move_trans_val;
				i_inertia_move_end_trans_val = min_trans_val;
			}
			i_inertia_move_time = 400;

		// 未超出临界值时手指放开做惯性运动	
		} else {

			if (i_scroll_end_time - i_scrolling_time > 20) {
				return;
			}
			// animation_type = "easeOut";
			// 计算开始滑动时到touchmove刚结束的平均速度，速度越大，需要缓冲的距离也越大
			var i_dis_time_bet_startscroll_and_scrollmoveend = i_scroll_end_time - i_start_scroll_time,
			i_dis_bet_startscroll_and_scrollmoveend = i_scrollmoveend_trans_val - i_start_scroll_trans_val,
			i_speed_bet_startscroll_and_scrollmoveend = i_dis_bet_startscroll_and_scrollmoveend / i_dis_time_bet_startscroll_and_scrollmoveend;//表示touchmove时元素滚动的平均速度,可能为负数

			// 计算做惯性运动需要的距离和时间(在惯性运动结束时并未超过临界值时的情况)
			i_inertia_move_dis = i_speed_bet_startscroll_and_scrollmoveend * 1000,
			i_inertia_move_time = Math.abs(i_speed_bet_startscroll_and_scrollmoveend)  * 500,
			i_inertia_move_end_trans_val = i_start_inertia_move_trans_val + i_inertia_move_dis;
			animation_type = "easeOut";
			// 计算做惯性运动需要的距离和时间(在惯性运动结束时超过临界值时的情况)
			if (i_inertia_move_end_trans_val > max_trans_val) {
				i_inertia_move_end_trans_val = max_trans_val;
				i_inertia_move_dis = max_trans_val - i_start_inertia_move_trans_val;
				animation_type = "backOut";
			} else if (i_inertia_move_end_trans_val < min_trans_val) {
				i_inertia_move_end_trans_val = min_trans_val;
				i_inertia_move_dis = min_trans_val - i_start_inertia_move_trans_val;
				animation_type = "backOut";
			}
		}


		inertiaMotion({
			"moving_elem": scrolled_elem,
			"changing_attr": changing_attr,
			"animation type": animation_type,
			"beginning value": i_start_inertia_move_trans_val, 
			"change in value": i_inertia_move_dis, 
			"endding value": i_inertia_move_end_trans_val,
			"duration": i_inertia_move_time 
		});


		if(callback_obj&&callback_obj.touchend){
			callback_obj.touchend();
		}
	});


	// touchend后做惯性或回弹运动
	function inertiaMotion(obj) {
		var i_trans_val_when_inertia_moving = obj["beginning value"]; //会随惯性运动而一直改变的值

		var scrolled_elem = obj["moving_elem"],
		changing_attr = obj.changing_attr,
		i_start_inertia_move_time = new Date();

		var b = obj["beginning value"],
		c = obj["change in value"],
		d = obj["duration"],
		e = obj["endding value"],
		animation_type = obj["animation type"];

		// 当touend后是由于惯性运动而超过临界点时，把动画类型变为回弹运动，并设置
		// 动画会回弹会临界点
		function transformFromInertiaToFrictionMove() {

			if (i_trans_val_when_inertia_moving > max_trans_val || 
				i_trans_val_when_inertia_moving < min_trans_val) {

				if (i_trans_val_when_inertia_moving > max_trans_val) {
					e = max_trans_val;
					
				} else {
					e = min_trans_val;
				}
				c = e - b;
				animation_type = "backOut";
			}
		}
		scrolled_elem.scrolltimer = setInterval(function() {
			var i_cur_inertia_move_time = new Date(),
				i_dis_time = i_cur_inertia_move_time - i_start_inertia_move_time;
			if (i_dis_time >= d) {
				clearInterval(scrolled_elem.scrolltimer);
				i_trans_val_when_inertia_moving = e;
				cssTransform(scrolled_elem, changing_attr, i_trans_val_when_inertia_moving, e);
				if(callback_obj&&callback_obj.moveover){
					callback_obj.moveover();
				}
			} else {
				//transformFromInertiaToFrictionMove();
				i_trans_val_when_inertia_moving = Tween[animation_type](i_dis_time, b, c, d);
				cssTransform(scrolled_elem, changing_attr, i_trans_val_when_inertia_moving);
				if(callback_obj&&callback_obj.moving){
					callback_obj.moving();
				}
			}	
		}, 10);		
	}
}
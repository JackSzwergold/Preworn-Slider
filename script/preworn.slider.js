/**
 * Preworn Slider (preworn.slider.js) (c) by Jack Szwergold
 *
 * Preworn Slider is licensed under a
 * Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
 *
 * You should have received a copy of the license along with this
 * work. If not, see <http://creativecommons.org/licenses/by-nc-sa/4.0/>. 
 *
 * w: http://www.preworn.com
 * e: me@preworn.com
 *
 * Created: 2011-08-03 js
 * Version: 2011-08-03, js: alpha stage
 *          2011-08-06, js: more alpha stage
 *          2011-08-07, js: new shifting method
 *          2011-08-08, js: experimenting with pointer buffer zone
 *          2011-08-09, js: using 'step' callback in animation to control stop/start
 *          2011-08-10, js: detecting pointer direction & motion
 *          2011-08-11, js: detecting slider direction, motion & timestamping pointer stopping
 *          2011-08-12, js: more timestamping pointer stopping & swipe detection
 *          2011-08-16, js: variable cleanup
 *          2011-08-18, js: moving global variables to stored object data
 *          2011-08-22, js: moving global variables to stored object data
 *          2011-08-23, js: general cleanup
 *          2011-08-24, js: refactoring into plugin
 *          2011-08-30, js: adjust detection of inner & outer areas
 *          2011-09-01, js: tweaks to adjust initial position
 *          2011-09-02, js: tweaking slider effects
 *          2011-09-05, js: setting a "pointer_init_ratio" in addition to the "slider_init_ratio"
 *          2011-09-06, js: tweaks to streamline variables and improve performance
 *          2011-09-09, js: breaking out the 'step' and 'complete' functions from main animation
 *          2011-09-11, js: switched init position from 'css' to 'animate' with 0 duration for better control
 *          2011-09-12, js: first test at implementing inner fuctions for the slider; fade in/out
 *          2011-09-13, js: set "insideCallback" and "outsideCallback" functions to allow outside function control
 *          2011-09-14, js: added "bounce" effect to slider step stopping setup
 *          2011-09-15, js: created a "sliderStepCallback" function to allow outside function control
 *          2011-09-20, js: re-jiggering the callbacks to set better defaults
 *          2011-09-21, js: changed 'slider_widths' to 'slider_info' to encompass more data
 *          2011-09-22, js: combining slider objects into one object
 *          2011-09-27, js: experimenting with 'touch' related detection
 *          2011-09-28, js: added 'frame' object to the slider structure
 *          2011-09-29, js: tweaked the way controller works in relation to the container
 *          2011-09-30, js: better control for touch devices
 *          2011-10-04, js: switching 'toFixed()' calls to 'Math.round()' for speed; 'toFixed()' is noticably slower
 *          2011-10-08, js: added detection of 'window.is_touch_device' so that function can be independent of core functions
 *          2011-10-09, js: added 'lock_slider_small' so lists only shift when it matches condition set
 *          2011-10-15, js: fixed bug in 'initSliderInteraction()'
 *          2011-10-19, js: inetegrating iScroll into the mix
 *          2011-10-20, js: cleanup & refactoring
 *          2011-10-21, js: added bindings for window 'resize' & 'onorientationchange'
 *          2011-10-24, js: shifted bindings into arrays (instead of strings) for easier binding management
 *          2011-10-26, js: created 'calculateSliderValue()' to breakout slider value logic from 'shiftSliderElement()'
 *          2011-10-28, js: fix to 'calculateSliderValue()' to better handle situations when slider is smaller than window, but then becomes larger due to window resize
 *          2011-10-28, js: re-added 'show_control_zones' for control zone debugging
 *          2011-10-29, js: changed 'lock_slider_small' to 'lock_slider' and added other options
 *          2011-10-31, js: adjustments to 'calculateSliderValue()' for better ratio control
 *          2011-10-31, js: small adjustment to the way the 'center_iscroll' CSS class gets set
 *          2011-11-05, js: testing setting 'setSliderHeight()' to allow for full screen sliding on iPhone/iPad/iPod Touch devices
 *          2011-11-07, js: adjustments related to 'setSliderHeight()'
 */

(function($) {

$.fn.rwSlider = function (raw_params) {

  /************************************************************************************************/
  // Parse params and set defaults
  var is_touch_device = typeof(window.is_touch_device) != 'undefined' ? window.is_touch_device : false;

  var params = {};
  if (typeof(raw_params) != 'undefined') {
    var params = typeof(raw_params) == 'object' ? raw_params : $.parseJSON(raw_params);
  }

  var iscroll_mode = (typeof(params.iscroll_mode) != 'undefined' && typeof(iScroll) != 'undefined') ? params.iscroll_mode : false;

  var window_interval = 0;

  var pointer_interval = 0;
  var pointer_timeout = 0;
  var pointer_is_moving = false;

  var show_labels = typeof(params.show_labels) != 'undefined' ? params.show_labels : false; // shows a small index indicator label on each slide element for debugging
  var show_control_zones = typeof(params.show_control_zones) != 'undefined' ? params.show_control_zones : false; // shows the control zones for debugging

  var slider_init_ratio = typeof(params.slider_init_ratio) != 'undefined' ? params.slider_init_ratio : 0; // sets the initial position of the slider; 0 is left, 1 is right, 0.5 is halfway between
  var pointer_init_ratio = typeof(params.pointer_init_ratio) != 'undefined' ? params.pointer_init_ratio : -1; // sets the initial position of the pointer; 0 is left, 1 is right, 0.5 is halfway between

  var slider_mode = typeof(params.slider_mode) != 'undefined' ? params.slider_mode : ''; // if 'zoned', shifts the slider based on divided zones on the controller; if empty follows direct pointer movement on the controller
  var lock_slider = typeof(params.lock_slider) == 'string' ? params.lock_slider : ''; // 'all' locks it all the time, 'small' locks when small, 'large' locks when large, blank deactivates it
  var adjust_slider_height = typeof(params.adjust_slider_height) == 'string' ? params.adjust_slider_height : ''; // sets different options for adjusting the slider height; default is '' (empty) to leave the heigh as is

  var init_duration = typeof(params.init_duration) != 'undefined' ? params.init_duration : 0; // sets the animation speed of the init action; in milliseconds
  var init_queue = typeof(params.init_queue) != 'undefined' ? params.init_queue : false; // if true, queue's the init animations; if false don't queue the init animations
  var init_easing = typeof(params.init_easing) != 'undefined' ? params.init_easing : 'linear'; // sets the easing for init animations

  var slider_duration = typeof(params.slider_duration) != 'undefined' ? params.slider_duration : 1800; // sets the animation speed of the slider action; in milliseconds
  var slider_queue = typeof(params.slider_queue) != 'undefined' ? params.slider_queue : false; // if true, queue's the slider animations; if false don't queue the slider animations
  var slider_easing = typeof(params.slider_easing) != 'undefined' ? params.slider_easing : 'swing'; // sets the easing for slider animations

  var slider_shift_min = typeof(params.slider_shift_min) != 'undefined' ? params.slider_shift_min : 0; // sets the minimum amount needed for a 'shift' to happen

  var control_slices = typeof(params.control_slices) != 'undefined' ? params.control_slices : 9; // sets the amount of slices for the controller in zoned mode
  var control_outer = typeof(params.control_outer) != 'undefined' ? params.control_outer : 1; // sets the amount of outer slices for the controller in zoned mode
  var control_inner = typeof(params.control_inner) != 'undefined' ? params.control_inner : 2; // sets the amount of inner slices for the controller in zoned mode

  var pointer_interval_value = typeof(params.pointer_interval_value) != 'undefined' ? params.pointer_interval_value : 50; // mouse position is checked at every interval set here; lower numbers stress CPUs more while high numbers make it less accurate
  var pointer_is_moving_timeout = typeof(params.pointer_is_moving_timeout) != 'undefined' ? params.pointer_is_moving_timeout : 250; // testing
  var pointer_init_timegap = typeof(params.pointer_init_timegap) != 'undefined' ? params.pointer_init_timegap : 300; // the init timegap between current and last mouse events

  var data_storage_max = typeof(params.data_storage_max) != 'undefined' ? params.data_storage_max : 18;

  var slider_selector = typeof(params.slider_selector) != 'undefined' ? params.slider_selector : 'div#carousel'; // selector for the slider
  var slider_parts = $(slider_selector);

  /************************************************************************************************/
  // Define Object & Element Stuff
  var container_name = typeof(params.container_name) != 'undefined' ? params.container_name : document; // selector for the element that surrounds the slider
  var control_name = typeof(params.control_name) != 'undefined' ? params.control_name : document; // selector for the element that surrounds the slider
  var frame_id = this.attr('id');
  var wrapper_id = frame_id + '_wrapper';
  var element_id = frame_id + '_element';

  var slider_parts = {};
  slider_parts['container'] = $(container_name);
  slider_parts['control'] = $(control_name);
  slider_parts['frame'] = this;
  slider_parts['wrapper'] = slider_parts['frame'].find('div#' + wrapper_id);
  slider_parts['element'] = slider_parts['wrapper'].find('ul#' + element_id);
  slider_parts['element_items'] = slider_parts['element'].find('li');

  var slider_info = {};
  slider_info['first'] = 0;
  slider_info['last'] = slider_parts['element_items'].length - 1;
  slider_info['container_width'] = 0;
  slider_info['control_width'] = 0;
  slider_info['frame_width'] = 0;
  slider_info['wrapper_width'] = 0;
  slider_info['element_width'] = 0;

  /************************************************************************************************/
  // Callback for rwSlider
  if (typeof(params.insideCallback) == 'function') {
    var insideCallback = params.insideCallback;
  }
  else {
    function insideCallback (slider_parts, slider_info, iscroll_var) {};
  }

  if (typeof(params.outsideCallback) == 'function') {
    var outsideCallback = params.outsideCallback;
  }
  else {
    function outsideCallback (slider_parts, slider_info, iscroll_var) {};
  }

  if (typeof(params.sliderStepCallback) == 'function') {
    var sliderStepCallback = params.sliderStepCallback;
  }
  else {
    function sliderStepCallback (slider_parts, slider_info, now, fx) {
      // slider_parts['element'].stop(true, false);
      slider_parts['wrapper'].stop(true, false);
    };
  }

  /************************************************************************************************/
  // Callbacks for iScroll
  if (typeof(params.iScroll_onRefresh) == 'function') {
    var iScroll_onRefresh = params.iScroll_onRefresh;
  }
  else {
    function iScroll_onRefresh () {};
  }

  if (typeof(params.iScroll_onScrollMove) == 'function') {
    var iScroll_onScrollMove = params.iScroll_onScrollMove;
  }
  else {
    function iScroll_onScrollMove () {};
  }

  if (typeof(params.iScroll_onScrollEnd) == 'function') {
    var iScroll_onScrollEnd = params.iScroll_onScrollEnd;
  }
  else {
    function iScroll_onScrollEnd () {};
  }

  /************************************************************************************************/
  // iScroll stuff
  var iscroll_params = {};
  iscroll_params['hScroll'] = typeof(params.hScroll) != 'undefined' ? params.hScroll : true; // 'true' to enable horizontal scrolling.
  iscroll_params['vScroll'] = typeof(params.vScroll) != 'undefined' ? params.vScroll : false; // 'true' to enable vertical scrolling.
  iscroll_params['hScrollbar'] = typeof(params.hScrollbar) != 'undefined' ? params.hScrollbar : false; // 'true' to display the horizontal scrollbar.
  iscroll_params['vScrollbar'] = typeof(params.vScrollbar) != 'undefined' ? params.vScrollbar : true; // 'true' to vertical the horizontal scrollbar.
  iscroll_params['fixedScrollbar'] = typeof(params.fixedScrollbar) != 'undefined' ? params.fixedScrollbar : false; // on iOS the scrollbar shrinks when you drag over the scroller boundaries. Setting this to true prevents the scrollbar to move outside the visible area (as per Android). Default: true on Android, false on iOS.
  iscroll_params['fadeScrollbar'] = typeof(params.fadeScrollbar) != 'undefined' ? params.fadeScrollbar : true; // set to false to have the scrollbars just disappear without the fade effect.
  iscroll_params['hideScrollbar'] = typeof(params.hideScrollbar) != 'undefined' ? params.hideScrollbar : true; // the scrollbars fade away when there’s no user interaction. You may want to have them always visible. Default: true.
  iscroll_params['bounce'] = typeof(params.bounce) != 'undefined' ? params.bounce : true; // enable/disable bouncing outside of the boundaries. Default: true.
  iscroll_params['momentum'] = typeof(params.momentum) != 'undefined' ? params.momentum : true; // enable/disable inertia. Default: true. Useful if you want to save resources.
  iscroll_params['lockDirection'] = typeof(params.lockDirection) != 'undefined' ? params.lockDirection : true; // when you start dragging on one axis the other is locked and you can keep dragging only in two directions (up/down or left/right). You may remove the direction locking by setting this parameter to false.
  iscroll_params['zoomMax'] = typeof(params.zoomMax) != 'undefined' ? params.zoomMax : 4; // this is the maximum allowed scale. Defaulted to 4, it means 4 times the original size.
  iscroll_params['snap'] = typeof(params.snap) != 'undefined' ? params.snap : false; // iScroll 4 also adds the option to snap to any element inside the scroller regardless of the wrapper size. To snap to elements, pass a string representing the query of the DOM elements the scroller should snap to.
  iscroll_params['useTransition'] = typeof(params.useTransition) != 'undefined' ? params.useTransition : false; // A maximum performance mode that grants the highest speed squeezable out of the Apple device. It is compatible only with a bunch of devices (modern iPhone/iPod/iPad and Playbook).
  iscroll_params['onRefresh'] = iScroll_onRefresh; // callback for when an iscroll element is refeshed
  iscroll_params['onScrollMove'] = iScroll_onScrollMove; // callback for when an iscroll is moved by the user
  iscroll_params['onScrollEnd'] = iScroll_onScrollEnd; // callback for when a iscroll element stops moving

  /************************************************************************************************/
  // Initialize
  setSliderWidth();
  setSliderHeight();
  var iscroll_var = iscroll_mode ? new iScroll(frame_id, iscroll_params) : false;
  initSliderPostion();

  initSliderData();
  initControllerData();

  if (!iscroll_mode || (iscroll_mode && is_touch_device)) { initSliderInteraction(); }
  initInsideActions();
  initOutsideActions();
  initWindowActions();

  /************************************************************************************************/
  // Init labels
  if (show_labels == true) {
    initLabels();
  }

  /************************************************************************************************/
  // Control zone debugging
  if (show_control_zones == true) {
    showControlZones();
    resizeControlZones();
  }

  /************************************************************************************************/
  // Window bindings
  function initWindowActions () {

    var window_bindings = [ 'resize', 'onorientationchange' ];
    $(window).unbind(window_bindings.join(' '));
    $(window).bind(window_bindings.join(' '),
      function() {
        setSliderWidth();
        setSliderHeight();
        // alert(slider_info['control_width'] + ' | ' + slider_info['container_width']);
        if (!iscroll_mode) {
          initControllerData();
        }
        if (show_control_zones == true) {
          resizeControlZones();
        }
        if (iscroll_mode) {
          iscroll_var.refresh();
        }
      }
    );

  } // initWindowActions

  /************************************************************************************************/
  // Main Functions
  function setSliderWidth () {

    var li_widths = $.map(slider_parts['element_items'], function(element) {
      return $(element).outerWidth(true);
    });
    li_total_width = eval(li_widths.join('+'));
    if (false || iscroll_mode) {
      slider_parts['wrapper'].width(li_total_width); // Needed for iScroll
    }
    slider_parts['wrapper'].width(li_total_width);
    slider_parts['element'].width(li_total_width);

    slider_info['container_width'] = slider_parts['container'].width();
    slider_info['control_width'] = slider_parts['control'].width();
    slider_info['frame_width'] = slider_parts['frame'].outerWidth();
    slider_info['wrapper_width'] = slider_parts['wrapper'].outerWidth();
    slider_info['element_width'] = slider_parts['element'].outerWidth();

  } // setSliderWidth

  function setSliderHeight () {

    if (adjust_slider_height == 'full') {
      var new_height = Math.round(slider_parts['container'].height() - slider_parts['frame'].offset().top);
      slider_parts['frame'].height(new_height);
      slider_parts['wrapper'].height(new_height);
    }

  } // setSliderHeight

  function initSliderPostion () {

    if (iscroll_mode) {
      slider_parts['frame'].wrap('<div class="center_iscroll" />');

      // var left_value = Math.abs(Math.round((slider_info['element_width'] - slider_info['frame_width']) * slider_init_ratio));
      var left_value = Math.abs(Math.round((slider_info['wrapper_width'] - slider_info['frame_width']) * slider_init_ratio));
      iscroll_var.scrollTo(left_value, 0, 0, true); // scrollTo(x, y, time, relative)
    }
    else {
      // var left_value = Math.abs(Math.round((slider_info['element_width'] - slider_info['frame_width']) * slider_init_ratio));
      var left_value = Math.abs(Math.round((slider_info['wrapper_width'] - slider_info['frame_width']) * slider_init_ratio));

      var slider_params = {};
      // slider_params['left'] = ((slider_info['element_width'] > slider_info['frame_width']) ? '-' : '') + left_value + 'px';
      slider_params['left'] = ((slider_info['wrapper_width'] > slider_info['frame_width']) ? '-' : '') + left_value + 'px';
      slider_params['proxy_left'] = slider_params['left'];

      var slider_options = {};
      slider_options['duration'] = typeof(init_duration) != 'undefined' ? init_duration : 0;
      slider_options['queue'] = typeof(init_queue) != 'undefined' ? init_queue : false;
      slider_options['easing'] = typeof(init_easing) != 'undefined' ? init_easing : 'linear';

      // slider_parts['element'].animate(slider_params, slider_options);
      slider_parts['wrapper'].animate(slider_params, slider_options);
    }

  } // initSliderPostion

  function initSliderData () {

    // var element_pos = slider_parts['element'].position();
    var element_pos = slider_parts['wrapper'].position();
    var defaultX = element_pos.left;

    var pointer_data = {};
    pointer_data['location'] = 'outside';
    slider_parts['wrapper'].data('pointer', pointer_data);

  } // initSliderData

  function initControllerData () {

    // var element_pos = slider_parts['element'].position();
    var element_pos = slider_parts['wrapper'].position();
    var defaultX = Math.abs(element_pos.left);

    // var pointer_ratio = (pointer_init_ratio >= 0) ? pointer_init_ratio : Math.abs(Math.round(defaultX / (slider_info['element_width'] - slider_info['frame_width'])));
    var pointer_ratio = (pointer_init_ratio >= 0) ? pointer_init_ratio : Math.abs(Math.round(defaultX / (slider_info['wrapper_width'] - slider_info['frame_width'])));
    var pointer_value = Math.round(slider_info['frame_width'] * pointer_ratio);

    var current_data = {};
    current_data['pageX'] = pointer_value;
    current_data['pageY'] = 0;
    current_data['timeStamp'] = new Date().getTime();

    var last_data = {};
    last_data['pageX'] = pointer_value;
    last_data['pageY'] = 0;
    last_data['timeStamp'] = (current_data.timeStamp - pointer_init_timegap) - 1;

    var direction = {};
    direction['X'] = 'stop';
    direction['Y'] = 'stop';

    slider_parts['control'].data('current_events', [current_data]);
    slider_parts['control'].data('last_events', [last_data, current_data]); // Set two items in the array so there can be a penultimate event.
    slider_parts['control'].data('direction', [direction]);

  } // initControllerData

  function storeControllerData (data_name, data_value) {
    var data_array = slider_parts['control'].data(data_name);
    data_array.push(data_value);
    if (data_array.length > data_storage_max) {
      data_array.shift();
    }
    slider_parts['control'].data(data_name, data_array);
    return data_array;
  } // storeControllerData

  function initSliderInteraction () {

    if (is_touch_device) {
      // For touch-control
      var touch_bindings = [ 'touchstart', 'MozTouchDown' ];
      // var touch_bindings = [ 'touchmove', 'MozTouchMove' ];
      // var touch_bindings = [ 'touchend', 'MozTouchRelease' ];
      $(document).unbind(touch_bindings.join(' '));
      $(document).bind(touch_bindings.join(' '),
        function(event) {
          event.stopPropagation();
          if ($(event.target).closest(slider_parts['wrapper']).attr('id') == wrapper_id) {
            initInsideActions();
          }
          else {
            initOutsideActions();
          }
        }
      );
    }
    else {
      // For mouse-based control
      var inside_bindings = [ 'mouseenter' ];
      var outside_bindings = [ 'mouseleave' ];
      slider_parts['wrapper'].unbind(inside_bindings.join(' ') + ' ' + outside_bindings.join(' '));
      slider_parts['wrapper'].bind(inside_bindings.join(' '),
        function(event) {
          event.stopPropagation();
          initInsideActions();
        }
      ).bind(outside_bindings.join(' '),
        function(event) {
          event.stopPropagation();
          initOutsideActions();
        }
      );
    }

  } // initSliderInteraction

  function initInsideActions () {

    var pointer_data = {};
    pointer_data['location'] = 'inside';
    slider_parts['wrapper'].data('pointer', pointer_data);

    if (!iscroll_mode) {
      clearInterval(pointer_interval);
      pointer_interval = setInterval(function() {
        calculatePointerData();
        detectPointerDirection();
      }, pointer_interval_value);
    }

    insideCallback(slider_parts, slider_info, iscroll_var);

  } // initInsideActions

  function initOutsideActions () {

    var pointer_data = {};
    pointer_data['location'] = 'outside';
    slider_parts['wrapper'].data('pointer', pointer_data);

    if (!iscroll_mode) {
      clearInterval(pointer_interval);
      pointer_interval = setInterval(function() {
        calculatePointerData();
        detectPointerDirection();
        var slider_value = calculateSliderValue(slider_info);
        shiftSliderElement(slider_value);
      }, pointer_interval_value);
    }
    else {
      // Something here?
    }

    outsideCallback(slider_parts, slider_info, iscroll_var);

  } // initOutsideActions

  function calculatePointerData () {

    var current_events = slider_parts['control'].data('current_events');
    var last_events = slider_parts['control'].data('last_events');

    if (is_touch_device) {
      var pointer_bindings = [ 'touchmove', 'MozTouchMove' ];
    }
    else {
      var pointer_bindings = [ 'mousemove' ];
    }

    slider_parts['control'].unbind(pointer_bindings.join(' '));
    slider_parts['control'].bind(pointer_bindings.join(' '), function(event) {

      if (event.type != 'mousemove') {
        // event.preventDefault(); // Testing
      }
      event.stopPropagation();

      if (event.originalEvent.touches && event.originalEvent.touches.length) {
        event = event.originalEvent.touches[0];
      }
      else if(event.originalEvent.changedTouches && event.originalEvent.changedTouches.length) {
        event = event.originalEvent.changedTouches[0];
      }

      storeControllerData('current_events', event);

      clearTimeout(pointer_timeout);
      pointer_timeout = setTimeout(function() {
        pointer_is_moving = false;
      }, pointer_is_moving_timeout);

      if (pointer_is_moving == false) {
        storeControllerData('last_events', event);
      }
      pointer_is_moving = true;

      slider_parts['control'].unbind(pointer_bindings.join(' '));

    });

  } // calculatePointerData

  function detectPointerDirection () {

    var current_events = slider_parts['control'].data('current_events');
    var current_event = current_events[current_events.length > 0 ? (current_events.length - 1) : 0];

    var last_events = slider_parts['control'].data('last_events');
    var last_event = last_events[last_events.length > 0 ? (last_events.length - 1) : 0];

    var direction_data = {};

    if (current_event.pageX < last_event.pageX) {
      direction_data['X'] = 'left';
    }
     else if (current_event.pageX > last_event.pageX) {
      direction_data['X'] = 'right';
    }
    else {
      direction_data['X'] = 'stop';
    }

    if (current_event.pageY < last_event.pageY) {
      direction_data['Y'] = 'up';
    }
    else if (current_event.pageY > last_event.pageY) {
      direction_data['Y'] = 'down';
    }
    else {
      direction_data['Y'] = 'stop';
    }

    storeControllerData('direction', direction_data);

  } // detectPointerDirection

  // TODO: Too mixed up?
  function calculateSliderValue (slider_info) {

    var left_container = 0;

    var slider_ratio = 0;
    // var slider_value = slider_parts['wrapper'].offset().left;
    var slider_value = 0;

    slider_info['container_width'] = slider_parts['container'].width();
    slider_info['control_width'] = slider_parts['control'].width();
    slider_info['frame_width'] = slider_parts['frame'].outerWidth();
    slider_info['wrapper_width'] = slider_parts['wrapper'].outerWidth();
    slider_info['element_width'] = slider_parts['element'].outerWidth();

    var slider_init_value = -Math.floor((slider_info['wrapper_width'] - slider_info['container_width']) * slider_init_ratio);

    // Slider locking conditions
    if (lock_slider == 'all') {
      return slider_init_value;
    }
    // else if (lock_slider == 'small' && (slider_info['container_width'] > slider_info['element_width'])) {
    else if (lock_slider == 'small' && (slider_info['container_width'] > slider_info['wrapper_width'])) {
      return slider_init_value;
    }
    // else if (lock_slider == 'large' && (slider_info['container_width'] < slider_info['element_width'])) {
    else if (lock_slider == 'large' && (slider_info['container_width'] < slider_info['wrapper_width'])) {
      return slider_init_value;
    }

    var slice_width = Math.round(slider_info['control_width'] / control_slices);

    var outer_width = Math.round(slice_width * control_outer);
    var left_outer = outer_width;
    var right_outer = slider_info['control_width'] - outer_width;

    var inner_width = Math.round(slice_width * control_inner);
    var left_inner = inner_width + left_outer;
    var right_inner = slider_info['control_width'] - (inner_width + outer_width);

    var current_events = slider_parts['control'].data('current_events');
    var current_event = current_events[current_events.length > 0 ? (current_events.length - 1) : 0];

    var offset_value = (slider_parts['control'].offset() != null) ? slider_parts['control'].offset().left : 0;
    var offset_pageX = (current_event.pageX - offset_value);

    // Calculate the slider ratio and value
    if (slider_mode == 'zoned') {
      if (left_outer >= offset_pageX) {
        slider_ratio = 0; // Left Outer Area
      }
      else if (left_outer <= offset_pageX && left_inner >= offset_pageX) {
        slider_ratio = 0.25; // Left Inner Area
      }
      else if (left_inner < offset_pageX && right_inner > offset_pageX) {
        slider_ratio = 0.5; // Center Area
      }
      else if (right_outer >= offset_pageX && right_inner <= offset_pageX) {
        slider_ratio = 0.75; // Right Inner Area
      }
      else if (right_outer <= offset_pageX) {
        slider_ratio = 1; // Right Outer Area
      }
    }
    else {
      var area_width = slider_info['container_width'];
      var area_leftside = (offset_pageX - left_container);
      slider_ratio = (area_leftside / area_width);
    }

    // slider_value = -Math.floor((slider_info['element_width'] - slider_info['container_width']) * slider_ratio);
    slider_value = -Math.floor((slider_info['wrapper_width'] - slider_info['container_width']) * slider_ratio);

    return slider_value;

  } // calculateSliderValue

  function shiftSliderElement (slider_value) {

    // Only move the slider if the value & current position are not the same
    // if (slider_value != slider_parts['element'].offset().left) {
    if (slider_value != slider_parts['wrapper'].offset().left && (Math.abs(Math.abs(slider_parts['wrapper'].offset().left) - Math.abs(slider_value)) > slider_shift_min)) {
      // This is where the iScroll animation happens.
      if (iscroll_mode) {
        if (iscroll_var.isReady()) {
          iscroll_var.scrollTo(slider_value, 0, slider_duration, false); // scrollTo(x, y, time, relative);
        }
      }
      else {
        // This is where the jQuery animation happens.
        // if (!slider_parts['element'].is(':animated')) {
        if (!slider_parts['wrapper'].is(':animated')) {
          var slide_params = {};
          slide_params['proxy_left'] = slider_value + 'px';

          var slide_options = {};
          slide_options['duration'] = slider_duration;
          slide_options['queue'] = slider_queue;
          slide_options['easing'] = slider_easing;

          slide_options['step'] = function(now, fx) {
            var now_value = Math.round(now);
            if (slider_parts['wrapper'].data('pointer').location == 'outside') {
              var step_css_params = {};
              step_css_params[fx.prop.replace('proxy_','')] = now_value + 'px';
              // slider_parts['element'].css(step_css_params);
              slider_parts['wrapper'].css(step_css_params);
            }
            else if (slider_parts['wrapper'].data('pointer').location == 'inside') {
              sliderStepCallback (slider_parts, slider_info, now, fx);
            }
          };
          // slider_parts['element'].stop(true, false).animate(slide_params, slide_options);
          slider_parts['wrapper'].stop(true, false).animate(slide_params, slide_options);
        }
      }
    }

  } // shiftSliderElement

  /************************************************************************************************/
  // Adds labels to list items for debugging
  function initLabels () {
    slider_parts['element_items'].each(function(index, element) {
      var indicator = $('<div />').addClass('Label').prepend($('<p />').text(index));
      $(element).append(indicator);
    });
  } // initLabels

  function showControlZones () {
    $('body').append($('<div />').attr('id', 'mousedata_wrapper'));
    $('div#mousedata_wrapper').append($('<ul />').attr('id', 'mousedata_controls'));
    for (x = 0; x < control_slices; x++) {
      $('ul#mousedata_controls').append($('<li />'));
    }
  } // showControlZones

  function resizeControlZones () {

    var ul_li_height = Math.round(slider_parts['container'].height() - slider_parts['frame'].offset().top) - slider_parts['frame'].outerHeight();

    // var li_width = ($(window).width() / control_slices);
    var li_width = Math.floor(slider_info['control_width'] / control_slices);
    $('ul#mousedata_controls > li').each(function(index, element) {

      // Control width & height
      var li_css = {};
      li_css['width'] = li_width + 'px';
      li_css['height'] = ul_li_height + 'px';

      // Default class
      var li_class = 'control_center';

      // Left outer control
      if (index < control_outer) {
        li_class = 'control_outer';
      }
      // Right outer control
      else if (index >= (control_slices - control_outer)) {
        li_class = 'control_outer';
      }

      // Left inner control
      if (index >= control_outer && index < (control_inner + control_outer)) {
        li_class = 'control_inner';
      }
      // Right inner control
      else if (index >= (control_slices - (control_outer + control_inner)) && index < (control_slices - control_outer)) {
        li_class = 'control_inner';
      }

      // Set the inline css and class
      $(element).css(li_css);
      $(element).removeClass().addClass(li_class);
    })

    var ul_css = {};
    ul_css['width'] = Math.round(li_width * control_slices) + 'px';
    ul_css['height'] = ul_li_height + 'px';
    $('ul#mousedata_controls').css(ul_css);

  } // resizeControlZones


} // $.fn.rwSlider

})(jQuery);
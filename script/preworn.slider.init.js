/**
 * Preworn Slider Init (preworn.slider.init.js) (c) by Jack Szwergold
 *
 * Preworn Slider Init is licensed under a
 * Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
 *
 * You should have received a copy of the license along with this
 * work. If not, see <http://creativecommons.org/licenses/by-nc-sa/4.0/>. 
 *
 * w: http://www.preworn.com
 * e: me@preworn.com
 *
 * Created: 2011-09-20 js
 * Version: 2011-09-20, js: alpha stage
 *          2011-09-21, js: more alpha stage
 *          2011-10-02, js: refinements & speedup of selection logic & effects
 *          2011-10-10, js: added logic for title swapping & slight cleanup
 *          2011-10-11, js: added check for 'window' params for individual pages
 *          2011-10-13, js: renamed 'mouse' variables to 'pointer' to encompass all nav options and added comments & notations
 *          2011-10-19, js: added 'iscroll_mode' to the list of params
 *          2011-10-20, js: cleanup & refactoring
 *          2011-10-24, js: shifted bindings into arrays (instead of strings) for easier binding management
 *          2011-10-24, js: added an 'inside_event_delay' to give a window of time before the default actions are active
 *          2011-10-29, js: changed 'lock_slider_small' to 'lock_slider' and added other options
 *          2011-10-31, js: adding iScroll specific params & 'inside_defer_touch' as a new param
 *          2011-10-31, js: tweak to 'insideCallback()' from 'touch[event]' stuff to 'click' to make sure our slide fades play nicely with iScroll
 *          2011-11-07, js: adjustments related to 'setSliderHeight()'
 */

(function($) {

$(document).ready(function() {

    /**********************************************************************************************/
    // Set variables
    var is_touch_device = typeof(window.is_touch_device) != 'undefined' ? window.is_touch_device : false;

    var params = {};
    if (typeof(window.slider_params) != 'undefined') {
      var params = typeof(window.slider_params) == 'object' ? window.slider_params : $.parseJSON(window.slider_params);
    }

    var iscroll_mode = (typeof(params.iscroll_mode) != 'undefined' && typeof(iScroll) != 'undefined') ? params.iscroll_mode : false;

    var callback_timeout = 0;
    var last_inside_timestamp = 0;
    var curr_inside_timestamp = 0;

    var inside_active_delay = typeof(params.inside_active_delay) != 'undefined' ? params.inside_active_delay : (is_touch_device ? 0 : 250); // delay before an active action on a slider item occurs; in milliseconds
    var inside_inactive_delay = typeof(params.inside_inactive_delay) != 'undefined' ? params.inside_inactive_delay : (is_touch_device ? 2500 : 250); // delay before an inactive action outside of a slider item--but still in the slider--occurs; in milliseconds
    var inside_event_delay = typeof(params.inside_event_delay) != 'undefined' ? params.inside_event_delay : (is_touch_device ? 500 : 0); // delay before an active action on a slider item occurs; in milliseconds
    var inside_defer_touch = typeof(params.inside_defer_touch) != 'undefined' ? params.inside_defer_touch : true; // if set to 'true' defers the first touch on an item in the slider, next touch is a click; if 'false' links behave as normal

    var outside_inactive_delay = typeof(params.outside_inactive_delay) != 'undefined' ? params.outside_inactive_delay : (is_touch_device ? 125 : 250); // delay before an inactive action outside of the slider element happens; in milliseconds

    var item_fadein_speed = typeof(params.item_fadein_speed) != 'undefined' ? params.item_fadein_speed : 250; // speed of the item fade in; in milliseconds
    var item_fadein_value = typeof(params.item_fadein_value) != 'undefined' ? params.item_fadein_value : 1; // opacity value of the item fade in; 0 is transparent, 1 is solid, 0.5 is halfway between
    var item_fadeout_speed = typeof(params.item_fadeout_speed) != 'undefined' ? params.item_fadeout_speed : 250; // speed of the item fade out; in milliseconds
    var item_fadeout_value = typeof(params.item_fadeout_value) != 'undefined' ? params.item_fadeout_value : 0.5; // opacity value of the item fade out; 0 is transparent, 1 is solid, 0.5 is halfway between

    var title_fadein_speed = typeof(params.title_fadein_speed) != 'undefined' ? params.title_fadein_speed : 500; // speed of the title fade in; in milliseconds
    var title_fadein_value = typeof(params.title_fadein_value) != 'undefined' ? params.title_fadein_value : 1; // opacity value of the title fade in; 0 is transparent, 1 is solid, 0.5 is halfway between
    var title_fadeout_speed = typeof(params.title_fadeout_speed) != 'undefined' ? params.title_fadeout_speed : 500; // speed of the title fade out; in milliseconds
    var title_fadeout_value = typeof(params.title_fadeout_value) != 'undefined' ? params.title_fadeout_value : 0; // opacity value of the title fade out; 0 is transparent, 1 is solid, 0.5 is halfway between

    var reveal_duration = typeof(params.reveal_duration) != 'undefined' ? params.reveal_duration : 500; // duration of the item reveal
    var reveal_queue = typeof(params.reveal_queue) != 'undefined' ? params.reveal_queue : false; // true to queue the reveal animation
    var reveal_easing = typeof(params.reveal_easing) != 'undefined' ? params.reveal_easing : 'swing'; // easing for the reveal

    var hidden_text_selector = typeof(params.hidden_text_selector) != 'undefined' ? params.hidden_text_selector : 'div.Image div.HiddenText'; // selector for the hidden text connected to each item in the slider

    var title_selector = typeof(params.title_selector) != 'undefined' ? params.title_selector : 'div#project_title'; // selector for the div where the hidden text will be placed
    var title_wrapper = $(title_selector + '_wrapper');
    var title_element = $(title_selector);

    var slider_selector = typeof(params.slider_selector) != 'undefined' ? params.slider_selector : 'div#carousel'; // selector for the slider
    var slider_element = $(slider_selector);
    var slider_element_items = $(slider_selector).find('li');

    /**********************************************************************************************/
    // Set slider_params for rwSlider
    var slider_params = {};
    slider_params['iscroll_mode'] = iscroll_mode; // if set to true it uses iScroll; otherwise it uses the jQuery functions
    slider_params['show_labels'] = typeof(params.show_labels) != 'undefined' ? params.show_labels : false; // shows a small index indicator label on each slide element for debugging
    slider_params['show_control_zones'] = typeof(params.show_control_zones) != 'undefined' ? params.show_control_zones : false; // shows the control zones for debugging

    slider_params['slider_init_ratio'] = typeof(params.slider_init_ratio) != 'undefined' ? params.slider_init_ratio : 0.5; // sets the initial position of the slider; 0 is left, 1 is right, 0.5 is halfway between
    slider_params['pointer_init_ratio'] = typeof(params.pointer_init_ratio) != 'undefined' ? params.pointer_init_ratio : 0.5; // sets the initial position of the pointer; 0 is left, 1 is right, 0.5 is halfway between

    slider_params['slider_mode'] = typeof(params.slider_mode) != 'undefined' ? params.slider_mode : ''; // if 'zoned', shifts the slider based on divided zones on the controller; if empty follows direct pointer movement on the controller
    slider_params['lock_slider'] = typeof(params.lock_slider) == 'string' ? params.lock_slider : ''; // 'all' locks it all the time, 'small' locks when small, 'large' locks when large, blank deactivates it
    slider_params['adjust_slider_height'] = typeof(params.adjust_slider_height) == 'string' ? params.adjust_slider_height : ''; // sets different options for adjusting the slider height; default is '' (empty) to leave the heigh as is

    slider_params['init_duration'] = typeof(params.init_duration) != 'undefined' ? params.init_duration : 0; // sets the animation speed of the init action; in milliseconds
    slider_params['init_queue'] = typeof(params.init_queue) != 'undefined' ? params.init_queue : false; // if true, queue's the init animations; if false don't queue the init animations
    slider_params['init_easing'] = typeof(params.init_easing) != 'undefined' ? params.init_easing : 'linear'; // sets the easing for init animations

    slider_params['slider_duration'] = typeof(params.slider_duration) != 'undefined' ? params.slider_duration : 1800; // sets the animation speed of the slider action; in milliseconds
    slider_params['slider_queue'] = typeof(params.slider_queue) != 'undefined' ? params.slider_queue : false; // if true, queue's the slider animations; if false don't queue the slider animations
    slider_params['slider_easing'] = typeof(params.slider_easing) != 'undefined' ? params.slider_easing : 'swing'; // sets the easing for slider animations

    slider_params['control_slices'] = typeof(params.control_slices) != 'undefined' ? params.control_slices : 9; // sets the amount of slices for the controller in zoned mode
    slider_params['control_outer'] = typeof(params.control_outer) != 'undefined' ? params.control_outer : 1; // sets the amount of outer slices for the controller in zoned mode
    slider_params['control_inner'] = typeof(params.control_inner) != 'undefined' ? params.control_inner : 2; // sets the amount of inner slices for the controller in zoned mode

    slider_params['slider_shift_min'] = typeof(params.slider_shift_min) != 'undefined' ? params.slider_shift_min : 0; // sets the minimum amount needed for a 'shift' to happen

    slider_params['pointer_interval_value'] = typeof(params.pointer_interval_value) != 'undefined' ? params.pointer_interval_value : 50; // mouse position is checked at every interval set here; lower numbers stress CPUs more while high numbers make it less accurate
    slider_params['pointer_is_moving_timeout'] = typeof(params.pointer_is_moving_timeout) != 'undefined' ? params.pointer_is_moving_timeout : 250; // testing
    slider_params['pointer_init_timegap'] = typeof(params.pointer_init_timegap) != 'undefined' ? params.pointer_init_timegap : 300; // the init timegap between current and last mouse events

    slider_params['container_name'] = typeof(params.container_name) != 'undefined' ? params.container_name : document; // selector for the element that surrounds the slider
    slider_params['control_name'] = typeof(params.control_name) != 'undefined' ? params.control_name : document; // selector for the element that surrounds the slider

    slider_params['insideCallback'] = insideCallback; // sets the insideCallback() function
    slider_params['outsideCallback'] = outsideCallback; // sets the outsideCallback() function

    // iScroll specific params
    slider_params['hScroll'] = typeof(params.hScroll) != 'undefined' ? params.hScroll : true; // 'true' to enable horizontal scrolling.
    slider_params['vScroll'] = typeof(params.vScroll) != 'undefined' ? params.vScroll : false; // 'true' to enable vertical scrolling.
    slider_params['hScrollbar'] = typeof(params.hScrollbar) != 'undefined' ? params.hScrollbar : false; // 'true' to display the horizontal scrollbar.
    slider_params['vScrollbar'] = typeof(params.vScrollbar) != 'undefined' ? params.vScrollbar : true; // 'true' to vertical the horizontal scrollbar.
    slider_params['fixedScrollbar'] = typeof(params.fixedScrollbar) != 'undefined' ? params.fixedScrollbar : false; // on iOS the scrollbar shrinks when you drag over the scroller boundaries. Setting this to true prevents the scrollbar to move outside the visible area (as per Android). Default: true on Android, false on iOS.
    slider_params['fadeScrollbar'] = typeof(params.fadeScrollbar) != 'undefined' ? params.fadeScrollbar : true; // set to false to have the scrollbars just disappear without the fade effect.
    slider_params['hideScrollbar'] = typeof(params.hideScrollbar) != 'undefined' ? params.hideScrollbar : true; // the scrollbars fade away when there’s no user interaction. You may want to have them always visible. Default: true.
    slider_params['bounce'] = typeof(params.bounce) != 'undefined' ? params.bounce : true; // enable/disable bouncing outside of the boundaries. Default: true.
    slider_params['momentum'] = typeof(params.momentum) != 'undefined' ? params.momentum : true; // enable/disable inertia. Default: true. Useful if you want to save resources.
    slider_params['lockDirection'] = typeof(params.lockDirection) != 'undefined' ? params.lockDirection : true; // when you start dragging on one axis the other is locked and you can keep dragging only in two directions (up/down or left/right). You may remove the direction locking by setting this parameter to false.
    slider_params['zoomMax'] = typeof(params.zoomMax) != 'undefined' ? params.zoomMax : 4; // this is the maximum allowed scale. Defaulted to 4, it means 4 times the original size.
    slider_params['snap'] = typeof(params.snap) != 'undefined' ? params.snap : false; // iScroll 4 also adds the option to snap to any element inside the scroller regardless of the wrapper size. To snap to elements, pass a string representing the query of the DOM elements the scroller should snap to.
    slider_params['useTransition'] = typeof(params.useTransition) != 'undefined' ? params.useTransition : false; // A maximum performance mode that grants the highest speed squeezable out of the Apple device. It is compatible only with a bunch of devices (modern iPhone/iPod/iPad and Playbook).

    slider_params['iScroll_onRefresh'] = iScroll_onRefresh; // sets the onRefresh() function for iScroll
    slider_params['iScroll_onScrollMove'] = iScroll_onScrollMove; // sets the onScrollMove() function for iScroll
    slider_params['iScroll_onScrollEnd'] = iScroll_onScrollEnd; // sets the onScrollEnd() function for iScroll

    /**********************************************************************************************/
    // Initialize 'rwSlider'
    var slider_var = slider_element.rwSlider(slider_params);
    title_wrapper.remove(); // the whole 'title_wrapper' is removed so it can be dynamically be readded; must be done for iOS to allow title fade & iScroll for some reason

    /**********************************************************************************************/
    // insideCallback function
    function insideCallback (slider_parts, slider_info, iscroll_var) {

      if (is_touch_device) {
        // var active_bindings = [ 'touchstart', 'MozTouchDown' ];
        // var inactive_bindings = [ 'touchend', 'MozTouchRelease' ];
        var active_bindings = [ 'click' ]; // This seems to work nicer in integrating the slide fades into iScroll
        var inactive_bindings = [ '' ];
      }
      else {
        var active_bindings = [ 'mouseenter' ];
        var inactive_bindings = [ 'mouseleave' ];
      }

      var buffer_zone = Math.round(slider_info['frame_width'] / 2);
      var left_boundary = 0 - buffer_zone;
      var right_boundary = slider_info['frame_width'] + buffer_zone;

      slider_parts['element_items'].unbind(active_bindings.join(' ') + ' ' + inactive_bindings.join(' '));
      slider_parts['element_items'].bind(active_bindings.join(' '),
        function(event) {
          clearTimeout(callback_timeout);
          var item_obj = $(this);

          if (iscroll_mode) {
            iscroll_var.stop();
          }

          if ((typeof(item_obj.attr('class')) == 'undefined' || item_obj.attr('class') == 'inactive') && (!iscroll_mode || iscroll_var.isReady())) {

            last_inside_timestamp = new Date().getTime();

            // This is done to prevent going to any href links within the slide for the first touch
            if (inside_defer_touch && is_touch_device && ($.inArray(event.type, active_bindings) >= 0)) {
              curr_inside_timestamp = new Date().getTime();
              if ((curr_inside_timestamp - last_inside_timestamp) < inside_event_delay) {
                event.stopPropagation();
                event.preventDefault();
              }
            }

            callback_timeout = setTimeout(function() {

              if (item_obj.find(hidden_text_selector).length > 0 && title_element.length > 0) {
                var project_title = item_obj.find(hidden_text_selector).html();
                slider_parts['frame'].after(title_wrapper);
                slider_parts['frame'].promise().done(
                  function () {
                    if (slider_params['adjust_slider_height'] == 'full') {
                      var new_margin_top = Math.round(slider_parts['frame'].outerHeight() - slider_parts['element'].outerHeight());
                      $(title_element).css( { 'margin-top' : -new_margin_top + 'px' });
                    }
                    title_element.stop(true, true).html(project_title).fadeTo(title_fadein_speed, title_fadein_value); // TODO
                  }
                );
              }

              item_obj.stop(true, true).fadeTo(item_fadein_speed, item_fadein_value).removeAttr('class').addClass('active').siblings().each(
                function (index, element) {
                  var sibling_element = $(element);
                  var sibling_offset = sibling_element.offset();
                  if (sibling_offset.left >= left_boundary && sibling_offset.left <= right_boundary) {
                    sibling_element.fadeTo(item_fadeout_speed, item_fadeout_value).removeAttr('class').addClass('inactive');
                  }
                }
              );
              revealSlide(slider_parts, item_obj);
            }, inside_active_delay);
          }
          else if (item_obj.attr('class') == 'active' && (!iscroll_mode || iscroll_var.isReady())) {
            curr_inside_timestamp = new Date().getTime();
            if ((curr_inside_timestamp - last_inside_timestamp) < inside_event_delay) {
              event.stopPropagation();
              event.preventDefault();
            }
          }

        }
      ).bind(inactive_bindings.join(' '),
        function(event) {
          clearTimeout(callback_timeout);

          callback_timeout = setTimeout(function() {

            if (title_element.length > 0) { // TODO
              title_element.stop(true, true).fadeTo(title_fadeout_speed, title_fadeout_value,
                function () {
                  $(this).empty().closest(title_wrapper).remove();
                }
              );
            }
            slider_parts['element'].find('li.inactive').stop(true, true).fadeTo(item_fadein_speed, item_fadein_value);
            slider_element_items.removeAttr('class');
          }, inside_inactive_delay);

          // event.stopPropagation();
          // event.preventDefault();

        }
      );

      /**********************************************************************************************/
      // revealSlide function
      function revealSlide (slider_parts, item_obj) {

        var item_margin = item_obj.outerWidth(true) - item_obj.outerWidth();
        if (item_margin == 0) {
          var item_margin = parseInt(item_obj.css('padding-left')) + parseInt(item_obj.css('padding-right'));
        }

        // var element_position = slider_parts['element'].position();
        var element_position = slider_parts['wrapper'].position();

        if (iscroll_mode) {
          var item_position = item_obj.offset();
          var overflow_left = item_position.left;
          var overflow_right = (item_position.left - slider_info['frame_width']) + (item_obj.outerWidth() + element_position.left);
        }
        else {
          var item_position = item_obj.position();
          var overflow_left = (item_position.left + element_position.left);
          var overflow_right = (item_position.left - slider_info['container_width']) + (item_obj.outerWidth() + element_position.left);
        }

        var extra_area = (item_margin * 3);

        // if (!slider_parts['element'].is(':animated') && (overflow_left < 0 || overflow_right > 0)) {
        if (!slider_parts['wrapper'].is(':animated') && (overflow_left < 0 || overflow_right > 0)) {
          if (overflow_left < 0) {
            var slider_value = item_obj.index() == slider_info['first'] ? overflow_left : Math.round(overflow_left - extra_area);
          }
          else if (overflow_right > 0) {
            var slider_value = item_obj.index() == slider_info['last'] ? overflow_right : Math.round(overflow_right + extra_area);
          }
          else {
            // var slider_value = slider_parts['element'].position().left;
            var slider_value = slider_parts['wrapper'].position().left;
          }

          if (iscroll_mode) {
            iscroll_var.scrollTo(slider_value, 0, reveal_duration, true); // scrollTo(x, y, time, relative);
          }
          else {
            var element_params = {};
            element_params['left'] = '-=' + slider_value + 'px';
            element_params['proxy_left'] = element_params['left'];

            var element_options = {};
            element_options['duration'] = reveal_duration;
            element_options['queue'] = reveal_queue;
            element_options['easing'] = reveal_easing;
            // slider_parts['element'].animate(element_params, element_options);
            slider_parts['wrapper'].animate(element_params, element_options);
          }
        }

      } // revealSlide

    } // insideCallback

    /**********************************************************************************************/
    // outsideCallback function
    function outsideCallback (slider_parts, slider_info, iscroll_var) {

      if (is_touch_device) {
        clearTimeout(callback_timeout);
        callback_timeout = setTimeout(function() {
          resetElementItems();
        }, outside_inactive_delay);
      }

    } // outsideCallback

    /**********************************************************************************************/
    // iScroll_onRefresh function for iScroll
    function iScroll_onRefresh () {
      return;
    } // iScroll_onRefresh

    /**********************************************************************************************/
    // iScroll_onScrollMove function for iScroll
    function iScroll_onScrollMove () {
      resetElementItems();
    } // iScroll_onScrollMove

    /**********************************************************************************************/
    // iScroll_onScrollMove function for iScroll
    function iScroll_onScrollEnd () {
      return;
    } // iScroll_onScrollEnd

    /**********************************************************************************************/
    // resetElementItems
    function resetElementItems () {

      if (title_element.length > 0) { // TODO
        title_element.stop(true, true).fadeTo(title_fadeout_speed, title_fadeout_value,
          function () {
            $(this).empty().closest(title_wrapper).remove();
          }
        );
      }
      slider_element.find('li.inactive').stop(true, true).fadeTo(item_fadein_speed, item_fadein_value);
      slider_element_items.removeAttr('class');

    } // resetElementItems

});

})(jQuery);
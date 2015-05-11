/**
 * iScroll Init (iscroll.init.js) (c) by Jack Szwergold
 *
 * iScroll Init is licensed under a
 * Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
 *
 * You should have received a copy of the license along with this
 * work. If not, see <http://creativecommons.org/licenses/by-nc-sa/4.0/>. 
 *
 * w: http://www.preworn.com
 * e: me@preworn.com
 *
 * Created: 2011-10-18 js
 * Version: 2011-10-18, js: alpha stage
 *          2011-10-18, js: more alpha stage
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

    var callback_timeout = 0;

    var inside_active_delay = typeof(params.inside_active_delay) != 'undefined' ? params.inside_active_delay : (is_touch_device ? 0 : 250); // delay before an active action on a slider item occurs; in milliseconds
    var inside_inactive_delay = typeof(params.inside_inactive_delay) != 'undefined' ? params.inside_inactive_delay : (is_touch_device ? 2500 : 250); // delay before an inactive action outside of a slider item--but still in the slider--occurs; in milliseconds

    var outside_inactive_delay = typeof(params.outside_inactive_delay) != 'undefined' ? params.outside_inactive_delay : (is_touch_device ? 125 : 250); // delay before an inactive action outside of the slider element happens; in milliseconds

    var item_fadein_speed = typeof(params.item_fadein_speed) != 'undefined' ? params.item_fadein_speed : 250; // speed of the item fade in; in milliseconds
    var item_fadein_value = typeof(params.item_fadein_value) != 'undefined' ? params.item_fadein_value : 1; // opacity value of the item fade in; 0 is transparent, 1 is solid, 0.5 is halfway between

    var item_fadeout_speed = typeof(params.item_fadeout_speed) != 'undefined' ? params.item_fadeout_speed : 250; // speed of the item fade out; in milliseconds
    var item_fadeout_value = typeof(params.item_fadeout_value) != 'undefined' ? params.item_fadeout_value : 0.5; // opacity value of the item fade out; 0 is transparent, 1 is solid, 0.5 is halfway between

    var title_fadein_speed = typeof(params.title_fadein_speed) != 'undefined' ? params.title_fadein_speed : 500; // speed of the title fade in; in milliseconds
    var title_fadein_value = typeof(params.title_fadein_value) != 'undefined' ? params.title_fadein_value : 1; // opacity value of the title fade in; 0 is transparent, 1 is solid, 0.5 is halfway between

    var title_fadeout_speed = typeof(params.title_fadeout_speed) != 'undefined' ? params.title_fadeout_speed : 500; // speed of the title fade out; in milliseconds
    var title_fadeout_value = typeof(params.title_fadeout_value) != 'undefined' ? params.title_fadeout_value : 0; // opacity value of the title fade out; 0 is transparent, 1 is solid, 0.5 is halfway between

    var hidden_text_selector = typeof(params.hidden_text_selector) != 'undefined' ? params.hidden_text_selector : 'div.Image div.HiddenText'; // selector for the hidden text connected to each item in the slider

    var title_selector = typeof(params.title_selector) != 'undefined' ? params.title_selector : 'div#project_title'; // selector for the div where the hidden text will be placed
    var title_obj = $(title_selector);

    var slider_selector = typeof(params.slider_selector) != 'undefined' ? params.slider_selector : 'div#carousel'; // selector for the slider
    var slider_obj = $(slider_selector);

  /************************************************************************************************/
  // Define Object & Element Stuff
  var container_name = typeof(params.container_name) != 'undefined' ? params.container_name : document; // 'document' works better than 'window' for touch devices
  var control_name = typeof(params.control_name) != 'undefined' ? params.control_name : document; // 'document' works better than 'window' for touch devices
  var frame_id = 'carousel';
  var wrapper_id = frame_id + '_wrapper';
  var element_id = frame_id + '_element';

  var slider_obj = {};
  slider_obj['container'] = $(container_name);
  slider_obj['control'] = $(control_name);
  slider_obj['frame'] = $('#' + frame_id);
  slider_obj['wrapper'] = slider_obj['frame'].find('div#' + wrapper_id);
  slider_obj['element'] = slider_obj['wrapper'].find('ul#' + element_id);
  slider_obj['element_items'] = slider_obj['element'].find('li');

  var slider_info = {};
  slider_info['first'] = 0;
  slider_info['last'] = slider_obj['element'].find('li').length - 1;
  slider_info['container_width'] = 0;
  slider_info['control_width'] = 0;
  slider_info['frame_width'] = 0;
  slider_info['wrapper_width'] = 0;
  slider_info['element_width'] = 0;


    var li_widths = $.map(slider_obj['element_items'], function(element) {
      return $(element).outerWidth(true);
    });
    li_total_width = eval(li_widths.join('+'));
    slider_obj['wrapper'].width(li_total_width);
    slider_obj['element'].width(li_total_width);

    /**********************************************************************************************/
    // Set slider_params for iScroll
    var iscroll_params = {};
    iscroll_params['hScroll'] = true; // used to disable the horizontal scrolling no matter what. By default you can pan both horizontally and vertically, by setting this parameter to false you may prevent horizontal scroll even if contents exceed the wrapper.
    iscroll_params['vScroll'] = false; // same as above for vertical scroll.
    iscroll_params['hScrollbar'] = false; // set this to false to prevent the horizontal scrollbar to appear.
    iscroll_params['vScrollbar'] = false; // same as above for vertical scrollbar.
    iscroll_params['fixedScrollbar'] = false; // on iOS the scrollbar shrinks when you drag over the scroller boundaries. Setting this to true prevents the scrollbar to move outside the visible area (as per Android). Default: true on Android, false on iOS.
    iscroll_params['fadeScrollbar'] = true; // set to false to have the scrollbars just disappear without the fade effect.
    iscroll_params['hideScrollbar'] = true; // the scrollbars fade away when there’s no user interaction. You may want to have them always visible. Default: true.
    iscroll_params['bounce'] = true; // enable/disable bouncing outside of the boundaries. Default: true.
    iscroll_params['momentum'] = true; // enable/disable inertia. Default: true. Useful if you want to save resources.
    iscroll_params['lockDirection'] = true; // when you start dragging on one axis the other is locked and you can keep dragging only in two directions (up/down or left/right). You may remove the direction locking by setting this parameter to false.
    iscroll_params['zoomMax'] = 4; // this is the maximum allowed scale. Defaulted to 4, it means 4 times the original size.
    iscroll_params['snap'] = false; // iScroll 4 also adds the option to snap to any element inside the scroller regardless of the wrapper size. To snap to elements, pass a string representing the query of the DOM elements the scroller should snap to.

    /**********************************************************************************************/
    // Initialize 'rwSlider'
    var iscroll_var = new iScroll(frame_id, iscroll_params);
    document.addEventListener('touchmove', function (event) { event.preventDefault(); }, false);

    // iscroll_var.scrollTo(li_total_width/2, 0, 1800, true); // scrollTo(x, y, time, relative)
    // iscroll_var.scrollToElement('li:nth-child(48)', 1800); // scrollToElement(element, time)
    // iscroll_var.scrollToPage(3, 0, 1800); // snapToPage(pageX, pageY, time)

      testFunction();
      function testFunction () {

      if (is_touch_device) {
        var active_bindings = 'touchstart MozTouchDown';
        var inactive_bindings = 'touchend MozTouchRelease';
      }
      else {
        var active_bindings = 'mouseenter';
        var inactive_bindings = 'mouseleave';
      }

      var buffer_zone = Math.round($(window).width() / 4);
      var left_boundary = 0 - buffer_zone;
      var right_boundary = $(window).width() + buffer_zone;

      slider_obj['element_items'].unbind(active_bindings + ' ' + inactive_bindings);
      slider_obj['element_items'].bind(active_bindings,
        function(event) {
          clearTimeout(callback_timeout);
          var item_obj = $(this);
          callback_timeout = setTimeout(function() {

            // alert(buffer_zone + ' | ' + item_obj.offset().left);
            if (item_obj.find(hidden_text_selector).length > 0 && title_obj.length > 0) {
              var project_title = item_obj.find(hidden_text_selector).html();
              title_obj.stop(true, true).html(project_title).fadeTo(title_fadein_speed, title_fadein_value);
            }


            item_obj.stop(true, true).fadeTo(item_fadein_speed, item_fadein_value).removeClass('inactive').siblings().each(
              function (index, element) {
                var sibling_element = $(element);
                var sibling_offset = sibling_element.offset();
                if (sibling_offset.left >= left_boundary && sibling_offset.left <= right_boundary) {
                  sibling_element.fadeTo(item_fadeout_speed, item_fadeout_value).addClass('inactive');
                }
              }
            );
            revealSlide(item_obj);


          }, inside_active_delay);
          // event.preventDefault();
          // event.stopPropagation();
        }
      ).bind(inactive_bindings,
        function(event) {
          clearTimeout(callback_timeout);
          callback_timeout = setTimeout(function() {

            if (title_obj.length > 0) {
              title_obj.stop(true, true).fadeTo(title_fadeout_speed, title_fadeout_value,
                function () {
                  $(this).empty();
                }
              );
            }

            slider_obj['element'].find('li.inactive').stop(true, true).fadeTo(item_fadein_speed, item_fadein_value).removeClass('inactive');

          }, inside_inactive_delay);
          // event.preventDefault();
          // event.stopPropagation();
        }
      );

      }

      /**********************************************************************************************/
      // revealSlide function
      function revealSlide (item_obj) {

        // var item_position = item_obj.position();
        var item_position = item_obj.offset();
        var item_margin = item_obj.outerWidth(true) - item_obj.outerWidth();
        if (item_margin == 0) {
          var item_margin = parseInt(item_obj.css('padding-left')) + parseInt(item_obj.css('padding-right'));
        }
        var element_position = slider_obj['element'].position();
        // var element_position = slider_obj['element'].offset();
        var overflow_left = (item_position.left + element_position.left);
        var overflow_right = (item_position.left - $(window).width()) + (item_obj.outerWidth() + element_position.left);

        var extra_area = (item_margin * 4);

        if ((overflow_left < 0 || overflow_right > 0)) {

          if (overflow_left < 0) {
            var slider_value = item_obj.index() == slider_info['first'] ? overflow_left : Math.round(overflow_left - extra_area);
          }
          else if (overflow_right > 0) {
            var slider_value = item_obj.index() == slider_info['last'] ? overflow_right : Math.round(overflow_right + extra_area);
          }
          else {
            var slider_value = slider_obj['element'].position().left;
          }

          iscroll_var.scrollTo(slider_value, 0, 800, true); // scrollTo(x, y, time, relative)
          return;

          var element_params = {};
          element_params['left'] = '-=' + slider_value + 'px';
          element_params['proxy_left'] = element_params['left'];

          var element_options = {};
          element_options['duration'] = 500;
          element_options['queue'] = false;
          element_options['easing'] = 'swing';
          element_options['complete'] = function () {
            var slider_data = {};
            slider_data['directionX'] = 'stop';
            slider_data['lastX'] = slider_obj['wrapper'].data('slider').currentX;
            slider_data['currentX'] =  slider_obj['element'].position().left;
            slider_data['destinationX'] = slider_obj['wrapper'].data('slider').destinationX;
            slider_obj['wrapper'].data('slider', slider_data);
          };
          // slider_obj['element'].animate(element_params, element_options);
        }

      } // revealSlide

  /************************************************************************************************/
  // Adds labels to list items for debugging
  initLabels();
  function initLabels () {
    slider_obj['element_items'].each(function(index, element) {
      var indicator = $('<div />').addClass('Label').prepend($('<p />').text(index));
      $(element).append(indicator);
    });
  } // initLabels

});

})(jQuery);
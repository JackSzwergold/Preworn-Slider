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
 *          2015-05-10, js: placing settings in separate files.
 */

(function($) {

$(document).ready(function() {

    /**********************************************************************************************/
    // Set 'window' params for the slider
    var is_touch_device = typeof(window.is_touch_device) != 'undefined' ? window.is_touch_device : false;

    window.slider_params = {};

    window.slider_params['inside_active_delay'] = is_touch_device ? 0 : 250; // delay before an active action on a slider item occurs; in milliseconds
    window.slider_params['inside_inactive_delay'] = is_touch_device ? 2500 : 250; // delay before an inactive action outside of a slider item--but still in the slider--occurs; in milliseconds
    window.slider_params['inside_event_delay'] = is_touch_device ? 500 : 0; // delay before an active action on a slider item occurs; in milliseconds
    window.slider_params['inside_defer_touch'] = true; // if set to 'true' defers the first touch on an item in the slider, next touch is a click; if 'false' links behave as normal

    window.slider_params['outside_inactive_delay'] = is_touch_device ? 125 : 250; // delay before an inactive action outside of the slider element happens; in milliseconds

    window.slider_params['item_fadein_speed'] = 250; // speed of the item fade in; in milliseconds
    window.slider_params['item_fadein_value'] = 1; // opacity value of the item fade in; 0 is transparent, 1 is solid, 0.5 is halfway between
    window.slider_params['item_fadeout_speed'] = 250; // speed of the item fade out; in milliseconds
    window.slider_params['item_fadeout_value'] = 0.3; // opacity value of the item fade out; 0 is transparent, 1 is solid, 0.5 is halfway between

    window.slider_params['title_fadein_speed'] = 500; // speed of the item fade in; in milliseconds
    window.slider_params['title_fadein_value'] = 1; // opacity value of the item fade in; 0 is transparent, 1 is solid, 0.5 is halfway between
    window.slider_params['title_fadeout_speed'] = 500; // speed of the item fade out; in milliseconds
    window.slider_params['title_fadeout_value'] = 0; // opacity value of the item fade out; 0 is transparent, 1 is solid, 0.5 is halfway between

    window.slider_params['reveal_duration'] = 500; // duration of the item reveal
    window.slider_params['reveal_queue'] = false; // true to queue the reveal animation
    window.slider_params['reveal_easing'] = 'swing'; // easing for the reveal

    window.slider_params['hidden_text_selector'] = 'div.Image div.HiddenText'; // selector for the hidden text connected to each item in the slider
    window.slider_params['title_selector'] = 'div#project_title'; // selector for the div where the hidden text will be placed
    window.slider_params['slider_selector'] = 'div#carousel'; // selector for the slider

    window.slider_params['iscroll_mode'] = true; // if set to true it uses iScroll; otherwise it uses the jQuery functions
    window.slider_params['show_labels'] = true; // shows a small index indicator label on each slide element for debugging
    window.slider_params['show_control_zones'] = false; // shows the control zones for debugging

    window.slider_params['slider_init_ratio'] = 0.5; // sets the initial position of the slider; 0 is left, 1 is right, 0.5 is halfway between
    window.slider_params['pointer_init_ratio'] = 0.5; // sets the initial position of the pointer; 0 is left, 1 is right, 0.5 is halfway between

    window.slider_params['slider_mode'] = ''; // if 'zoned', shifts the slider based on divided zones on the controller; if empty follows direct pointer movement on the controller
    window.slider_params['lock_slider'] = 'all'; // 'all' locks it all the time, 'small' locks when small, 'large' locks when large, blank deactivates it
    window.slider_params['adjust_slider_height'] = 'full'; // sets different options for adjusting the slider height; default is '' (empty) to leave the heigh as is

    window.slider_params['init_duration'] = 0; // sets the animation speed of the init action; in milliseconds
    window.slider_params['init_queue'] = false; // if true, queue's the init animations; if false don't queue the init animations
    window.slider_params['init_easing'] = 'linear'; // sets the easing for init animations

    window.slider_params['slider_duration'] = 500; // sets the animation speed of the slider action; in milliseconds
    window.slider_params['slider_queue'] = false; // if true, queue's the slider animations; if false don't queue the slider animations
    window.slider_params['slider_easing'] = 'swing'; // sets the easing for slider animations

    window.slider_params['control_slices'] = 9; // sets the amount of slices for the controller in zoned mode
    window.slider_params['control_outer'] = 1; // sets the amount of outer slices for the controller in zoned mode
    window.slider_params['control_inner'] = 2; // sets the amount of inner slices for the controller in zoned mode

    window.slider_params['slider_shift_min'] = 0; // sets the minimum amount needed for a 'shift' to happen

    window.slider_params['pointer_interval_value'] = 50; // mouse position is checked at every interval set here; lower numbers stress CPUs more while high numbers make it less accurate

    window.slider_params['container_name'] = window; // selector for the element that surrounds the slider
    // window.slider_params['control_name'] = 'div.Control'; // selector for the element that controls the slider

    // iScroll specific params
    window.slider_params['hScroll'] = true; // 'true' to enable horizontal scrolling.
    window.slider_params['vScroll'] = false; // 'true' to enable vertical scrolling.
    window.slider_params['hScrollbar'] = false; // 'true' to display the horizontal scrollbar.
    window.slider_params['vScrollbar'] = true; // 'true' to vertical the horizontal scrollbar.
    window.slider_params['fixedScrollbar'] = false; // on iOS the scrollbar shrinks when you drag over the scroller boundaries. Setting this to true prevents the scrollbar to move outside the visible area (as per Android). Default: true on Android, false on iOS.
    window.slider_params['fadeScrollbar'] = true; // set to false to have the scrollbars just disappear without the fade effect.
    window.slider_params['hideScrollbar'] = true; // the scrollbars fade away when there’s no user interaction. You may want to have them always visible. Default: true.
    window.slider_params['bounce'] = true; // enable/disable bouncing outside of the boundaries. Default: true.
    window.slider_params['momentum'] = true; // enable/disable inertia. Default: true. Useful if you want to save resources.
    window.slider_params['lockDirection'] = true; // when you start dragging on one axis the other is locked and you can keep dragging only in two directions (up/down or left/right). You may remove the direction locking by setting this parameter to false.
    window.slider_params['zoomMax'] = 4; // this is the maximum allowed scale. Defaulted to 4, it means 4 times the original size.
    window.slider_params['snap'] = false; // iScroll 4 also adds the option to snap to any element inside the scroller regardless of the wrapper size. To snap to elements, pass a string representing the query of the DOM elements the scroller should snap to.
    window.slider_params['useTransition'] = true; // A maximum performance mode that grants the highest speed squeezable out of the Apple device. It is compatible only with a bunch of devices (modern iPhone/iPod/iPad and Playbook).

});

})(jQuery);
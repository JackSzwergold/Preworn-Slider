/**
 * Preworn Helpers (preworn.helpers.js) (c) by Jack Szwergold
 *
 * Preworn Helpers is licensed under a
 * Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
 *
 * You should have received a copy of the license along with this
 * work. If not, see <http://creativecommons.org/licenses/by-nc-sa/4.0/>. 
 *
 * w: http://www.preworn.com
 * e: me@preworn.com
 *
 * Created: 2011-10-08 js
 * Version: 2011-10-08, js: alpha stage
 *          2011-10-08, js: more alpha stage
 *          2011-10-31, js: added 'is_apple_touch_device()'
 */

(function($) {

$(document).ready(function() {


  /************************************************************************************************/
  // Touch Apple device detection

  function is_apple_touch_device(){
    return (
      (navigator.platform.indexOf('iPhone') != -1) ||
      (navigator.platform.indexOf('iPod') != -1) ||
      (navigator.platform.indexOf('iPad') != -1)
    );
  }

  /************************************************************************************************/
  // Touch device detection

  // var is_touch_device = 'ontouchstart' in document.documentElement;
  function is_touch_device () {
    try {
      document.createEvent('TouchEvent');
      return true;
    }
    catch (e) {
      return false;
    }
  }

  /************************************************************************************************/
  // Set as global so all functions can access
  window.is_touch_device = is_touch_device();
  window.is_apple_touch_device = is_apple_touch_device();

});

})(jQuery);
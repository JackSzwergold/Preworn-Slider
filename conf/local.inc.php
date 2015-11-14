<?php

/**
 * Local Config File (local.inc.php) (c) by Jack Szwergold
 *
 * Local Config File is licensed under a
 * Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
 *
 * You should have received a copy of the license along with this
 * work. If not, see <http://creativecommons.org/licenses/by-nc-sa/4.0/>. 
 *
 * w: http://www.preworn.com
 * e: me@preworn.com
 *
 * Created: 2014-02-16, js
 * Version: 2014-02-16, js: creation
 *          2014-02-16, js: development & cleanup
 *
 */

/**************************************************************************************************/
// Define localized defaults.

// Enable or disable JSON debugging output.
$DEBUG_OUTPUT_JSON = false;

// Set the base URL path.
if ($_SERVER['SERVER_NAME'] == 'localhost') {
  define('BASE_PATH', '/Preworn-Slider/');
}
else {
  define('BASE_PATH', '/art/slider/');
}

// Site descriptive info.
$SITE_TITLE = 'Slider';
$SITE_DESCRIPTION = 'A simple slider I created which works well on desktop as well as mobile browsers using jQuery and CSS3 WebKit commands.';
$SITE_URL = 'http://www.preworn.com/slider/';
$SITE_COPYRIGHT = '(c) Copyright ' . date('Y') . ' Jack Szwergold. Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.';
$SITE_ROBOTS = 'noindex, nofollow';
$SITE_VIEWPORT = 'width=device-width, initial-scale=0.65, maximum-scale=2, minimum-scale=0.65, user-scalable=yes';

// Payment info.
$PAYMENT_INFO = array();
$PAYMENT_INFO['amazon']['short_name'] = 'Amazon';
$PAYMENT_INFO['amazon']['emoji'] = '🎥📚📀';
$PAYMENT_INFO['amazon']['url'] = 'http://www.amazon.com/?tag=lastplacechamp-20';
$PAYMENT_INFO['amazon']['description'] = 'Support me when you buy things on Amazon with this link.';
$PAYMENT_INFO['paypal']['short_name'] = 'PayPal';
$PAYMENT_INFO['paypal']['emoji'] = '💰💸💳';
$PAYMENT_INFO['paypal']['url'] = 'https://www.paypal.me/JackSzwergold';
$PAYMENT_INFO['paypal']['description'] = 'Support me with a PayPal donation.';

// Set the page DIVs array.
$PAGE_DIVS_ARRAY = array();

// Set the JavaScript array.
$JAVASCRIPTS_ITEMS = array();
$JAVASCRIPTS_ITEMS[] = 'script/json2.js';
$JAVASCRIPTS_ITEMS[] = 'script/jquery/jquery-1.11.3.min.js';
$JAVASCRIPTS_ITEMS[] = 'script/jquery/jquery-1.11.3.min.map';
$JAVASCRIPTS_ITEMS[] = 'script/jquery/jquery.noconflict.js';
$JAVASCRIPTS_ITEMS[] = 'script/iscroll.js';
$JAVASCRIPTS_ITEMS[] = 'script/preworn.helpers.js';
$JAVASCRIPTS_ITEMS[] = 'script/preworn.slider.js';
$JAVASCRIPTS_ITEMS[] = 'script/preworn.slider.settings.iscroll.js';
$JAVASCRIPTS_ITEMS[] = 'script/preworn.slider.init.js';
    
// Set the CSS array.
$CSS_ITEMS = array();
$CSS_ITEMS[] = 'css/style.css';

// Set the controller and parameter stuff.
$VALID_CONTROLLERS = array();
$DISPLAY_CONTROLLERS = array();
$VALID_GET_PARAMETERS = array('_debug');

?>

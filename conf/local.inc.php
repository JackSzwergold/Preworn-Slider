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

if ($_SERVER['SERVER_NAME'] == 'localhost') {
  define('BASE_PATH', '/Preworn-Slider/');
}
else {
  define('BASE_PATH', '/art/slider/');
}

// Site descriptive info.
$SITE_TITLE = 'Slider';
$SITE_DESCRIPTION = 'Some PHP classes to handle slider display stuff.';
$SITE_URL = 'http://www.preworn.com/slider/';
$SITE_COPYRIGHT = '(c) Copyright ' . date('Y') . ' Jack Szwergold. Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.';
$SITE_ROBOTS = 'noindex, nofollow';
$SITE_VIEWPORT = 'width=device-width, initial-scale=0.65, maximum-scale=2, minimum-scale=0.65, user-scalable=yes';

// Amazon link info.
$AMAZON_INFO = array();
$AMAZON_INFO['short_name'] = 'amazon';
$AMAZON_INFO['url'] = 'http://www.amazon.com/?tag=lastplacechamp-20';
$AMAZON_INFO['description'] = 'Support me when you buy things on Amazon with this link.';

// PayPal link info.
$PAYPAL_INFO = array();
$PAYPAL_INFO['short_name'] = 'paypal';
$PAYPAL_INFO['url'] = 'https://www.paypal.me/JackSzwergold';
$PAYPAL_INFO['description'] = 'Support me with a PayPal donation.';

// Set the page DIVs array.
$PAGE_DIVS_ARRAY = array();

// Set the javascript values.
$JAVASCRIPTS_ARRAY = array();
$JAVASCRIPTS_ARRAY[] = 'script/json2.js';
$JAVASCRIPTS_ARRAY[] = 'script/jquery/jquery-1.11.3.min.js';
$JAVASCRIPTS_ARRAY[] = 'script/jquery/jquery-1.11.3.min.map';
$JAVASCRIPTS_ARRAY[] = 'script/jquery/jquery.noconflict.js';
$JAVASCRIPTS_ARRAY[] = 'script/iscroll.js';
$JAVASCRIPTS_ARRAY[] = 'script/preworn.helpers.js';
$JAVASCRIPTS_ARRAY[] = 'script/preworn.slider.js';
$JAVASCRIPTS_ARRAY[] = 'script/preworn.slider.settings.iscroll.js';
$JAVASCRIPTS_ARRAY[] = 'script/preworn.slider.init.js';
    
// Set the controller and parameter stuff.
$VALID_CONTROLLERS = array();
$DISPLAY_CONTROLLERS = array();
$VALID_GET_PARAMETERS = array('_debug');

?>

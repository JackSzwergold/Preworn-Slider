<?php

/**
 * Frontend Display Helpers (frontendDisplayHelpers.php) (c) by Jack Szwergold
 *
 * Frontend Display Helpers is licensed under a
 * Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
 *
 * You should have received a copy of the license along with this
 * work. If not, see <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
 *
 * w: http://www.preworn.com
 * e: me@preworn.com
 *
 * Created: 2015-11-10, js
 * Version: 2015-11-10, js: creation
 *          2015-11-10, js: development
 *
 */

//**************************************************************************************//
// Require the basic configuration settings & functions.

require_once BASE_FILEPATH . '/lib/slider_display.class.php';

//**************************************************************************************//
// Set the mode.

// $VIEW_MODE = 'shortlist';
// $VIEW_MODE = 'mediumlist';
$VIEW_MODE = 'longlist';

//**************************************************************************************//
// Init the display class and get the values.

$DisplayClass = new Display();
$body = $DisplayClass->set_body_content(144);

?>
<?php

/**
 * Colorspace Display Stuff (colorspace_display.class.php) (c) by Jack Szwergold
 *
 * Colorspace Display Stuff is licensed under a
 * Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
 *
 * You should have received a copy of the license along with this
 * work. If not, see <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
 *
 * w: http://www.preworn.com
 * e: me@preworn.com
 *
 * Created: 2015-05-11, js
 * Version: 2015-05-11, js: creation
 *          2015-05-11, js: development & cleanup
 *
 */

//**************************************************************************************//
// Here is where the magic happens!

class Display {

  // private $color_array_source = array('blue', 'gray', 'green', 'orange', 'purple', 'red');
  private $color_array_source = array('#D8DDCE', '#C1D1BF', '#A5BFAA', '#7FA08C', '#5B8772', '#21543F', '#0C3026');
  // private $color_array_source = array('#272231', '#3E2E40', '#5A4055', '#805F73', '#A4788D', '#DEABC0', '#F3CFD9');
  private $color_array = array();

  private $width_min = 100;
  private $width_max = 240;

  private $height_min = 120;
  private $height_max = 420;

  /**************************************************************************************/

  public function __construct() {

    // Init the color array based on the source values.
    $this->color_array = $this->color_array_source;

  } // __construct

  /**************************************************************************************/

  public function create_slider_item ($color_array_source = array(), $width = 0, $height = 0) {

    // If the color array is empty, reload the source color values into the array.
    if (empty($this->color_array)) {
      $this->color_array = $this->color_array_source;
    }

    // Shuffle the array.
    shuffle($this->color_array);

    // Shift the first item off of the newly shuffled array.
    $color = array_shift($this->color_array);

    // Get a random value for the width and height.
    $width = rand($this->width_min, $this->width_max);
    $height = rand($this->height_min, $this->height_max);

    $text = '<div class="HiddenText">'
          . '<p><i>Hello</i>, world!</p>'
          . '</div><!-- .HiddenText -->'
          ;

    $ret = '<li>'
         . '<div class="Image">'
         . '<div class="Padding">'
         . '<a href="http://www.preworn.com/">'
         . sprintf('<div style="background-color: %s; width: %dpx; height: %dpx"></div>', $color, $width, $height)
         . '</a>'
         . $text
         . '</div><!-- .Padding -->'
         . '</div><!-- .Image -->'
         . '</li>'
         ;

    return $ret;

  } // create_slider_item

  /**************************************************************************************/

  public function set_body_content ($how_many_items = 12) {

    $list_items = '';
    for ($x = 0; $x <= $how_many_items; $x++) {
      $list_items .= $this->create_slider_item();
    }

    $body = '<br />'
          . '<br />'
          . '<br />'
          . '<div class="carouselFrame" id="carousel">'
          . '<div class="carouselWrapper" id="carousel_wrapper">'
          . '<ul id="carousel_element">'
          . $list_items
          . '</ul>'
          . '</div><!-- .carouselWrapper -->'
          . '</div><!-- .carouselFrame -->'
          . '<div class="container" id="project_title_wrapper">'
          . '<div class="nav" id="project_title">'
          . '&nbsp;Watch this space...'
          . '</div><!-- .nav -->'
          . '</div><!-- .container -->'
          ;

    return $body;

  } // set_body_content

} // Grids

?>
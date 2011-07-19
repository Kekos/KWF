<?php
/**
 * KWF Class: view, loads and compiles the template set by a controller
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2011-04-24
 * @version 3.0
 */

class view
  {
  private $template;
  private $data = array();

  /*
   * Constructor: view
   *
   * @param string $template The name of template, without paths and extensions. Error will be thrown if the template is missing
   * @return void
   */
  public function __construct($template, $data = array())
    {
    $this->template = BASE . 'view/' . $template . '.phtml';
    if (!file_exists($this->template))
      {
      throw new Exception('Template file "' . $this->template . '" is missing');
      }

    if (!is_array($data))
      {
      throw new Exception('Incorrect data type passed to view. Must be an array.');
      }

    $this->data = $data;
    }

  /*
   * Starts output buffering, requires the template file and then returns the output made and cleans the buffer
   *
   * @param string $route Contains the route to page which started the calling controller
   * @param string $params Contains the params sent to page which started the calling controller
   * @return string The output data
   */
  public function compile($route = '', $params = '')
    {
    /* Extract data variables array to this scope, it looks better in template files */
    extract($this->data, EXTR_SKIP);
    $this->data = null;

    /* Start output buffer this template and return its output */
    ob_start();
    require($this->template);
    return ob_get_clean();
    }
  }
?>
<?php
/**
 * KWF Class: View, parent class for views, this must be extended
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2013-02-17
 * @version 1.0
 */

abstract class View
  {
  protected $template;
  protected $content_type;
  protected $data = array();

  /**
   * Returns the content type
   *
   * @return string The content type
   */
  public function getContentType()
    {
    return $this->content_type;
    }

  /**
   * Adds view data
   *
   * @param string $key Data variable name
   * @param mixed $new_data Data to add
   */
  public function addData($key, $new_data)
    {
    $this->data[$key] = $new_data;
    }

  /**
   * Starts output buffering, requires the template file and then returns the output made and cleans the buffer
   *
   * @param string $route Contains the route to page which started the calling controller
   * @param string $params Contains the params sent to page which started the calling controller
   * @return string The output data
   */
  abstract public function compile();
  }
?>
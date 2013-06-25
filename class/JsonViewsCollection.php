<?php
/**
 * KWF Class: JsonViewsCollection, corresponds to a collection of Views
 * encoded to JSON
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2013-04-18
 * @version 1.0
 */

class JsonViewsCollection extends View
  {
  private $view_collection = array();

  /**
   * Constructor
   *
   * @param mixed[] $data Data array that's able to be encoded to JSON
   * @param View[] $view_collection The view collection as array. Will be
   *        appended to the data variable as "views" property when compiled
   */
  public function __construct($data, $view_collection)
    {
    $this->content_type = 'json';

    if (!is_array($data))
      {
      throw new Exception('Incorrect data type passed to view. Must be an array.');
      }

    $this->data = $data;
    $this->view_collection = $view_collection;
    }

  /**
   * Starts output buffering, compiles all views in collection
   *
   * @param string $route Contains the route to page which started the calling controller
   * @param string $params Contains the params sent to page which started the calling controller
   * @return string The output data
   */
  public function compile($route = '', $params = '')
    {
    foreach ($this->view_collection as &$view)
      {
      $view = $view->compile($route, $params);
      }

    $this->data['views'] = $this->view_collection;

    return JsonEncoder::encode($this->data);
    }
  }
?>
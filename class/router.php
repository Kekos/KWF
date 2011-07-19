<?php
/**
 * KWF Class: router, finds out which page that should be used according to the given URL route
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @version 2.0
 */

class router
  {
  private $route;
  private $request;
  private $page_model;

  /*
   * Constructor: router
   *
   * @param string $route The unparsed complete route that produced the request
   * @param object $request The request object that created the instance
   * @param object $page_model The page model object to get page data from
   * @return void
   */
  public function __construct($route, $request, $page_model)
    {
    $this->route = $route;
    $this->request = $request;
    $this->page_model = $page_model;

    $this->request->params = explode('/', $this->route);
    if (empty($this->request->params[0]))
      {
      $this->request->params[0] = 'index';
      }

    if (empty($this->request->params[count($this->request->params) - 1]))
      {
      unset($this->request->params[count($this->request->params) - 1]);
      }
    }

  /*
   * Get the page
   *
   * @return object The page object that will run the controllers
   */
  public function getPage()
    {
    return new page($this->page_model, $this->request);
    }
  }
?>
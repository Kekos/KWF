<?php
/**
 * KWF Class: Controller, the generalized controller class. Must be extended
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2013-01-18
 * @version 4.0
 */

abstract class Controller
  {
  protected $request;
  protected $response;
  protected $page;
  protected $controller_data;
  protected $route;
  protected $params;
  protected $view;

  /**
   * Constructor: controller
   *
   * @param Request $request The request object that created the instance
   * @param Response $response The response object used to make output
   * @param Page $page The page object
   * @param mixed[] $controller_data An array with data associated to controller
   * @param string $route Contains the route to page which started this controller
   * @param string $params Contains the params sent to page which started this controller
   */
	public function __construct($request, $response, $page, $controller_data, $route, $params)
    {
    $this->request = $request;
    $this->response = $response;
    $this->page = $page;
    $this->controller_data = $controller_data;
    $this->route = $route;
    $this->params = $params;
    }

  /**
   * Runs the controller (set the view template file, set response content type and add content to response)
   */
	abstract public function run();
  }
?>
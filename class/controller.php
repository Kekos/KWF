<?php
/**
 * KWF Class: controller, the generalized controller class. Must be extended
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2011-04-24
 * @version 3.0
 */

abstract class controller
  {
  protected $request;
  protected $response;
  protected $controller_data;
  protected $route;
  protected $params;
  protected $view;

  /*
   * Constructor: controller
   *
   * @param object $request The request object that created the instance
   * @param object $response The response object used to make output
   * @param array $controller_data An array with data associated to controller
   * @param string $route Contains the route to page which started this controller
   * @param string $params Contains the params sent to page which started this controller
   * @return void
   */
	public function __construct($request, $response, $controller_data, $route, $params)
    {
    $this->request = $request;
    $this->response = $response;
    $this->controller_data = $controller_data;
    $this->route = $route;
    $this->params = $params;
    }

  /*
   * Runs the controller (set the view template file, set response content type and add content to response)
   *
   * @return void
   */
	abstract public function run();
  }
?>
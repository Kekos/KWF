<?php
/**
 * KWF Class: page, runs all controllers that is defined to be run in the page
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2011-06-11
 * @version 3.1
 */

class page
  {
  private $model;
  private $request;

  public $response;
  public $page = false;

  /*
   * Constructor: page
   *
   * @param object $model The page model object to get page data from
   * @param object $request The request object that created the instance
   * @return void
   */
  public function __construct($model, $request)
    {
    $this->model = $model;
    $this->request = $request;
    $this->response = new response($this->request);
    }

  /*
   * Runs all controllers within the page
   *
   * @return void
   */
  public function runControllers()
    {
    $max_param = count($this->request->params);
    while ($this->page == false && $max_param > 0)
      {
      $use_route = implode('/', array_slice($this->request->params, 0, $max_param));
      $this->page = $this->model->getPage($use_route);
      --$max_param;
      }

    if (!$this->page && !($this->page = $this->model->getPage('404')))
      {
      throw new Exception('The page "' . $use_route . '" could not be found. Additionally, the internal 404 page does not exist.');
      }

    $this->response->title = (is_object($this->page) ? $this->page->title : $this->page['title']);

    $args = array_slice($this->request->params, $max_param + 1);
    $default_args = $args;
    if (count($args))
      {
      $function = $args[0];
      unset($args[0]);
      }
    else
      {
      $function = '_default';
      }

    foreach ($this->model->getControllers($use_route) as $controller)
      {
      $controller_name =  (is_object($controller) ? $controller->name : $controller['name']);
      $controller_obj = new $controller_name($this->request, $this->response, 
          $controller, $use_route, implode('/', $default_args));

      if (method_exists($controller_obj, 'before'))
        {
        $this->callControllerFunction($controller_obj, 'before', $default_args);
        }

      if (method_exists($controller_obj, $function))
        {
        $this->callControllerFunction($controller_obj, $function, $args);
        }
      else
        {
        $this->callControllerFunction($controller_obj, '_default', $default_args);
        }

      if (method_exists($controller_obj, 'after'))
        {
        $this->callControllerFunction($controller_obj, 'after', $default_args);
        }

      $controller_obj->run();
      }
    }

  /*
   * Calls a method on a controller with the URI segments as arguments
   *
   * @param object $controller The controller which have the $function
   * @param string $function The method that should be called
   * @param array(string) $args The URI segments that should be passed as arguments
   * @return void
   */
  private function callControllerFunction($controller, $function, $args)
    {
    call_user_func_array(array($controller, $function), $args);
    }

  /*
   * Get the content from response object
   *
   * @return string The response content
   */
  public function getResponseContent()
    {
    return $this->response->getContent();
    }
  }
?>
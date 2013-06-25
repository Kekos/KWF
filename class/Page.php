<?php
/**
 * KWF Class: Page, runs all controllers that is defined to be run in the page
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2013-02-17
 * @version 5.0
 */

class Page
  {
  public $title = '';
  public $route = '';
  public $controllers = array();
  public $view = null;

  private $response = null;
  private $arguments = array();

  /**
   * Sets the controller arguments
   *
   * @param string[] $args The arguments
   */
  public function setArguments($args)
    {
    $this->arguments = $args;
    }

  /**
   * Runs all controllers within the page
   * Creates the Response
   *
   * @param Request $request The request object that created the instance
   */
  public function runControllers($request)
    {
    // Get the page view (which controllers' view will go into)
    // The page view can be specified with 'DEFAULT_VIEW', then we will create
    // that object now
    if ($this->view == 'DEFAULT_VIEW')
      {
      $this->view = new HTMLView(RESPONSE_LAYOUT, array('title', $this->title));
      }

    $this->response = new Response($request, $this->view);
    $this->response->title = $this->title;

    $args = $this->arguments;
    $params_str = implode('/', $args);

    // If there are arguments, let the first argument specify the function
    if (count($args) > 0)
      {
      $function = array_shift($args);
      }
    // Or else, let it be the default function
    else
      {
      $function = '_default';
      }

    // Iterate over the controller collection
    foreach ($this->controllers as $controller)
      {
      // Get the controller name, but we can't assume $controller is an object
      $controller_name = (is_object($controller) ? $controller->name : $controller['name']);

      // Create Controller object
      $controller_obj = new $controller_name($request, $this->response, $this, 
          $controller, $this->route, $params_str);

      if (method_exists($controller_obj, 'before'))
        {
        $this->callControllerFunction($controller_obj, 'before', $this->arguments);
        }

      if (method_exists($controller_obj, $function))
        {
        $this->callControllerFunction($controller_obj, $function, $args);
        }
      else
        {
        $this->callControllerFunction($controller_obj, '_default', $this->arguments);
        }

      if (method_exists($controller_obj, 'after'))
        {
        $this->callControllerFunction($controller_obj, 'after', $this->arguments);
        }

      // Run means compiling the controller's view or any other output
      $controller_obj->run();
      $this->response->setContentType($controller_obj->getViewContentType());
      }
    }

  /**
   * Calls a method on a controller with the URI segments as arguments
   *
   * @param object $controller The controller which have the $function
   * @param string $function The method that should be called
   * @param string[] $args The URI segments that should be passed as arguments
   */
  private function callControllerFunction($controller, $function, $args)
    {
    call_user_func_array(array($controller, $function), $args);
    }

  /**
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
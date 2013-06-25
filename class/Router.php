<?php
/**
 * KWF Class: Router, finds out which page that should be used according to the given URL route
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2013-03-31
 * @version 3.0
 */

class Router
  {
  private $request;
  private $page_model;
  private $page = null;

  /**
   * Constructor
   *
   * @param Request $request The request object that created the instance
   * @param object $page_model The page model object to get page data from
   */
  public function __construct($request, $page_model)
    {
    $this->request = $request;
    $this->page_model = $page_model;

    // Sanity check of route, remove empty last parameter
    $temp_params = $request->params;
    $last_param = end($temp_params);
    if (empty($last_param))
      {
      array_pop($temp_params);
      $request->setParams($temp_params);
      }

    // If the entire route is empty, we fallback to "index" page
    if (empty($temp_params[0]))
      {
      $temp_params[0] = 'index';
      $request->setParams($temp_params);
      }
    }

  /**
   * Get the page
   *
   * @return Page The page object that will run the controllers
   */
  public function getPage()
    {
    // Keep track of maximum number of params to try finding a Page for
    $max_param = count($this->request->params);

    // Try finding a page as long as no page is found and not all params are tested
    while ($this->page == null && $max_param > 0)
      {
      // Compose a route for page by the params up to $max_params (we are 
      // first trying the longest route and last the route with only one param)
      $use_route = implode('/', array_slice($this->request->params, 0, $max_param));

      $this->page = $this->page_model->getPage($use_route);

      --$max_param;
      }

    // If a page still isn't found, find the 404 page
    if ($this->page == null)
      {
      $this->page = $this->page_model->getPage('404');

      // The 404 page wasn't found. That's an Exception
      if ($this->page == null)
        {
        throw new Exception('The page "' . $use_route . '" could not be found. Additionally, the internal 404 page does not exist.');
        }
      }

    // The params not used for finding the page is referred as 
    // "controller arguments"
    $args = array_slice($this->request->params, $max_param + 1);
    $this->page->setArguments($args);

    $this->page->controllers = $this->page_model->getControllers();

    return $this->page;
    }
  }
?>
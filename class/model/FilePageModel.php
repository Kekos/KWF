<?php
/**
 * KWF Model: FilePageModel, retrievs Page objects from files in /pages/ directory
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2013-02-17
 * @version 1.0
 */

class FilePageModel extends PageModel
  {
  protected $controllers = array();

  /**
   * Searches for a page in the /pages/ directory
   */
  public function getPage($page_name)
    {
    $page_file = BASE . 'pages/' . $page_name . '.php';

    // Look in /pages/ directory for the page file
    if (file_exists($page_file))
      {
      $this->page = new Page();
      $this->page->route = $page_name;

      // Include the page file and let it populate the Page object
      require($page_file);

      return $this->page;
      }
    else
      {
      return null;
      }
    }

  /**
   * Adds a Controller to $controllers collection
   *
   * @param string $controller Name of controller class
   * @param string $content Arbitrary information to send to controller, e.g. JSON string
   */
  public function addController($controller, $content)
    {
    $this->controllers[] = array('name' => $controller, 'content' => $content);
    }
  }
?>
<?php
/**
 * KWF Model: PageModel
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2012-06-12
 * @version 2.0
 */

class PageModel
  {
  private $page = array();
  private $controllers = array();

  public function addController($controller, $content)
    {
    $this->controllers[] = array('name' => $controller, 'content' => $content);
    }

  public function getPage($page_name)
    {
    $this->page = array();
    $this->controllers = array();

    $page_file = BASE . 'pages/' . $page_name . '.php';
    if (!file_exists($page_file))
      {
      return false;
      }

    require($page_file);

    return $this->page;
    }

  public function getControllers()
    {
    return $this->controllers;
    }
  }
?>
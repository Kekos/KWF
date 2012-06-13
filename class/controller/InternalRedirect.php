<?php
/**
 * KWF Controller: InternalRedirect
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2012-06-12
 * @version 1.0
 */

class InternalRedirect extends Controller
  {
  public function _default()
    {
    return $this->page->routeRedirect('index');
    }

  public function run()
    {
    if ($this->view != null)
      {
      $this->response->setContentType('html');
      $this->response->addContent($this->view->compile($this->route, $this->params));
      }
    }
  }
?>
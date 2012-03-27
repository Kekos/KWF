<?php
/**
 * KWF Controller: internal_redirect
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2012-03-27
 * @version 1.0
 */

class internal_redirect extends controller
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
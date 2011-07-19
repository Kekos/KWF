<?php
/**
 * KWF Controller: text
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2011-04-24
 * @version 3.0
 */

class text extends controller
  {
  public function _default()
    {
    if (substr($this->controller_data['content'], 0, 9) == 'template:')
      {
      $this->view = new view(substr($this->controller_data['content'], 9));
      }
    else
      {
      $data['content'] = $this->controller_data['content'];
      $this->view = new view('text', $data);
      }
    }

  public function run()
    {
    if ($this->view != null)
      {
      $this->response->setContentType('html'); // The controller MUST set the content type
      $this->response->addContent($this->view->compile($this->route, $this->params));
      }
    }
  }
?>
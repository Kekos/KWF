<?php
/**
 * KWF Controller: Text
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2012-06-12
 * @version 3.1
 */

class Text extends Controller
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
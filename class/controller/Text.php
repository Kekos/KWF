<?php
/**
 * KWF Controller: Text
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2013-02-17
 * @version 3.2
 */

class Text extends Controller
  {
  public function _default()
    {
    if (substr($this->controller_data['content'], 0, 9) == 'template:')
      {
      $this->view = new HTMLView(substr($this->controller_data['content'], 9));
      }
    else
      {
      $data['content'] = $this->controller_data['content'];
      $this->view = new HTMLView('text', $data);
      }
    }

  public function run()
    {
    if ($this->view != null)
      {
      $this->response->addContent($this->view->compile($this->route, $this->params));
      }
    }
  }
?>
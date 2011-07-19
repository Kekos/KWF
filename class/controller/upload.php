<?php
/**
 * KWF Controller: upload
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2011-04-24
 * @version 1.1
 */

class upload extends controller
  {
  public function _default()
    {
    $this->view = new view('upload');
    if ($this->request->file('file'))
      {
      $this->doUpload();
      }
    }

  private function doUpload()
    {
    $file = $this->request->file('file');
    if (isset($file['ajax']))
      move_ajax_uploaded_file($file['stream'], 'uploads/' . $file['name']);
    else
      move_uploaded_file($file['tmp_name'], 'uploads/' . $file['name']);

    $this->response->addInfo('Du laddade upp filen ' . $file['name']);
    $this->view = null;
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
<?php
/**
 * KWF Controller: Upload
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2012-07-25
 * @version 1.2
 */

class Upload extends Controller
  {
  private $data = array('form' => true, 'list' => true, 'footer' => true);

  public function before()
    {
    Language::load('pages');
    }

  public function _default()
    {
    if ($this->request->file('file'))
      {
      $this->doUpload();
      $this->showListOnly();
      }

    $this->data['uploads'] = scandir('uploads/');
    $this->setUploadView();
    }

  public function remove($file)
    {
    if (file_exists('uploads/' . $file))
      {
      unlink('uploads/' . $file);
      $this->response->addInfo(_('UPLOAD_INFO_DELETED', $file));
      }
    else
      {
      $this->response->addError(_('UPLOAD_ERROR_DELETE', $file));
      }

    $this->showListOnly();
    $this->_default();
    }

  private function doUpload()
    {
    $file = $this->request->file('file');
    if (isset($file['ajax']))
      move_ajax_uploaded_file($file['stream'], 'uploads/' . $file['name']);
    else
      move_uploaded_file($file['tmp_name'], 'uploads/' . $file['name']);

    $this->response->addInfo(_('UPLOAD_INFO_UPLOADED', $file['name']));
    }

  private function setUploadView()
    {
    $this->view = new View('upload', $this->data);
    }

  private function showListOnly()
    {
    if ($this->request->ajax_request)
      {
      $this->data['form'] = false;
      $this->data['footer'] = false;
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
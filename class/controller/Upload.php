<?php
/**
 * KWF Controller: Upload
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2012-12-30
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
      $this->response->addInfo(__('UPLOAD_INFO_DELETED', $file));
      }
    else
      {
      $this->response->addError(__('UPLOAD_ERROR_DELETE', $file));
      }

    $this->showListOnly();
    $this->_default();
    }

  private function doUpload()
    {
    $files = $this->request->file('file');
    $file_names = array();

    if (!is_array($files))
      {
      $files = array($files);
      }

    foreach ($files as $file)
      {
      move_uploaded_file($file['tmp_name'], 'uploads/' . $file['name']);
      $file_names[] = $file['name'];
      }

    $this->response->addInfo(__('UPLOAD_INFO_UPLOADED', implode(', ', $file_names)));
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
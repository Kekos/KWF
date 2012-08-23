<?php
/**
 * KWF Class: Application, caches data common for the whole application
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2012-08-23
 * @version 1.0
 */

class Application
  {
  private $vars = array();
  private $filename = '';
  private $is_changed = false;

  const CACHE_FILE = 'class/app.cache';

  static $instance = null;

  private function __construct()
    {
    $filename = BASE . self::CACHE_FILE;
    if (is_file($filename))
      {
      // Delete the appcache file older than 1 day
      if (filemtime($filename) < (time() - 86400))
        {
        unlink($filename);
        }
      else
        {
        $this->vars = unserialize(file_get_contents($filename));
        }
      }
    else
      {
      file_put_contents($filename, '');
      }

    $this->filename = realpath($filename);
    }

  function __destruct()
    {
    if ($this->is_changed)
      {
      file_put_contents($this->filename, serialize($this->vars));
      }
    }

  /*
   * Returns the only instance of this class (singleton)
   *
   * @return Instance of class Application
   */
  static function getInstance()
    {
    if (self::$instance == null)
      {
      self::$instance = new Application;
      }

    return self::$instance;
    }

  /*
   * Sets an application variable
   *
   * @param string $key The array key that identificates the variable
   * @param string $value Value to store in variable
   * @return void
   */
  public function set($key, $value)
    {
    $this->vars[$key] = $value;
    $this->is_changed = true;
    }

  /*
   * Deletes an application variable
   *
   * @param string $key The array key that identificates the variable
   * @return void
   */
  public function delete($key)
    {
    unset($this->vars[$key]);
    $this->is_changed = true;
    }

  /*
   * Gets an application variable
   *
   * @param string $key The array key that identificates the variable
   * @param boolean/numeric $return_empty_undefined If true it returns an empty string if the variable doesn't exist
   * @return string/boolean Returns the application variable or false/empty string
   */
  public function get($key, $return_empty_undefined = 0)
    {
    if (isset($this->vars[$key]))
      {
      return $this->vars[$key];
      }
    else
      {
      return ($return_empty_undefined ? '' : false);
      }
    }
  }
?>
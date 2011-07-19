<?php
/**
 * KWF Class: session, keeps track of all sessions and adds a little more security to sessions
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @version 2.0
 */

class session
  {
  private $ip;
  private $proxy;

  public function __construct()
    {
    session_start();

    if (isset($_SERVER['HTTP_X_FORWARDED_FOR']))
      {
      $this->ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
      $this->proxy = (isset($_SERVER['HTTP_CLIENT_IP']) ? $_SERVER['HTTP_CLIENT_IP'] : $_SERVER['REMOTE_ADDR']);
      }
    else
      {
      $this->ip = (isset($_SERVER['HTTP_CLIENT_IP']) ? $_SERVER['HTTP_CLIENT_IP'] : $_SERVER['REMOTE_ADDR']);
      $this->proxy = '';
      }

    if (!$this->get('ip') && !$this->get('proxy'))
      {
      $this->set('ip', $this->ip);
      $this->set('proxy', $this->proxy);
      }
    else if ($this->get('ip') != $this->ip || $this->get('proxy') != $this->proxy)
      {
      throw new Exception('A possible XSS attempt was encountered');
      }
    }

  /*
   * Sets a session variable
   *
   * @param string $key The array key that identificates the variable
   * @param string $value Value to store in variable
   * @return void
   */
  public function set($key, $value)
    {
    $_SESSION[SESSION_PREFIX . '_' . $key] = $value;
    }

  /*
   * Deletes a session variable
   *
   * @param string $key The array key that identificates the variable
   * @return void
   */
  public function delete($key)
    {
    unset($_SESSION[SESSION_PREFIX . '_' . $key]);
    }

  /*
   * Gets a session variable
   *
   * @param string $key The array key that identificates the variable
   * @param boolean/numeric $return_empty_undefined If true it returns an empty string if the variable doesn't exist
   * @return string/boolean Returns the session variable or false/empty string
   */
  public function get($key, $return_empty_undefined = 0)
    {
    if (isset($_SESSION[SESSION_PREFIX . '_' . $key]))
      {
      return $_SESSION[SESSION_PREFIX . '_' . $key];
      }
    else
      {
      return ($return_empty_undefined ? '' : false);
      }
    }
  }
?>
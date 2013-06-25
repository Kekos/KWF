<?php
/**
 * KWF Class: Session, just an object oriented interface for standard PHP session handling
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2013-02-17
 * @version 2.2
 */

class Session
  {
  public function __construct()
    {
    session_start();
    }

  /**
   * Sets a session variable
   *
   * @param string $key The array key that identificates the variable
   * @param string $value Value to store in variable
   */
  public function set($key, $value)
    {
    $_SESSION[SESSION_PREFIX . '_' . $key] = $value;
    }

  /**
   * Deletes a session variable
   *
   * @param string $key The array key that identificates the variable
   */
  public function delete($key)
    {
    unset($_SESSION[SESSION_PREFIX . '_' . $key]);
    }

  /**
   * Gets a session variable
   *
   * @param string $key The array key that identificates the variable
   * @param bool|int $return_empty_undefined If true it returns an empty string if the variable doesn't exist
   * @return string|bool Returns the session variable or false/empty string
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
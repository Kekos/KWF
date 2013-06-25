<?php
/**
 * KWF Class: Cookie, just an object oriented interface for standard PHP cookie handling
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2013-02-17
 * @version 2.1
 */

class Cookie
  {
  /**
   * Sets a cookie
   *
   * @param string $key The array key that identificates the cookie
   * @param string $value Value to store in cookie
   * @param int $expires The time the cookie expires as UNIX timestamp
   * @param string $path The path on the server in which the cookie will be available on
   * @param string $domain The domain that the cookie is available to
   * @param bool $secure Indicates that the cookie should only be transmitted over a secure HTTPS connection from the client
   * @param bool $http_only When TRUE the cookie will be made accessible only through the HTTP protocol
   */
  public function set($key, $value, $expires = 0, $path = '', $domain = '', $secure = false, $http_only = false)
    {
    if ($path == '')
      $path = FULLPATH . $path;

    setcookie($key, $value, $expires, $path, $domain, $secure, $http_only);
    }

  /**
   * Deletes a cookie
   *
   * @param string $key The array key that identificates the variable
   * @param int $expires The time the cookie expires as UNIX timestamp
   * @param string $path The path on the server in which the cookie will be available on
   * @param string $domain The domain that the cookie is available to
   * @param bool $secure Indicates that the cookie should only be transmitted over a secure HTTPS connection from the client
   * @param bool $http_only When TRUE the cookie will be made accessible only through the HTTP protocol
   */
  public function delete($key, $path = '', $domain = '', $secure = false, $http_only = false)
    {
    if ($path == '')
      $path = FULLPATH . $path;

    $this->set($key, '', time() - 604800, $path, $domain, $secure, $http_only);
    unset($_COOKIE[$key]);
    }

  /**
   * Gets a cookie
   *
   * @param string $key The array key that identificates the variable
   * @param bool|int $return_empty_undefined If true it returns an empty string if the variable doesn't exist
   * @return string|bool Returns the cookie or false/empty string
   */
  public function get($key, $return_empty_undefined = 0)
    {
    if (isset($_COOKIE[$key]))
      {
      return $_COOKIE[$key];
      }
    else
      {
      return ($return_empty_undefined ? '' : false);
      }
    }
  }
?>
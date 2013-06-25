<?php
/**
 * KWF Model: PageModel, interface for retrieving Page objects and modifying them
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2013-02-17
 * @version 3.0
 */

abstract class PageModel
  {
  protected $page = null;

  /**
   * Searches for a page with specified name and returns the it's Page object
   *
   * @param string $page_name Name of page to find
   * @return Page The Page object (NULL if page not found)
   */
  abstract public function getPage($page_name);

  /**
   * Returns the $controllers collection
   *
   * @return string[][] Array of arrays of type 
   *  {'name' => controller name, 'content' => controller content}
   */
  public function getControllers()
    {
    return $this->controllers;
    }
  }
?>
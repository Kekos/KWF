<?php
/**
 * KWF Class: JsonView, corresponds to a JSON data view
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2013-03-01
 * @version 1.0
 */

class JsonView extends View
  {
  /**
   * Constructor
   *
   * @param mixed[] $data Array of data to encode as JSON
   */
  public function __construct($data)
    {
    $this->content_type = 'json';
    $this->data = $data;
    }

  /**
   * JSON encodes the data and then returns the output as string
   *
   * @return string The output data
   */
  public function compile()
    {
    return JsonEncoder::encode($this->data);
    }
  }
?>
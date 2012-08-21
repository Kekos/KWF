/*!
 * KWF Script: kwf.js
 * Based on DOMcraft
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2012-08-21
 * @version 4.0
 */

/**
 * Returns an element with specified ID
 * @method elem
 * @param {String} id ID of element to get
 * @return {HTMLElement/boolean} False if element was not found
 */
function elem(id)
  {
  try
    {
    return document.getElementById(id) || document.all[id];
    }
  catch (e)
    {
    return false;
    }
  }

/**
 * Returns source/target of event
 * @method getTarget
 * @param {Event} e The event object
 * @return {HTMLElement} The event target element
 */
function getTarget(e)
  {
  e = e || window.event;
  return e.target || e.srcElement;
  }

/**
 * Prevents the browsers default behavior on event
 * @method returnFalse
 * @param {Event} e The event object
 */
function returnFalse(e)
  {
  if (window.event)
    {
    event.returnValue = false;
    }
  else
    {
    e.preventDefault();
    }
  }

/**
 * Adds an event listener to an element
 * @method addEvent
 * @param {HTMLElement} element Element to listen on
 * @param {String} state Name of event to listen for
 * @param {Function} func Callback function
 * @param {Object} [context] Object to call callback function on
 */
function addEvent(element, state, func, context)
  {
  var new_func = func;

  if (context)
    {
    new_func = function(e)
      {
      func.call(context, e);
      };
    }

  if (element.addEventListener)
    {
    element.addEventListener(state, new_func, 0);
    }
  else if (element.attachEvent)
    {
    element.attachEvent('on' + state, new_func);
    }
  }

/**
 * Removes an event listener from an element
 * @method removeEvent
 * @param {HTMLElement} element Element to remove from
 * @param {String} state Name of event to remove on
 * @param {Function} func Callback function to remove
 */
function removeEvent(element, state, func)
  {
  if (element.removeEventListener)
    {
    element.removeEventListener(state, func, 0);
    }
  else if (element.attachEvent)
    {
    element.detachEvent('on' + state, func);
    }
  }

/**
 * Adds an 'submit' event listener to an element
 * @method addSubmitEvent
 * @param {HTMLFormElement} element Form element to listen on
 * @param {Function} func Callback function
 */
function addSubmitEvent(element, func)
  {
  addEvent(element, 'click', function(e)
    {
    window.submit_target = getTarget(e);
    });
  addEvent(element, 'submit', func);
  }

/**
 * Tests if node is whitespace node
 * @method isWs
 * @param {Node} node The node to test
 * @return {Boolean} True if whitespace node
 */
function isWs(node)
  {
  return !(/[^\t\n\r ]/.test(node.data));
  }

/**
 * Tests if node is ignoreable
 * @method isIgnorable
 * @param {Node} node The node to test
 * @return {Boolean} True if node is comment or whitespace text node
 */
function isIgnorable(node)
  {
  return (node.nodeType === 8) ||  ((node.nodeType === 3) && isWs(node));
  }

/**
 * Returns the previous sibling to a node
 * @method previousNode
 * @param {Node} sib The node to find sibiling for
 * @return {Node}
 */
function previousNode(sib)
  {
  while (sib)
    {
    if (!isIgnorable(sib))
      {
      return sib;
      }

    sib = sib.previousSibling;
    }

  return null;
  }

/**
 * Returns the next sibling to a node
 * @method nextNode
 * @param {Node} sib The node to find sibiling for
 * @return {Node}
 */
function nextNode(sib)
  {
  while (sib)
    {
    if (!isIgnorable(sib))
      {
      return sib;
      }

    sib = sib.nextSibling;
    }

  return null;
  }

/**
 * Returns the first child for a element
 * @method firstChildElement
 * @param {HTMLElement} parent The element to find first child of
 * @return {HTMLElement}
 */
function firstChildElement(parent)
  {
  var children = parent.childNodes, 
    c;

  for (c = 0; c < children.length; c++)
    {
    if (!isIgnorable(children[c]))
      {
      return children[c];
      }
    }

  return null;
  }

/**
 * Returns the last child for a element
 * @method lastChildElement
 * @param {HTMLElement} parent The element to find last child of
 * @return {HTMLElement}
 */
function lastChildElement(parent)
  {
  var children = parent.childNodes, 
    c;

  for (c = children.length - 1; c >= 0; c--)
    {
    if (!isIgnorable(children[c]))
      {
      return children[c];
      }
    }

  return null;
  }

/**
 * Returns true if element has specified CSS class
 * @method hasClass
 * @param {HTMLElement} element Element to test
 * @param {String} classname Name of class to test for
 * @return {Boolean}
 */
function hasClass(element, classname)
  {
  return (element.className ? element.className.match(new RegExp('(\\s|^)' + classname + '(\\s|$)')) : 0);
  }

/**
 * Adds specified CSS class to element
 * @method addClass
 * @param {HTMLElement} element Element to add to
 * @param {String} classname Name of class to add
 */
function addClass(element, classname)
  {
  if (!hasClass(element, classname))
    {
    element.className += ' ' + classname;
    }
  }

/**
 * Removed specified CSS class from element
 * @method removeClass
 * @param {HTMLElement} element Element to remove from
 * @param {String} classname Name of class to remove
 */
function removeClass(element, classname)
  {
  element.className = element.className.replace(new RegExp('(\\s|^)' + classname + '(\\s|$)'), ' ').replace(/\s+/g,' ').replace(/^\s|\s$/,'');
  }

/**
 * Replaces specified CSS class with new class from element
 * @method replaceClass
 * @param {HTMLElement} element Element to replace on
 * @param {String} old_classname Name of class to remove
 * @param {String} new_classname Name of class to add
 */
function replaceClass(element, old_classname, new_classname)
  {
  removeClass(element, old_classname);
  addClass(element, new_classname);
  }

/**
 * Gives opacity for an element in Internet Explorer (using Alpha filter)
 * @method giveOpacity
 * @param {HTMLElement} element Element to give opacity
 * @param {Number} value Opacity value
 */
function giveOpacity(element, value)
  {
  if (typeof element.filters === 'object')
    {
    element.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(opacity=' + value + ')';
    }
  }

/**
 * Parses JSON using browser's built-in method or using eval()
 * @method parseJSON
 * @param {String} j JSON object as string
 * @return {Object}
 */
function parseJSON(j)
  {
  try
    {
    j = JSON.parse(j);
    }
  catch (e)
    {
    try
      {
      j = eval('(' + j + ')');
      }
    catch (e2)
      {
      }
    }

  return j;
  }

/**
 * Exposes all properties to an object and alerts them in human readable format
 * @method var_dump
 * @param {Object} variable The variable to dump
 * @param {Number} [depth=0] Depth of variable (only for internal use)
 * @return {Void/String}
 */
function var_dump(variable, depth)
  {
  function spaces(num)
    {
    var i, str = '';
    for (i = 0; i < (num * 2); i++)
      {
      str += ' ';
      }

    return str;
    }

  var type = typeof variable, str = '', i;

  if (!depth)
    {
    depth = 1;
    }
  else if (depth > 5)
    {
    return '';
    }

  if (type === 'object')
    {
    str += '{\n';

    for (i in variable)
      {
      try
        {
        str += spaces(depth) + i + ': ' + var_dump(variable[i], depth + 1);
        }
      catch (ex) {}
      }

    str += spaces(depth) + '}';
    }
  else
    {
    str = variable.toString();
    }

  str = '(' + type + ') ' + str + '\n';
  if (depth === 1)
    {
    alert(str);
    }
  else
    {
    return str;
    }
  }

/**
 * Converts a string with HTML to a DOM Node
 * @example Returns only the first node in the string (eg. returns only tag1 but not tag3 in "<tag1><tag2>some text</tag2></tag1><tag3>other text</tag3>")
 * @method toDOMnode
 * @param {String} html HTML string to convert
 * @return {Node}
 */
function toDOMnode(html)
  {
  var div = document.createElement('div');
  div.innerHTML = html;
  return div.firstChild;
  }

/**
 * Replaces old_node with new_node
 * @method replaceNode
 * @param {Node} old_node The old node to replace
 * @param {Node} new_node The new node to insert
 */
function replaceNode(old_node, new_node)
  {
  var parent = old_node.parentNode;

  parent.insertBefore(new_node, old_node);
  parent.removeChild(old_node);
  }

/**
 * AJAX class provides an easy interface for requesting data asynchronous
 * @class Ajax
 * @static
 */
var Ajax = (function()
  {
  /**
   * Callback called when AJAX request is started
   * @property onbeforeajax
   * @type Function
   * @private
   * @default null
   */
  var onbeforeajax = null, 
  /**
   * Callback called after AJAX response has been recieved
   * @property onafterajax
   * @type Function
   * @private
   * @default null
   */
  onafterajax = null;

  /**
	 * Creates the actual AJAX object and opens the connection
	 * Helper function for get() and send()
	 * @method send
   * @private
	 * @param {String} url URL to load
	 * @param {String} method GET or POST
	 * @param {Function} success Callback to call if request succeeded
   * @param {Function} fail Callback to call if request failed
	 * @param {String} data Data to send
   * @param {Object} headers Extra HTTP headers
   * @param {Boolean} ignore_content_type True if Content-Type header should be set by browser
	 * @return {XMLHttpRequest}
	 */
  function send(url, method, success, fail, data, headers, ignore_content_type)
    {
    var ajax_req = (window.ActiveXObject) ? 
        new ActiveXObject('Microsoft.XMLHTTP') : new XMLHttpRequest(),
      response, content_type = 0, h;

    ajax_req.open(method, url);
    ajax_req.setRequestHeader('X-ajax-request', 'true');

    // Set extra HTTP headers if any
    if (typeof headers === 'object')
      {
      for (h in headers)
        {
        if (headers[h][0] === 'Content-Type')
          {
          // Fix for Chrome who otherwise concatenates the different content-types
          content_type = 1;
          }

        ajax_req.setRequestHeader(headers[h][0], headers[h][1]);
        }
      }

    // If no Content-Type was set, use default, or ignore Content-Type if needed
    if (!content_type && !ignore_content_type)
      {
      ajax_req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8');
      }

    // Set event handler for ready state
    ajax_req.onreadystatechange = function()
      {
      if (ajax_req.readyState === 4)
        {
        content_type = ajax_req.getResponseHeader('Content-Type');
        content_type = content_type.substring(0, content_type.indexOf(';'));
        response = {
            page: ajax_req.responseText,
            content_type: content_type,
            status: ajax_req.status
          };

        if (response.content_type === 'application/json')
          {
          response.page = parseJSON(response.page);
          }

        // Call "after" callback
        if (onafterajax)
          {
          onafterajax();
          }

        // 200 if we got a page as response
        if (ajax_req.status === 200)
          {
          if (ajax_req.getResponseHeader('X-ajax-error'))
            {
            response.success = 0;
            fail(response);
            }
          else
            {
            response.success = 1;
            success(response);
            }
          }
        // 404 if resource was not found
        else if (ajax_req.status === 404)
          {
          response = {
              success: 0,
              page: {error: ['Filen hittades inte.']},
              content_type: 'application/json',
              status: '404'
              };
          fail(response);
          }
        }
      };

    // Call the "before" callback
    if (onbeforeajax)
      {
      onbeforeajax();
      }

    ajax_req.send(data);

    return ajax_req;
    }

  /**
	 * Translates an object on form {var1: "val1", var2: "val2"} to query string var1=val1&var2=val2
	 * Helper function for get() and send()
	 * @method array2query
   * @private
	 * @param {Object} data Object to translate
	 * @return {String} The object as query string
	 */
  function array2query(data)
    {
    var query = '', key;

    for (key in data)
      {
      query += '&' + key + '=' + encodeURIComponent(data[key]);
      }

    return query.substring(1);
    }

  /**
	 * Translates form element to query string eg. var1=val1&var2=val2
	 * Helper function for get() and send()
	 * @method form2query
   * @private
	 * @param {HTMLFormElement} form The form to translate
   * @param {HTMLElement} sender The button that fired the request
   * @param {String} boundary A boundary that delimits parts
	 * @return {String} The form as query string
	 */
  function form2query(form, sender, boundary)
    {
    var data = '', 
      inputs = form.getElementsByTagName('input'), 
      selects = form.getElementsByTagName('select'), 
      textareas = form.getElementsByTagName('textarea'), 
      i;

    function encode(elm)
      {
      var ret;

      if (boundary)
        {
        ret = (elm.name === '' ? '' : '\r\nContent-Disposition: form-data; name="' + elm.name + '"\r\n\r\n' + encodeURIComponent(elm.value) + '\r\n--' + boundary);
        }
      else
        {
        ret = (elm.name === '' ? '' : '&' + elm.name + '=' + encodeURIComponent(elm.value));
        }

      return ret;
      }

    if (form)
      {
      for (i = 0; i < inputs.length; i++)
        {
        if (((inputs[i].type === 'radio' || inputs[i].type === 'checkbox')
            && !inputs[i].checked) || (inputs[i].type === 'button' || 
            inputs[i].type === 'submit'))
          {
          continue;
          }

        data += encode(inputs[i]);
        }

      for (i = 0; i < selects.length; i++)
        {
        data += encode(selects[i]);
        }

      for (i = 0; i < textareas.length; i++)
        {
        data += encode(textareas[i]);
        }
      }

    if (sender)
      {
      data += encode(sender);
      }

    return data.substring(1);
    }

  /**
	 * Starts a HTTP GET request
	 * @method get
   * @public
	 * @param {String} url URL to load
	 * @param {Function} success Callback to call if request succeeded
   * @param {Function} fail Callback to call if request failed
	 * @param {String/Object} data Data to append to query string, as string or object: {var1: "val1", var2: "val2"}
	 * @return {XMLHttpRequest}
	 */
  function get(url, success, fail, data)
    {
    if (typeof data === 'object')
      {
      data = array2query(data);
      }

    if (data)
      {
      data = '?' + data;
      }
    else
      {
      data = '';
      }

    return send(url + data, 'GET', success, fail, null);
    }

  /**
	 * Starts a HTTP POST request
	 * @method post
   * @public
	 * @param {String} url URL to load
	 * @param {Function} success Callback to call if request succeeded
   * @param {Function} fail Callback to call if request failed
	 * @param {String/HTMLFormElement} data Data to send, as HTML form or object: {var1: "val1", var2: "val2"}
	 * @return {XMLHttpRequest}
	 */
  function post(url, success, fail, data, sender)
    {
    data = (data.nodeType ? form2query(data, sender) : 
        array2query(data));
    return send(url, 'POST', success, fail, data);
    }

  /**
	 * Starts a HTTP POST request with a file element as attachment
	 * @method upload
   * @public
	 * @param {String} url URL to load
	 * @param {Function} success Callback to call if request succeeded
   * @param {Function} fail Callback to call if request failed
	 * @param {HTMLInputElement} file_elem The <input type="file"> element to send
	 * @return {XMLHttpRequest}
	 */
  function upload(url, success, fail, file_elem)
    {
    // Check for File and FormData support
    if (typeof FormData !== 'undefined' && typeof File !== 'undefined')
      {
      var form_data = new FormData();
      form_data.append(file_elem.name, file_elem.files[0]);
      return send(url, 'POST', success, fail, form_data, [], 1);
      }
    // No FormData support: Resort to <iframe> solution
    else
      {
      var orig_form = file_elem.parentNode, form, frame, frame_doc, 
        body = document.body, resp, 
        is_json = 0;

      if (onbeforeajax)
        {
        onbeforeajax();
        }

      form = body.appendChild(toDOMnode('<form style="visibility: hidden;" action="' + url 
         + '" method="post" enctype="multipart/form-data" target="ajax_upload_frame'
         + '"><input type="hidden" name="X-ajax-request" value="true" />'
         + '<input type="hidden" name="X-frame-upload" value="true" /></form>'));

      orig_form.removeChild(file_elem);
      form.appendChild(file_elem);

      frame = body.appendChild(toDOMnode('<iframe style="visibility: hidden;" src="javascript: false;" '
         + 'name="ajax_upload_frame" id="ajax_upload_frame"></iframe>'));

      addEvent(frame, 'load', function()
        {
        setTimeout(function()
          {
          frame_doc = frame.contentDocument || frame.contentWindow.document;
          resp = frame_doc.body.firstChild.nodeValue;
          if (resp === null)
            {
            resp = frame_doc.body.innerHTML;
            }

          if (resp.substring(0, 1) === '{' && resp.substring(resp.length - 1) === '}')
            {
            is_json = 1;
            }

          success({
              page: (is_json ? parseJSON(resp) : resp),
              content_type: (is_json ? 'application/json' : 'text/plain'),
              status: '200'
            });
          body.removeChild(frame);

          if (onafterajax)
            {
            onafterajax();
            }
          }, 1);
        });

      form.submit();
      body.removeChild(form);
      orig_form.appendChild(file_elem);
      }
    }

  /**
	 * Sets the "before" callback
	 * @method setBeforeCallback
   * @public
	 * @param {Function} callback
	 */
  function setBeforeCallback(callback)
    {
    onbeforeajax = callback;
    }

  /**
	 * Sets the "after" callback
	 * @method setAfterCallback
   * @public
	 * @param {Function} callback
	 */
  function setAfterCallback(callback)
    {
    onafterajax = callback;
    }

  return {'get': get, 'post': post, 'upload': upload, 'setBeforeCallback': setBeforeCallback, 'setAfterCallback': setAfterCallback};
  }()),

/**
 * Boxing class provides functions for showing a popup dialog on the center of the screen with an overlay behind
 * @class Boxing
 * @static
 */
Boxing = (function()
  {
  /**
   * 1 if the Boxing window is created
   * @property initiated
   * @type Number
   * @private
   * @default 0
   */
  var initiated = 0, 
  /**
   * 1 if the Boxing window is shown, 0 if hidden
   * @property state
   * @type Number
   * @private
   * @default 0
   */
  state = 0, 
  /**
   * A reference to the <html> tag
   * @property html_tag
   * @type HTMLHtmlElement
   * @private
   * @default null
   */
  html_tag = null, 
  /**
   * A reference to the Boxing overlayer
   * @property overlayer
   * @type HTMLDivElement
   * @private
   * @default null
   */
  overlayer = null, 
  /**
   * A reference to the Boxing close button
   * @property close
   * @type HTMLDivElement
   * @private
   * @default null
   */
  close = null, 
  /**
   * A reference to the Boxing window
   * @property window
   * @type HTMLDivElement
   * @private
   * @default null
   */
  window = null, 
  /**
   * A NodeList of all elements in the Boxing window
   * @property elements
   * @type NodeList
   * @private
   * @default null
   */
  elements = null, 
  /**
   * A callback called when the Boxing window is hidden
   * @property onhide_callback
   * @type Function
   * @private
   * @default null
   */
  onhide_callback = null;

  /**
	 * Returns a reference to the Boxing window
	 * @method getWindow
   * @public
	 * @return {HTMLDivElement}
	 */
  function getWindow()
    {
    return window;
    }

  /**
	 * Returns all focusable elements in the Boxing window
	 * @method getFocusableElements
   * @private
	 * @return {Array}
	 */
  function getFocusableElements()
    {
    var i, 
      focus_elements = [], 
      tagname;

    for (i = 0; i < elements.length; i++)
      {
      tagname = elements[i].tagName.toLowerCase();
      if (tagname.match(/^input|select|textarea|button|a$/))
        {
        if ((tagname === 'input' && (elements[i].disabled || elements[i].type === 'hidden')) || (tagname === 'a' && !elements[i].href))
          {
          continue;
          }

        focus_elements.push(elements[i]);
        }
      }

    return focus_elements;
    }

  /**
	 * Returns the focusable element at specified index
	 * @method
   * @private
   * @param {Number} idx The index
	 * @return {Array}
	 */
  function getElement(idx)
    {
    var focus_elements = getFocusableElements();
    return (focus_elements.length > 0 ? focus_elements[idx] : null);
    }

  /**
	 * Called when a new element has got the focus
	 * @method focusChanged
   * @private
   * @param {HTMLElement} new_focus_elem The element that got the focus
   * @param {Boolean} is_reverse True if the focus order is reverse (eg. Shift key is pressed)
	 */
  function focusChanged(new_focus_elem, is_reverse)
    {
    var test_node = new_focus_elem.parentNode;

    // Focusing on the close button is allowed, so checking that button is not needed
    if (new_focus_elem !== close)
      {
      // Traverse the DOM upwards to see if the newly focused element is a child of the Boxing window
      while (test_node)
        {
        // If the element is child of Bowing window, this will be true
        if (test_node === window)
          {
          return;
          }

        test_node = test_node.parentNode;
        }

      if (is_reverse)
        {
        // Set focus to the last focusable element
        getFocusableElements().pop().focus();
        }
      else
        {
        // Set focus to the close button
        close.focus();
        }
      }
    }

  /**
	 * Hides the Boxing window
	 * @method hide
   * @public
	 */
  function hide()
    {
    if (initiated)
      {
      if (onhide_callback)
        {
        if (!onhide_callback())
          {
          return;
          }
        }

      overlayer.style.display = 'none';
      close.style.display = 'none';
      window.style.display = 'none';

      window.innerHTML = '';
      html_tag.style.overflow = '';
      onhide_callback = null;
      state = 0;
      }
    }

  /**
	 * Listener for the keyup event
	 * @method keys
   * @private
   * @param {Event} e The event object
	 */
  function keys(e)
    {
    if (e.keyCode === 27)
      {
      hide();
      }
    else if (e.keyCode === 9 && state)
      {
      focusChanged(getTarget(e), e.shiftKey);
      }
    }

  /**
	 * Initiates the Boxing window
	 * @method init
   * @private
	 */
  function init()
    {
    var doc = document;

    overlayer = doc.createElement('div');
    window = doc.createElement('div');
    close = doc.createElement('a');

    overlayer.id = 'boxing-overlayer';
    doc.body.appendChild(overlayer);
    giveOpacity(overlayer, 60);

    addEvent(overlayer, 'click', hide);
    addEvent(doc, 'keyup', keys);

    close.id = 'close_boxing';
    close.className = 'hide-boxing';
    close.href = 'javascript: void(0);';
    close.appendChild(doc.createTextNode('Stäng'));
    doc.body.appendChild(close);

    window.id = 'boxing-window';
    doc.body.appendChild(window);

    html_tag = doc.getElementsByTagName('HTML')[0];
    initiated = 1;
    }

  /**
	 * Shows the Boxing window
	 * @method show
   * @public
   * @param {String} text The HTML to show in the window
   * @param {Number} width The width of the window (for widths > 100 results in pixels, otherwise percents)
   * @param {Number} height The height of the window (for heights > 100 results in pixels, otherwise percents)
   * @param {Function} callback An optional callback function to call when the window is hidden
	 */
  function show(text, width, height, callback)
    {
    if (!initiated)
      {
      init();
      }

    if (typeof callback !== 'undefined')
      {
      onhide_callback = callback;
      }

    var w_unit = (width > 100 ? 'px' : '%'), 
      h_unit = (height > 100 ? 'px' : '%'), 
      first_elem;

    overlayer.style.display = 'block';
    close.style.display = 'block';
    window.style.display = 'block';

    window.style.width = width + w_unit;
    window.style.height = height + h_unit;

    if (h_unit === '%')
      {
      window.style.margin = '0 0 0 -' + (width / 2) + w_unit;
      window.style.top = (100 - height) / 2 + '%';
      }
    else
      {
      window.style.margin = '-' + (height / 2) + h_unit + ' 0 0 -' + (width / 2) + w_unit;
      window.style.top = '50%';
      }

    window.innerHTML = text;

    close.style.top = window.offsetTop - 10 + 'px';
    close.style.left = window.offsetLeft + window.offsetWidth - 10 + 'px';

    // Create a reference to the window's child elements for future
    elements = window.getElementsByTagName('*');

    // Find the first focusable element
    first_elem = getElement(0);
    if (first_elem)
      {
      first_elem.focus();
      }

    html_tag.style.overflow = 'hidden';
    state = 1;
    }

  return {'show': show, 'hide': hide, 'getWindow': getWindow};
  }()),

/**
 * Reference to the global ContentRequest
 * @property content_request
 * @type ContentRequest
 * @public
 */
content_request, 
/**
 * Reference to the global BoxingRequest
 * @property boxing_request
 * @type BoxingRequest
 * @public
 */
boxing_request, 

/**
 * KWF object handles load and click events, messages and starts the JavaScript framework
 * @class Kwf
 * @static
 */
Kwf = {
  FULLPATH: '',

  /**
   * Reference to a function called when user clicks the document
   * @property onclick
   * @type Function
   * @public
   * @default null
   */
  onclick: null,

  /**
   * Reference to a function called on the "load" event
   * @property onload
   * @type Function
   * @public
   * @default null
   */
  onload: null,

  /**
   * Reference to the timer that hides error and info messages
   * @property info_timer
   * @type Number
   * @public
   * @default null
   */
  info_timer: null,

  /**
   * True if event listener should ignore next hashchange event
   * @property ignore_hash_change
   * @type Boolean
   * @public
   * @default false
   */
  ignore_hash_change: 0,

  /**
	 * Called on the "click" event on the document
	 * @method clicking
   * @public
   * @param {Event} e The event object
	 */
  clicking: function(e)
    {
    if (e.button < 1)
      {
      var targ = getTarget(e);

      if (hasClass(targ, 'nolink') || hasClass(targ.parentNode, 'nolink'))
        {
        returnFalse(e);
        }

      if (hasClass(targ, 'hide-boxing'))
        {
        returnFalse(e);
        Boxing.hide();
        }

      if (Kwf.onclick)
        {
        Kwf.onclick(e, targ);
        }
      }
    },

  /**
	 * Called on the "load" event
	 * @method loading
   * @public
   * @param {Event} e The event object
	 */
  loading: function(e)
    {
    if (Kwf.onload)
      {
      Kwf.onload(e);
      }

    if (elem('content'))
      {
      var location = document.location, 
        popped = ('state' in history && history.state !== null), 
        initial_url = location.href;

      function changeContent(url)
        {
        content_request.load({preventDefault: function() {}}, url, 1);
        }

      // Listen for back/forward events
      addEvent(window, 'popstate', function(pe)
        {
        if (!(!popped && location.href === initial_url))
          {
          changeContent(pe.state === null ? location.pathname : pe.state.url);
          }

        popped = 1;
        });

      // Change content from the hash if pushState is not supported
      if (!history.pushState)
        {
        if (location.hash !== '')
          {
          changeContent(location.hash.slice(1));
          }

        // Listen for hashchange if supported
        if ('onhashchange' in window)
          {
          addEvent(window, 'hashchange', function(pe)
            {
            if (!Kwf.ignore_hash_change)
              {
              changeContent(location.hash.slice(1) || location.pathname);
              }

            Kwf.ignore_hash_change = 0;
            });
          }
        }
      // Read the initial state
      else if (history.state && history.state !== null)
        {
        changeContent(history.state.url);
        }

      content_request.findForms();
      content_request.dispatchEvent('ready');
      }
    },

  /**
	 * Removes all error and info messages
	 * @method hideInfo
   * @public
	 */
  hideInfo: function()
    {
    var list = elem('errorlist');

    if (list)
      {
      list.parentNode.removeChild(list);
      }

    list = elem('infolist');

    if (list)
      {
      list.parentNode.removeChild(list);
      }
    },

  /**
	 * Creates HTML for showing error and info messages.
   * Sets the timer for hiding the messages after 10 seconds.
	 * @method infoHandler
   * @public
   * @param {Object} page The response.page object
	 * @return {String} The HTML for message lists
	 */
  infoHandler: function(page)
    {
    var html = '', row, k = Kwf;

    if (page.errors)
      {
      html += '<ul id="errorlist">';
      for (row in page.errors)
        {
        html += '<li>' + page.errors[row] + '</li>';
        }
      html += '</ul>';
      }

    if (page.info)
      {
      html += '<ul id="infolist">';
      for (row in page.info)
        {
        html += '<li>' + page.info[row] + '</li>';
        }
      html += '</ul>';
      }

    if (html !== '')
      {
      k.hideInfo();
      clearTimeout(k.timer);
      k.timer = setTimeout(k.hideInfo, 10000);
      }

    return html;
    },

  /**
	 * Inserts info messages HTML from the infoHandler into content <div>
	 * @method insertInfo
   * @public
   * @param {Object} page The response.page object
	 */
  insertInfo: function(page)
    {
    var context = elem('content');
    context.insertBefore(toDOMnode(Kwf.infoHandler(page)), context.firstChild);
    },

  /**
	 * Inserts form error messages AJAX response into current page
	 * @method handleFormErrors
   * @public
   * @param {Object} page The response.page object
	 */
  handleFormErrors: function(page)
    {
    if (page.form_errors)
      {
      var errors = page.form_errors, 
        name, span, input;

      for (name in errors)
        {
        input = elem(name);
        span = document.createElement('span');
        addClass(span, 'form-error');
        span.innerHTML = errors[name];
        try
          {
          input.parentNode.insertBefore(span, input);
          }
        catch (e)
          {
          alert('Element ' + name + ' not found in page');
          }
        }
      }
    },

  /**
	 * Removes all form error messages from current page
	 * @method removeFormErrors
   * @public
	 */
  removeFormErrors: function()
    {
    if (document.getElementsByClassName)
      {
      var errors = document.getElementsByClassName('form-error');

      while (errors[0])
        {
        errors[0].parentNode.removeChild(errors[0]);
        }
      }
    }
  },

/**
 * Contains methods for MultiViews parsing
 * @class MultiView
 * @static
 */
MultiView = {
  parse: function(response)
    {
    // Create dummy <div> to create a new namespace to perform ID search on
    var div = document.createElement('div'), 
      content, 
      id_elements, 
      d;

    if (response.content_type === 'application/json')
      {
      // Insert any info/error messages into content <div>
      Kwf.insertInfo(response.page);

      content = response.page.content;
      }
    else
      {
      content = response.page;
      }

    div.innerHTML = content;

    // Find all elements with an id attribute and replace the old ones
    id_elements = div.querySelectorAll('*[id]');

    for (d = 0; d < id_elements.length; d++)
      {
      replaceNode(elem(id_elements[d].id), id_elements[d]);
      }
    }
  },

/**
 * Prototype this to add event listening functionality to your class
 * With help from http://www.nczonline.net/blog/2010/03/09/custom-events-in-javascript/
 * @class KWFEventTarget
 * @constructor
 */
KWFEventTarget = function()
  {
  /**
   * Reference to this object
   * @property self
   * @type Object
   * @private
   */
  var self = this, 
  /**
   * Stores all listeners
   * @property listeners
   * @type Object
   * @private
   * @default {}
   */
  listeners = {};

  /**
	 * Adds a listener for specified event type
	 * @method addEventListener
   * @public
   * @param {String} type The event type
   * @param {Function} listener A function that will be called when the event are fired
	 */
  self.addEventListener = function(type, listener)
    {
    if (typeof listeners[type] === 'undefined')
      {
      listeners[type] = [];
      }

    listeners[type].push(listener);
    };

  /**
	 * Removes a listener for specified event type
	 * @method removeEventListener
   * @public
   * @param {String} type The event type
   * @param {Function} listener The listener function to remove
	 */
  self.removeEventListener = function(type, listener)
    {
    if (listeners[type] instanceof Array)
      {
      var type_listeners = listeners[type], 
        i;

      for (i = 0; i < type_listeners.length; i++)
        {
        if (String(type_listeners[i]) === String(listener))
          {
          type_listeners.splice(i, 1);
          break;
          }
        }
      }
    };

  /**
	 * Fires all listeners of specified event type.
   * Should only be called from the class itself
	 * @method dispatchEvent
   * @public
   * @param {String/Object} event The event type as string or an event object (must contain the "type" property!)
   * @param {Object} target An optional target of the event
	 */
  self.dispatchEvent = function(event, target)
    {
    if (typeof event === 'string')
      {
      event = { type: event };
      if (typeof target !== 'undefined')
        {
        event.target = target;
        }
      }

    if (!event.target)
      {
      event.target = this;
      }

    if (!event.type)
      {
      alert('Request Event object missing "type" property.'); // Errors can't be thrown from here in Firefox
      }

     if (listeners[event.type] instanceof Array)
      {
      var type_listeners = listeners[event.type], 
        i;

      for (i = 0; i < type_listeners.length; i++)
        {
        try
          {
          type_listeners[i].call(this, event);
          }
        catch (e)
          {
          alert(e.message + ' at line ' + (e.lineNumber || 'null') + ' in file ' + (e.fileName || 'null')); // Errors can't be thrown from here in Firefox
          }
        }
      }
    };
  },

/**
 * Handles AJAX requests of the content <div>
 * @class ContentRequest
 * @extends KWFEventTarget
 * @constructor
 */
ContentRequest = function()
  {
  /**
   * Reference to this object
   * @property self
   * @type Object
   * @private
   */
  var self = this, 

  /**
   * The button or link that fired the request
   * @property caller
   * @type HTMLElement
   * @private
   * @default null
   */
  caller = null, 

  /**
   * The current requested URL
   * @property url
   * @type String
   * @private
   * @default null
   */
  url = null,

  /**
   * Tells whether the next response should NOT be pushed to history state
   * @property ignore_pushstate
   * @type Boolean
   * @private
   * @default true
   */
  ignore_pushstate = 1;

  /**
   * The response object returned from AJAX class
   * @property response
   * @type Object
   * @public
   * @default null
   */
  self.response = null;

  /**
   * The button that fired a form request
   * @property form_btn
   * @type HTMLButtonElement
   * @public
   * @default null
   */
  self.form_btn = null;

  /**
	 * Start loading a new page into the content <div>
	 * @method load
   * @public
   * @param {Event} e The event object
   * @param {String} url_arg The URL to load
   * @param {Boolean} ignore_pushstate_arg True if this request should NOT push this response to a new history state
	 */
  self.load = function(e, url_arg, ignore_pushstate_arg)
    {
    returnFalse(e);

    caller = getTarget(e);
    url = url_arg;
    ignore_pushstate = ignore_pushstate_arg;

    self.dispatchEvent('beforeload', caller);
    Ajax.get(url, self.parseResponse, self.parseResponse);
    };

  /**
	 * Parse a response (insert the HTML to content <div> and show error and info messages)
	 * @method parseResponse
   * @public
   * @param {Object} response The response object
	 */
  self.parseResponse = function(response)
    {
    var info = '', content = '', 
      context = elem('content'), 
      btn = self.form_btn;

    // Remove any form errors
    Kwf.removeFormErrors();

    // Store the response object in this object so any event listeners can access it
    self.response = response;
    // Fire the afterload event
    self.dispatchEvent('afterload', caller);
    // Retrieve the response object again (it may have been changed by an event listener)
    response = self.response;

    // If the response contains JSON: look for error and info messages
    if (response.content_type === 'application/json')
      {
      info = Kwf.infoHandler(response.page);
      if (response.page.content)
        {
        // Get the HTML from content property
        content = info + response.page.content;
        }
      }
    else
      {
      // Get the HTML from page property
      content = response.page;
      }

    // If no HTML was sent, keep the old HTML and just add error and info messages
    if (content === '' && (info !== '' || response.page.form_errors))
      {
      Kwf.handleFormErrors(response.page);
      if (info !== '')
        {
        context.insertBefore(toDOMnode(info), context.firstChild);
        }
      }
    else
      {
      context.innerHTML = content;
      self.findForms();
      }

    window.scrollTo(0, 0);

    self.dispatchEvent('ready', caller);
    caller = null;
    self.response = null;

    if (!ignore_pushstate)
      {
      if (history.pushState)
        {
        history.pushState({url: url}, null, url);
        }
      else
        {
        Kwf.ignore_hash_change = 1;
        location.hash = '#' + url;
        }
      }

    // Restore the form_btn
    if (btn)
      {
      btn.disabled = '';
      self.form_btn = null;
      }
    };

  /**
	 * Add submit event listeners to all "ajax-forms" in the content <div>
	 * @method findForms
   * @public
	 */
  self.findForms = function()
    {
    var context = elem('content'), 
      forms = context.getElementsByTagName('form'), 
      i, form;

    // The Submit event listener
    function formSubmit(e)
      {
      var targ = self.form_btn = window.submit_target, 
        action;

      caller = getTarget(e); // The event target is the form who creates this new event, not the button who triggered this event
      action = (caller.action === '') ? document.location.href : caller.action; // For backwards compatibility, may change in future versions

      returnFalse(e);
      targ.disabled = 'disabled';
      self.dispatchEvent('beforeload', caller);

      Ajax.post(action, self.parseResponse, self.parseResponse, caller, targ);
      }

    for (i = 0; i < forms.length; i++)
      {
      form = forms[i];
      if (hasClass(form, 'ajax-form'))
        {
        addSubmitEvent(form, formSubmit);
        removeClass(form, 'ajax-form');
        }
      }
    };
  },

/**
 * Handles AJAX requests of the Boxing window
 * @class BoxingRequest
 * @extends KWFEventTarget
 * @constructor
 */
BoxingRequest = function()
  {
  /**
   * Reference to this object
   * @property self
   * @type Object
   * @private
   */
  var self = this, 

  /**
   * The button or link that fired the request
   * @property caller
   * @type HTMLElement
   * @private
   * @default null
   */
  caller = null;

  /**
   * The response object returned from AJAX class
   * @property response
   * @type Object
   * @public
   * @default null
   */
  self.response = null;

  /**
   * The width of current Boxing window
   * @property width
   * @type Number
   * @public
   * @default 0
   */
  self.width = 0;

  /**
   * The height of current Boxing window
   * @property height
   * @type Number
   * @public
   * @default 0
   */
  self.height = 0;

  /**
   * The button that fired a form request
   * @property form_btn
   * @type HTMLButtonElement
   * @public
   * @default null
   */
  self.form_btn = null;

  /**
	 * Start loading a page into a new Boxing window
	 * @method load
   * @public
   * @param {Event} e The event object
   * @param {string} url The URL to load
   * @param {Number} width The width of new Boxing window (optional)
   * @param {Number} height The height of new Boxing window (optional)
	 */
  self.load = function(e, url, width, height)
    {
    returnFalse(e);
    caller = getTarget(e);

    self.width = (width || 300);
    self.height = (height || 200);

    self.dispatchEvent('beforeload', caller);

    Ajax.get(url, self.parseResponse, self.parseResponse);
    };

  /**
	 * Parse a response (insert the HTML to Boxing window, show window and show error and info messages)
	 * @method parseResponse
   * @public
   * @param {Object} response The response object
	 */
  self.parseResponse = function(response)
    {
    var info = '', content = '', 
      btn = self.form_btn;

    // Remove any form errors
    Kwf.removeFormErrors();

    // Store the response object in this object so any event listeners can access it
    self.response = response;
    // Fire the afterload event
    self.dispatchEvent('afterload', caller);
    // Retrieve the response object again (it may have been changed by an event listener)
    response = self.response;

    // If the response contains JSON: look for error and info messages
    if (response.content_type === 'application/json')
      {
      info = Kwf.infoHandler(response.page);
      if (response.page.content)
        {
        // Get the HTML from content property
        content = info + response.page.content;
        }
      }
    else
      {
      // Get the HTML from page property
      content = response.page;
      }

    // If no HTML was sent, check if there are any messages
    if (content === '')
      {
      // Add error and info messages to content <div>
      if (info !== '')
        {
        elem('content').insertBefore(toDOMnode(info), elem('content').firstChild);
        }

      // If there are form messages, add them to page and do NOT hide Boxing
      if (response.page.form_errors)
        {
        Kwf.handleFormErrors(response.page);
        }
      // If no content or messages were sent, hide the Boxing window
      else
        {
        Boxing.hide();
        }
      }
    else
      {
      Boxing.show(content, self.width, self.height);
      self.findForms();
      }

    self.dispatchEvent('ready', caller);
    caller = null;
    self.response = null;

    // Restore the form_btn
    if (btn)
      {
      btn.disabled = '';
      self.form_btn = null;
      }
    };

  /**
	 * Add submit event listeners to all "ajax-forms" in the Boxing window
	 * @method findForms
   * @public
	 */
  self.findForms = function()
    {
    var forms = Boxing.getWindow().getElementsByTagName('form'), 
      i, form;

    // The Submit event listener
    function formSubmit(e)
      {
      var targ = window.submit_target, 
        action;

      caller = getTarget(e); // The event target is the form who creates this new event, not the button who triggered this event
      action = (caller.action === '') ? document.location.href : caller.action; // For backwards compatibility, may change in future versions

      returnFalse(e);

      if (!hasClass(targ, 'hide-boxing'))
        {
        targ.disabled = 'disabled';
        self.form_btn = targ;
        self.dispatchEvent('beforeload', caller);

        Ajax.post(action, self.parseResponse, self.parseResponse, caller, targ);
        }
      }

    for (i = 0; i < forms.length; i++)
      {
      form = forms[i];
      if (hasClass(form, 'ajax-form'))
        {
        addSubmitEvent(form, formSubmit);
        removeClass(form, 'ajax-form');
        }
      }
    };
  };

// Let ContentRequest and BoxingRequest inherit KWFEventTarget
ContentRequest.prototype = new KWFEventTarget();
BoxingRequest.prototype = new KWFEventTarget();

// Create instances of ContentRequest and BoxingRequest
content_request = new ContentRequest();
boxing_request = new BoxingRequest();

// Add listeners for click and load events
addEvent(document, 'click', Kwf.clicking);
addEvent(window, 'load', Kwf.loading);
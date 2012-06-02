/**
 * KWF Script: kwf.js
 * Based on DOMcraft
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2012-05-25
 * @version 4.0
 */

/*
 * Returns an element with specified ID
 *
 * @param string id ID of element to get
 * @return HTMLElement/boolean False if element was not found
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

/*
 * Returns source/target of event
 *
 * @param e Event object
 * @return HTMLElement
 */
function getTarget(e)
  {
  e = e || window.event;
  return e.target || e.srcElement;
  }

/*
 * Prevents the browsers default behavior on event
 *
 * @param e Event object
 * @return void
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

/*
 * Adds an event listener to an element
 *
 * @param HTMLElement element Element to listen on
 * @param string state Name of event to listen for
 * @param function func Callback function
 * @param object context Object to call callback function on
 * @return void
 */
function addEvent(elem, state, func, context)
  {
  var new_func = func;

  if (context)
    {
    new_func = function(e)
      {
      func.call(context, e);
      };
    }

  if (elem.addEventListener)
    {
    elem.addEventListener(state, new_func, 0);
    }
  else if (elem.attachEvent)
    {
    elem.attachEvent('on' + state, new_func);
    }
  }

/*
 * Removes an event listener from an element
 *
 * @param HTMLElement element Element to remove from
 * @param string state Name of event to remove on
 * @param function func Callback function to remove
 * @return void
 */
function removeEvent(elem, state, func)
  {
  if (elem.removeEventListener)
    {
    elem.removeEventListener(state, func, 0);
    }
  else if (elem.attachEvent)
    {
    elem.detachEvent('on' + state, func);
    }
  }

/*
 * Adds an 'submit' event listener to an element
 *
 * @param HTMLFormElement element Form element to listen on
 * @param function func Callback function
 * @return void
 */
function addSubmitEvent(elem, func)
  {
  addEvent(elem, 'click', function(e)
    {
    window.submit_target = getTarget(e);
    });
  addEvent(elem, 'submit', func);
  }

/*
 * Tests if node is whitespace node, returns true if so
 *
 * @param Node node The node to test
 * @return boolean
 */
function isWs(node)
  {
  return !(/[^\t\n\r ]/.test(node.data));
  }

/*
 * Tests if node is ignoreable (is comment or whitespace text node)
 *
 * @param Node node The node to test
 * @return boolean
 */
function isIgnorable(node)
  {
  return (node.nodeType === 8) ||  ((node.nodeType === 3) && isWs(node));
  }

/*
 * Returns the previous sibling to a node
 *
 * @param Node sib The node to find sibiling for
 * @return Node
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

/*
 * Returns the next sibling to a node
 *
 * @param Node sib The node to find sibiling for
 * @return Node
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

/*
 * Returns the first child for a element
 *
 * @param HTMLElement parent The element to find first child of
 * @return HTMLElement
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

/*
 * Returns the last child for a element
 *
 * @param HTMLElement parent The element to find last child of
 * @return HTMLElement
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

/*
 * Returns true if element has specified CSS class
 *
 * @param HTMLElement elem Element to test
 * @param string classname Name of class to test for
 * @return boolean
 */
function hasClass(elem, classname)
  {
  return (elem.className ? elem.className.match(new RegExp('(\\s|^)' + classname + '(\\s|$)')) : 0);
  }

/*
 * Adds specified CSS class to element
 *
 * @param HTMLElement elem Element to add to
 * @param string classname Name of class to add
 * @return void
 */
function addClass(elem, classname)
  {
  if (!hasClass(elem, classname))
    {
    elem.className += ' ' + classname;
    }
  }

/*
 * Removed specified CSS class from element
 *
 * @param HTMLElement elem Element to remove from
 * @param string classname Name of class to remove
 * @return void
 */
function removeClass(elem, classname)
  {
  elem.className = elem.className.replace(new RegExp('(\\s|^)' + classname + '(\\s|$)'), ' ').replace(/\s+/g,' ').replace(/^\s|\s$/,'');
  }

/*
 * Replaces specified CSS class with new class from element
 *
 * @param HTMLElement elem Element to replace on
 * @param string old_classname Name of class to remove
 * @param string new_classname Name of class to add
 * @return void
 */
function replaceClass(elem, old_classname, new_classname)
  {
  removeClass(elem, old_classname);
  addClass(elem, new_classname);
  }

/*
 * Gives opacity for an element in Internet Explorer (using Alpha filter)
 *
 * @param HTMLElement elm Element to give opacity
 * @param integer value Opacity value
 * @return void
 */
function giveOpacity(elm, value)
  {
  if (typeof elm.filters === 'object')
    {
    elm.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(opacity=' + value + ')';
    }
  }

/*
 * Parses JSON using browser's built-in method or using eval()
 *
 * @param string j JSON object as string
 * @return object
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

/*
 * Exposes all properties to an object and alerts them in human readable format
 *
 * @param object variable The variable to dump
 * @param integer depth Depth of variable (only for internal use)
 * @return void/string
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
      str += spaces(depth) + i + ': ' + var_dump(variable[i], depth + 1);
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

/*
 * Converts a string with HTML to a DOM Node
 * Returns only the first node in the string (eg. returns only tag1 but not tag3 in "<tag1><tag2>some text</tag2></tag1><tag3>other text</tag3>")
 *
 * @param string html HTML string to convert
 * @return Node
 */
function toDOMnode(html)
  {
  var div = document.createElement('div');
  div.innerHTML = html;
  return div.firstChild;
  }

/*
 *
 * AJAX Module
 *
 */
var ajax = (function()
  {
  // Private variables
  var onbeforeajax = null, // Callback called when AJAX request is started
    onafterajax = null; // Callback called after AJAX response has been recieved

  /*
   * @private
	 * Creates the actual AJAX object and opens the connection
	 * Helper function for get() and send()
	 *
	 * @param string url URL to load
	 * @param string method GET or POST
	 * @param function success Callback to call if request succeeded
   * @param function fail Callback to call if request failed
	 * @param string data Data to send
   * @param object headers Extra HTTP headers
   * @param boolean ignore_content_type True if Content-Type header should be set by browser
	 * @return XMLHttpRequest
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

  /*
   * @private
	 * Translates an object on form {var1: "val1", var2: "val2"} to query string var1=val1&var2=val2
	 * Helper function for get() and send()
	 *
	 * @param object data Object to translate
	 * @return string The object as query string
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

  /*
   * @private
	 * Translates form element to query string eg. var1=val1&var2=val2
	 * Helper function for get() and send()
	 *
	 * @param HTMLFormElement form The form to translate
   * @param HTMLElement sender The button that fired the request
   * @param string boundary A boundary that delimits parts
	 * @return string The form as query string
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

  /*
   * @public
	 * Starts a HTTP GET request
	 *
	 * @param string url URL to load
	 * @param function success Callback to call if request succeeded
   * @param function fail Callback to call if request failed
	 * @param string/object data Data to append to query string, as string or object: {var1: "val1", var2: "val2"}
	 * @return XMLHttpRequest
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

  /*
   * @public
	 * Starts a HTTP POST request
	 *
	 * @param string url URL to load
	 * @param function success Callback to call if request succeeded
   * @param function fail Callback to call if request failed
	 * @param string/HTMLFormElement data Data to send, as HTML form or object: {var1: "val1", var2: "val2"}
	 * @return XMLHttpRequest
	 */
  function post(url, success, fail, data, sender)
    {
    data = (data.nodeType ? form2query(data, sender) : 
        array2query(data));
    return send(url, 'POST', success, fail, data);
    }

  /*
   * @public
	 * Starts a HTTP POST request with a file element as attachment
	 *
	 * @param string url URL to load
	 * @param function success Callback to call if request succeeded
   * @param function fail Callback to call if request failed
	 * @param HTMLInputElement file_elem The <input type="file"> element to send
	 * @return XMLHttpRequest
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

  /*
   * @public
	 * Sets the "before" callback
	 *
	 * @param function callback
	 * @return void
	 */
  function setBeforeCallback(callback)
    {
    onbeforeajax = callback;
    }

  /*
   * @public
	 * Sets the "after" callback
	 *
	 * @param function callback
	 * @return void
	 */
  function setAfterCallback(callback)
    {
    onafterajax = callback;
    }

  return {'get': get, 'post': post, 'upload': upload, 'setBeforeCallback': setBeforeCallback, 'setAfterCallback': setAfterCallback};
  }()),

/*
 *
 * Boxing Module
 *
 */
boxing = (function()
  {
  // Private variables
  var initiated = 0, // 1 if the Boxing window is created
    state = 0, // 1 if the Boxing window is shown, 0 if hidden
    html_tag = null, // A reference to the <html> tag
    overlayer = null, // A reference to the Boxing overlayer
    close = null, // A reference to the Boxing close button
    window = null, // A reference to the Boxing window
    elements = null, // A NodeList of all elements in the Boxing window
    onhide_callback = null; // A callback called when the Boxing window is hidden

  /*
   * @public
	 * Returns a reference to the Boxing window
	 *
	 * @return HTMLDivElement
	 */
  function getWindow()
    {
    return window;
    }

  /*
   * @private
	 * Returns all focusable elements in the Boxing window
	 *
	 * @return Array
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

  /*
   * @private
	 * Returns the focusable element at specified index
	 *
   * @param integer idx The index
	 * @return Array
	 */
  function getElement(idx)
    {
    var focus_elements = getFocusableElements();
    return (focus_elements.length > 0 ? focus_elements[idx] : null);
    }

  /*
   * @private
	 * Called when a new element has got the focus
	 *
   * @param HTMLElement new_focus_elem The element that got the focus
   * @param boolean is_reverse True if the focus order is reverse (eg. Shift key is pressed)
	 * @return void
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

  /*
   * @public
	 * Hides the Boxing window
	 *
	 * @return void
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
      window.style.display = 'none';

      window.innerHTML = '';
      html_tag.style.overflow = '';
      onhide_callback = null;
      state = 0;
      }
    }

  /*
   * @private
	 * Listener for the keyup event
	 *
   * @param HTMLElement new_focus_elem The element that got the focus
   * @param boolean is_reverse True if the focus order is reverse (eg. Shift key is pressed)
	 * @return void
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

  /*
   * @private
	 * Initiates the Boxing window
	 *
	 * @return void
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
    overlayer.appendChild(close);

    window.id = 'boxing-window';
    doc.body.appendChild(window);

    html_tag = doc.getElementsByTagName('HTML')[0];
    initiated = 1;
    }

  /*
   * @public
	 * Shows the Boxing window
	 *
   * @param string text The HTML to show in the window
   * @param integer width The width of the window (for widths > 100 results in pixels, otherwise percents)
   * @param integer height The height of the window (for heights > 100 results in pixels, otherwise percents)
   * @param function callback An optional callback function to call when the window is hidden
	 * @return void
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
    window.style.display = 'block';

    close.style.width = window.style.width = width + w_unit;
    window.style.height = height + h_unit;

    if (h_unit === '%')
      {
      window.style.margin = '0 0 0 -' + (width / 2) + w_unit;
      window.style.top = (100 - height) / 2 + '%';
      close.style.margin = '0 0 0 -' + (width / 2) + w_unit;
      close.style.top = (100 - height) / 2 - 3 + '%';
      }
    else
      {
      window.style.margin = '-' + (height / 2) + h_unit + ' 0 0 -' + (width / 2) + w_unit;
      window.style.top = '50%';
      close.style.margin = '-' + (height / 2) - 20 + h_unit + ' 0 0 -' + (width / 2) + w_unit;
      close.style.top = '50%';
      }

    window.innerHTML = text;

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

// Reference to the global ContentRequest
content_request, 
// Reference to the global BoxingRequest
boxing_request, 

/*
 *
 * KWF Module
 *
 */
kwf = {
  FULLPATH: '',

  // (@public) Reference to a function called when user clicks the document
  onclick: null,

  // (@public) Reference to a function called on the "load" event
  onload: null,

  // (@public) Reference to the timer that hides error and info messages
  info_timer: null,

  /*
   * @public
	 * Called on the "click" event on the document
	 *
   * @param Event e The event object
	 * @return void
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
        boxing.hide();
        }

      if (kwf.onclick)
        {
        kwf.onclick(e, targ);
        }
      }
    },

  /*
   * @public
	 * Called on the "load" event
	 *
   * @param Event e The event object
	 * @return void
	 */
  loading: function(e)
    {
    if (kwf.onload)
      {
      kwf.onload(e);
      }

    if (elem('content'))
      {
      content_request.findForms();
      content_request.dispatchEvent('ready');
      }
    },

  /*
   * @public
	 * Removes all error and info messages
	 *
	 * @return void
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

  /*
   * @public
	 * Creates HTML for showing error and info messages.
   * Sets the timer for hiding the messages after 10 seconds.
	 *
   * @param object obj The event object
	 * @return string
	 */
  infoHandler: function(obj)
    {
    var html = '', row, k = kwf;

    if (obj.errors)
      {
      html += '<ul id="errorlist">';
      for (row in obj.errors)
        {
        html += '<li>' + obj.errors[row] + '</li>';
        }
      html += '</ul>';
      }

    if (obj.info)
      {
      html += '<ul id="infolist">';
      for (row in obj.info)
        {
        html += '<li>' + obj.info[row] + '</li>';
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
    }
  },

/*
 * Class KWFEventTarget
 *
 * Prototype this to add event listening functionality to your class
 * With help from http://www.nczonline.net/blog/2010/03/09/custom-events-in-javascript/
 */
KWFEventTarget = function()
  {
  // Private variables
  var self = this, 
    listeners = {}; // Stores all listeners

  /*
   * @public
	 * Adds a listener for specified event type
	 *
   * @param string type The event type
   * @param function listener A function that will be called when the event are fired
	 * @return void
	 */
  self.addEventListener = function(type, listener)
    {
    if (typeof listeners[type] === 'undefined')
      {
      listeners[type] = [];
      }

    listeners[type].push(listener);
    };

  /*
   * @public
	 * Removes a listener for specified event type
	 *
   * @param string type The event type
   * @param function listener The listener function to remove
	 * @return void
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

  /*
   * @public
	 * Fires all listeners of specified event type.
   * Should only be called from the class itself
	 *
   * @param string/object event The event type as string or an event object (must contain the "type" property!)
   * @param object target An optional target of the event
	 * @return void
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

/*
 * Class ContentRequest
 *
 * Handles AJAX requests of the content <div>
 */
ContentRequest = function()
  {
  // Private variables
  var self = this, 
    caller = null; // The button or link that fired the request

  // Public variables
  self.response = null; // The response object returned from Ajax module
  self.form_btn = null; // The button that fired a form request

  /*
   * @public
	 * Start loading a new page into the content <div>
	 *
   * @param Event e The event object
   * @param string url The URL to load
	 * @return void
	 */
  self.load = function(e, url)
    {
    returnFalse(e);
    caller = getTarget(e);
    self.dispatchEvent('beforeload', caller);
    ajax.get(url, self.parseResponse, self.parseResponse);
    };

  /*
   * @public
	 * Parse a response (insert the HTML to content <div> and show error and info messages)
	 *
   * @param object response The response object
	 * @return void
	 */
  self.parseResponse = function(response)
    {
    var info = '', content = '', 
      context = elem('content'), 
      btn = self.form_btn;

    // Store the response object in this object so any event listeners can access it
    self.response = response;
    // Fire the afterload event
    self.dispatchEvent('afterload', caller);
    // Retrieve the response object again (it may have been changed by an event listener)
    response = self.response;

    // If the response contains JSON: look for error and info messages
    if (response.content_type === 'application/json')
      {
      info = kwf.infoHandler(response.page);
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
    if (content === '' && info !== '')
      {
      context.insertBefore(toDOMnode(info), context.firstChild);
      }
    else
      {
      context.innerHTML = content;
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

  /*
   * @public
	 * Add submit event listeners to all "ajax-forms" in the content <div>
	 *
	 * @return void
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

      ajax.post(action, self.parseResponse, self.parseResponse, caller, targ);
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

/*
 * Class BoxingRequest
 *
 * Handles AJAX requests of the Boxing window
 */
BoxingRequest = function()
  {
  // Private variables
  var self = this, 
    caller = null; // The button or link that fired the request

  // Public variables
  self.response = null; // The response object returned from Ajax module
  self.width = 0; // The width of current Boxing window
  self.height = 0; // The height of current Boxing window
  self.form_btn = null; // The button that fired a form request

  /*
   * @public
	 * Start loading a page into a new Boxing window
	 *
   * @param Event e The event object
   * @param string url The URL to load
   * @param integer width The width of new Boxing window (optional)
   * @param integer height The height of new Boxing window (optional)
	 * @return void
	 */
  self.load = function(e, url, width, height)
    {
    returnFalse(e);
    caller = getTarget(e);

    self.width = (width || 300);
    self.height = (height || 200);

    self.dispatchEvent('beforeload', caller);

    ajax.get(url, self.parseResponse, self.parseResponse);
    };

  /*
   * @public
	 * Parse a response (insert the HTML to Boxing window, show window and show error and info messages)
	 *
   * @param object response The response object
	 * @return void
	 */
  self.parseResponse = function(response)
    {
    var info = '', content = '', 
      btn = self.form_btn;

    // Store the response object in this object so any event listeners can access it
    self.response = response;
    // Fire the afterload event
    self.dispatchEvent('afterload', caller);
    // Retrieve the response object again (it may have been changed by an event listener)
    response = self.response;

    // If the response contains JSON: look for error and info messages
    if (response.content_type === 'application/json')
      {
      info = kwf.infoHandler(response.page);
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

    // If no HTML was sent, hide the Boxing window and add error and info messages to content <div>
    if (content === '')
      {
      if (info !== '')
        {
        elem('content').insertBefore(toDOMnode(info), elem('content').firstChild);
        }

      boxing.hide();
      }
    else
      {
      boxing.show(content, self.width, self.height);
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

  /*
   * @public
	 * Add submit event listeners to all "ajax-forms" in the Boxing window
	 *
	 * @return void
	 */
  self.findForms = function()
    {
    var forms = boxing.getWindow().getElementsByTagName('form'), 
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

        ajax.post(action, self.parseResponse, self.parseResponse, caller, targ);
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
addEvent(document, 'click', kwf.clicking);
addEvent(window, 'load', kwf.loading);
/*!
 * KWF Script: kwf.js
 * Based on DOMcraft
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2013-09-27
 * @version 5.3
 */

/*global File, ActiveXObject */

(function(window, document)
  {
  /**
   * Returns a new Kwf element object
   * Also available as variable K
   * @method Kwf
   * @public
   * @param {String|HTMLElement} selector ID of element to get or a DOM Element
   */
  var Kwf = function(selector)
    {
    try
      {
      return new Kwf.p.element(selector);
      }
    catch (ex)
      {
      return null;
      }
    }, 

    /**
     * List of functions to be called when the document is ready
     * @property readyList
     * @type Array
     * @private
     * @default null
     */
    readyList = null,
    /**
     * Click listener for the whole document
     * @property click_listener
     * @type Function
     * @private
     * @default null
     */
    click_listener = null,

    ready, 
    toDOMnode, 
    htmlSpecialChars, 
    parseJSON, 
    Ajax, 
    DialogManager, 
    Boxing, 
    Dialog, 
    EventTarget, 
    Context, 
    ContentContext, 
    BoxingContext, 
    MessagesView;

    // Adds the String.trim() function for older browsers
    if (!String.prototype.trim)
      {
      String.prototype.trim = function ()
        {
        return this.replace(/^\s+|\s+$/g,'');
        };
      }

  /**
   * Uniforms the event object so it have the same methods and properties in
   * all browsers
   * @method uniformEvent
   * @private
   * @param {Event} e The event object
   */
  function uniformEvent(e)
    {
    if (!e.preventDefault)
      {
      e.preventDefault = function()
        {
        event.returnValue = false;
        };
      }

    if (!e.stopPropagation)
      {
      e.stopPropagation = function()
        {
        e.cancelBubble = true;
        };
      }

    if (!e.target)
      {
      e.target = event.srcElement;
      }
    }

  /**
   * The <form> click listener for submit events
   * @method formClickListener
   * @private
   * @param {Event} e The event object
   */
  function formClickListener(e)
    {
    // this is the <form> and event target is the button
    if (e.target.nodeName.match(/button|input/i) && e.target.type === 'submit')
      {
      this.submitter = e.target;
      }
    }

  /**
   * Listener for click events on complete document
   * @method documentClick
   * @private
   * @param {Event} e The event object
   */
  function documentClick(e)
    {
    if (e.button < 1)
      {
      var target = Kwf(e.target), 
        prevent = 0;

      if (target.hasClass('content-context'))
        {
        prevent = 1;
        ContentContext.fromLink(target);
        }
      else if (target.hasClass('boxing-context'))
        {
        prevent = 1;
        BoxingContext.fromLink(target);
        }

      if (click_listener)
        {
        prevent |= click_listener(e, target);
        }

      if (prevent)
        {
        e.preventDefault();
        }
      }
    }

  /**
   * Calls all ready listeners
   * @method completed
   * @private
   * @param {Event} e The event object
   */
  function completed(e)
    {
    if (document.addEventListener || e.type === 'load' || document.readyState === 'complete')
      {
      // Event listeners must be cleaned before calling ready listeners
      if (document.addEventListener)
        {
        document.removeEventListener('DOMContentLoaded', completed, 0);
        window.removeEventListener('load', completed, 0);
        }
      else
        {
        document.detachEvent('onreadystatechange', completed);
        window.detachEvent('onload', completed);
        }

      var i;
      for (i = 0; i < readyList.length; i++)
        {
        readyList[i]();
        }

      // Clean-up the ready list
      readyList = null;
      }
    }

  Kwf.p = Kwf.prototype = {
    /**
     * Returns a new Kwf element object for selector
     * @class element
     * @constructor
     * @param {String|HTMLElement} selector ID of element to get or a DOM Element
     */
    element: function(selector)
      {
      this.elem = null;

      // If selector is a DOM node OR is the window
      if (selector.nodeType || selector === window)
        {
        // The window selector has of course limited use of some of this class'
        // methods, other than the event methods
        this.elem = selector;
        }
      // If selector is a ID string
      else if (typeof selector === 'string')
        {
        try
          {
          this.elem = document.getElementById(selector) || document.all[selector];

          // For IE, who doesn't throw errors when trying to find non-existing ID
          if (!this.elem)
            {
            throw new Error('Could not find element #' + selector);
            }
          }
        catch (e)
          {
          throw new Error('Could not find element #' + selector);
          }
        }
      },

    /**
     * Returns true if element has specified CSS class
     * @method hasClass
     * @public
     * @param {String} classname Name of class to test for
     * @return {Boolean}
     */
    hasClass: function(classname)
      {
      return (this.elem.className 
        ? Boolean(this.elem.className.match(new RegExp('(\\s|^)' + classname + '(\\s|$)'))) 
        : false);
      },

    /**
     * Adds specified CSS class to element
     * @method addClass
     * @public
     * @param {String} classname Name of class to add
     */
    addClass: function(classname)
      {
      if (!this.hasClass(classname))
        {
        this.elem.className += ' ' + classname;
        }
      },

    /**
     * Removed specified CSS class from element
     * @method removeClass
     * @public
     * @param {String} classname Name of class to remove
     */
    removeClass: function(classname)
      {
      this.elem.className = this.elem.className
        .replace(new RegExp('(\\s|^)' + classname + '(\\s|$)'), ' ')
        .replace(/\s+/g,' ').
        replace(/^\s|\s$/,'');
      },

    /**
     * Replaces specified CSS class with new class from element
     * @method replaceClass
     * @public
     * @param {String} old_classname Name of class to remove
     * @param {String} new_classname Name of class to add
     */
    replaceClass: function(old_classname, new_classname)
      {
      this.removeClass(old_classname);
      this.addClass(new_classname);
      },

    /**
     * Returns the parent element for this element, as a Kwf element
     * @method parent
     * @public
     * @return {Kwf.element} The parent element
     */
    parent: function()
      {
      return Kwf(this.elem.parentNode);
      },

    /**
     * Queries the element for first child node matching the query
     * @method query
     * @public
     * @param {String} query_str Query string
     * @return {Kwf.element} Matching element
     */
    query: function(query_str)
      {
      return Kwf(this.elem.querySelector(query_str));
      },

    /**
     * Queries the element for child nodes matching the query
     * @method queryAll
     * @public
     * @param {String} query_str Query string
     * @return {Array} Array of Kwf.elements of all matching elements
     */
    queryAll: function(query_str)
      {
      var arr = [], i, 
        result = this.elem.querySelectorAll(query_str);

      for (i = 0; i < result.length; i++)
        {
        arr.push(Kwf(result[i]));
        }

      return arr;
      },

    /**
     * Inserts an element before a reference element
     * @method insertBefore
     * @public
     * @param {Kwf.element|HTMLElement} element Element as Kwf.element or HTMLElement
     * @param {Kwf.element|HTMLElement} ref_element Element as Kwf.element or HTMLElement
     */
    insertBefore: function(element, ref_element)
      {
      if (element instanceof Kwf)
        {
        element = element.elem;
        }

      if (ref_element instanceof Kwf)
        {
        ref_element = ref_element.elem;
        }

      this.elem.insertBefore(element, ref_element);
      },

    /**
     * Prepends an element as first child to this element
     * @method prepend
     * @public
     * @param {Kwf.element|HTMLElement} element Element as Kwf.element or HTMLElement
     */
    prepend: function(element)
      {
      this.insertBefore(element, this.elem.firstChild);
      },

    /**
     * Appends an element as last child to this element
     * @method append
     * @public
     * @param {Kwf.element|HTMLElement} element Element as Kwf.element or HTMLElement
     */
    append: function(element)
      {
      if (element instanceof Kwf)
        {
        element = element.elem;
        }

      this.elem.appendChild(element);
      },

    /**
     * Removes this element from it's parent
     * @method remove
     * @public
     */
    remove: function()
      {
      this.elem.parentNode.removeChild(this.elem);
      },

    /**
     * Removes all child elements from this element
     * @method empty
     * @public
     */
    empty: function()
      {
      while (this.elem.hasChildNodes() && this.elem.removeChild(this.elem.firstChild));
      },

    /**
     * Sets or gets the inner HTML of element
     * @method html
     * @public
     * @param {String} [new_html] Optional new HTML to set
     * @return {String} Returns the innerHTML if new_html is undefined
     */
    html: function(new_html)
      {
      if (typeof new_html === 'string')
        {
        this.elem.innerHTML = new_html;
        }
      else
        {
        return this.elem.innerHTML;
        }
      },

    /**
     * Sets or gets the textContent of element.
     * For IE < 9 this uses the innerText instead.
     * @method text
     * @public
     * @param {String} [new_text] Optional new text content to set
     * @return {String} Returns the textContent value if new_text is undefined
     */
    text: function(new_text)
      {
      var property = (this.elem.textContent !== undefined ? 'textContent' : 'innerText');

      if (typeof new_text === 'string')
        {
        this.elem[property] = new_text;
        }
      else
        {
        return this.elem[property];
        }
      },

    /**
     * Sets or gets the value of a form element
     * Throws error if element is not a form element
     * @method value
     * @public
     * @param {String} [new_value] Optional new value to set
     * @return {String} Returns the value if new_value is undefined
     */
    value: function(new_value)
      {
      if (this.elem.value === undefined)
        {
        throw new Error('value(): Tried to set value on non-form element');
        }
      else if (new_value !== undefined)
        {
        this.elem.value = new_value;
        }
      else
        {
        return this.elem.value;
        }
      },

    /**
     * Sets or gets an attribute of element
     * @method attr
     * @public
     * @param {String} attribute Attribute name
     * @param {String} [new_value] Optional new value to set on attribute
     * @return {String} Returns the attribute if new_value is undefined
     */
    attr: function(attribute, new_value)
      {
      if (typeof new_value !== 'undefined')
        {
        this.elem.setAttribute(attribute, new_value);
        }
      else
        {
        return this.elem.getAttribute(attribute);
        }
      },

    /**
     * Sets or gets a CSS style property of element
     * Property name must be in camelCase (eg. backgroundColor)
     * @method style
     * @public
     * @param {String} property Style property
     * @param {String} [new_value] Optional new value to set on property
     * @return {String} Returns the property value if new_value is undefined
     */
    style: function(property, new_value)
      {
      try
        {
        if (typeof new_value !== 'undefined')
          {
          this.elem.style[property] = new_value;
          }
        else
          {
          return this.elem.style[property];
          }
        }
      catch (e)
        {
        throw new Error('style(): Could not find property: ' + property);
        }
      },

    /**
     * Returns the real offsetTop for element
     * @method offsetTop
     * @public
     * @return {Number}
     */
    offsetTop: function()
      {
      var off_top = this.elem.offsetTop, 
        off_parent = this.elem.offsetParent;

      while (off_parent)
        {
        off_top += off_parent.offsetTop;
        off_parent = off_parent.offsetParent;
        }

      return off_top;
      },

    /**
     * Returns the real offsetLeft for element
     * @method offsetLeft
     * @public
     * @return {Number}
     */
    offsetLeft: function()
      {
      var off_left = this.elem.offsetLeft, 
        off_parent = this.elem.offsetParent;

      while (off_parent)
        {
        off_left += off_parent.offsetLeft;
        off_parent = off_parent.offsetParent;
        }

      return off_left;
      },

    /**
     * Adds an event listener to the element
     * If element is a <form>, a click listener is also applied
     * @method addEvent
     * @public
     * @param {String} event Name of event to listen for
     * @param {Function} func Callback function
     * @param {Boolean} [use_capture] True if capturing should be used, default is false
     * @param {Object} [context] Object to call callback function on
     */
    addEvent: function(event, func, use_capture, context)
      {
      var new_func = func, 
        listener, 
        self = this;

      // Context is optional
      if (context)
        {
        new_func = function(e)
          {
          func.call(context, e);
          };
        }

      // Uniform the event before calling callback function
      listener = function(e)
        {
        uniformEvent(e);
        // Uniform the "this" on event listeners. "this" should be the element
        // listener is listening to (default for addEventListener but not for
        // attachEvent)
        new_func.call(self.elem, e);
        };

      // Submit events on <form> should also have click listener so submit
      // listener will now which submit button was clicked
      if (event === 'submit')
        {
        self.addEvent('click', formClickListener);
        }

      if (self.elem.addEventListener)
        {
        self.elem.addEventListener(event, listener, use_capture);
        }
      else if (self.elem.attachEvent)
        {
        self.elem.attachEvent('on' + event, listener);
        }
      }
    };

  // This makes the element object same as Kwf
  Kwf.p.element.prototype = Kwf.p;

  /**
   * Creates a new HTML element with specified tag name
   * @method create
   * @public
   * @param {String} tag_name The type of element to create
   * @param {Object} options Attributes to set on the new element
   */
  Kwf.create = function(tag_name, options)
    {
    var element = new Kwf.p.element(document.createElement(tag_name)), 
      property;

    if (options)
      {
      for (property in options)
        {
        if (property === 'id')
          {
          element.elem.id = options.id;
          }
        else if (property === 'class')
          {
          element.elem.className = options['class'];
          }
        else
          {
          element.attr(property, options[property]);
          }
        }
      }

    return element;
    };

  /**
   * Adds a listener for the DOM ready event
   * @method ready
   * @public
   * @param {Function} listener Ready listener
   */
  Kwf.ready = ready = function(listener)
    {
    // If no ready list is initiated, assume no event listeners are added yet
    if (!readyList)
      {
      readyList = [];

      // If document is ready before this function is called
      if (document.readyState === 'complete')
        {
        setTimeout(complete);
        }
      // For standard compliant browsers
      else if (document.addEventListener)
        {
        document.addEventListener('DOMContentLoaded', completed, 0);
        // Fallback
        window.addEventListener('load', completed, 0);
        }
      // For IE
      else
        {
        document.attachEvent('onreadystatechange', completed);
        // Fallback
        window.attachEvent('onload', completed);
        }
      }

    if (typeof listener === 'function')
      {
      readyList.push(listener);
      }
    else
      {
      throw new Error('ready(): listener must be a function.');
      }
    };

  /***
   * Sets the document click listener. Overwrites any previous listener
   * @method click
   * @public
   * @param {Function} listener Click listener
   */
  Kwf.click = function(listener)
    {
    if (typeof listener === 'function')
      {
      click_listener = listener;
      }
    else
      {
      throw new Error('click(): listener must be a function.');
      }
    };

  /**
   * Parses JSON using browser's built-in method or using string functions
   * @method parseJSON
   * @public
   * @param {String} data JSON object as string
   * @return {Object}
   */
  Kwf.parseJSON = parseJSON = function(data)
    {
    if (window.JSON && JSON.parse)
      {
      data = JSON.parse(data);
      }
    else if (typeof data === 'string')
      {
      try
        {
        data = (new Function('return ' + data))();
        }
      catch (e) {}
      }

    return data;
    };

  /**
   * Returns a language string
   * @method __
   * @public
   * @param {String} key The language string's key
   * @return {String}
   */
  Kwf.__ = function(key)
    {
    if (Kwf.languages[key])
      {
      return Kwf.languages[key];
      }

    return key;
    };

  /**
   * Exposes all properties to an object and alerts them in human readable format
   * @method var_dump
   * @public
   * @param {Object} variable The variable to dump
   * @param {Number} [depth=0] Depth of variable (only for internal use)
   * @return {Void/String}
   */
  Kwf.var_dump = function(variable, depth)
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
          str += spaces(depth) + i + ': ' + Kwf.var_dump(variable[i], depth + 1);
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
    };

  /**
   * Converts a string with HTML to a DOM Node
   * @example Returns only the first node in the string (eg. returns only tag1 but not tag3 in "<tag1><tag2>some text</tag2></tag1><tag3>other text</tag3>")
   * @method toDOMnode
   * @public
   * @param {String} html HTML string to convert
   * @return {Kwf.Element}
   */
  Kwf.toDOMnode = toDOMnode = function(html)
    {
    var div = document.createElement('div');
    div.innerHTML = html.trim();
    return Kwf(div.firstChild);
    };

  /**
   * Takes a text string and encodes all HTML entities (< > ")
   * @method htmlSpecialChars
   * @public
   * @param {String} text The text to sanitize
   * @return {String} The encoded text
   */
  Kwf.htmlSpecialChars = htmlSpecialChars = function(text)
    {
    return text.replace(/>/gm, '&gt;').replace(/</gm, '&lt;').replace(/"/gm, '&quot;');
    }

  /**
   * AJAX class provides an easy interface for requesting data asynchronous
   * @class Ajax
   * @static
   */
  Kwf.Ajax = Ajax = (function()
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
     * @param {Function} fail Callback to call if request failed (failing 
     *        means request failed, e.g. HTTP error statuses)
     * @param {String} data Data to send
     */
    function send(url, method, success, fail, data)
      {
      var ajax_req = (window.XMLHttpRequest) ? 
          new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP'),
        response, 
        content_type;

      ajax_req.open(method, url);
      ajax_req.setRequestHeader('X-ajax-request', 'true');

      // If no Content-Type was set and data is not a FormData object, use default
      if (!window.FormData ||  !(data instanceof FormData))
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
              redirect_url: ajax_req.getResponseHeader('X-kwf-redirect-url'),
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
            // If a runtime error happened at server, this header gets sent
            if (ajax_req.getResponseHeader('X-kwf-runerror'))
              {
              // Kwf.Dialogs must be created with "new" or else multiple dialogs will get the same properties!
              new Kwf.Dialog('Debug', response.page, 600, 500);
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
      }

    /**
     * Legacy file upload for browsers not supporting XMLHttpRequest2 and FormData.
     * @method uploadLegacy
     * @private
     * @param {String} url URL to load
     * @param {Function} success Callback to call if request succeeded
     * @param {Function} fail Callback to call if request failed (failing 
     *        means request failed, e.g. HTTP error statuses)
     * @param {String} data Data to send
     * @param {HTMLElement} [sender] The button that fired the request
     */
    function uploadLegacy(url, success, fail, form, sender)
      {
      var iframe_form, 
        frame, 
        frame_doc, 
        input_ajax_request = toDOMnode('<input type="hidden" name="X-ajax-request" value="true" />'),
        input_frame_upload = toDOMnode('<input type="hidden" name="X-frame-upload" value="true" />'), 
        input_sender, 
        body = Kwf(document.body), 
        resp, 
        is_json = 0;

      if (onbeforeajax)
        {
        onbeforeajax();
        }

      form.target = 'ajax_upload_frame';
      form.appendChild(input_ajax_request.elem);
      form.appendChild(input_frame_upload.elem);

      if (sender)
        {
        input_sender = toDOMnode('<input type="hidden" name="' + sender.name + '" value="1" />');
        form.appendChild(input_sender.elem);
        }

      frame = toDOMnode('<iframe style="visibility: hidden;" src="javascript: false;" '
         + 'name="ajax_upload_frame" id="ajax_upload_frame"></iframe>');
      body.append(frame);

      frame.addEvent('load', function()
        {
        setTimeout(function()
          {
          frame_doc = frame.elem.contentDocument || frame.elem.contentWindow.document;
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

          frame.remove();

          if (onafterajax)
            {
            onafterajax();
            }
          }, 1);
        });

      // Send the form through <iframe>
      form.submit();

      // Revert the form back to original state
      form.target = '';
      input_ajax_request.remove();
      input_frame_upload.remove();
      if (sender)
        {
        input_sender.remove();
        }
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
     * Helper function for post()
     * @method form2query
     * @private
     * @param {HTMLFormElement} form The form to translate
     * @param {HTMLElement} sender The button that fired the request
     * @return {String} The form as query string
     */
    function form2query(form, sender)
      {
      var data = '', 
        element, 
        i;

      for (i = 0; i < form.elements.length; i++)
        {
        element = form.elements[i];

        // Disabled form elements can't be sen, neither
        // can elements with no name
        if (!element.disabled && element.name)
          {
          // Append this element to query string, but if it's a radio or 
          // checkbox, it must've been checked. Do not add buttons or files
          if (((element.type !== 'radio' && element.type !== 'checkbox') || element.checked)
              && element.type !== 'submit' && element.type !== 'button' 
              && element.type !== 'file')
            {
            data += encodeURIComponent(element.name) + '=' + encodeURIComponent(element.value) + '&';
            }
          }
        }

      // The button that sent the form must be added afterwards
      if (sender)
        {
        data += encodeURIComponent(sender.name) + '=' + encodeURIComponent(sender.value);
        }

      return data;
      }

    /**
     * Starts a HTTP GET request
     * @method get
     * @public
     * @param {String} url URL to load
     * @param {Function} success Callback to call if request succeeded
     * @param {Function} fail Callback to call if request failed
     * @param {String/Object} data Data to append to query string, as string or object: {var1: "val1", var2: "val2"}
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

      send(url + data, 'GET', success, fail, null);
      }

    /**
     * Starts a HTTP POST request
     * @method post
     * @public
     * @param {String} url URL to load
     * @param {Function} success Callback to call if request succeeded
     * @param {Function} fail Callback to call if request failed
     * @param {Object|HTMLFormElement} data Data to send, as HTML form or object: {var1: "val1", var2: "val2"}
     * @param {HTMLElement} [sender] The button that fired the request
     */
    function post(url, success, fail, data, sender)
      {
      // Is "data" a form?
      if (data.nodeType)
        {
        // Forms with file upload elements will have the multipart "enctype"
        if (data.enctype === 'multipart/form-data')
          {
          // If the FormData interface is supported
          if (window.FormData)
            {
            data = new FormData(data);

            // We still need to add the "clicked" button manually
            if (sender)
              {
              data.append(sender.name, sender.value);
              }
            }
          else
            {
            // Use the legacy <iframe> form uploader instead
            return uploadLegacy(url, success, fail, data, sender);
            }
          }
        // For "normal" urlencoded forms
        else
          {
          data = form2query(data, sender);
          }
        }
      // No, assume it's an object
      else
        {
        data = array2query(data);
        }

      send(url, 'POST', success, fail, data);
      }

    /**
     * Starts a HTTP POST request with a file element as attachment
     * @method upload
     * @public
     * @param {String} url URL to load
     * @param {Function} success Callback to call if request succeeded
     * @param {Function} fail Callback to call if request failed
     * @param {HTMLInputElement|Kwf.element} file_elem The <input type="file"> element to send
     * @param {HTMLElement} [sender] The button that fired the request
     */
    function upload(url, success, fail, file_elem, sender)
      {
      file_elem = (file_elem.elem ? file_elem.elem : file_elem);

      var form = Kwf.create('form'), 
        file_elem_parent = file_elem.parentNode, 
        file_elem_sibling = file_elem.nextSibling, 
        form_elem = form.elem;

      form_elem.action = url;
      form_elem.method = 'post';
      // For IE8 you need both. Obnoxious
      form_elem.encoding = form_elem.enctype = "multipart/form-data";
      form.style('visibility', 'hidden');
      form.append(file_elem);

      Kwf(document.body).append(form);
      post(url, function(response)
        {
        success(response);

        file_elem_parent.insertBefore(file_elem, file_elem_sibling);
        }, fail, form_elem, sender);
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

    return {
      'get': get, 
      'post': post, 
      'upload': upload, 
      'setBeforeCallback': setBeforeCallback, 
      'setAfterCallback': setAfterCallback
      };
    }());

  /**
   * Manages all different dialogs that can be opened within a page.
   * Takes care of top most dialog and the Escape key for closing it.
   * Sets focus to the dialog and ensures that focus can't be moved anywhere else.
   * @class DialogManager
   * @static
   */
  Kwf.DialogManager = DialogManager = (function()
    {
    /**
     * Array of opened dialogs
     * @property dialogs
     * @type Array
     * @private
     * @default []
     */
    var dialogs = [],
    /**
     * Array of opened dialogs
     * @property Z_INDEX_START
     * @type Number
     * @private
     * @final
     */
    Z_INDEX_START = 100,
    /**
     * Holds reference to the focused element before opening a dialog
     * @property last_focus
     * @type HTMLElement
     * @private
     */
    last_focus = null,
    /**
     * Holds reference to resize timer
     * @property resize_timer
     * @type Number
     * @private
     */
    resize_timer = null;

    /**
     * Returns the uppermost dialog
     * @method getLastDialog
     * @private
     * @return {Object} The dialog object, or null if no dialogs are in stack
     */
    function getLastDialog()
      {
      if (dialogs.length)
        {
        return dialogs[dialogs.length - 1];
        }

      return null;
      }

    /**
     * Adds a new dialog to the stack and moves focus to it
     * @method addDialog
     * @public
     * @param {Object} dialog The dialog object
     */
    function addDialog(dialog)
      {
      var container = dialog.getContainer();

      last_focus = document.activeElement;

      // Make the container focusable
      container.tabIndex = -1;
      container.focus();

      // Make sure this dialog is on top of the others
      dialog.setZIndex(Z_INDEX_START + dialogs.length);

      // Add to end of the dialogs stack
      dialogs.push(dialog);

      // See if this new dialog fits on screen
      resizeDialogs(dialog);
      }

    /**
     * Removes the uppermost dialog from the stack
     * @method removeDialog
     * @public
     */
    function removeDialog()
      {
      // Pop the uppermost dialog of stack
      dialogs.pop();

      // Try set focus to the element with focus before opening the dialog
      if (last_focus)
        {
        last_focus.focus();
        }
      // Are there any more dialogs in stack?
      else if (dialogs.length)
        {
        // Set focus to the next upper dialog
        getLastDialog().getContainer().focus();
        }
      }

    /**
     * Checks if the requested dialog is the uppermost, then closes the dialog
     * if it's the uppermost
     * @method requestRemoval
     * @public
     * @param {Object} dialog The dialog object to close
     */
    function requestRemoval(dialog)
      {
      var last_dialog = getLastDialog();

      if (last_dialog === dialog)
        {
        last_dialog.close();
        removeDialog();
        }
      }

    /**
     * Listener for keyup event. Makes Escape key close most upper dialog
     * @method keyListener
     * @private
     * @param {Event} e The key event object
     */
    function keyListener(e)
      {
      if (e.keyCode === 27 && dialogs.length)
        {
        getLastDialog().close();
        removeDialog();
        }
      }

    /**
     * Listener for focus event. Ensures the focus stays inside the
     * uppermost dialog
     * @method focusListener
     * @private
     * @param {Event} e The focus event object
     */
    function focusListener(e)
      {
      if (dialogs.length)
        {
        var container = getLastDialog().getContainer();

        if (!container.contains(e.target))
          {
          e.stopPropagation();
          container.focus();
          }
        }
      }

    /**
     * Ensures every dialog has appropriate dimensions relative to client 
     * dimensions.
     * @method resizeDialogs
     * @private
     * @param {Object} [dialog] Optional dialog to resize. If undefined, all dialogs are resized
     */
    function resizeDialogs(dialog)
      {
      var width, 
        height, 
        resized, 
        resize_dialogs = (dialog ? [dialog] : dialogs), 
        i;

      if (window.innerWidth)
        {
        width = window.innerWidth;
        height = window.innerHeight;
        }
      else
        {
        width = document.body.clientWidth;
        height = document.body.clientHeight;
        }

      for (i = 0; i < dialogs.length; i++)
        {
        resized = 0;

        if (dialogs[i].getWidth() > width)
          {
          dialogs[i].setWidth(width);
          resized = 1;
          }

        if (dialogs[i].getHeight() > height)
          {
          dialogs[i].setHeight(height);
          resized = 1;
          }

        if (!resized)
          {
          dialogs[i].restoreSize();
          }
        }
      }

    /**
     * Listener for resize event. Calls resizeDialogs when user has stopped 
     * resizing (with help of a timer).
     * @method resizeListener
     * @private
     * @param {Event} e The focus event object
     */
    function resizeListener(e)
      {
      clearTimeout(resize_timer);
      resize_timer = setTimeout(resizeDialogs, 50);
      }

    // Start listen for key events to bind the Escape key
    Kwf(document).addEvent('keyup', keyListener);
    // Start listen for focus events to keep focus within the uppermost dialog
    Kwf(document).addEvent('focus', focusListener, 1);
    // For IE < 9
    Kwf(document).addEvent('focusin', focusListener);
    // Start listen for resize events to resize dialogs appropriately
    Kwf(window).addEvent('resize', resizeListener);

    return {
      'addDialog': addDialog,
      'removeDialog': removeDialog,
      'requestRemoval': requestRemoval
      };
    }());

  /**
   * Boxing class provides functions for showing a popup dialog on the center of the screen with an overlay behind
   * @class Boxing
   * @static
   */
  Kwf.Boxing = Boxing = (function()
    {
    /**
     * True if the Boxing window is shown, false if hidden
     * @property state
     * @type Boolean
     * @private
     * @default false
     */
    var state = 0, 
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
     * @type Kwf.element
     * @private
     * @default null
     */
    overlayer = null, 
    /**
     * A reference to the Boxing close button
     * @property close_btn
     * @type Kwf.element
     * @private
     * @default null
     */
    close_btn = null, 
    /**
     * A reference to the Boxing container
     * @property container
     * @type Kwf.element
     * @private
     * @default null
     */
    container = null, 
    /**
     * A callback called when the Boxing window is hidden
     * @property onhide_callback
     * @type Function
     * @private
     * @default null
     */
    onhide_callback = null, 
    /**
     * The initial width of current opened Boxing
     * @property initial_width
     * @type Number
     * @private
     */
    initial_width, 
    /**
     * The initial height of current opened Boxing
     * @property initial_height
     * @type Number
     * @private
     */
    initial_height;

    /**
     * Returns a reference to the Boxing container
     * @method getContainer
     * @public
     * @return {HTMLDivElement} The container element
     */
    function getContainer()
      {
      return container.elem;
      }

    /**
     * Sets the Boxing z-index
     * @method setZIndex
     * @public
     * @param {Number} z_index New z-index
     */
    function setZIndex(z_index)
      {
      container.style('zIndex', z_index);
      }

    /**
     * Sets the Boxing width
     * @method setWidth
     * @public
     * @param {Number} width New width
     */
    function setWidth(width)
      {
      var unit = (width > 100 ? 'px' : '%');

      container.style('width', width + unit);
      container.style('marginLeft', '-' + (width / 2) + unit);

      setTimeout(function()
        {
        close_btn.style('left', container.offsetLeft() + container.elem.offsetWidth - 10 + 'px');
        }, 10);
      }

    /**
     * Returns the Boxing width
     * @method getWidth
     * @public
     * @return {Number} The width
     */
    function getWidth() { return parseInt(container.style('width'), 10); }

    /**
     * Sets the Boxing height
     * @method setHeight
     * @public
     * @param {Number} width New width
     */
    function setHeight(height)
      {
      var unit = (height > 100 ? 'px' : '%');

      if (unit === '%')
        {
        container.style('marginTop', 0);
        container.style('top', (100 - height) / 2 + '%');
        }
      else
        {
        container.style('marginTop', '-' + (height / 2) + 'px');
        container.style('top', '50%');
        }

      container.style('height', height + unit);

      setTimeout(function()
        {
        close_btn.style('top', container.offsetTop() - 10 + 'px');
        }, 10);
      }

    /**
     * Returns the Boxing height
     * @method getHeight
     * @public
     * @return {Number} The height
     */
    function getHeight() { return parseInt(container.style('height'), 10); }

    /**
     * Restores Boxing to initial width and height
     * @method restoreSize
     * @public
     */
    function restoreSize()
      {
      setWidth(initial_width);
      setHeight(initial_height);
      }

    /**
     * Closes the Boxing dialog
     * @method close
     * @public
     */
    function close()
      {
      if (onhide_callback)
        {
        if (!onhide_callback())
          {
          return;
          }
        }

      overlayer.addClass('hide');
      close_btn.addClass('hide');
      container.removeClass('show');

      // This is for animation purpose
      setTimeout(function()
        {
        container.addClass('hide');
        container.html('');
        }, 100);

      html_tag.style.overflow = '';
      onhide_callback = null;
      state = 0;
      }

    /*
     * Initiates the Boxing window
     */
    Kwf.ready(function()
      {
      var body = Kwf(document.body);

      // Overlayer is the background of dialog, obfuscating the rest of screen
      overlayer = Kwf.create('div', {'id': 'boxing-overlayer'});
      body.append(overlayer);

      // Clicking on the overlayer should close the dialog, if allowed
      overlayer.addEvent('click', function()
        {
        DialogManager.requestRemoval(Boxing);
        });

      // Close button
      close_btn = Kwf.create('a', {'id': 'close_boxing', 'class': 'hide-boxing', 'href': 'javascript: void(0);'});
      close_btn.text('X');
      body.append(close_btn);

      // The dialog container should have the ARIA role as dialog
      container = Kwf.create('div', {'id': 'boxing-window', 'role': 'dialog', 'class': 'kwf-dialog'});
      body.append(container);

      // Listen for clicks on elements with "hide-boxing" class
      body.addEvent('click', function(e)
        {
        if (Kwf(e.target).hasClass('hide-boxing'))
          {
          e.preventDefault();
          DialogManager.requestRemoval(Boxing);
          }
        });

      html_tag = document.getElementsByTagName('HTML')[0];

      // Start the dialog in closed mode
      close();
      });

    /**
     * Shows the Boxing dialog
     * @method show
     * @public
     * @param {String} text The HTML to show in the dialog
     * @param {Number} width The width of the dialog (for widths > 100 results in pixels, otherwise percents)
     * @param {Number} height The height of the dialog (for heights > 100 results in pixels, otherwise percents)
     * @param {Function} callback An optional callback function to call when the dialog is hidden
     */
    function show(text, width, height, callback)
      {
      if (callback)
        {
        onhide_callback = callback;
        }

      overlayer.removeClass('hide');
      close_btn.removeClass('hide');
      container.removeClass('hide');

      initial_width = width;
      initial_height = height;
      setWidth(width);
      setHeight(height);
      container.html(text);

      // This is for animation purpose
      setTimeout(function()
        {
        container.addClass('show');
        }, 100);

      html_tag.style.overflow = 'hidden';

      // Add this dialog to the dialog stack if dialog was closed before
      if (!state)
        {
        DialogManager.addDialog(Boxing);
        }

      // Remember that the Boxing dialog is opened
      state = 1;
      }

    return {
      'show': show, 
      'close': close, 
      'getContainer': getContainer,
      'setZIndex': setZIndex,
      'setWidth': setWidth,
      'getWidth': getWidth,
      'setHeight': setHeight,
      'getHeight': getHeight,
      'restoreSize': restoreSize
      };
    }());

  /**
   * Contains functions for opening dialogs
   * @class Dialog
   * @constructor
   * @param {String} title Dialog title
   * @param {HTMLElement|String} content Containing HTML of this dialog as string or element
   * @param {Number} width Dialog width
   * @param {Number} height Dialog height
   * @param {Function} [click_listener] A listener for the click event
   */
  Kwf.Dialog = Dialog = function(title, content, width, height, click_listener)
    {
    /**
     * Reference to this object
     * @property self
     * @type Object
     * @private
     */
    var self = this, 

    /**
     * Reference to the dialog element
     * @property dialog
     * @type Kwf.element
     * @private
     */
    dialog = Kwf.create('div'), 

    /**
     * Reference to the dialog content element
     * @property content_div
     * @type Kwf.element
     * @private
     */
    content_div = null, 

    /**
     * Unique ID for this dialog
     * @property uid
     * @type Number
     * @private
     */
    uid = Math.floor(Math.random() * 1000);

    /**
     * Handles click events on dialog
     * @method click
     * @private
     * @param {Event} e The event object
     */
    function click(e)
      {
      if (Kwf(e.target).hasClass('dialog-close'))
        {
        DialogManager.requestRemoval(self);
        }

      if (typeof click_listener === 'function')
        {
        click_listener(e);
        }
      }

    /**
     * Sets the dialog content
     * @method setContent
     * @public
     * @param {HTMLElement/String} content Containing HTML of this dialog as string or element
     */
    self.setContent = function(content)
      {
      if (typeof content === 'string')
        {
        content_div.html(content_div.html() + content);
        }
      else
        {
        content_div.html('');
        content_div.append(content);
        }
      };

    /**
     * Returns a reference to the Dialog container
     * @method getContainer
     * @public
     * @return {HTMLDivElement} The container element
     */
    self.getContainer = function()
      {
      return content_div.elem;
      };

    /**
     * Sets the dialog z-index
     * @method setZIndex
     * @public
     * @param {Number} z_index New z-index
     */
    self.setZIndex = function(z_index)
      {
      dialog.style('zIndex', z_index);
      };

    /**
     * Sets the dialog width
     * @method setWidth
     * @public
     * @param {Number} width New width
     */
    self.setWidth = function(width)
      {
      dialog.style('width', width + 'px');
      dialog.style('marginLeft', '-' + (width / 2) + 'px');
      };

    /**
     * Returns the dialog width
     * @method getWidth
     * @public
     * @return {Number} The width
     */
    self.getWidth = function() { return parseInt(dialog.style('width'), 10); };

    /**
     * Sets the dialog height
     * @method setHeight
     * @public
     * @param {Number} width New width
     */
    self.setHeight = function(height)
      {
      dialog.style('height', height + 'px');
      dialog.style('marginTop', '-' + (height / 2) + 'px');
      };

    /**
     * Returns the dialog height
     * @method getHeight
     * @public
     * @return {Number} The height
     */
    self.getHeight = function() { return parseInt(dialog.style('height'), 10); };

    /**
     * Restores dialog to initial width and height
     * @method restoreSize
     * @public
     */
    self.restoreSize = function()
      {
      self.setWidth(width);
      self.setHeight(height);
      };

    /**
     * Closes this dialog
     * @method close
     * @public
     */
    self.close = function()
      {
      dialog.removeClass('show');

      // This is for animation purpose
      setTimeout(function()
        {
        dialog.remove();
        }, 100);
      };

    /* Initiation */

    // The dialog should have the ARIA role as dialog
    dialog.attr('role', 'dialog');
    // The dialog is labeled by kwf-dialog-title with the unique ID
    dialog.attr('aria-labelledby', 'kwf_dlgtitle_' + uid);

    dialog.addClass('kwf-dialog');
    self.setWidth(width);
    self.setHeight(height);
    dialog.html('<div class="kwf-dialog-bar"><span class="kwf-dialog-title" id="kwf_dlgtitle_' + uid + '">'
      + title + '</span><span class="kwf-dialog-close dialog-close">X</span></div>');

    content_div = toDOMnode('<div class="kwf-dialog-content"></div>');
    dialog.append(content_div);
    self.setContent(content);

    Kwf(document.body).append(dialog);

    // This is for animation purpose
    setTimeout(function()
      {
      dialog.addClass('show');
      }, 100);

    // Add this dialog to the dialog stack
    DialogManager.addDialog(self);

    dialog.addEvent('click', click);
    };

  /**
   * Responsible for showing info and error messages in the most appropriate way
   * @class MessagesView
   * @static
   */
  Kwf.MessagesView = MessagesView = (function()
    {
    /**
     * Reference to the list view element
     * @property listview
     * @type HTMLUListElement
     * @private
     * @default null
     */
    var listview = null;

    /**
     * Finds existing messages sent with initial response and sets timeouts for
     * those messages
     * @method init
     * @public
     */
    function init()
      {
      listview = Kwf('kwf_messages_view');

      // If any messages were found, set a timer to remove them
      if (listview && listview.elem.children.length)
        {
        setTimeout(function()
          {
          listview.empty();
          }, 10000);
        }
      }

    /**
     * Shows all messages for 10 seconds
     * @method appendToList
     * @private
     * @param {String} type 'info' or 'error'
     * @param {String|Array} messagelist Array of info messages, or a single string message
     */
    function appendToList(type, messagelist)
      {
      var i;

      if (typeof messagelist === 'string')
        {
        messagelist = [messagelist];
        }

      if (!listview)
        {
        listview = Kwf.create('ul', {'id': 'kwf_messages_view'});
        Kwf('content').prepend(listview);
        }

      for (i = 0; i < messagelist.length; i++)
        {
        // Make new closure so the timeout function have the correct definition of li
        (function()
          {
          var li = toDOMnode('<li class="kwf-' + type + '">' + messagelist[i] + '</li>');
          listview.append(li.elem);

          setTimeout(function()
            {
            li.remove();
            }, 10000);
          }());
        }
      }

    /**
     * Add info message(s) and views it for 10 seconds
     * @method addError
     * @public
     * @param {String|Array} messages The message to show, or an array of messages to show
     */
    function addError(messages)
      {
      appendToList('error', messages);
      }

    /**
     * Add info message(s) and views it for 10 seconds
     * @method addInfo
     * @public
     * @param {String|Array} messages The message to show, or an array of messages to show
     */
    function addInfo(messages)
      {
      appendToList('info', messages);
      }

    /**
     * Extracts all info and error messages from a AJAX response page and shows
     * them for 10 seconds
     * @method fromResponse
     * @public
     * @param {Object} page The response.page object
     */
    function fromResponse(page)
      {
      // Clear out any previous form errors
      Kwf.MessagesView.removeFormErrors();

      if (page.errors)
        {
        addError(page.errors);
        }

      if (page.info)
        {
        addInfo(page.info);
        }

      if (page.form_errors)
        {
        var errors = page.form_errors, 
          name, span, input, label, 
          first = 1;

        for (name in errors)
          {
          input = Kwf(name);
          label = input.elem.parentNode.getElementsByTagName('label')[0];
          span = Kwf.create('strong', {'class': 'kwf-form-error'});
          span.html(errors[name]);

          try
            {
            // Set focus to the first input element
            if (first)
              {
              first = 0;
              input.elem.focus();
              }

            label.appendChild(span.elem);
            }
          catch (e)
            {
            console.error('MessagesView: Element ' + name + ' not found in page');
            }
          }
        }
      }

    /**
     * Removes all form error messages from current page
     * @method removeFormErrors
     * @public
     */
    function removeFormErrors()
      {
      var errors = K(document).queryAll('.kwf-form-error'), 
        e = 0;

      while (errors[e])
        {
        errors[e].remove();
        ++e;
        }
      }

    return {
      'init': init,
      'addError': addError,
      'addInfo': addInfo,
      'fromResponse': fromResponse,
      'removeFormErrors': removeFormErrors
      };
    }());

  /**
   * Prototype this to add event listening functionality to your class
   * With help from http://www.nczonline.net/blog/2010/03/09/custom-events-in-javascript/
   * @class EventTarget
   * @constructor
   */
  Kwf.EventTarget = EventTarget = function()
    {
    /**
     * Stores all listeners
     * @property listeners
     * @type Object
     * @public
     * @default {}
     */
    this.listeners = {};

    /**
     * Adds a listener for specified event type
     * @method addEvent
     * @public
     * @param {String} type The event type
     * @param {Function} listener A function that will be called when the event are fired
     */
    this.addEvent = function(type, listener)
      {
      if (this.listeners[type] === undefined)
        {
        this.listeners[type] = [];
        }

      this.listeners[type].push(listener);
      };

    /**
     * Removes a listener for specified event type
     * @method removeEvent
     * @public
     * @param {String} type The event type
     * @param {Function} listener The listener function to remove
     */
    this.removeEvent = function(type, listener)
      {
      if (this.listeners[type] instanceof Array)
        {
        var type_listeners = this.listeners[type], 
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
     * @return {Boolean} False if any event listener called preventDefault on event
     */
    this.dispatchEvent = function(event, target)
      {
      if (typeof event === 'string')
        {
        event = { type: event };
        if (target !== undefined)
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

      event.defaultPrevented = false;
      event.preventDefault = function()
        {
        event.defaultPrevented = true;
        };

       if (this.listeners[event.type] instanceof Array)
        {
        var type_listeners = this.listeners[event.type], 
          i;

        for (i = 0; i < type_listeners.length; i++)
          {
          try
            {
            type_listeners[i].call(this, event);
            }
          catch (e)
            {
            // Errors can't be thrown from here in Firefox
            throw new Error('Event ' + event.type + ': ' + e.message + ' at line ' + (e.lineNumber || 'null') + ' in file ' + (e.fileName || 'null'));
            }
          }
        }

      return event.defaultPrevented;
      };
    };

  /**
   * Context
   * @class Context
   * @constructor
   * @param {Kwf.element|HTMLElement} element The element that will change content
   */
  Kwf.Context = Context = function(element)
    {
    /**
     * The failure event listener
     * @property failure
     * @type Function
     * @private
     * @default Empty function
     */
    var failure = function() {}, 
    self = this;

    // Call parent class constructor, to make local copy of EventTarget for this instance
    EventTarget.call(self);

    /* Constructor */
    (function()
      {
      // Check if the element is a Kwf.element
      if (!element.elem)
        {
        element = Kwf(element);
        }

      // Find AJAX:able forms from start
      findForms();
      }());

    /**
     * Add submit event listeners to all "ajax-forms" in the content <div>
     * @method findForms
     * @private
     */
    function findForms()
      {
      var forms = element.elem.getElementsByTagName('form'), 
        i, form;

      // The Submit event listener
      function formSubmit(e)
        {
        var form = e.target;

        e.preventDefault();

        // Disable form submit button
        if (form.submitter)
          {
          form.submitter.disabled = 'disabled';
          }

        self.request(form.action, form);
        }

      for (i = 0; i < forms.length; i++)
        {
        form = Kwf(forms[i]);
        if (form.hasClass('ajax-form'))
          {
          form.addEvent('submit', formSubmit);
          form.removeClass('ajax-form');
          }
        }
      }

    /**
     * Sets listener on AJAX failure events on this context
     * @method onFailure
     * @public
     * @param {Function} listener Function that will be listener for this event
     */
    this.onFailure = function(listener)
      {
      if (typeof listener !== 'function')
        {
        throw new Error('onFailure listener must be a function.');
        }

      failure = listener;
      };

    /**
     * Makes a new request to load into the element
     * @method request
     * @public
     * @param {String} url The URL to load
     * @param {Object|HTMLFormElement} [data] Optional data, as object or <form> element
     */
    this.request = function(url, data)
      {
      var self = this;

      // This local function makes sure that one request binds up to correct response
      function onResponse(response)
        {
        self.parseResponse({'url': url, 'data': data}, response);
        }

      if (data)
        {
        if (data.type === 'file')
          {
          Ajax.upload(url, onResponse, failure, data);
          }
        else
          {
          Ajax.post(url, onResponse, failure, data, data.submitter);
          }
        }
      else
        {
        Ajax.get(url, onResponse, failure);
        }
      };

    /**
     * Parse a response (insert the HTML to content <div> and show error and info messages)
     * @method parseResponse
     * @public
     * @param {Object} request The request object {url: ..., data: ...}
     * @param {Object} response The response object
     */
    this.parseResponse = function(request, response)
      {
      // Create the event object
      var event = {'type': 'afterload', 
        'request': request, 
        'target': response};

      // If the inner content is JSON, then auto-parse it
      if (response.page.content_type === 'application/json')
        {
        response.page.content = parseJSON(response.page.content);
        }

      // Fire afterload event and check if it was prevented
      if (!this.dispatchEvent(event))
        {
        // JSON responses may contain error/info messages
        if (response.content_type === 'application/json')
          {
          // The inner content should only be printed out on page if it is
          // plain text or HTML. Please note that content_type can be an object
          // if server sets it to NULL.
          if (String(response.page.content_type).indexOf('text/') === 0)
            {
            element.html(response.page.content);
            }

          Kwf.MessagesView.fromResponse(response.page);
          }
        // If this was a "HTML only" response
        else
          {
          element.html(response.page);
          }

        findForms.call(this);

        // If data is a form, make the submit button enabled again
        if (request.data && request.data.submitter)
          {
          request.data.submitter.disabled = '';
          }

        event.type = 'ready';
        this.dispatchEvent(event);
        }
      };
    };

  // Let Context inherit EventTarget
  Context.prototype = new EventTarget();

  // Make default Context instances for #content and Boxing. This must be done
  // when DOM is ready
  Kwf.ready(function()
    {
    // But only do it if there are a #content element
    if (Kwf('content'))
      {
      /**
       * The default context for #content part of page. This object is created when
       * DOM is loaded.
       * @class ContentContext
       * @static
       */
      ContentContext = new Context(Kwf('content'));

      ContentContext.addEvent('ready', function(e)
        {
        if (e.request)
          {
          var url = e.target.redirect_url || e.request.url;

          // We want to scroll back to top so user will notice the page change
          window.scrollTo(0, 0);

          // Push this state to history if it's a new request
          if (!this.fromHistory)
            {
            if (history.pushState)
              {
              history.pushState({'url': url}, null, url);
              }
            else
              {
              this.ignore_hash_change = 1;
              location.hash = '#' + url;
              }
            }

          this.fromHistory = 0;
          }
        });

      /**
       * Makes a new Content request from link element attributes
       * @method fromLink
       * @public
       * @param {HTMLAnchorElement} link The link element
       */
      ContentContext.fromLink = function(link)
        {
        this.request(link.attr('href'), null);
        };

      /**
       * Makes a new Content request without pushing the request to history
       * @method noHistory
       * @public
       * @param {String} url The URL to load
       * @param {Object|HTMLFormElement} [data] Optional data, as object or <form> element
       */
      ContentContext.noHistory = function(url, data)
        {
        ContentContext.fromHistory = 1;
        ContentContext.request(url, data);
        };

      /*
       * Initate the pop state events
       */
      (function()
        {
        var location = document.location, 
          // popped is true if pushState is supported and if a state was pushed here in history
          popped = ('state' in history && history.state !== null), 
          initial_url = location.href, 
          kwindow = Kwf(window);

        // Listen for back/forward events
        kwindow.addEvent('popstate', function(pe)
          {
          if (!(!popped && location.href === initial_url))
            {
            ContentContext.noHistory(pe.state === null ? location.pathname : pe.state.url);
            }

          popped = 1;
          });

        // Change content from the hash if pushState is not supported
        if (!history.pushState)
          {
          if (location.hash !== '')
            {
            ContentContext.noHistory(location.hash.slice(1));
            }

          // Listen for hashchange if supported
          if ('onhashchange' in window)
            {
            kwindow.addEvent('hashchange', function(pe)
              {
              if (!ContentContext.ignore_hash_change)
                {
                ContentContext.noHistory(location.hash.slice(1) || location.pathname);
                }

              ContentContext.ignore_hash_change = 0;
              });
            }
          }
        // Read the initial state
        else if (history.state && history.state !== null && location.href !== initial_url)
          {
          ContentContext.noHistory(history.state.url);
          }

        // Simulate a ready event on content when page is loaded
        Kwf(window).addEvent('load', function()
          {
          ContentContext.dispatchEvent({'type': 'ready', 'request': null, 'target': null});
          });
        }());

      Kwf.ContentContext = ContentContext;

      /**
       * The default context for the Boxing dialog. This object is created when
       * DOM is loaded.
       * @class BoxingContext
       * @static
       */
      BoxingContext = new Context(Boxing.getContainer());

      var super_boxing_request = BoxingContext.request;
      BoxingContext.request = function(url, data, width, height)
        {
        if (width && height)
          {
          BoxingContext.width = width;
          BoxingContext.height = height;
          }

        super_boxing_request.call(this, url, data);
        };

      BoxingContext.addEvent('afterload', function(e)
        {
        // We need to open the Boxing dialog manually, but the Context class
        // sets the content HTML by itself. But don't re-open the dialog on JSON
        // responses with JSON content
        if (e.target.content_type !== 'application/json' || String(e.target.page.content_type).indexOf('text/') === 0)
          {
          Boxing.show('', BoxingContext.width, BoxingContext.height);
          }
        });

      /**
       * Makes a new Boxing request from link element attributes
       * @method fromLink
       * @public
       * @param {HTMLAnchorElement} link The link element
       */
      BoxingContext.fromLink = function(link)
        {
        link = link.elem;
        var width = 400, height = 300, 
          cls = link.className, match;

        if (cls.indexOf('dim') > -1)
          {
          match = new RegExp('dim(\\d+)x(\\d+)').exec(cls);
          width = match[1];
          height = match[2];
          }

        this.request(link.getAttribute('href'), null, width, height);
        };

      Kwf.BoxingContext = BoxingContext;
      }
    });

  // Expose Kwf and K to be global
  window.Kwf = window.K = Kwf;

  // Add listeners for click and load events
  Kwf(document).addEvent('click', documentClick);
  Kwf.ready(MessagesView.init);
  }(window, document));
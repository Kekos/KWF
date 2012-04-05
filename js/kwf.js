/**
 * KWF Script: kwf.js
 * Based on DOMcraft
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2012-03-30
 * @version 4.0
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

function getTarget(e)
  {
  e = e || window.event;
  return e.target || e.srcElement;
  }

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

function addSubmitEvent(elem, func)
  {
  addEvent(elem, 'click', function(e)
    {
    window.submit_target = getTarget(e);
    });
  addEvent(elem, 'submit', func);
  }

function isWs(node)
  {
  return !(/[^\t\n\r ]/.test(node.data));
  }

function isIgnorable(node)
  {
  return (node.nodeType === 8) ||  ((node.nodeType === 3) && isWs(node));
  }

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

function hasClass(elem, classname)
  {
  return (elem.className ? elem.className.match(new RegExp('(\\s|^)' + classname + '(\\s|$)')) : 0);
  }

function addClass(elem, classname)
  {
  if (!hasClass(elem, classname))
    {
    elem.className += ' ' + classname;
    }
  }

function removeClass(elem, classname)
  {
  elem.className = elem.className.replace(new RegExp('(\\s|^)' + classname + '(\\s|$)'), ' ').replace(/\s+/g,' ').replace(/^\s|\s$/,'');
  }

function giveOpacity(elm, value)
  {
  if (typeof elm.filters === 'object')
    {
    elm.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(opacity=' + value + ')';
    }
  }

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

function toDOMnode(html)
  {
  var div = document.createElement('div');
  div.innerHTML = html;
  return div.firstChild;
  }

var ajax = (function()
  {
  var onbeforeajax = null,
    onafterajax = null;

  function send(url, method, success, fail, data, headers, binary_data)
    {
    var ajax_req = (window.ActiveXObject) ? 
        new ActiveXObject('Microsoft.XMLHTTP') : new XMLHttpRequest(),
      response, content_type = 0, h;

    ajax_req.open(method, url);
    ajax_req.setRequestHeader('X-ajax-request', 'true');

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

    if (!content_type)
      {
      ajax_req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8');
      }

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

        if (onafterajax)
          {
          onafterajax();
          }

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

    if (onbeforeajax)
      {
      onbeforeajax();
      }

    if (ajax_req.sendAsBinary && binary_data)
      {
      ajax_req.sendAsBinary(data);
      }
    else
      {
      ajax_req.send(data);
      }

    return ajax_req;
    }

  function array2query(data)
    {
    var query = '', key;

    for (key in data)
      {
      query += '&' + key + '=' + encodeURIComponent(data[key]);
      }

    return query.substring(1);
    }

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

  function get(url, success, fail, data)
    {
    if (typeof data === 'object')
      {
      data = array2query(data);
      }

    if (data !== '')
      {
      data = '?' + data;
      }

    return send(url + data, 'GET', success, fail, null);
    }

  function post(url, success, fail, data, sender)
    {
    data = (data.nodeType ? form2query(data, sender) : 
        array2query(data));
    return send(url, 'POST', success, fail, data);
    }

  function upload(url, success, fail, file_elem, sender)
    {
    if (typeof File !== 'undefined')
      {
      var file_list = file_elem.files, file, f, filename, reader, 
        boundary = '---------------------------' + new Date().getTime(), 
        data = '--' + boundary + '\r\n';

      if (typeof FileReader === 'undefined')
        {
        file = file_list[0];
        filename = file.fileName || file.name;

        return send(url, 'POST', success, fail, file, [['X-ajax-upload', encodeURIComponent(filename)]]);
        }
      else
        {
        reader = new FileReader();
        reader.onloadend = function()
          {
          data += 'Content-Disposition: form-data; name="' + file_elem.name + '"; filename="' + filename + '"\r\nContent-Type: ' + file.type + '\r\n\r\n' + reader.result + '\r\n--' + boundary;
          if (f === file_list.length)
            {
            data += '\r' + form2query(file_elem.form, sender, boundary);

            if (f)
              {
              return send(url, 'POST', success, fail, data + '--', [
                  ['Content-Type', 'multipart/form-data; boundary=' + boundary],
                  ['Content-Length', data.length]
                ], 1);
              }
            }
          };

        for (f = 0; f < file_list.length; f++)
          {
          file = file_list[f];
          filename = file.fileName || file.name;
          if (f)
            {
            data += '\r\n';
            }

          reader.readAsBinaryString(file);
          }
        }
      }
    else
      {
      var orig_form = file_elem.parentNode, form, frame, frame_doc, 
        body = document.body, resp;

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
          resp = frame_doc.body.innerHTML;
          success({
              response: parseJSON(resp),
              content_type: (resp.substring(0, 1) === '{' && resp.substring(resp.length - 1) === '}' ? 'application/json' : 'text/plain'),
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

  function setBeforeCallback(callback)
    {
    onbeforeajax = callback;
    }

  function setAfterCallback(callback)
    {
    onafterajax = callback;
    }

  return {'get': get, 'post': post, 'upload': upload, 'setBeforeCallback': setBeforeCallback, 'setAfterCallback': setAfterCallback};
  }()),

boxing = (function()
  {
  var initiated = 0, 
    state = 0, 
    html_tag = null, 
    overlayer = null, 
    close = null, 
    window = null, 
    elements = null, 
    onhide_callback = null;

  function getWindow()
    {
    return window;
    }

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

  function getElement(idx)
    {
    var focus_elements = getFocusableElements();
    return (focus_elements.length > 0 ? focus_elements[idx] : null);
    }

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

content_request, 
boxing_request, 

kwf = {
  FULLPATH: '',
  onclick: null,
  onload: null,
  info_timer: null,

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

/* With help from http://www.nczonline.net/blog/2010/03/09/custom-events-in-javascript/ */
KWFEventTarget = function()
  {
  var self = this, 
    listeners = {};

  self.addEventListener = function(type, listener)
    {
    if (typeof listeners[type] === 'undefined')
      {
      listeners[type] = [];
      }

    listeners[type].push(listener);
    };

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

ContentRequest = function()
  {
  var self = this, 
    caller = null;

  self.response = null;
  self.form_btn = null;

  self.load = function(e, url)
    {
    returnFalse(e);
    caller = getTarget(e);
    self.dispatchEvent('beforeload', caller);
    ajax.get(url, self.parseResponse, self.parseResponse);
    };

  self.parseResponse = function(response)
    {
    var info = '', content = '', 
      context = elem('content'), 
      btn = self.form_btn;

    self.response = response;
    self.dispatchEvent('afterload', caller);
    response = self.response;

    if (response.content_type === 'application/json')
      {
      info = kwf.infoHandler(response.page);
      if (response.page.content)
        {
        content = info + response.page.content;
        }
      }
    else
      {
      content = response.page;
      }

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

    if (btn)
      {
      btn.disabled = '';
      self.form_btn = null;
      }
    };

  self.findForms = function()
    {
    var context = elem('content'), 
      forms = context.getElementsByTagName('form'), 
      i, action, form;

    function formSubmit(e)
      {
      var targ = self.form_btn = window.submit_target, 
        caller = getTarget(e); // The event target is the form who creates this new event, not the button who triggered this event

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
        action = (form.action === '') ? document.location.href : form.action; // For backwards compatibility, may change in future versions
        addSubmitEvent(form, formSubmit);
        removeClass(form, 'ajax-form');
        }
      }
    };
  },

BoxingRequest = function()
  {
  var self = this, 
    caller = null;

  self.response = null;
  self.width = 0;
  self.height = 0;
  self.form_btn = null;

  self.load = function(e, url, width, height)
    {
    returnFalse(e);
    caller = getTarget(e);

    self.width = (width || 300);
    self.height = (height || 200);

    self.dispatchEvent('beforeload', caller);

    ajax.get(url, self.parseResponse, self.parseResponse);
    };

  self.parseResponse = function(response)
    {
    var info = '', content = '', 
      btn = self.form_btn;

    self.response = response;
    self.dispatchEvent('afterload', caller);
    response = self.response;

    if (response.content_type === 'application/json')
      {
      info = kwf.infoHandler(response.page);
      if (response.page.content)
        {
        content = info + response.page.content;
        }
      }
    else
      {
      content = response.page;
      }

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

    if (btn)
      {
      btn.disabled = '';
      self.form_btn = null;
      }
    };

  self.findForms = function()
    {
    var forms = boxing.getWindow().getElementsByTagName('form'), 
      i, action, form;

    function formSubmit(e)
      {
      var targ = window.submit_target, 
        caller = getTarget(e); // The event target is the form who creates this new event, not the button who triggered this event

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
        action = (form.action === '') ? document.location.href : form.action; // For backwards compatibility, may change in future versions
        addSubmitEvent(form, formSubmit);
        removeClass(form, 'ajax-form');
        }
      }
    };
  };

ContentRequest.prototype = new KWFEventTarget();
BoxingRequest.prototype = new KWFEventTarget();

content_request = new ContentRequest();
boxing_request = new BoxingRequest();

addEvent(document, 'click', kwf.clicking);
addEvent(window, 'load', kwf.loading);
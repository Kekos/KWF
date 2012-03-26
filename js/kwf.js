/**
 * KWF Script: kwf.js
 * Based on DOMcraft
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2011-07-05
 * @version 3.3
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
    elem.addEventListener(state, new_func, 0);
  else if (elem.attachEvent)
    elem.attachEvent('on' + state, new_func);
  }

function removeEvent(elem, state, func)
  {
  if (elem.removeEventListener)
    elem.removeEventListener(state, func, 0);
  else if (elem.attachEvent)
    elem.detachEvent('on' + state, func);
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

function is_ignorable(node)
  {
  return (node.nodeType == 8) || 
    ((node.nodeType == 3) && isWs(node));
  }

function previousNode(sib)
  {
  while (sib = sib.previousSibling)
    {
    if (!is_ignorable(sib)) return sib;
    }
  return null;
  }

function nextNode(sib)
  {
  while (sib = sib.nextSibling)
    {
    if (!is_ignorable(sib)) return sib;
    }
  return null;
  }

function firstChildElement(parent)
  {
  var children = parent.childNodes, c;
  for (c = 0; c < children.length; c++)
    {
    if (!is_ignorable(children[c])) return children[c];
    }
  return null;
  }

function lastChildElement(parent)
  {
  var children = parent.childNodes, c;
  for (c = children.length - 1; c >= 0; c--)
    {
    if (!is_ignorable(children[c])) return children[c];
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
    elem.className += ' ' + classname;
  }

function removeClass(elem, classname)
  {
  elem.className = elem.className.replace(new RegExp('(\\s|^)' + classname + '(\\s|$)'), ' ').replace(/\s+/g,' ').replace(/^\s|\s$/,'');
  }

function giveOpacity(elm, value)
  {
  if (typeof elm.filters == 'object')
    elm.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(opacity=' + value + ')';
  }

function getTarget(e)
  {
  e = e || window.event;
  return e.target || e.srcElement;
  }

function returnFalse(e)
  {
  (window.event) ? event.returnValue = false : e.preventDefault();
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
    catch (e)
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
      str += ' ';
    return str;
    }

  var type = typeof variable, str = '', i;

  if (!depth)
    depth = 1;
  else if (depth > 5)
    return '';

  if (type == 'object')
    {
    str += '{\n';
    for (i in variable)
      str += spaces(depth) + i + ': ' + var_dump(variable[i], depth + 1);
    str += spaces(depth) + '}';
    }
  else
    str = variable.toString();

  str = '(' + type + ') ' + str + '\n';
  if (depth == 1)
    alert(str);
  else
    return str;
  }

function toDOMnode(html)
  {
  var div = document.createElement('div');
  div.innerHTML = html;
  return div.firstChild;
  }

var ajax = {
  onbeforeajax: null,
  onafterajax: null,

  get: function(url, success, fail, data)
    {
    data = (typeof data == 'object' ? '?' + ajax.array2query(data) : '');
    return ajax.send(url + data, 'GET', success, fail, null);
    },

  post: function(url, success, fail, data, sender)
    {
    data = (data.nodeType ? ajax.form2query(data, sender) : 
        ajax.array2query(data));
    return ajax.send(url, 'POST', success, fail, data);
    },

  upload: function(url, success, fail, file_elem, sender)
    {
    if (typeof File != 'undefined')
      {
      var file_list = file_elem.files, file, f, filename, reader, 
        boundary = '---------------------------' + new Date().getTime(), 
        data = '--' + boundary + '\r\n';

      if (typeof FileReader == 'undefined')
        {
        file = file_list[0];
        filename = (file.fileName != null) ? file.fileName : file.name;

        return ajax.send(url, 'POST', success, fail, file, [['X-ajax-upload', encodeURIComponent(filename)]]);
        }
      else
        {
        reader = new FileReader();
        reader.onloadend = function()
          {
          data += 'Content-Disposition: form-data; name="' + file_elem.name + '"; filename="' + filename + '"\r\nContent-Type: ' + file.type + '\r\n\r\n' + reader.result + '\r\n--' + boundary;
          if (f == file_list.length)
            {
            data += '\r' + ajax.form2query(file_elem.form, sender, boundary);

            if (f)
              return ajax.send(url, 'POST', success, fail, data + '--', [
                  ['Content-Type', 'multipart/form-data; boundary=' + boundary],
                  ['Content-Length', data.length]
                ], 1);
            }
          }

        for (f = 0; f < file_list.length; f++)
          {
          file = file_list[f];
          filename = (file.fileName != null) ? file.fileName : file.name;
          if (f)
            data += '\r\n';
          reader.readAsBinaryString(file);
          }
        }
      }
    else
      {
      var orig_form = file_elem.parentNode, form, frame, frame_doc, a = ajax, 
        body = document.body, resp;

      if (a.onbeforeajax != null)
        a.onbeforeajax();

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
          frame_doc = (frame.contentDocument) ? frame.contentDocument : 
              frame.contentWindow.document;
          resp = frame_doc.body.innerHTML;
          success({
              response: parseJSON(resp),
              content_type: (resp.substring(0, 1) == '{' && resp.substring(resp.length - 1) == '}' ? 'application/json' : 'text/plain'),
              status: '200'
            });
          body.removeChild(frame);

          if (a.onafterajax != null)
            a.onafterajax();
          }, 1);
        });

      form.submit();
      body.removeChild(form);
      orig_form.appendChild(file_elem);
      }
    },

  send: function(url, method, success, fail, data, headers, binary_data)
    {
    var ajax_req = (window.ActiveXObject) ? 
        new ActiveXObject('Microsoft.XMLHTTP') : new XMLHttpRequest(),
      response, content_type = 0, h, a = ajax;

    ajax_req.open(method, url);
    ajax_req.setRequestHeader('X-ajax-request', 'true');

    if (typeof headers == 'object')
      {
      for (h in headers)
        {
        if (headers[h][0] == 'Content-Type')
          content_type = 1; // Fix for Chrome who otherwise concatenates the different content-types
        ajax_req.setRequestHeader(headers[h][0], headers[h][1]);
        }
      }

    if (!content_type)
      ajax_req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8');

    ajax_req.onreadystatechange = function()
      {
      if (ajax_req.readyState == 4)
        {
        content_type = ajax_req.getResponseHeader('Content-Type');
        content_type = content_type.substring(0, content_type.indexOf(';'));
        response = {
            page: ajax_req.responseText,
            content_type: content_type,
            status: ajax_req.status
          };

        if (response.content_type == 'application/json')
          response.page = parseJSON(response.page);

        if (a.onafterajax != null)
          a.onafterajax();

        if (ajax_req.status == 200)
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
        else if (ajax_req.status == 404)
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

    if (a.onbeforeajax != null)
      a.onbeforeajax();

    if (ajax_req.sendAsBinary && binary_data)
      ajax_req.sendAsBinary(data);
    else
      ajax_req.send(data);

    return ajax_req;
    },

  array2query: function(data)
    {
    var query = '', key;

    for (key in data)
      {
      query += '&' + key + '=' + encodeURIComponent(data[key]);
      }

    return query.substring(1);
    },

  form2query: function(form, sender, boundary)
    {
    var data = '', ret;

    function encode(elm)
      {
      if (boundary)
        ret = (elm.name == '' ? '' : '\r\nContent-Disposition: form-data; name="' + elm.name + '"\r\n\r\n' + encodeURIComponent(elm.value) + '\r\n--' + boundary);
      else
        ret = (elm.name == '' ? '' : '&' + elm.name + '=' + encodeURIComponent(elm.value));
      return ret;
      }

    if (form != null)
      {
      var inputs = form.getElementsByTagName('input'), 
        selects = form.getElementsByTagName('select'), 
        textareas = form.getElementsByTagName('textarea'), 
        i;

      for (i = 0; i < inputs.length; i++)
        {
        if (((inputs[i].type == 'radio' || inputs[i].type == 'checkbox')
            && !inputs[i].checked) || (inputs[i].type == 'button' || 
            inputs[i].type == 'submit'))
          continue;

        data += encode(inputs[i]);
        }

      for (i = 0; i < selects.length; i++)
        data += encode(selects[i]);

      for (i = 0; i < textareas.length; i++)
        data += encode(textareas[i]);
      }

    if (sender)
      data += encode(sender);

    return data.substring(1);
    }
  },

kwf = {
  FULLPATH: '',
  onclick: null,
  onload: null,
  info_timer: null,

  clicking: function(e)
    {
    if (e.button > 1)
      return;

    var targ = getTarget(e);

    if (targ.className.indexOf('nolink') > -1 || (targ.parentNode.className && targ.parentNode.className.indexOf('nolink') > -1))
      returnFalse(e);
    if (targ.className.indexOf('hide-boxing') > -1)
      {
      returnFalse(e);
      boxing.hide();
      }

    if (kwf.onclick != null)
      kwf.onclick(e, targ);
    },

  loading: function(e)
    {
    if (kwf.onload != null)
      kwf.onload(e);

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
      list.parentNode.removeChild(list);

    list = elem('infolist');

    if (list)
      list.parentNode.removeChild(list);
    },

  infoHandler: function(obj)
    {
    var html = '', row, k = kwf;

    if (obj.errors)
      {
      html += '<ul id="errorlist">';
      for (row in obj.errors)
        html += '<li>' + obj.errors[row] + '</li>';
      html += '</ul>';
      }

    if (obj.info)
      {
      html += '<ul id="infolist">';
      for (row in obj.info)
        html += '<li>' + obj.info[row] + '</li>';
      html += '</ul>';
      }

    if (html != '')
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
  var self = this;

  self._listeners = {};

  self.addEventListener = function(type, listener)
    {
    if (typeof self._listeners[type] == 'undefined')
      {
      self._listeners[type] = [];
      }

    self._listeners[type].push(listener);
    }

  self.removeEventListener = function(type, listener)
    {
    if (self._listeners[type] instanceof Array)
      {
      var listeners = self._listeners[type], 
        i;

      for (i = 0; i < listeners.length; i++)
        {
        if ('' + listeners[i] === '' + listener)
          {
          listeners.splice(i, 1);
          break;
          }
        }
      }
    }

  self.dispatchEvent = function(event, target)
    {
    if (typeof event == 'string')
      {
      event = { type: event };
      if (typeof target != 'undefined')
        event.target = target;
      }

    if (!event.target)
      event.target = this;

    if (!event.type)
      alert('Request Event object missing "type" property.'); // Errors can't be thrown from here in Firefox

     if (self._listeners[event.type] instanceof Array)
      {
      var listeners = self._listeners[event.type], 
        i;

      for (i = 0; i < listeners.length; i++)
        {
        try
          {
          listeners[i].call(this, event);
          }
        catch (e)
          {
          alert(e.message + ' at line ' + (e.lineNumber ? e.lineNumber : 'null') + ' in file ' + (e.fileName ? e.fileName : 'null')); // Errors can't be thrown from here in Firefox
          }
        }
      }
    }
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

    if (response.content_type == 'application/json')
      {
      info = kwf.infoHandler(response.page);
      if (response.page.content)
        content = info + response.page.content;
      }
    else
      content = response.page;

    if (content == '' && info != '')
      context.insertBefore(toDOMnode(info), context.firstChild);
    else
      {
      context.innerHTML = content;
      self.findForms();
      }

    self.dispatchEvent('ready', caller);
    caller = null;
    self.response = null;

    if (btn != null)
      {
      btn.disabled = '';
      self.form_btn = null;
      }
    };

  self.findForms = function()
    {
    var context = elem('content'), 
      forms = context.getElementsByTagName('form'), 
      i, action, form, targ;

    for (i = 0; i < forms.length; i++)
      {
      form = forms[i];
      if (form.className.indexOf('ajax-form') > -1)
        {
        action = (form.action == '') ? document.location.href : form.action; // For backwards compatibility, may change in future versions
        addSubmitEvent(form, function(e)
          {
          returnFalse(e);

          targ = self.form_btn = window.submit_target;
          targ.disabled = 'disabled';
          caller = getTarget(e); // The event target is the form who creates this new event, not the button who triggered this event
          self.dispatchEvent('beforeload', caller);

          ajax.post(action, self.parseResponse, self.parseResponse, caller, targ);
          });
        form.className = form.className.replace(/\bajax-form\b/, '');
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

    self.width = (width ? width : 300);
    self.height = (height ? height : 200);

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

    if (response.content_type == 'application/json')
      {
      info = kwf.infoHandler(response.page);
      if (response.page.content)
        content = info + response.page.content;
      }
    else
      content = response.page;

    if (content == '')
      {
      if (info != '')
        elem('content').insertBefore(toDOMnode(info), elem('content').firstChild);

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

    if (btn != null)
      {
      btn.disabled = '';
      self.form_btn = null;
      }
    };

  self.findForms = function(callback)
    {
    var forms = boxing.window.getElementsByTagName('form'), 
      i, action, form, targ;

    for (i = 0; i < forms.length; i++)
      {
      form = forms[i];
      if (form.className.indexOf('ajax-form') > -1)
        {
        action = (form.action == '') ? document.location.href : form.action; // For backwards compatibility, may change in future versions
        addSubmitEvent(form, function(e)
          {
          returnFalse(e);
          targ = window.submit_target;
          if (targ.className.indexOf('hide-boxing') < 0)
            {
            targ.disabled = 'disabled';
            self.form_btn = targ;
            caller = getTarget(e); // The event target is the form who creates this new event, not the button who triggered this event
            self.dispatchEvent('beforeload', caller);

            ajax.post(action, self.parseResponse, self.parseResponse, caller, targ);
            }
          });
        form.className = form.className.replace(/\bajax-form\b/, '');
        }
      }
    };
  },

boxing = {
  initiated: 0,
  state: 0,
  html_tag: null,
  overlayer: null,
  close: null,
  window: null,
  onhide_callback: null,

  init: function()
    {
    var doc = document,
      box = boxing,
      overlayer = doc.createElement('div'),
      window = doc.createElement('div'),
      close = doc.createElement('a');

    overlayer.id = 'boxing-overlayer';
    box.overlayer = doc.body.appendChild(overlayer);
    addEvent(box.overlayer, 'click', box.hide);
    addEvent(doc, 'keyup', box.keys);
    giveOpacity(overlayer, 60);

    close.id = 'close_boxing';
    close.className = 'hide-boxing';
    close.href = 'javascript: void(0);';
    close.appendChild(doc.createTextNode('Stäng'));
    box.close = box.overlayer.appendChild(close);

    window.id = 'boxing-window';
    box.window = doc.body.appendChild(window);

    box.html_tag = doc.getElementsByTagName('HTML')[0];
    box.initiated = 1;
    },

  show: function(text, width, height)
    {
    if (!boxing.initiated)
      boxing.init();

    var box = boxing, 
      win = box.window, 
      close = box.close;

    w_unit = (width > 100 ? 'px' : '%');
    h_unit = (height > 100 ? 'px' : '%');

    box.overlayer.style.display = 'block';
    win.style.display = 'block';
    close.style.width = win.style.width = width + w_unit;
    win.style.height = height + h_unit;
    if (h_unit == '%')
      {
      win.style.margin = '0 0 0 -' + (width / 2) + w_unit;
      win.style.top = (100 - height) / 2 + '%';
      close.style.margin = '0 0 0 -' + (width / 2) + w_unit;
      close.style.top = (100 - height) / 2 - 3 + '%';
      }
    else
      {
      win.style.margin = '-' + (height / 2) + h_unit + ' 0 0 -' + (width / 2) + w_unit;
      win.style.top = '50%';
      close.style.margin = '-' + (height / 2) - 20 + h_unit + ' 0 0 -' + (width / 2) + w_unit;win.style.top = '50%';
      close.style.top = '50%';
      }

    win.innerHTML = text;
    box.html_tag.style.overflow = 'hidden';
    box.state = 1;
    },

  hide: function()
    {
    if (!boxing.initiated)
      return;

    var box = boxing,
      win = box.window;

    if (box.onhide_callback != null)
      {
      if (!box.onhide_callback())
        return;
      }

    box.overlayer.style.display = 'none';
    win.style.display = 'none';
    win.innerHTML = '';
    box.html_tag.style.overflow = '';
    box.onhide_callback = null;
    box.state = 0;
    },

  keys: function(e)
    {
    if (e.keyCode == 27)
      boxing.hide();
    }
  };

ContentRequest.prototype = new KWFEventTarget();
content_request = new ContentRequest();
BoxingRequest.prototype = new KWFEventTarget();
boxing_request = new BoxingRequest();

addEvent(document, 'click', kwf.clicking);
addEvent(window, 'load', kwf.loading);
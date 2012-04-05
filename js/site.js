/**
 * KWF Script: site.js
 * Based on DOMcraft
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2011-04-24
 * @version 3.0
 */

kwf.onclick = function(e, targ)
  {
  if (targ.id == 'load_contactform')
    site.loadContactform(e, targ);
  else if (targ.name == 'upload')
    site.upload(e, targ);
  };

kwf.onload = function(e)
  {
  ajax.onbeforeajax = site.beforeAjax;
  ajax.onafterajax = site.afterAjax;
  };

var site = {
  beforeAjax: function()
    {
    var ajax_loader = elem('ajax_loader'),
      doc = document;

    if (!ajax_loader)
      {
      ajax_loader = doc.createElement('div');
      ajax_loader.id = 'ajax_loader';
      ajax_loader.appendChild(doc.createTextNode('Laddar...'));
      elem('header').appendChild(ajax_loader);
      }

    ajax_loader.style.display = 'block';
    },

  afterAjax: function()
    {
    elem('ajax_loader').style.display = 'none';
    },

  loadContactform: function(e, targ)
    {
    boxing_request.load(e, targ.href, 300, 400);
    //content_request.load(e, targ.href);
    },

  upload: function(e, targ)
    {
    returnFalse(e);
    ajax.upload(document.location.href, content_request.parseResponse, 
      content_request.parseResponse, elem('file'), targ)
    }
  };
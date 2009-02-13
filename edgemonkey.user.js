// ==UserScript==
// @name           EdgeMonkey
// @copyright      (c)2009, Martok
// @namespace      entwickler-ecke.de
// @description    Krams fuer die Entwickler-Ecke
// @include        http://*.entwickler-ecke.de/*
// @include        http://*.c-sharp-forum.de/*
// @include        http://*.delphi-library.de/*
// @include        http://*.delphi-forum.de/*
// @include        http://*.delphiforum.de/*
// @include        http://*.c-sharp-library/*
// @exclude
// ==/UserScript==

const ScriptVersion = 0.16;

// @changelog
/*

0.17           09-02-**
  -better search.php for empty resultsets


0.16           09-02-06
  -highlight fixed
  -utf8
  -nicely styled settings dialog (thx BenBE!)
  -settings-icon fixed size
  -pm checker in Overlay Window
  -ask for reload on settings change
  -highlight check using name instead of uid
  -restructured Settings (one object, one prefs key {large pref entrys don't matter, large numbers do} )
  -movable overlay


0.15           09-02-01
  -redesigned SB-browser-buttons
  -SB-Anekdoter
  -cssHack by Kha (monospace)
  -Menubar
  -Settings class & window
  -PM-Checker
  -rewrote to 'good style' protype notation
  -SB-Highlighting (own, mod)
  -SB URL Fix

0.1           09-01-22
  -initial release
  -shoutbox browser
*/





const sburl = '/shoutbox_view.php?';
const sb_per_page = 30;
const RELEASE = 0;

var console = unsafeWindow.console;
// just in case s/o does not have Firebug
if (!console || RELEASE) {
  console = new Object();
  console.log = function() {return true; };
}
var Settings;

function last_child(node,kind)
{
  c = node.getElementsByTagName(kind);
  return c[c.length-1];
}

function isUndef(what)
{
  return (typeof what == "undefined");
}

function addEvent(elementObject, eventName, functionObject)
{
  if(document.addEventListener)
    elementObject.addEventListener(eventName,
      function (evt) {
        functionObject(elementObject, evt)
      },
      false);
}

function addHeadrow(tbl, content, colspan)
{
  r = tbl.insertRow(-1);
  th = document.createElement('th');
  th.colSpan = colspan;
  th.innerHTML = content;
  r.appendChild(th);
}

function AJAXObject() {
}

AJAXObject.prototype = {
  prepareRequest: function(url,postData,async) {
    request = new XMLHttpRequest();

    if (isUndef(postData))
    {
      request.open("GET", url, async);
      request.postBody=null;
    }
    else
    {
      request.postBody = "";
      for (name in postData)
      request.postBody += name+"="+escape(postData[name])+"&";

      request.open("POST", url, async);
      request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=iso-8859-1');
    }
    return request;
  },
  SyncRequest: function(url,postData) {
    request = this.prepareRequest(url,postData,false);
    request.send(request.postBody);
    return request.responseText;
  },
  AsyncRequest: function(url,postData,div,callback) {
    function readyEvent(aEvt) {
      if (request.readyState == 4) {
        if(request.status == 200) {
        if (!isUndef(div) && div!=null) {div.innerHTML = request.responseText}
        if (!isUndef(callback) && callback!=null) {callback(div);}
        }
      }
    }
    request = this.prepareRequest(url,postData,true);
    request.onreadystatechange = readyEvent;
    return request.send(request.postBody);
  }
}



function UserWindow(title, name,options,previous,body_element) {
  if (!isUndef(previous)) {
    if (previous && !previous.closed) previous.close();
  }
  wnd = window.open('',name,options);
  wnd.document.open();
  wnd.document.write(
        '<html><head><script>Settings=opener.em_settings</script>'+
//        '<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1">'+
        '<meta http-equiv="Content-Style-Type" content="text/css">'+
        '<link rel="stylesheet" type="text/css" href="styles/common.css">'+
        '<link rel="stylesheet" type="text/css" href="styles/simple_main.css">'+
        '<link rel="stylesheet" type="text/css" href="styles/styles_others.css">'+
        '<style type="text/css">'+"\n"+
        '<!--'+"\n"+
        ' body { padding: 5px; }'+
        ' input.mainoption { background-color:#FAFAFC; font-weight:bold; }'+
        ' input.liteoption { background-color:#FAFAFC; font-weight:normal; }'+
        '</style>'+
    '<title>'+title+'</title></head>');
  var bd = '<body bgcolor="#E5E5E5" text="#000000" link="#006699" vlink="#5493B4">';
  switch (typeof body_element) {
    case "undefined": break;
    case "string": bd+=body_element; break;
    case "object": bd+=body_element.innerHTML; break;
    default:  bd+=body_element.toString;
  }
  wnd.document.write(bd+'</body>');

  wnd.document.write('</html>');
  wnd.document.close();
  this.Window = wnd;
  this.Document = wnd.document;
  this.Body = wnd.document.body;
  this.close = function () {
    this.Window.close();
  }
}

function OverlayWindow(x,y,w,h,content,id)
{
  wn = document.createElement('div');
  wn.className='overlay';
  wn.style.cssText = 'background:url(./graphics/navBar.gif);border:2px solid #197BB5;left:'+x+';top:'+y+';min-width:'+w+';min-height:'+h;
  wn.id=id;
  wn.close = function() {this.parentNode.removeChild(this);this.style.cssText+=' display:none' };

  wn.ctrl=document.createElement('div');
  wn.ctrl.window = wn;
  wn.appendChild(wn.ctrl);
  wn.ctrl.style.cssText='text-align:right;background:url(../templates/subSilver/images/cellpic3.gif);padding:3px;cursor:move;';
  wn.ctrl.closebtn=document.createElement('span');
  wn.moving = false;
  addEvent(wn.ctrl,'mousedown',function(dv,event) {
    var win = dv.window;
    var x=event.clientX + window.scrollX;
    var y=event.clientY + window.scrollY;
    win.moving = true;
    win.mov_pr_x = x;
    win.mov_pr_y = y;
    win.left = parseInt(win.style.left,10);
    win.top = parseInt(win.style.top,10);
  });
  addEvent(wn.ctrl,'mousemove',function(dv,event) {
    var win = dv.window;
    if (win.moving) {
      var x=event.clientX + window.scrollX;
      var y=event.clientY + window.scrollY;
      win.left += x - win.mov_pr_x;
      win.top  += y - win.mov_pr_y;
      win.style.left = win.left + "px";
      win.style.top = win.top + "px";

      win.mov_pr_x = x;
      win.mov_pr_y = y;
      event.preventDefault();
    }
  });
  addEvent(wn.ctrl,'mouseup',function(dv,event) {
    var win = dv.window;
    if (win.moving) {
    	win.moving=false;
    }
  });
  wn.ctrl.closebtn.window = wn;
  wn.ctrl.appendChild(wn.ctrl.closebtn);
  wn.ctrl.closebtn.innerHTML='[Fenster schließen]';
  wn.ctrl.closebtn.style.cssText='cursor:pointer;color:#FF9E00;font-weight:bold';
  addEvent(wn.ctrl.closebtn,'click',function(ev) {  ev.window.close() } );

  wn.cont=document.createElement('div');
  wn.cont.window = wn;
  wn.appendChild(wn.cont);
  wn.cont.innerHTML=content;
  document.getElementsByTagName('body')[0].appendChild(wn);
  return wn;
}

function SettingsStore() {
  function Unpack(s) {
    s = s.substr(1,s.length-2);
    if (s.match(/^"[^"]*"$/))
      s = s.substr(1,s.length-2);
    return s;
  }
  function Deserialize(what) {
    if (what.indexOf("a:2:{")==0) {
       keys = what.match(/(:[^:;]*);/g);
       result = new Object();
       for (i=0; i<keys.length; i+=2) {
         result[Unpack(keys[i])] = Unpack(keys[i+1]);
       }
       return result;
    }
    else return result;
  }

  this.RestoreDefaults();
  this.LoadFromDisk();
  co = document.cookie.split(';');
  re = /\s?(\w*)=(.*)\s?/;
  this.cookies = new Object();
  for (i=0; i<co.length; i++) {
    c = co[i];
    if (res=re.exec(c)) {
      this.cookies[res[1].replace(/(df|dl|csf|csf)/,'ee')] = Deserialize(unescape(res[2]));
    }
  }
}

var Settings_SaveToDisk = function () { // global deklarieren
  Settings.store_field('settings', Settings.Values);
}

SettingsStore.prototype = {
  store_field: function (key, data) {
    GM_setValue(key, uneval(data));
  },
  load_field: function (key, data) {
    return eval(GM_getValue(key, (uneval(data) || '({})')));
  },

  LoadFromDisk: function () {
    this.Values = this.load_field('settings', this.Values);
  },

  RestoreDefaults: function() {
    this.Values = new Object();
    this.Values['pagehack.monospace']=false;
    this.Values['sb.anek_reverse']=true;
    this.Values['sb.highlight_me']=false;
    this.Values['sb.highlight_mod']=false;
  },
  
  GetValue: function(sec,key) {
  	return this.Values[sec+'.'+key];
  },
  SetValue: function(sec,key,val) {
  	this.Values[sec+'.'+key] = val;
  },

  FillDialog: function() {
    tbl = this.Window.Document.createElement('table');
    tbl.className = 'forumline';
    addHeadrow(tbl,'Ansicht',2);
    with (tbl.insertRow(-1)) {
      insertCell(-1).innerHTML = 'Codeblöcke als monospace anzeigen';
      insertCell(-1).innerHTML = '<input name="ph_mono" type="checkbox" '+(this.GetValue('pagehack','monospace')?'checked="">':'>');
    }
    addHeadrow(tbl,'Shoutbox',2);
    with (tbl.insertRow(-1)) {
      insertCell(-1).innerHTML = 'Anekdoten oben einfügen';
      insertCell(-1).innerHTML = '<input name="sb_anek_rev" type="checkbox" '+(this.GetValue('sb','anek_reverse')?'checked="">':'>');
    }
    with (tbl.insertRow(-1)) {
      insertCell(-1).innerHTML = 'Shouts von mir hervorheben<br />(nur mit Auto-Login)';
      insertCell(-1).innerHTML = '<input name="sb_highlight_me" type="checkbox" '+(this.GetValue('sb','highlight_me')?'checked="">':'>');
    }
    with (tbl.insertRow(-1)) {
      insertCell(-1).innerHTML = 'Shouts von Moderatoren/Admins hervorheben';
      insertCell(-1).innerHTML = '<input name="sb_highlight_mod" type="checkbox" '+(this.GetValue('sb','highlight_mod')?'checked="">':'>');
    }
    this.Window.Body.appendChild(tbl);
  },

  ev_SaveDialog: function(evt) {
    with (Settings.Window.Document) {
      Settings.SetValue('pagehack','monospace', getElementsByName('ph_mono')[0].checked);
      Settings.SetValue('sb','anek_reverse', getElementsByName('sb_anek_rev')[0].checked);
      Settings.SetValue('sb','highlight_me', getElementsByName('sb_highlight_me')[0].checked);
      Settings.SetValue('sb','highlight_mod', getElementsByName('sb_highlight_mod')[0].checked);
    }
    Settings_SaveToDisk();
    if (confirm('Änderungen gespeichert.\nSie werden aber erst beim nächsten Seitenaufruf wirksam. Jetzt neu laden?')){
      window.location.reload(false);
    }
    Settings.Window.close();
  },

  ev_ClearAll: function(evt) {
    Settings.RestoreDefaults();
    Settings_SaveToDisk();
    if (confirm("Einstellugen auf Standard zurückgesetzt.\nSie werden aber erst beim nächsten Seitenaufruf wirksam. Jetzt neu laden?")) {
      window.location.reload(false);
    }
    Settings.Window.close();
  },

  ShowSettingsDialog: function() {
    this.Window = new UserWindow('EdgeMonkey :: Einstellungen', 'em_wnd_settings',
            'HEIGHT=400,resizable=yes,WIDTH=500', this.Window);
    this.FillDialog();
    tbl = this.Window.Document.createElement('table');
    with (tbl.insertRow(tbl.rows.length)) {
      c = insertCell(0);
      c.innerHTML = '<input type="button" value="Speichern" class="mainoption">';
      addEvent(c, 'click', this.ev_SaveDialog);
      insertCell(1).innerHTML = '<input type="button" class="liteoption" onclick="window.close()" value="Schließen">';
      c = insertCell(2);
      c.innerHTML = '<input type="button" value="Alles Zur&uuml;cksetzen" class="liteoption">';
      addEvent(c, 'click', this.ev_ClearAll);
    }
    this.Window.Body.appendChild(tbl);
  }
}



function ButtonBar() {
	this.mainTable = null;
	tab = document.getElementsByTagName('table');
	for (var i=0; i<tab.length;i++) {
		if (tab[i].className=='overall') {this.mainTable=tab[i]; break;}
	}
	
	this.navTable = last_child(this.mainTable.getElementsByTagName('td')[0],'table');
	console.log(this.navTable);
  //man könnte auch XPath nehmen... :P


  cont = this.navTable.getElementsByTagName('tbody')[0];

  sep = document.createElement('tr');
  dummy = document.createElement('td');
  dummy.className='navbarleft';
  sep.appendChild(dummy);
  dummy = document.createElement('td');
  dummy.colSpan='2';
  dummy.style.cssText = "margin: 0px; padding: 0px; height: 2px; background-image: url(./graphics/navBar.gif);";
  sep.appendChild(dummy);

  dummy = document.createElement('td');
  dummy.className='navbarright';
  sep.appendChild(dummy);
  cont.insertBefore(sep, last_child(cont,'tr'));

  this.row = document.createElement('tr');
    dummy = document.createElement('td');
    dummy.className='navbarleft';
    this.row.appendChild(dummy);

    dummy = document.createElement('td');
    dummy.colSpan='2';
    dummy.className='navbarfunctions';
      this.container=document.createElement('span');
      this.container.className='nav';

      sp=document.createElement('span');
      sp.style.cssText="color: rgb(0, 0, 0);";
      sp.innerHTML='EdgeMonkey:&nbsp;';
      this.container.appendChild(sp);
      //buttons
      dummy.appendChild(this.container);
    this.row.appendChild(dummy);
    dummy = document.createElement('td');
    dummy.className='navbarright';
    this.row.appendChild(dummy);
  cont.insertBefore(this.row, last_child(cont,'tr'));

}

ButtonBar.prototype = {
  addButton: function(img,caption,script,id) {
    btn = document.createElement('a');
    btn.target="_self";
    btn.className="gensmall";
    btn.href='javascript:'+script;
    btn.id=id;
    if (img!='') btn.innerHTML+='<img class="navbar" border="0" alt="'+caption+'" src="'+img+'" style="width: 19px; height: 18px;">';
    if (caption!='') btn.innerHTML+=caption;
    this.container.appendChild(btn);
    a=this.container.innerHTML;
    a+=' &nbsp;&nbsp; ';
    this.container.innerHTML=a;
  }
}

function UserManager() {
  this.knownUIDs = Settings.load_field('uidcache',this.knownUIDs);
  this.loggedOnUserId = Settings.cookies['ee_data']['userid'];
  this.loggedOnUser = this.knownUIDs[-1];
  var a=document.getElementsByTagName('a');
  for (var i=0;i<a.length;i++) {
    if (a[i].href.match(/login\.php\?logout=true/) && a[i].innerHTML.match(/Logout/)) {
      this.loggedOnUser = a[i].innerHTML.match(/\((.*)\)/)[1];
      this.knownUIDs[-1] = this.loggedOnUser;
      Settings.store_field('uidcache', this.knownUIDs);
      break;
    }
  }
}

UserManager.prototype = {
  knownUIDs: new Object(),
  getUID: function(name) {
    if (!name) return -1;
    if (isUndef(this.knownUIDs[name])) {
      prof = AJAXSyncRequest('user_'+name+'.html');
      id = prof.match(/vc\.php\?mode=new&amp;ref_type=1&amp;id=([0-9]*)\"/ );
      if (id) this.knownUIDs[name] = id[1];
      Settings.store_field('uidcache', this.knownUIDs);
    }
    return this.knownUIDs[name];
  },
  getUIDByProfile: function(href) {
    return this.getUID(this.usernameFromProfile(href));
  },
  usernameFromProfile: function(href) {
    var m = href.match(/user_(.*)\.html/);
    if (m)
      return m[1];
    else
      return '';
  }
}


function ShoutboxControls() {
  this.shout_obj = document.getElementById('sidebar_shoutbox');

  this.get_iframe = function () { return this.shout_obj.getElementsByTagName('iframe')[0] }

  this.shout_url = this.get_iframe().src;

  if (this.shout_obj) {
    this.btnUpdate = this.shout_obj.getElementsByTagName('input')[3];
    this.btnUpdate.style.cssText+='width: 152px !important';
    this.btnUpdate.value='Aktuellste zeigen';
    this.btnUpdate.setAttribute('onclick', 'em_shouts.ev_sb_update()');

    this.contButtons = document.createElement('<div>');
    this.btnUpdate.parentNode.appendChild(this.contButtons);

    this.btnNewer = this.btnUpdate.cloneNode(false);
    this.btnNewer.value='<<';
    this.btnNewer.style.cssText='width: 50px';
    this.btnNewer.setAttribute('onclick', 'em_shouts.newer_page()');
    this.btnNewer.title='Neuere Shouts';
    this.contButtons.appendChild(this.btnNewer);

    this.edtDirect = this.shout_obj.getElementsByTagName('input')[0].cloneNode(false);
    this.edtDirect.style.cssText='width: 50px;margin:0 1px 0 1px';
    this.edtDirect.value = 0;
    this.edtDirect.setAttribute('onchange', '');
    this.edtDirect.setAttribute('onkeydown', '');
    this.edtDirect.setAttribute('onkeyup', 'em_shouts.ev_sb_goto(event)');
    this.edtDirect.title='Start-Shout, Enter zum aufrufen';
    this.contButtons.appendChild(this.edtDirect);

    this.btnOlder = this.btnNewer.cloneNode(false);
    this.btnOlder.value='>>';
    this.btnOlder.title='Ältere Shouts';
    this.btnOlder.setAttribute('onclick', 'em_shouts.older_page()');
    this.contButtons.appendChild(this.btnOlder);

  }
}

ShoutboxControls.prototype = {
  current_start: function () {
    st = this.shout_url.match(/start=(\d*)/);
    if (st == null)
      return 0
    else
      return parseInt(st[1]);
  },

  setUrl: function (url) {
    ifr = this.get_iframe();
    ifr.contentDocument.location.href = url;
    this.shout_url = url;
  },

  newer_page: function () {
    p = this.current_start() - sb_per_page;
    this.goto_page(p);
  },

  older_page: function () {
    p = this.current_start() + sb_per_page;
    this.goto_page(p);
  },

  goto_page: function (strt) {
    if (strt>0) {
      this.setUrl(sburl + 'start=' + strt);
      this.edtDirect.value = strt;
    } else {
      this.setUrl(sburl);
      this.edtDirect.value = 0;
    }
  },

  ev_sb_goto: function (evt) {
    evt = (evt) ? evt : ((event) ? event : null);
    if (evt && evt.keyCode==13) {
       p=parseInt(this.edtDirect.value);
       if(isNaN(p)) alert(this.edtDirect.value+' ist keine gültige Zahl!');
       else this.goto_page(p);
    }
  },

  ev_sb_update: function(evt) {
    this.goto_page(0);
  }
}

function ShoutboxWindow() {
  trs = document.getElementsByTagName('tr');
  this.shouts = new Array();
  for (i=0; i<trs.length; i++) {
    shout = trs[i].firstChild;
    this.shouts.push(shout);
    a = shout.firstChild;
    div = document.createElement('div');
    std = document.createElement('span');
    for (j=0;j<shout.childNodes.length+5;j++) {
      nd = shout.removeChild(shout.firstChild);
      if (nd.nodeName=='BR') {
        break;
      } else {
        std.appendChild(nd);
      }
    }
    div.className+='intbl';
    if (Settings.GetValue('sb','highlight_me')) {
      if (UserMan.usernameFromProfile(a.href)==UserMan.loggedOnUser)
        shout.className+=' myshout';
    }
    if (Settings.GetValue('sb','highlight_mod')) {
      if (a.style.cssText.match(/color\:/))
        shout.className+=' modshout';
    }
    std.className = 'incell left';
    div.appendChild(std);
    cnt = document.createElement('div');
    cnt.innerHTML = shout.innerHTML;
    shout.innerHTML = '';
    shout.insertBefore(cnt, shout.firstChild);
    shout.insertBefore(div, shout.firstChild);

    tools = document.createElement('span');
    tools.className+=' incell right';
    tools.innerHTML+='<a href="javascript:em_shout_cnt.ev_anekdote('+i+')>A</a>';
    div.appendChild(tools);
  };
  this.AddCustomStyles();
}

ShoutboxWindow.prototype = {
  AddCustomStyles: function()
  {
    var head, style;
    head = document.getElementsByTagName('head')[0];

    if(head)
    {
      style = document.createElement('style');
      style.type = 'text/css';
      style.innerHTML+= ' .incell { display: table-cell}';
      style.innerHTML+= ' .incell.left{float:none;text-align:left}';
      style.innerHTML+= ' .incell.right{text-align:right;padding-right:1px;}';
      style.innerHTML+= ' .intbl { display: table; width: 100%}';
      style.innerHTML+= ' .row1.myshout { background-color: #FEF4E4}';
      style.innerHTML+= ' .row2.myshout { background-color: #FEEFD7}';
      style.innerHTML+= ' .row1.modshout { background-color: #E8FED4}';
      style.innerHTML+= ' .row2.modshout { background-color: #DBFEC4}';
      head.appendChild(style);
    }

  },

  Anekdote: function(item) {
    var an='';
    an+= '[user]'+item.getElementsByTagName('a')[0].firstChild.innerHTML+'[/user]';
    an+= ' [color=#777777]'+item.getElementsByTagName('span')[2].innerHTML+'[/color]\n';
    sht = item.childNodes[1].childNodes;
    res = new Array();
    for (i=0;i<sht.length;i++) {
      switch (sht[i].tagName) {
        case 'A': res.push('[url='+sht[i].href+']'+sht[i].innerHTML+'[/url]');break;
        case 'IMG': res.push(sht[i].alt);break;
        default: res.push(sht[i].textContent);break;
      }
    }

    return an+res.join('')+'\n';
  },

  ev_anekdote: function(idx) {
    ih = (this.Anekdoter)?this.Anekdoter.Body.firstChild.innerHTML:'';
    this.Anekdoter = new UserWindow('EdgeMonkey :: SB-Anekdoter', 'em_wnd_sbanekdote',
          'HEIGHT=400,resizable=yes,WIDTH=500,scrollbars=yes',undefined,'<pre></pre>');

    if (Settings.GetValue('sb','anek_reverse'))
       this.Anekdoter.Body.firstChild.innerHTML = this.Anekdote(this.shouts[idx]) + ih;
    else
       this.Anekdoter.Body.firstChild.innerHTML = ih + this.Anekdote(this.shouts[idx]);
    this.Anekdoter.Window.focus();
  }
}

function Pagehacks() {
  if (Settings.GetValue('pagehack','monospace')) this.cssHacks();
  unsafeWindow.em_buttonbar.addButton('/templates/subSilver/images/folder_new_open.gif','Auf neue PNs prüfen','em_pagehacks.checkPMs()','em_checkPM');
  this.AddCustomStyles();
  if (Location.indexOf('search.php?mode=results')>=0) this.FixEmptyResults();
}

Pagehacks.prototype = {
  checkPMs: function() {
    var lnk = document.getElementById('em_checkPM');
    var lft = lnk.getBoundingClientRect().left;
    var btm = lnk.getBoundingClientRect().bottom;
    var w = OverlayWindow(lft,btm,400,225,'','em_pmcheck');
    var s = Ajax.AsyncRequest('privmsg.php?mode=newpm',undefined,w.cont,
      function(div) {
        a=div.getElementsByTagName('a');
        for(i=0;i<a.length;i++) {
          if (a[i].href.match(/window\.close/)) {
            a[i].removeAttribute('href');
            a[i].style.cssText+=' cursor:pointer';
            addEvent(a[i],'click',function() {div.window.close(); return false;});
          } else a[i].removeAttribute('target');
        }
      });
  },

  cssHacks: function() {
    for (var s = 0; s < document.styleSheets.length; s++) {
      var rules = document.styleSheets[s].cssRules;
      for (var r = 0; r < rules.length; r++) {
        var rule = rules[r];
        if (rule.selectorText.match(/\.code(Cell|comment|key|string|char|number|compilerdirective)|textarea\.posting_body/))
          rule.style.fontFamily = "monospace";
      }
    }
  },

  AddCustomStyles: function()
  {
    var head, style;
    head = document.getElementsByTagName('head')[0];

    if(head)
    {
      style = document.createElement('style');
      style.type = 'text/css';
      style.innerHTML+= ' div.overlay { position: absolute; z-index: 1;}';
      head.appendChild(style);
    }

  },
  FixEmptyResults: function () {
  	sp = unsafeWindow.em_buttonbar.mainTable.getElementsByTagName('span');
  	for (var i=0; i<sp.length; i++) {
  		if (sp[i].firstChild.textContent.match(/Keine Beiträge/)) {
  			sp[i].innerHTML+='<br><br><a href="javascript:history.go(-1)">Zurück zum Suchformular</a>';
  			break;
  		}
  	}
  }

}

Settings = new SettingsStore();
Ajax = new AJAXObject();
UserMan = new UserManager();
unsafeWindow.em_settings = Settings;
Location = window.location.href;
if (Location.match(/shoutbox_view.php/)) {
  if (UserMan.loggedOnUser) unsafeWindow.em_shout_cnt = new ShoutboxWindow();
} else
{
    unsafeWindow.em_buttonbar = new ButtonBar();

    with(unsafeWindow.em_buttonbar) {
      addButton('/graphics/Profil-Sidebar.gif','Einstellungen','em_settings.ShowSettingsDialog()');
    }
    unsafeWindow.em_pagehacks = new Pagehacks();
    unsafeWindow.em_shouts = new ShoutboxControls();
}





// ==UserScript==
// @name           EdgeMonkey
// @copyright      (c)2009, Martok
// @namespace      entwickler-ecke.de
// @description    Krams fuer die Entwickler-Ecke
// @include        *.entwickler-ecke.de/*
// @include        *.c-sharp-forum.de/*
// @include        *.delphi-library.de/*
// @include        *.delphi-forum.de/*
// @include        *.delphiforum.de/*
// @include        *.c-sharp-library/*
// @exclude
// ==/UserScript==

const ScriptVersion = 0.19;

// @changelog
/*

0.19           09-03-**
  -setting for anekdoter (BenBE)
  -ph: max-width for images (BenBE)
  -better user-tag-linking
  -improved loading the configuration (BenBE)
  -Branch-Switch-Links

0.18           09-02-28
  -Flat Styles by BenBE
  -overlay window pos fix
  -Shoutbox Highlighting with profiles (BenBE)
  -Shoutbox Post features
  -more options for PageHacks (BenBE)
  -Link to unread posts after posting (BenBE)
  -XPath-Interface for simplified DOM access (BenBE)
  -dropdown menus (BenBE)
  -even better empty search page (BenBE)
  -some fixes

0.17           09-02-14
  -better search.php for empty resultsets
  -Overlay shadow by BenBE
  -better movable overlay window
  -dropshadow option by BenBE
  -cleaned up variable declarations


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

var colorTpl = new Array(
    {
        name:'none',
        friendlyname:'Keine Hervorhebung',
        style1:'',
        style2:'',
        style3:'',
        style4:'',
    },
    {
        name:'red',
        friendlyname:'Helles Rot',
        style1:'background:#FEE8D4;',
        style2:'background:#FEDBC4;',
        style3:'background:#FED7C0;',
        style4:'background:#FEDBC4;',
    },
    {
        name:'yellow',
        friendlyname:'Freundliches Gelb',
        style1:'background:#FEF4E4;',
        style2:'background:#FEEFD7;',
        style3:'background:#FEE2C8;',
        style4:'background:#FEEFD7;',
    },
    {
        name:'green',
        friendlyname:'Moderat(iv) Gr&uuml;n',
        style1:'background:#E8FED4;',
        style2:'background:#DBFEC4;',
        style3:'background:#D7FEC0;',
        style4:'background:#D7FEC0;',
    },
    {
        name:'blue',
        friendlyname:'Himmlisch Blau',
        style1:'background:#D4E4FE;',
        style2:'background:#B6D4FE;',
        style3:'background:#A8CCFE;',
        style4:'background:#A6C8FE;',
    },
    {
        name:'pink',
        friendlyname:'Schwules Pink',
        style1:'background:#F8D4FE;',
        style2:'background:#FBC4FE;',
        style3:'background:#F0C0FE;',
        style4:'background:#FBC4FE;',
    },
    {
        name:'grey',
        friendlyname:'Trist Grau',
        style1:'background:#E8E8E8;',
        style2:'background:#D0D0D0;',
        style3:'background:#B0B0B0;',
        style4:'background:#C0C0C0;',
    }
);

function queryXPath(node,xpath){
    //I hate having to always type this crap ...
    return unsafeWindow.document.evaluate(xpath, node, null, XPathResult.ANY_TYPE, null);
}

function queryXPathNode(node, xpath) {
    //Get the result ...
    var result = queryXPath(node,xpath);
    return result.iterateNext();
}

function queryXPathNodeSet(node, xpath) {
    //Get the result ...
    var result = queryXPath(node,xpath);
    var set = new Array();
    while(n = result.iterateNext()) {
      set.push(n);
    }
    return set;
}

function createColorSelection(name,def,includeignore){
  var s = '<select name=' + name + '>';
  for(var i = 0; i<colorTpl.length; i++) {
    var st = colorTpl[i].style1;
    var t = colorTpl[i].friendlyname;
    if(i==0) st = 'background:#FFFFFF;';

    s+='<option value="'+i+'" style="'+st+'"'+(i==def?' selected':'')+'>'+t+'</option>';

    if(i==0&&includeignore) {
      s+='<option value="-1" style="'+st+'"'+(-1==def?' selected':'')+'>Standard</option>';
    }
  }
  s += '</select>';
  return s;
}

function last_child(node,kind)
{
  var c = node.getElementsByTagName(kind);
  return c[c.length-1];
}

function isUndef(what)
{
  return (typeof what == "undefined");
}

function Point(x,y)
{
  this.x = x;
  this.y = y;
}

Point.prototype.CenterInWindow = function(cx,cy)
{
  this.x = window.pageXOffset + (window.innerWidth-cx) / 2;
  this.y = window.pageYOffset + (window.innerHeight-cy) / 2;
}

Point.prototype.TranslateWindow = function()
{
  this.x += window.pageXOffset;
  this.y += window.pageYOffset;
}

function addEvent(elementObject, eventName, functionObject, wantCapture)
{
  var a = isUndef(wantCapture) ? false : wantCapture;
  if(document.addEventListener)
    elementObject.addEventListener(eventName,
      function (evt) {
        functionObject(elementObject, evt);
      },
      a);
}

function addGlobalEvent(elementObject, eventName, functionObject, wantCapture)
{
  var a = isUndef(wantCapture) ? false : wantCapture;
  if(document.addEventListener)
    document.body.addEventListener(eventName,
      function (evt) {
        functionObject(elementObject, evt)
      },
      a);
}

function addHeadrow(tbl, content, colspan)
{
  var r = tbl.insertRow(-1);
  var th = document.createElement('th');
  th.colSpan = colspan;
  th.innerHTML = content;
  r.appendChild(th);
  tbl.zebra = false;
}

function addSettingsRow(tbl, caption, innerHTML) {
  var rowClass = tbl.zebra ? 'row1' : 'row2';
  tbl.zebra = !tbl.zebra;

  var r = tbl.insertRow(-1);

  var td_left = r.insertCell(-1);
  var td_right = r.insertCell(-1);

  td_left.className = rowClass;
  td_right.className = rowClass;

  var ot = r.optionText = document.createElement('span');
  var oc = r.optionControl = document.createElement('div');

  ot.className = 'gensmall';
  ot.innerHTML = caption;

  oc.className = 'gensmall';
  oc.innerHTML = innerHTML;

  td_left.appendChild(ot);
  td_right.appendChild(oc);

  return r;
}

function addMenuItem(tbl,icon,link,text,extralinks){
  with (tbl.insertRow(-1)) {
    with (insertCell(-1)) {
      if (!isUndef(extralinks)) {
        rowSpan=2;
      }
      className = 'row1';
      width=32;
      align="center";
      innerHTML =
        "<a class=\"genbig\" href=\""+link+"\">"+
        "<img src=\""+icon+"\" style=\"border: 0px none; vertical-align: middle; margin-right: 4px;\" />"+
        "</a>";
    }
    with (insertCell(-1)) {
      className = 'row2';
      innerHTML = "<a class=\"genbig\" href=\""+link+"\"><b>"+text+"</b></a>";
    }
  }
  if (!isUndef(extralinks)) {
    with (tbl.insertRow(-1)) {
      with (insertCell(-1)) {
        className = 'row2';
        innerHTML = "<span class=\"gensmall\">"+extralinks+"</span>";
      }
    }
  }
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
    var request = this.prepareRequest(url,postData,false);
    request.send(request.postBody);
    return request.responseText;
  },
  AsyncRequest: function(url,postData,div,callback) {
    function readyEvent(aEvt) {
      var req = aEvt.target;
      if (req.readyState == 4) {
        if(req.status == 200) {
        if (!isUndef(div) && div!=null) {div.innerHTML = req.responseText}
        if (!isUndef(callback) && callback!=null) {callback(div);}
        }
      }
    }
    var request = this.prepareRequest(url,postData,true);
    request.onreadystatechange = readyEvent;
    return request.send(request.postBody);
  }
}

function UserWindow(title, name,options,previous,body_element) {
  if (!isUndef(previous)) {
    if (previous && !previous.closed) previous.close();
  }
  var wnd = window.open('',name,options);
  wnd.document.open();
  wnd.document.write(
    '<?xml version="1.0" encoding="UTF-8"?>'+
    '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'+
    '<html><head><script type="text/javascript">Settings=opener.em_settings</script>'+
    '<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />'+
    '<meta http-equiv="Content-Style-Type" content="text/css" />'+
    '<link rel="stylesheet" type="text/css" href="styles/common.css" />'+
    '<link rel="stylesheet" type="text/css" href="styles/simple_main.css" />'+
    '<link rel="stylesheet" type="text/css" href="styles/styles_others.css" />'+
    '<style type="text/css">'+"\n"+
    '<!--'+"\n"+
    'body { padding: 5px; }'+
    'input.mainoption { background-color:#FAFAFC; font-weight:bold; }'+
    'input.liteoption { background-color:#FAFAFC; font-weight:normal; }'+
    'td.cat,td.catHead,td.catSides,td.catLeft,td.catRight,td.catBottom {'+
    '    background-image: url(../templates/subSilver/images/cellpic1.gif);'+
    '    background-color:DBE4EB; border: #FFFFFF; border-style: solid; height: 28px;'+
    '}'+
    'td.cat,td.catHead,td.catBottom {'+
    '    height: 29px;'+
    '    border-width: 0px 0px 0px 0px;'+
    '}'+
    '-->'+"\n"+
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

if (!document.getElementsByClassName) {
  document.getElementsByClassName = function(className, tagName) {
  var mat = document.getElementsByTagName(isUndef(tagName)?'*':tagName);
  var arr = new Array();
  for (var i=0; i<mat.length; i++) {
      if (mat[i].className.indexOf(className)!=-1) {
        arr.push(mat[i]);
      }
    }
  return arr;
  }
}

function bringToFront(obj)
{
    var divs = document.getElementsByClassName('overlayWin','div');
    var max_index = 0;
    var cur_index;

    // Compute the maximal z-index of
    // other absolute-positioned divs
    for (i = 0; i < divs.length; i++)
    {
      var item = divs[i];
      if (item == obj || item.style.zIndex == '') {
        continue;
      }

      cur_index = parseInt(item.style.zIndex);
      if (max_index < cur_index)
      {
        max_index = cur_index;
      }
    }

    obj.style.zIndex = max_index + 1;
    return max_index;
}

function OverlayWindow(x,y,w,h,content,id)
{
  //Fix Popups that open to much to the right ...
  console.log("x:"+x+",y:"+y+",w:"+w+",h:"+h);
  if (x+w+10 > unsafeWindow.innerWidth - 30){
      x = unsafeWindow.innerWidth - 30 - w - 10;
  }

  console.log('Overlay start');
  this.Outer = this.createElement('div');
  this.Outer.className='overlayWin';
  this.Outer.style.cssText = 'overflow:visible; left:'+x+';top:'+y+';min-width:'+w+';min-height:'+h;
  this.Outer.id = id;

  console.log('Overlay Frame Window');
  this.Frame = this.createElement('div');

  console.log('Overlay Drop Shadow');
  this.Shadows = [];
  var pwn = this.Outer;
  var swtop = 0;
  if(Settings.GetValue('ui', 'showDropShadow')) {
    for(i=10; i>=0; i--) {
      var filterCSS = 'position:relative; overflow:visible; display:block;';
      filterCSS += 'left:'+i+'px; top:'+(-(swtop-i))+'px;';
      filterCSS += 'min-width:'+(w+i)+';min-height:'+(h+i)+';';
      swtop += h+i;
      filterCSS += 'z-index:-'+(100+i)+';';
      filterCSS += 'background-color: #000;';
      filterCSS += 'opacity: '+(0.5-i/20)+';';
      var shadow = document.createElement('div');
      //shadow.className='overlay';
      shadow.style.cssText = filterCSS;
      this.Outer.appendChild(shadow);
      this.Shadows.push(shadow);
    }
  }

  this.Frame.style.cssText = 'overflow:visible;position:relative;background:url(./graphics/navBar.gif);'+
                                   'border:2px solid #197BB5;left:0;top:-'+swtop+';min-width:'+w+';min-height:'+h;

  console.log('Overlay Content Area');
  this.ContentArea=this.createElement('div');
  this.Frame.appendChild(this.ContentArea);
  this.ContentArea.innerHTML=content;
  this.Outer.appendChild(this.Frame);

  this.BringToFront();
  this.showing=true;
  console.log('Overlay finish');
  document.getElementsByTagName('body')[0].appendChild(this.Outer);
}

OverlayWindow.prototype = {
  createElement: function (tag) {
    var e = document.createElement(tag);
    e.window=this;
    return e;
  },

  InitWindow: function() {
    console.log('Overlay Caption Bar Window');
    this.TitleBar=this.createElement('div');
    this.Frame.insertBefore(this.TitleBar, this.ContentArea);
    this.TitleBar.style.cssText='text-align:right;background:url(../templates/subSilver/images/cellpic3.gif);padding:3px;cursor:move;';

    console.log('Overlay Caption Bar Close Button');
    this.moving = false;
    addEvent(this.TitleBar,'mousedown',function(dv,event) {
      var win = dv.window;
      var x=event.clientX + window.scrollX;
      var y=event.clientY + window.scrollY;
      win.moving = true;
      win.mov_pr_x = x;
      win.mov_pr_y = y;
      win.left = parseInt(win.Outer.style.left,10);
      win.top = parseInt(win.Outer.style.top,10);
      win.zSort = win.BringToFront();
    });
    addGlobalEvent(this.TitleBar,'mousemove',function(dv,event) {
      var win = dv.window;
      if (win.moving) {
        var x=event.clientX + window.scrollX;
        var y=event.clientY + window.scrollY;
        win.left += x - win.mov_pr_x;
        win.top  += y - win.mov_pr_y;
        win.Outer.style.left = win.left + "px";
        win.Outer.style.top = win.top + "px";

        win.mov_pr_x = x;
        win.mov_pr_y = y;
      }
    },true);
    addEvent(this.TitleBar,'mouseup',function(dv,event) {
      var win = dv.window;
      if (win.moving) {
        win.moving=false;
        //win.style.zIndex = win.zSort;
      }
    });
    this.TitleBar.closebtn=this.createElement('span');
    this.TitleBar.appendChild(this.TitleBar.closebtn);
    this.TitleBar.closebtn.innerHTML='[Fenster schlie&szlig;en]';
    this.TitleBar.closebtn.style.cssText='cursor:pointer;color:#FF9E00;font-weight:bold';
    addEvent(this.TitleBar.closebtn,'click',function(sp, ev) {  sp.window.Close() } );
  },

  InitDropdown: function() {
    console.log('Overlay Caption Bar Window');
    this.Outer.style.zIndex=1000;

    addGlobalEvent(this.Frame,'mousedown',function(dv,event) {
      var clicked = event.target;

      while(clicked != null) {
        if(clicked == dv)
          return;
        clicked = clicked.offsetParent;
      }
      //if we get here, someone clicked outside

      dv.window.Close();
      event.preventDefault();
    },true);
  },

  CreateMenu: function() {
    var tbl = this.createElement('table');
    tbl.cellSpacing = 0;
    tbl.height="100%";
    tbl.width="100%";
    this.ContentArea.appendChild(tbl);
    tbl.addMenuItem = function (icon,link,text,extralinks) {
      addMenuItem(tbl,icon,link,text,extralinks);
    };
    return tbl;

  },

  Close: function () {
    if (!this.showing) return;
    this.showing=false;
    this.Outer.style.cssText+=' display:none';
    this.Outer.parentNode.removeChild(this.Outer);
  },
  BringToFront: function() {
    return bringToFront(this.Outer);
  }
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
       var keys = what.match(/(:[^:;]*);/g);
       var result = new Object();
       for (var i=0; i<keys.length; i+=2) {
         result[Unpack(keys[i])] = Unpack(keys[i+1]);
       }
       return result;
    }
    else return what;
  }

  this.RestoreDefaults();
  this.LoadFromDisk();
  var co = document.cookie.split(';');
  var re = /\s?(\w*)=(.*)\s?/;
  this.cookies = new Object();
  for (var i=0; i<co.length; i++) {
    c = co[i];
    if (res=re.exec(c)) {
      var k=res[1].replace(/(df|dl|csf|csl)/,'ee');
      this.cookies[k] = Deserialize(unescape(res[2]));
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
//    this.Values = this.load_field('settings', this.Values);
    //Fix to only "import" not "override" settings from the browser configuration.
    //Based on http://www.thespanner.co.uk/2008/04/10/javascript-cloning-objects/
    var tmp = this.load_field('settings', this.Values);
    for(var f in tmp){
        this.Values[f] = tmp[f];
    }
  },

  RestoreDefaults: function() {
    this.Values = new Object();
    this.Values['pagehack.monospace']=true;
    this.Values['pagehack.imgMaxWidth']=false;
    this.Values['pagehack.extSearchPage']=true;
    this.Values['pagehack.extPostSubmission']=true;
    this.Values['pagehack.quickProfMenu']=false;
    this.Values['pagehack.quickSearhMenu']=false;

    this.Values['ui.showDropShadow']=true;
    this.Values['ui.useFlatStyle']=false;
    this.Values['ui.betaFeatures']=false;

    this.Values['sb.longInput']=false;
    this.Values['sb.anek_active']=true;
    this.Values['sb.anek_reverse']=true;
    this.Values['sb.highlight_me']=0;
    this.Values['sb.highlight_mod']=0;
  },

  GetValue: function(sec,key) {
    return this.Values[sec+'.'+key];
  },
  SetValue: function(sec,key,val) {
    this.Values[sec+'.'+key] = val;
  },

  FillDialog: function() {
    var tbl = this.Window.Document.createElement('table');
    tbl.className = 'forumline';
    tbl.style.cssText = 'width:98%; align:center;';

    addHeadrow(tbl,'Design',2);
    addSettingsRow(tbl, 'Codebl&ouml;cke als monospace anzeigen',
        '<input name="ph_mono" type="checkbox" '+(this.GetValue('pagehack','monospace')?'checked="">':'>'));
    addSettingsRow(tbl, 'Schlagschatten unter Popup-Fenstern',
        '<input name="ui_dropshadow" type="checkbox" '+(this.GetValue('ui','showDropShadow')?'checked="">':'>'));
    addSettingsRow(tbl, 'Nutze ein flacheres Layout f&uuml;r Formulare',
        '<input name="ui_flatstyle" type="checkbox" '+(this.GetValue('ui', 'useFlatStyle')?'checked="">':'>'));
    addSettingsRow(tbl, 'Maximalbreite von Bildern erzwingen',
        '<input name="ph_imgmaxwidth" type="checkbox" '+(this.GetValue('pagehack','imgMaxWidth')?'checked="">':'>'));

    addHeadrow(tbl,'Ergonomie',2);
    addSettingsRow(tbl, 'Dropdown-Men&uuml; f&uuml;r Meine Ecke',
        '<input name="ph_ddmyedge" type="checkbox" '+(this.GetValue('pagehack','quickProfMenu')?'checked="">':'>'));
    addSettingsRow(tbl, 'Dropdown-Men&uuml; f&uuml;r die Suche',
        '<input name="ph_ddsearch" type="checkbox" '+(this.GetValue('pagehack','quickSearchMenu')?'checked="">':'>'));
    addSettingsRow(tbl, 'Zus&auml;tzliche Navigationslinks bei leeren Suchergebnissen',
        '<input name="ph_extsearch" type="checkbox" '+(this.GetValue('pagehack','extSearchPage')?'checked="">':'>'));
    addSettingsRow(tbl, 'Weiterleitung auf ungelesene Themen nach dem Absenden von Beiträgen',
        '<input name="ph_extpost" type="checkbox" '+(this.GetValue('pagehack','extPostSubmission')?'checked="">':'>'));
    addSettingsRow(tbl, 'Zus&auml;tzliche Funktionen f&uuml;r Beta-Tester',
        '<input name="ui_betaFeatures" type="checkbox" '+(this.GetValue('ui','betaFeatures')?'checked="">':'>'));

    addHeadrow(tbl,'Shoutbox',2);
    addSettingsRow(tbl, 'Eingabefeld vergr&ouml;&szlig;ern',
        '<input name="sb_longinput" type="checkbox" '+(this.GetValue('sb','longInput')?'checked="">':'>'));
    addSettingsRow(tbl, 'Shoutbox-Anekdoter aktivieren',
        '<input name="sb_anek_start" type="checkbox" '+(this.GetValue('sb','anek_active')?'checked="">':'>'));
    addSettingsRow(tbl, 'Anekdoten oben einf&uuml;gen',
        '<input name="sb_anek_rev" type="checkbox" '+(this.GetValue('sb','anek_reverse')?'checked="">':'>'));
    addSettingsRow(tbl,'Shouts von mir hervorheben<br />(nur mit Auto-Login)',
        createColorSelection('sb_highlight_me',this.GetValue('sb','highlight_me'), false)
        );
    addSettingsRow(tbl,'Shouts von Moderatoren/Admins hervorheben',
        createColorSelection('sb_highlight_mod',this.GetValue('sb','highlight_mod'), false)
        );

    this.Window.OptionsTable = tbl;
    this.Window.Body.appendChild(tbl);
  },

  ev_SaveDialog: function(evt) {
    with (Settings.Window.Document) {
      Settings.SetValue('pagehack','monospace', getElementsByName('ph_mono')[0].checked);
      Settings.SetValue('pagehack','quickProfMenu', getElementsByName('ph_ddmyedge')[0].checked);
      Settings.SetValue('pagehack','quickSearchMenu', getElementsByName('ph_ddsearch')[0].checked);
      Settings.SetValue('pagehack','extSearchPage', getElementsByName('ph_extsearch')[0].checked);
      Settings.SetValue('pagehack','extPostSubmission', getElementsByName('ph_extpost')[0].checked);
      Settings.SetValue('pagehack','imgMaxWidth', getElementsByName('ph_imgmaxwidth')[0].checked);

      Settings.SetValue('ui','showDropShadow', getElementsByName('ui_dropshadow')[0].checked);
      Settings.SetValue('ui','useFlatStyle', getElementsByName('ui_flatstyle')[0].checked);
      Settings.SetValue('ui','betaFeatures', getElementsByName('ui_betaFeatures')[0].checked);

      Settings.SetValue('sb','anek_active', getElementsByName('sb_anek_start')[0].checked);
      Settings.SetValue('sb','anek_reverse', getElementsByName('sb_anek_rev')[0].checked);
      Settings.SetValue('sb','highlight_me', getElementsByName('sb_highlight_me')[0].value);
      Settings.SetValue('sb','highlight_mod', getElementsByName('sb_highlight_mod')[0].value);
      Settings.SetValue('sb','longInput', getElementsByName('sb_longinput')[0].value);
    }
    Settings_SaveToDisk();
    if (confirm('Änderungen gespeichert.\nSie werden aber erst beim nächsten Seitenaufruf wirksam. Jetzt neu laden?')){
      window.location.reload(false);
    }
    Settings.Window.close();
  },

  ev_ClearAll: function(evt) {
    if (!confirm("Sollen wirklich alle Einstellungen zurückgesetzt werden?"))
      return false;
    Settings.RestoreDefaults();
    Settings_SaveToDisk();
    if (confirm("Einstellugen auf Standard zurückgesetzt.\nSie werden aber erst beim nächsten Seitenaufruf wirksam. Jetzt neu laden?")) {
      window.location.reload(false);
    }
    Settings.Window.close();
  },

  ShowSettingsDialog: function() {
    this.Window = new UserWindow('EdgeMonkey :: Einstellungen', 'em_wnd_settings',
            'HEIGHT=400,WIDTH=500,resizable=yes', this.Window);
    this.FillDialog();
//    var tbl = this.Window.Document.createElement('table');
    var tbl = this.Window.OptionsTable;
    var row = tbl.insertRow(-1);
    with (row) {
      var c = document.createElement('td');
      row.appendChild(c);
      c.colSpan = 2;
      c.className = 'catBottom';
      c.style.cssText = 'text-align:center;';
      c.innerHTML = '&nbsp;';
      c.innerHTML += '<input type="button" class="mainoption" value="Speichern">';
      c.innerHTML += '&nbsp;&nbsp;';
      c.innerHTML += '<input type="button" class="liteoption" onclick="window.close()" value="Schlie&szlig;en">';
      c.innerHTML += '&nbsp;&nbsp;';
      c.innerHTML += '<input type="button" value="Alles zur&uuml;cksetzen" class="liteoption">';
      c.innerHTML += '&nbsp;';
      var i = c.getElementsByTagName('input');
      addEvent(i[0], 'click', this.ev_SaveDialog);
      addEvent(i[2], 'click', this.ev_ClearAll);
    }
    this.Window.Body.appendChild(tbl);
  }
}



function ButtonBar() {
  this.mainTable = null;
  var tab = document.getElementsByTagName('table');
  for (var i=0; i<tab.length;i++) {
    if (tab[i].className=='overall') {this.mainTable=tab[i]; break;}
  }

  if(isUndef(this.mainTable) || null == this.mainTable) {
    this.container = {appendChild:function(a){},innerHTML:''};
    return;
  }

  this.navTable = last_child(this.mainTable.getElementsByTagName('td')[0],'table');
  //man könnte auch XPath nehmen... :P

  var cont = this.navTable.getElementsByTagName('tbody')[0];

  var sep = document.createElement('tr');
  var dummy = document.createElement('td');
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

  var sp=document.createElement('span');
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
    var btn = document.createElement('a');
    btn.target="_self";
    btn.className="gensmall";
    btn.href='javascript:'+script;
    btn.id=id;
    if (img!='') btn.innerHTML+='<img class="navbar" border="0" alt="'+caption+'" src="'+img+'" style="width: 19px; height: 18px;">';
    if (caption!='') btn.innerHTML+=caption;
    this.container.appendChild(btn);
    var a=this.container.innerHTML;
    a+='&nbsp; &nbsp; ';
    this.container.innerHTML=a;
  }
}

function UserManager() {
  this.knownUIDs = Settings.load_field('uidcache',this.knownUIDs);
  this.loggedOnUserId = Settings.cookies['ee_data']['userid'];
  this.loggedOnSessionId = "";
  this.loggedOnUser = this.knownUIDs[-1];
  var a=document.getElementsByTagName('a');
  for (var i=0;i<a.length;i++) {
    if (a[i].href.match(/login\.php\?logout=true/) && a[i].innerHTML.match(/Logout/)) {
      this.loggedOnUser = a[i].innerHTML.match(/\((.*)\)/)[1];
      this.knownUIDs[-1] = this.loggedOnUser;
      Settings.store_field('uidcache', this.knownUIDs);

      //Get the Session ID
      var sid = a[i].href.match(/sid=([a-f0-9]{32})/i);
      this.loggedOnSessionId = sid[1];
      break;
    }
  }
}

UserManager.prototype = {
  knownUIDs: new Object(),
  getUID: function(name) {
    if (!name) return -1;
    if (isUndef(this.knownUIDs[name])) {
      var prof = AJAXSyncRequest('ajax_get_userid.php?username='+name);
      var id = prof.match(/<userid><!\[CDATA\[([0-9]*)\]\]><\/userid>/ );
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

  this.get_iframe = function () {
    if(isUndef(this.shout_obj) || null == this.shout_obj) {
      return null;
    }
    return this.shout_obj.getElementsByTagName('iframe')[0];
  }

  if(this.get_iframe() == null) {
    return;
  }

  this.shout_url = this.get_iframe().src;
  this.form_go = document.getElementById('shoutsubmit');
  this.form = this.form_go.form;
  if (Settings.GetValue('sb','longInput')) {
    this.form.innerHTML='';
    var tab = document.createElement('table');
    this.form.appendChild(tab);
    tab.width='100%';
    tab.cellSpacing=0;
    with (tab.insertRow(-1)) {
    	with (insertCell(-1)) {
    		align='left';
    		innerHTML='<span class="gensmall">Dein Text:</span>';
    	}
    	with (insertCell(-1)) {
    		align='right';
    		innerHTML='<span class="gensmall"><a onclick="em_pagehacks.SmileyWin(\'shoutmessage\'); return false;" href="posting.php?mode=smilies" class="gensmall">Smilies</a>';
    	}
    }
    with (tab.insertRow(-1)) {
    	with (insertCell(-1)) {
    		align='left';
    		colSpan=2;
    		innerHTML='<textarea class="gensmall" name="shoutmessage" id="shoutmessage" style="width:100%"></textarea>';
    	}
    }
    with (tab.insertRow(-1)) {
    	with (insertCell(-1)) {
    		align='left';
    		innerHTML='<span class="gensmall"><input style="color: green;" value="150" readonly="readonly" name="shoutchars" class="charcount" id="shoutchars" type="text"> Zeichen übrig</span>';
    	}
    	with (insertCell(-1)) {
    		align='right';
    		innerHTML='<input value="Go!" name="shoutgo" class="sidebarbutton" id="shoutsubmit" type="submit" style="width: 40px">';
    	}
    }
  }
  this.form_text = document.getElementById('shoutmessage');
  this.form_chars = document.getElementById('shoutchars');
  //addEvent(this.form,'submit',function() {return false });
  this.form.setAttribute('onsubmit', 'return em_shouts.ev_sb_post()');

  var a = this.form.getElementsByTagName('a')[0];
  a.setAttribute('onclick','em_pagehacks.SmileyWin("shoutmessage"); return false;');

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
    this.edtDirect.style.cssText='width: 50px;margin:0 1px 0 1px; text-align:center;';
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
    var st = this.shout_url.match(/start=(\d*)/);
    if (st == null)
      return 0
    else
      return parseInt(st[1]);
  },

  setUrl: function (url) {
    var ifr = this.get_iframe();
    ifr.contentDocument.location.href = url;
    this.shout_url = url;
  },

  newer_page: function () {
    var p = this.current_start() - sb_per_page;
    this.goto_page(p);
  },

  older_page: function () {
    var p = this.current_start() + sb_per_page;
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
  },

  ev_sb_post: function (evt) {
    var s = unsafeWindow.em_shouts.form_text.value;
    s = s.replace(/\bbenbe\b/i, "BenBE");
    s = s.replace(/\bcih\b/, "ich");
    s = s.replace(/\bnciht\b/, "nicht");

    //Check for references to the branch
    if(/http:\/\/(?:branch|trunk)\./i.test(s)) {
      //Die Idee mit der Branch-Infektion habe ich bei TUFKAPL gesehen, BenBE.
      if(!confirm("Dein Shout ist mit Branch infiziert.\nKlicke auf \"Abbrechen\", falls Du ihn heilen willst.")) {
        return false;
      }
    }

    //Wikipedia Link Support ...
    s = s.replace(/\[\[(\w\w):(\w+)\|(.*?)\]\]/i, "[url=http://$1.wikipedia.org/wiki/$2]$3[/url]");
    s = s.replace(/\[\[(\w+)\|(.*?)\]\]/i, "[url=http://de.wikipedia.org/wiki/$1]$2[/url]");
    s = s.replace(/\[\[(\w\w):(\w+)\]\]/i, "[url=http://$1.wikipedia.org/wiki/$2]$2[/url]");
    s = s.replace(/\[\[(\w+)\]\]/i, "[url=http://de.wikipedia.org/wiki/$1]$1[/url]");

    //Check for brackets in the shout (possible BBCodes
    if(/[\[\]]/i.test(s)) {
      var uncleanBBCode = false;

      //Search for inbalanced opening square brackets ...
      uncleanBBCode |= /(?:\[(?:(?!\]|$).)*(?=\[|$))|\[\]/i.test(s);

      //Search for inbalanced closing square brackets ...
      uncleanBBCode |= /(?:\](?:(?!\[|$).)*(?=\]))/i.test(s);

      //Search for improperly started tags ...
      uncleanBBCode |= /\[(?!\w|\/)/i.test(s);

      if(uncleanBBCode)
      {
        if(!confirm("Dein Shout scheint mit ungültigen oder falsch geschriebenen BBCodes infiziert zu sein. \"Abbrechen\" um dies zu korrigieren.")) {
          return false;
        }
      }
    }

    //Warn if 2 capital letters are found at the beginning of a word
    if(/\b[A-Z]{2}[a-z]/.test(s)) {
      if(!confirm("Dein Shout enthält ein Wort mit mehreren Großbuchstaben am Anfang. \"Abbrechen\" um dies zu korrigieren.")) {
        return false;
      }
    }

    //User-Tag-Verlinkung
    s = s.replace(/^@(GTA):/, "[user=\"GTA-Place\"]GTA-Place[/user]:");
    s = s.replace(/^@(TUFKAPL):/, "[user=\"Christian S.\"]TUFKAPL[/user]:");
    s = s.replace(/^@(Wolle):/, "[user=\"Wolle92\"]Wolle92[/user]:");
    s = s.replace(/^@([\w\.\-<>\(\)\[\]\{\}]+(\x20[\w\.\-<>\(\)\[\]\{\}]+)?):/, "[user]$1[/user]:");

    //Implement /me-Tags (if present) ;-)
    s = s.replace(/^\/me\s(.*)$/, "[i][user]" + unsafeWindow.em_user.loggedOnUser + "[/user] $1[/i]");

    unsafeWindow.em_shouts.form_text.value = s;
    return true;
  }
}

function ShoutboxWindow() {
  var trs = document.getElementsByTagName('tr');

  var shoutclass_me = 'emctpl' + Settings.GetValue('sb','highlight_me');
  var shoutclass_mod = 'emctpl' + Settings.GetValue('sb','highlight_mod');

  var anek_active = Settings.GetValue('sb','anek_active');
//  console.log('me: '+shoutclass_me);
//  console.log('mod: '+shoutclass_mod);

  this.shouts = new Array();
  for (var i=0; i<trs.length; i++) {
    var shout = trs[i].firstChild;
    this.shouts.push(shout);
    var a = shout.firstChild;
    var div = document.createElement('div');
    var std = document.createElement('span');
    for (var j=0;j<shout.childNodes.length+5;j++) {
      var nd = shout.removeChild(shout.firstChild);
      if (nd.nodeName=='BR') {
        break;
      } else {
        std.appendChild(nd);
      }
    }
    div.className+='intbl';
    //First detect Moderators ...
    if (Settings.GetValue('sb','highlight_mod')) {
      if (a.style.cssText.match(/color\:/))
        shout.className+=' ' + shoutclass_mod;
    }
    // and after this the logged on user, to allow overriding the style properly
    if (Settings.GetValue('sb','highlight_me')) {
      if (UserMan.usernameFromProfile(a.href)==UserMan.loggedOnUser)
        shout.className+=' ' + shoutclass_me;
    }
    std.className = 'incell left';
    div.appendChild(std);
    var cnt = document.createElement('div');
    cnt.innerHTML = shout.innerHTML;
    shout.innerHTML = '';
    shout.insertBefore(cnt, shout.firstChild);
    shout.insertBefore(div, shout.firstChild);

    if(anek_active) {
      var tools = document.createElement('span');
      tools.className+=' incell right';
      tools.innerHTML+='<a href="javascript:em_shout_cnt.ev_anekdote('+i+')>A</a>';
      div.appendChild(tools);
    }
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
      for(var i = 0; i < colorTpl.length; i++) {
        var tpl = colorTpl[i];
        style.innerHTML+= ' .row1.emctpl'+i+' { '+tpl.style1+' }';
        style.innerHTML+= ' .row2.emctpl'+i+' { '+tpl.style2+' }';
        style.innerHTML+= ' .row3.emctpl'+i+' { '+tpl.style3+' }';
        style.innerHTML+= ' .row4.emctpl'+i+' { '+tpl.style4+' }';
      }
      head.appendChild(style);
    }
  },

  Anekdote: function(item) {
    var an='';
    an+= '[user]'+item.getElementsByTagName('a')[0].firstChild.innerHTML+'[/user]';
    an+= ' [color=#777777]'+item.getElementsByTagName('span')[2].innerHTML+'[/color]\n';
    var sht = item.childNodes[1].childNodes;
    var res = new Array();
    for (var i=0;i<sht.length;i++) {
      switch (sht[i].tagName) {
        case 'A': res.push('[url='+sht[i].href+']'+sht[i].innerHTML+'[/url]');break;
        case 'IMG': res.push(sht[i].alt);break;
        default: res.push(sht[i].textContent);break;
      }
    }

    return an+res.join('')+'\n';
  },

  ev_anekdote: function(idx) {
    var ih = (this.Anekdoter)?this.Anekdoter.Body.firstChild.innerHTML:'';
    this.Anekdoter = new UserWindow('EdgeMonkey :: SB-Anekdoter', 'em_wnd_sbanekdote',
          'HEIGHT=400,resizable=yes,WIDTH=500,scrollbars=yes',undefined,'<pre></pre>');

    if (Settings.GetValue('sb','anek_reverse'))
       this.Anekdoter.Body.firstChild.innerHTML = this.Anekdote(this.shouts[idx]) + ih;
    else
       this.Anekdoter.Body.firstChild.innerHTML = ih + this.Anekdote(this.shouts[idx]);
    this.Anekdoter.Window.focus();
  }
}

function SmileyWindow(target) {
  if (typeof target != "object") {
    target = document.getElementById(target);
  }

  this.Target = target;
  var pt = new Point(0,0);
  pt.CenterInWindow(430,270);
  console.log(pt);
  this.win = new OverlayWindow(pt.x,pt.y,430,270,'','em_SmileyWin');
  this.win.InitWindow();
  this.tab = this.win.createElement('table');
  this.win.ContentArea.appendChild(this.tab);
  this.tab.width="100%";
  this.tab.cellSpacing=0;
  this.tab.cellPadding=5;
  this.tab.border=0;
  this.addLine([
    {cmd:':D', hint:'Very Happy', ico:'biggrin'},
    {cmd:':)', hint:'Smile', ico:'smile'},
    {cmd:':(', hint:'Sad', ico:'sad'},
    {cmd:':o', hint:'Surprised', ico:'surprised'},
    {cmd:':shock:', hint:'Shocked', ico:'eek'},
    {cmd:':?', hint:'Confused', ico:'confused'},
    {cmd:'8)', hint:'Cool', ico:'cool'},
    {cmd:':lol:', hint:'Laughing', ico:'lol'},
  ]);
  this.addLine([
    {cmd:':x', hint:'Mad', ico:'mad'},
    {cmd:':P', hint:'Razz', ico:'razz'},
    {cmd:':oops:', hint:'Embarassed', ico:'redface'},
    {cmd:':cry:', hint:'Crying or Very sad', ico:'cry'},
    {cmd:':evil:', hint:'Evil or Very Mad', ico:'evil'},
    {cmd:':twisted:', hint:'Twisted Evil', ico:'twisted'},
    {cmd:':roll:', hint:'Rolling Eyes', ico:'rolleyes'},
    {cmd:':wink:', hint:'Wink', ico:'wink'},
  ]);
  this.addLine([
    {cmd:':!:', hint:'Exclamation', ico:'exclaim'},
    {cmd:':?:', hint:'Question', ico:'question'},
    {cmd:':idea:', hint:'Idea', ico:'idea'},
    {cmd:':arrow:', hint:'Arrow', ico:'arrow'},
    {cmd:':|', hint:'Neutral', ico:'neutral'},
    {cmd:':mrgreen:', hint:'Mr. Green', ico:'mrgreen'},
    {cmd:':angel:', hint:'Angel', ico:'angel'},
    {cmd:':bawling:', hint:'Bawling', ico:'bawling'},
  ]);
  this.addLine([
    {cmd:':beer:', hint:'Beer chug', ico:'beerchug'},
    {cmd:':?!?:', hint:'Confused', ico:'confused2'},
    {cmd:':crying:', hint:'Crying', ico:'crying'},
    {cmd:':dance:', hint:'Dance', ico:'dance2'},
    {cmd:':dance2:', hint:'Dance', ico:'dance'},
    {cmd:':dunce:', hint:'Dunce', ico:'dunce'},
    {cmd:':eyecrazy:', hint:'Eyecrazy', ico:'eyecrazy'},
    {cmd:':eyes:', hint:'Eyes', ico:'eyes'},
  ]);
  this.addLine([
    {cmd:':hair:', hint:'Hair', ico:'hair'},
    {cmd:':nixweiss:', hint:'Nix weiss', ico:'nixweiss'},
    {cmd:':nut:', hint:'Nuß', ico:'nut'},
    {cmd:':party:', hint:'Party', ico:'party'},
    {cmd:':puke:', hint:'Puke', ico:'puke'},
    {cmd:':rofl:', hint:'Rofl mao', ico:'roflmao'},
    {cmd:':schmoll:', hint:'Schmoll', ico:'schmoll'},
    {cmd:':think:', hint:'Think', ico:'think'},
  ]);
  this.addLine([
    {cmd:':tongue:', hint:'Tongue', ico:'tongue'},
    {cmd:':wave:', hint:'Wave', ico:'wave'},
    {cmd:':welcome:', hint:'Willkommen', ico:'welcome'},
    {cmd:':wink2:', hint:'Wink 2', ico:'wink2'},
    {cmd:':mahn:', hint:'Mahn', ico:'znaika'},
    {cmd:':autsch:', hint:'Autsch', ico:'autsch'},
    {cmd:':flehan:', hint:'Fleh an', ico:'flehan'},
    {cmd:':gruebel:', hint:'Grübel', ico:'gruebel'},
  ]);
  this.addLine([
    {cmd:':les:', hint:'Les', ico:'les'},
    {cmd:':lupe:', hint:'Lupe', ico:'lupe'},
    {cmd:':motz:', hint:'Motz', ico:'motz'},
    {cmd:':gaehn:', hint:'Gähn', ico:'gaehn'},
    {cmd:':zustimm:', hint:'Zustimmen', ico:'zustimm'},
    {cmd:':zwinker:', hint:'Zwinkern', ico:'zwinkern'},
  ]);
}

SmileyWindow.prototype = {
  addLine: function(smileys) {
    var tr = this.tab.insertRow(-1);
    tr.valign='middle';
    tr.align='center';
    for each (var sm in smileys) {
      with (tr.insertCell(-1)) {
        var a = this.win.createElement('a');
        a.innerHTML='<img border="0" title="'+sm.hint+' '+sm.cmd+'" alt="'+sm.hint+' '+sm.cmd+'" src="images/smiles/icon_'+sm.ico+'.gif"/>';
        a.style.cursor='pointer';
        //carry over variables
        a.Target = this.Target;
        a.cmd = ' '+sm.cmd+' ';
        // c will be the link
        addEvent(a,'click',function(c,e) {
          var edit = c.Target;
          var text = c.cmd;
          var oldStart = edit.selectionStart;
          var oldEnd = edit.selectionEnd;
          var theSelection = edit.value.substring(oldStart, oldEnd);
          edit.value = edit.value.substring(0, oldStart) + theSelection + text + edit.value.substring(oldEnd, edit.value.length);
          if (oldStart == oldEnd)
          {
            edit.selectionStart = oldStart + text.length;
            edit.selectionEnd = oldStart + text.length;
          } else {
            edit.selectionStart = oldStart + theSelection.length + text.length;
            edit.selectionEnd = oldStart + theSelection.length + text.length;
          }
        });
        appendChild(a);
      }
    }
  }
}

function Pagehacks() {
  if (Settings.GetValue('pagehack','monospace'))
    this.cssHacks();
  unsafeWindow.em_buttonbar.addButton('/templates/subSilver/images/folder_new_open.gif','Auf neue PNs pr&uuml;fen','em_pagehacks.checkPMs()','em_checkPM');
  this.AddCustomStyles();
  if(Settings.GetValue('pagehack','extSearchPage') &&
    /\bsearch\.php\?(?:mode=results|search_id=)/.test(Location))
  {
    this.FixEmptyResults();
  }
  if(/\bsites\.php\?id=|\b(?:help(?:_.*?)?|promotion)\.html.*?,19.*$/i.test(Location)) {
    this.HelpAJAXified();
  }
  if(Settings.GetValue('pagehack','extPostSubmission') &&
    /\bposting\.php/i.test(Location)) {
    this.FixPostingDialog();
  }
  if(Settings.GetValue('pagehack','quickProfMenu')) {
    this.AddQuickProfileMenu();
  }
  if(Settings.GetValue('pagehack','quickSearchMenu')) {
    this.AddQuickSearchMenu();
  }
  if(Settings.GetValue('ui','betaFeatures')) {
    this.AddBetaLinks();
  }

}

Pagehacks.prototype = {
  checkPMs: function() {
    var lnk = document.getElementById('em_checkPM');
    var coords = new Point(lnk.getBoundingClientRect().left, lnk.getBoundingClientRect().bottom);
    coords.TranslateWindow();
    var w = new OverlayWindow(coords.x,coords.y,400,225,'','em_pmcheck');
    w.InitWindow();
    var s = Ajax.AsyncRequest('privmsg.php?mode=newpm',undefined,w.ContentArea,
      function(div) {
        var a=div.getElementsByTagName('a');
        for(i=0;i<a.length;i++) {
          if (a[i].href.match(/window\.close/)) {
            a[i].removeAttribute('href');
            a[i].style.cssText+=' cursor:pointer';
            addEvent(a[i],'click',function() {div.window.close(); return false;});
          } else a[i].removeAttribute('target');
        }
      });
  },

  SmileyWin: function(target) {
    new SmileyWindow(target);
  },

  cssHacks: function() {
    for (var s = 0; s < document.styleSheets.length; s++) {
      var rules = document.styleSheets[s].cssRules;
      for (var r = 0; r < rules.length; r++) {
        var rule = rules[r];
        if (!isUndef(rule.selectorText) && rule.selectorText.match(/\.code(Cell|comment|key|string|char|number|compilerdirective)|textarea\.posting_body/))
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
      style.innerHTML+= ' div.overlayWin { position: absolute; z-index: 1;}';

      if(Settings.GetValue('ui', 'useFlatStyle')) {
        style.innerHTML+=
          "input, textarea, select {"+
          "  background-color:#fff;"+
          "  border-color: #000;"+
          "  border-style: solid;"+
          "  margin:0.5px;"+
          "}";
        style.innerHTML+=
          "input:focus, textarea:focus, select:focus {"+
          "  background-color: #f8f8f8;"+
          "}";
        style.innerHTML+=
          "input:hover, textarea:hover, select:hover {"+
          "  background-color: #f0f0f0;"+
          "}";
      }

      if(Settings.GetValue('ph', 'imgMaxWidth')) {
        style.innerHTML+=
          ".postbody img {"+
          "  max-width: 80%;"+
          "}";
      }

      head.appendChild(style);
    }
  },

  FixEmptyResults: function () {
    var sp = unsafeWindow.em_buttonbar.mainTable.getElementsByTagName('span');
    for (var i=0; i<sp.length; i++) {
      if (sp[i].firstChild.textContent.match( /Keine Beitr.*?ge entsprechen Deinen Kriterien./ )) {
        sp[i].innerHTML+='<br><br><a href="javascript:history.go(-1)">Zur&uuml;ck zum Suchformular</a>';
        sp[i].innerHTML+='<br><br><a href="/index.php">Zur&uuml;ck zum Index</a>';
        break;
      }
    }
  },

  FixPostingDialog: function () {
    //Get the Content Main Table
    var sp = unsafeWindow.em_buttonbar.mainTable;
    console.log(sp);

    if(isUndef(sp) || null == sp) {
      return;
    }

    //Get the Information Table
    sp = queryXPathNode(sp, "tbody/tr[2]/td/div/table");
    console.log(sp);

    var t = queryXPathNode(sp, "tbody/tr[1]/th/b");
    console.log(t);
    if(isUndef(t) || null == t) {
      return;
    }

    if(t.textContent != "Information") {
      return;
    }

    //Get the Information Span with all those links ...
    sp = queryXPathNode(sp, "tbody/tr[2]/td/table/tbody/tr[2]/td/span");
    console.log(sp);

    sp.innerHTML+='<br><br><a href="/search.php?search_id=unread">Hier klicken</a>, um die ungelesenen Themen anzuzeigen';
  },

  HelpAJAXified: function() {
    console.log("F1!!! F1!!! F1!!!");
    var tbl = queryXPathNode(unsafeWindow.document, "/html/body/table[2]/tbody/tr[2]/td/div/table/tbody/tr/td/table[1]");
    console.log(tbl);
    var td = queryXPathNodeSet(tbl, "tbody/tr/td/span");
    console.log("Anzahl Zeilen: " + td.length);
    var tr = tbl.insertRow(1);
    td = tr.insertCell(-1);
    td.className='row2';
    td.style.paddingLeft = '13px';
    td.innerHTML='<span class="gensmall"><a href="#" class="gensmall" onclick="em_pagehacks.DisplayHelpAJAXified()">Edgemonkey-Hilfe</a></span>';
  },

  DisplayHelpAJAXified: function() {
    var post = queryXPathNode(unsafeWindow.document, "/html/body/table[2]/tbody/tr[2]/td/div/table/tbody/tr/td[2]/table/tbody");
    var header = queryXPathNode(post, "tr/th");
    var content = queryXPathNode(post, "tr[2]/td/div");
    header.innerHTML='EdgeMonkey-Hilfe';
    content.innerHTML=
        '<div style="text-align: center;">'+
        '    <span style="font-size: 18px; line-height: normal;">Hilfe</span>'+
        '    <br/>'+
        '    <br/>Willkommen in der Online Hilfe zum EdgeMonkey ' + ScriptVersion + '!' +
        '</div>'+
        '<p class="postbody">'+
        '    Der EdgeMonkey biete eine ganze Reihe zus&auml;tzlicher Funktionen gegen&uuml;ber der Forensoftware, die das Leben stark vereinfachen<br/>'+
        '    <br/>'+
        '    Foo foo bar baz foo quo cuz lorem ipsum est foo baz bar quo ...<br/>'+
        '    <br/>'+
        '    Foo foo bar baz foo quo cuz lorem ipsum est foo baz bar quo ...<br/>'+
        '    <br/>'+
        '    Foo foo bar baz foo quo cuz lorem ipsum est foo baz bar quo ...<br/>'+
        '    <br/>'+
        '    Foo foo bar baz foo quo cuz lorem ipsum est foo baz bar quo ...<br/>'+
        '    <br/>'+
        '    Foo foo bar baz foo quo cuz lorem ipsum est foo baz bar quo ...<br/>'+
        '</p>';
  },

  AddQuickProfileMenu: function() {
    var link = queryXPathNode(unsafeWindow.document, "/html/body/table/tbody/tr[3]/td[2]/table/tbody/tr/td/a[img][1]");
    link.setAttribute('onclick','return em_pagehacks.QuickProfileMenu()');
  },

  AddQuickSearchMenu: function() {
    var link = queryXPathNode(unsafeWindow.document, "/html/body/table/tbody/tr[3]/td[2]/table/tbody/tr/td[7]/a[img]");
    link.setAttribute('onclick','return em_pagehacks.QuickSearchMenu()');
  },

  QuickProfileMenu: function() {
    var link = queryXPathNode(unsafeWindow.document, "/html/body/table/tbody/tr[3]/td[2]/table/tbody/tr/td/a[img][1]");
    var bcr = link.getBoundingClientRect();
    var coords = new Point(bcr.left, bcr.bottom+10);
    coords.TranslateWindow();

    var w = new OverlayWindow(coords.x,coords.y,320,187,'','em_QPM');
    w.InitDropdown();

    var tbl = w.CreateMenu();

    tbl.addMenuItem(
        "/graphics/Portal-PM.gif",
        "/privmsg.php?folder=inbox",
        "Private Nachrichten",
        "<a href=\"/privmsg.php?folder=inbox\">Eingang</a>, "+
        "<a href=\"/privmsg.php?mode=post\">PN schreiben</a>, "+
        "<a href=\"/privmsg.php?folder=outbox\">Ausgang</a></a>, "+
        "<a href=\"/privmsg.php?folder=sentbox\">Gesendete</a>, "+
        "<a href=\"/privmsg.php?folder=savebox\">Archiv</a>"
        );
    tbl.addMenuItem(
        "/graphics/Drafts.gif",
        "/drafts.php",
        "Entw&uuml;rfe",
        "");
    tbl.addMenuItem(
        "/graphics/basket_light.gif",
        "/pdfbasket.php",
        "PDF-Korb",
        "");//"PDF erstellen");
    tbl.addMenuItem(
        "/graphics/Attachment.gif",
        "/uacp.php?u="+escape(UserMan.loggedOnUserId)+"&amp;sid="+escape(UserMan.loggedOnSessionId),
        "Dateianh&auml;nge",
        "");
    tbl.addMenuItem(
        "/graphics/Portal-Profil.gif",
        "/profile.php?mode=editprofile&page=portal",
        "Einstellungen",
        "<a href=\"/profile.php?mode=editprofile&page=1\">Standard</a>, "+
        "<a href=\"/profile.php?mode=editprofile&page=2\">Erweitert</a>, "+
        "<a href=\"/profile.php?mode=editprofile&page=3\">Sidebar</a></a>, "+
        "<a href=\"/profile.php?mode=editprofile&page=4\">Newsfeeds</a>, "+
        "<a href=\"/profile.php?mode=editprofile&page=5\">Websites</a>"
        );

    w.ContentArea.appendChild(tbl);

    return false;
  },

  QuickSearchMenu: function() {
    var link = queryXPathNode(unsafeWindow.document, "/html/body/table/tbody/tr[3]/td[2]/table/tbody/tr/td[7]/a[img]");
    var bcr = link.getBoundingClientRect();
    var coords = new Point(bcr.left, bcr.bottom+10);
    coords.TranslateWindow();

    var w = new OverlayWindow(coords.x,coords.y,272,242,'','em_QSM');
    w.InitDropdown();
    var tbl = w.CreateMenu();

    tbl.addMenuItem(
        "/templates/subSilver/images/folder_new_big.gif",
        "/search.php?search_id=newposts",
        "Beitr&auml;ge seit letztem Besuch");
    tbl.addMenuItem(
        "/graphics/Portal-PM.gif",
        "/search.php?search_id=unread",
        "Ungelesene Themen");
    tbl.addMenuItem(
        "/templates/subSilver/images/folder_new.gif",
        "/search.php?search_id=unanswered",
        "Unbeantwortete Themen");

    tbl.addMenuItem(
        "/graphics/Postings.gif",
        "/search.php?search_id=egosearch",
        "Eigene Beitr&auml;ge");
    tbl.addMenuItem(
        "/graphics/Topics.gif",
        "/search.php?search_id=startedtopics",
        "Eigene Themen");
    tbl.addMenuItem(
        "/graphics/Watched.gif",
        "/watched_topics.php",
        "Beobachtete Themen");

    tbl.addMenuItem(
        "/templates/subSilver/images/folder_open.gif",
        "/search.php?search_id=open",
        "Offene Fragen");
    tbl.addMenuItem(
        "/graphics/Open.gif",
        "/search.php?search_id=myopen",
        "Meine offenen Fragen");

    return false;
  },

  AddBetaLinks: function() {
    var table = queryXPathNode(unsafeWindow.document, "/html/body/table/tbody/tr/td[4]/table");
    table.style.cssText = '';
    RegExp.prototype.replace = function(str,rep) {
      return str.replace(this,rep);
    }
    var Lks = [];
    with (/http\:\/\/(branch|trunk)\./i) {
      if (test(Location))
        Lks.push(['Echt-Forum',replace(Location, 'http://www.')]);
    }
    with (/http\:\/\/(www|trunk)\./i) {
      if (test(Location)) {
        var loc = replace(Location, 'http://branch.');
        if (! /[\?\&]sid=/.test(loc)) {
          var p=loc.indexOf('?');
          if (p<0) loc+='?sid='+UserMan.loggedOnSessionId;
          else loc = loc.substring(0,p+1)+'sid='+UserMan.loggedOnSessionId+'&'+loc.substring(p+1,loc.length);

        }
        Lks.push(['Branch', loc]);
      }
    }
    with (/http\:\/\/(www|branch)\./i) {
      if (test(Location))
        Lks.push(['Trunk', replace(Location, 'http://trunk.')]);
    }
    console.log(Lks);
    with (table.insertRow(-1)) {
      insertCell(-1).style.cssText='width: 100%;';
      with (insertCell(-1)) {
        innerHTML='<a href="'+Lks[0][1]+'" class="gensmall" title="Zum '+Lks[0][0]+' wechseln"><b>'+
                   Lks[0][0]+'</b><img border="0" alt="no new" src="templates/subSilver/images/icon_minipost.gif"'+
                   ' style="margin-left: 1px; width: 12px; height: 9px;"/></a>';
        style.cssText='text-align: right; white-space: nowrap;';
      }
      insertCell(-1).style.cssText='text-align: center; padding-left: 7px; padding-right: 7px;';
      insertCell(-1).innerHTML='<a href="'+Lks[1][1]+'" class="gensmall" title="Zum '+Lks[1][0]+' wechseln">'+
                               '<img border="0" alt="no new" src="templates/subSilver/images/icon_minipost.gif"'+
                               ' style="margin-left: 1px; width: 12px; height: 9px;"/><b>'+Lks[1][0]+'</b></a>';
      insertCell(-1);
    }
  }
}

function upgradeSettings(){
  var upgraded = false;

  //0.18: Upgrade of boolean to number for Shout Highlighting related settings
  var chk = Settings.GetValue('sb','highlight_me');
//  console.log('sb.me:'+typeof chk);
  if(parseInt(chk, 10) == NaN) {
    upgraded = true;
    Settings.SetValue('sb','highlight_me', chk?2:0);
  }

  chk = Settings.GetValue('sb','highlight_mod');
//  console.log('sb.mod:'+typeof chk);
  if(parseInt(chk, 10) == NaN) {
    upgraded = true;
    Settings.SetValue('sb','highlight_mod', chk?3:0);
  }

  if (upgraded) {
    Settings_SaveToDisk();
    window.alert(
      'Die Einstellungen wurden auf ein aktualisiertes Datenformat konvertiert.\n' +
      'Ein Downgrade von EdgeMonkey kann daher zu Fehlfunktionen oder Datenverlust führen.'
    );
    window.location.reload(false);
  }
}

function initEdgeApe() {
  //No upgrade from inside any popup
  if(isUndef(window.opener) || null == window.opener)
  {
    upgradeSettings();
  }

  if (Location.match(/shoutbox_view.php/)) {
    if (UserMan.loggedOnUser) {
      unsafeWindow.em_shout_cnt = new ShoutboxWindow();
    }
  }
  else
  {
    unsafeWindow.em_user = UserMan;
    unsafeWindow.em_buttonbar = new ButtonBar();

    with(unsafeWindow.em_buttonbar) {
      addButton('/graphics/Profil-Sidebar.gif','Einstellungen','em_settings.ShowSettingsDialog()');
    }
    unsafeWindow.em_pagehacks = new Pagehacks();
    unsafeWindow.em_shouts = new ShoutboxControls();
  }
}

Settings = new SettingsStore();
Ajax = new AJAXObject();
UserMan = new UserManager();
unsafeWindow.em_settings = Settings;
Location = window.location.href;

initEdgeApe(); //Should go as soon as possible ...
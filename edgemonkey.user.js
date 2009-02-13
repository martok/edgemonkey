// ==UserScript==
// @name           EdgeMonkey
// @copyright      (c)2008, Martok
// @namespace      entwickler-ecke.de
// @description    Krams fuer die Entwickler-Ecke
// @include        http://*.c-sharp-forum.de/*
// @include        http://*.delphi-library.de/*
// @include        http://*.delphi-forum.de/*
// @include        http://*.delphiforum.de/*
// @include        http://*.c-sharp-library/*
// @exclude
// ==/UserScript==

const ScriptVersion = 0.15;

// @changelog
/*



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

var console = unsafeWindow.console;
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

function AJAXSyncRequest(url) {
	request = new XMLHttpRequest();

	if (arguments.length == 1)
	{
		request.open("GET", url, false);
		request.send(null);
	}
	else
	{
		postData = arguments[1];
		postUrl = "";
		for (name in postData)
		postUrl += name+"="+__AJAX_escape(postData[name])+"&";

		request.open("POST", url, false);
		request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=iso-8859-1');
		request.send(postUrl);
	}

	return request.responseText;
}

function UserWindow(title, name,options,previous,body_element) {
	if (!isUndef(previous)) {
		if (previous && !previous.closed) previous.close();
	}
	wnd = window.open('',name,options);
	wnd.document.write('<html><head><script>Settings=opener.em_settings</script>'+
						'<title>'+title+'</title></head>');
	switch (typeof body_element) {
		case "undefined": wnd.document.write('<body></body>'); break;
		case "string": wnd.document.write('<body>'+body_element+'</body>'); break;
		case "object": wnd.document.write('<body>'+body_element.innerHTML+'</body>'); break;
		default:  wnd.document.write('<body>'+body_element.toString+'</body>');
	}
	wnd.document.write('</html>');

	this.Window = wnd;
	this.Document = wnd.document;
	this.Body = wnd.document.body;
	this.close = function () {
		this.Window.close();
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
	Settings.store_field('features', Settings.features);
	Settings.store_field('pagehacks', Settings.pagehacks);
	Settings.store_field('shoutb', Settings.shoutb);
}

SettingsStore.prototype = {
	store_field: function (key, data) {
		GM_setValue(key, uneval(data));
	},
	load_field: function (key, data) {
		return eval(GM_getValue(key, (uneval(data) || '({})')));
	},

	LoadFromDisk: function () { // global deklarieren
		this.features = this.load_field('features', this.features);
		this.pagehacks = this.load_field('pagehacks', this.pagehacks);
		this.shoutb = this.load_field('shoutb', this.shoutb);
	},

	RestoreDefaults: function() {
		this.features = new Object();
		this.pagehacks = new Object();
		this.shoutb = new Object();
		this.pagehacks['monospace']=false;
		this.shoutb['anek_reverse']=true;
		this.shoutb['highlight_me']=false;
		this.shoutb['highlight_mod']=false;
	},

	FillDialog: function() {
		tbl = this.Window.Document.createElement('table');
		with (tbl.insertRow(-1)) {
			insertCell(-1).innerHTML = 'Codeblöcke als monospace anzeigen';
			insertCell(-1).innerHTML = '<input name="ph_mono" type="checkbox" '+(this.pagehacks['monospace']?'checked="">':'>');
		}
		addHeadrow(tbl,'Shoutbox',2);
		with (tbl.insertRow(-1)) {
			insertCell(-1).innerHTML = 'Anekdoten oben einfügen';
			insertCell(-1).innerHTML = '<input name="sb_anek_rev" type="checkbox" '+(this.shoutb['anek_reverse']?'checked="">':'>');
		}
		with (tbl.insertRow(-1)) {
			insertCell(-1).innerHTML = 'Shouts von mir hervorheben<br />(nur mit Auto-Login)';
			insertCell(-1).innerHTML = '<input name="highlight_me" type="checkbox" '+(this.shoutb['highlight_me']?'checked="">':'>');
		}
		with (tbl.insertRow(-1)) {
			insertCell(-1).innerHTML = 'Shouts von Moderatoren/Admins hervorheben';
			insertCell(-1).innerHTML = '<input name="highlight_mod" type="checkbox" '+(this.shoutb['highlight_mod']?'checked="">':'>');
		}
		this.Window.Body.appendChild(tbl);
	},

	ev_SaveDialog: function(evt) {
		with (Settings.Window.Document) {
			Settings.pagehacks['monospace'] = getElementsByName('ph_mono')[0].checked;
			Settings.shoutb['anek_reverse'] = getElementsByName('sb_anek_rev')[0].checked;
			Settings.shoutb['highlight_me'] = getElementsByName('highlight_me')[0].checked;
			Settings.shoutb['highlight_mod'] = getElementsByName('highlight_mod')[0].checked;
		}
		Settings_SaveToDisk();
		alert('Änderungen gespeichert.\nSie werden aber erst beim nächsten Seitenaufruf wirksam.');
		Settings.Window.close();
	},

	ev_ClearAll: function(evt) {
		Settings.RestoreDefaults();
		Settings_SaveToDisk();
		alert("Einstellugen auf Standard zurückgesetzt.\nSie werden aber erst beim nächsten Seitenaufruf wirksam.");
		Settings.Window.close();
	},

	ShowSettingsDialog: function() {
		this.Window = new UserWindow('EdgeMonkey :: Einstellungen', 'em_wnd_settings',
					  'HEIGHT=400,resizable=yes,WIDTH=500', this.Window);
		tbl = this.Window.Document.createElement('table');
		with (tbl.insertRow(tbl.rows.length)) {
			c = insertCell(0);
			c.innerHTML = '<input type="button" value="Speichern">';
			addEvent(c, 'click', this.ev_SaveDialog);
			insertCell(1).innerHTML = '<input type="button" onclick="window.close()" value="Schließen">';
			c = insertCell(2);
			c.innerHTML = '<input type="button" value="Alles Zur&uuml;cksetzen">';
			addEvent(c, 'click', this.ev_ClearAll);
		}
		this.Window.Body.appendChild(tbl);
		this.FillDialog();
	}
}



function ButtonBar() {
	tds = document.getElementsByTagName('td');
	for(i=0;i<tds.length;i++) {
		td = tds[i];
		if (td.className.match(/navbarnav/) && td.innerHTML.match(/Navigation\:/)) {
			cont = td.parentNode.parentNode;
			
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
			break;
		}
	}
}

ButtonBar.prototype = {
	addButton: function(img,caption,script) {
		btn = document.createElement('a');
		btn.target="_self";
		btn.className="gensmall";
		btn.href='javascript:'+script;
		if (img!='') btn.innerHTML+='<img class="navbar" border="0" alt="'+caption+'" src="'+img+'">';
		if (caption!='') btn.innerHTML+=caption;
		this.container.appendChild(btn);
		a=this.container.innerHTML;
		a+=' &nbsp;&nbsp; ';
		this.container.innerHTML=a;
	}
}

function UserManager() {
	this.knownUIDs = Settings.load_field('uidcache',this.knownUIDs);
	this.loggedOnUser = Settings.cookies['ee_data']['userid'];
}

UserManager.prototype = {
	knownUIDs: new Object(),
	getUID: function(name) {
		console.log(name);
		if (isUndef(this.knownUIDs[name])) {
			prof = AJAXSyncRequest('user_'+name+'.html');
			id = prof.match(/vc\.php\?mode=new&amp;ref_type=1&amp;id=([0-9]*)\"/ );
			if (id) this.knownUIDs[name] = id[1];
			Settings.store_field('uidcache', this.knownUIDs);
		}
		return this.knownUIDs[name];
	},
	getUIDByProfile: function(href) {
		m = href.match(/user_(.*)\.html/);
		if (m)
			return this.getUID(m[1]);
		else
			return 0;
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
		if (Settings.shoutb['highlight_me']) {
			who = UserMan.getUIDByProfile(a.href);
			if (who==UserMan.loggedOnUser)
				shout.className+=' myshout';
		}
		if (Settings.shoutb['highlight_mod']) {
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
			style.innerHTML+= ' .myshout { background-color: #FEF4E4}';
			style.innerHTML+= ' .modshout { background-color: #EFFFEF}';
			head.appendChild(style);
		}

	},

	Anekdote: function(item) {
		an='';
		an+= '[user]'+item.getElementsByTagName('a')[0].innerHTML+'[/user]';
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
		this.Anekdoter = new UserWindow('EdgeMonkey :: SB-Anekdoter', 'em_wnd_sbanekdote',
				  'HEIGHT=400,resizable=yes,WIDTH=500,scrollbars=yes',undefined,'<pre></pre>');

		ih = this.Anekdoter.Body.firstChild.innerHTML;
		if (Settings.shoutb['anek_reverse'])
			 this.Anekdoter.Body.firstChild.innerHTML = this.Anekdote(this.shouts[idx]) + ih;
		else
			 this.Anekdoter.Body.firstChild.innerHTML = ih + this.Anekdote(this.shouts[idx]);
		this.Anekdoter.Window.focus();
	}
}

function Pagehacks() {

	this.checkPMs = function() {
		window.open('privmsg.php?mode=newpm', 'em_pmcheck', 'HEIGHT=225,resizable=yes,WIDTH=400');
	}
	
	this.cssHacks = function() {
		for (var s = 0; s < document.styleSheets.length; s++) {
			var rules = document.styleSheets[s].cssRules;
			for (var r = 0; r < rules.length; r++) {
				var rule = rules[r];
				if (rule.selectorText.match(/\.code(Cell|comment|key|string|char|number|compilerdirective)|textarea\.posting_body/))
					rule.style.fontFamily = "monospace";
			}
		}
	}
	
	if (Settings.pagehacks['monospace']) this.cssHacks();
	unsafeWindow.em_buttonbar.addButton('/templates/subSilver/images/folder_new_open.gif','Auf neue PNs prüfen','em_pagehacks.checkPMs()');
}

Settings = new SettingsStore();
UserMan = new UserManager();
unsafeWindow.em_settings = Settings;
if (window.location.href.match(/shoutbox_view.php/)) {
	unsafeWindow.em_shout_cnt = new ShoutboxWindow();
} else
{

	unsafeWindow.em_buttonbar = new ButtonBar();

	with(unsafeWindow.em_buttonbar) {
		addButton('/graphics/Profil-Sidebar.gif','Einstellungen','em_settings.ShowSettingsDialog()');
	}
	unsafeWindow.em_pagehacks = new Pagehacks();
	unsafeWindow.em_shouts = new ShoutboxControls();
}





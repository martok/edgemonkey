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

const ScriptVersion = 0.11;

const sburl = 'http://www.delphi-forum.de/shoutbox_view.php?';
const sb_per_page = 30;

console = unsafeWindow.console;

function ShoutboxHandler() {
	this.shout_obj = document.getElementById('sidebar_shoutbox');

	this.get_iframe = function () { return this.shout_obj.getElementsByTagName('iframe')[0] }

	this.shout_url = this.get_iframe().src;

	this.current_start = function () {
		st = this.shout_url.match(/start=(\d*)/);
		if (st == null)
			return 0
		else
			return parseInt(st[1]);
	}

	this.setUrl = function (url) {
		ifr = this.get_iframe();
		ifr.contentDocument.location.href = url;
		this.shout_url = url;
	}

	this.newer_page = function () {
		p = this.current_start() - sb_per_page;
		this.goto_page(p);
	}

	this.older_page = function () {
		p = this.current_start() + sb_per_page;
		this.goto_page(p);
	}

	this.goto_page = function (strt) {
		if (strt>0) {
			this.setUrl(sburl + 'start=' + strt);
			this.edtDirect.value = strt;
		} else {
			this.setUrl(sburl);
			this.edtDirect.value = 0;
		}
	}
	
	this.ev_sb_goto = function (evt) {
		evt = (evt) ? evt : ((event) ? event : null);
		if (evt && evt.keyCode==13) {
			 p=parseInt(this.edtDirect.value);
			 if(isNaN(p)) alert(this.edtDirect.value+' ist keine gültige Zahl!');
			 else this.goto_page(p);
		}
	}
	
	// Initialization
	if (this.shout_obj) {
		this.btnUpdate = this.shout_obj.getElementsByTagName('input')[3];
		this.btnUpdate.parentNode.removeChild(this.btnUpdate.nextSibling);

		this.btnNewer = this.btnUpdate.cloneNode(false);
		this.btnNewer.value='<<';
		this.btnNewer.style.cssText='width: 27px';
		this.btnNewer.setAttribute('onclick', 'em_shouts.newer_page()');
		this.btnNewer.title='Neuere Shouts';
		this.btnUpdate.parentNode.insertBefore(this.btnNewer, this.btnUpdate);

		this.btnOlder = this.btnNewer.cloneNode(false);
		this.btnOlder.value='>>';
		this.btnOlder.title='Ältere Shouts';
		this.btnOlder.setAttribute('onclick', 'em_shouts.older_page()');

		this.btnUpdate.parentNode.appendChild(this.btnOlder);

		this.edtDirect = this.shout_obj.getElementsByTagName('input')[0].cloneNode(false);
		this.edtDirect.style.cssText='width: 25px';
		this.edtDirect.value = 0;
		this.edtDirect.setAttribute('onchange', '');
		this.edtDirect.setAttribute('onkeydown', '');
		this.edtDirect.setAttribute('onkeyup', 'em_shouts.ev_sb_goto(event)');
		this.edtDirect.title='Start-Shout, Enter zum aufrufen';
		this.btnUpdate.parentNode.appendChild(this.edtDirect);
	}
}

unsafeWindow.em_shouts = new ShoutboxHandler();




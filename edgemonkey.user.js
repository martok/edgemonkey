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

const ScriptVersion = 0.21;

// @changelog
/*

0.21           09-08-07
  -SB: Auto-Tagging (BenBE)
  -SB: IRC-Like Nickname Autocomplete (Martok)
  -Trunk link changed
  -Fix: monospace not always applied
  -SB: some new replace rules
  -fix: uid cache could cause freezes

0.20           09-05-23
  -global usage of EM object across all (i)frames & popups
  -display shouting user in bold
  -better (more native feeling) dropdown handling
  -New Anekdoter with better html2code (Martok)
  -quicklink dropdowns default on
  -enhanced Opera compatibility
  -builtin urldrop functionality for SB
  -resizable SB
  -new colors
  -Post highlighter


0.19           09-04-12
  -setting for anekdoter (BenBE)
  -ph: max-width for images (BenBE)
  -better user-tag-linking
  -improved loading the configuration (BenBE)
  -Branch-Switch-Links
  -Shout Following (BenBE)
  -Inline Window for Smileys in SB (Martok)
  -Quick Search from navigation bar (Martok)
  -Multiline Textarea for Shoutbox (Martok)
  -improved autoshout features (BenBE)
  -Opera Compatibility (BenBE)
  -User Highlighting in Shoutbox (BenBE, Martok)
  -improved Shoutbox tools (BenBE, Martok)

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

//Opera compatibility (BenBE)
if(typeof unsafeWindow == "undefined") {
  unsafeWindow = window;
}

var console = unsafeWindow.console;
// just in case s/o does not have Firebug
if (!console || RELEASE) {
  console = new Object();
  console.log = function() {return true; };
}

var colorTpl = new Array(
    {
        name:'none',
        friendlyname:'Keine Hervorhebung',
        style1:'',
        style2:'',
        style3:'',
        style4:''
    },
    {
        name:'red',
        friendlyname:'Kräftig Rot',
        style1:'background:#FEC8C8;',
        style2:'background:#FEB3B3;',
        style3:'background:#FEACAC;',
        style4:'background:#FEA7A7;'
    },
    {
        name:'orange',
        friendlyname:'Fruchtig Orange',
        style1:'background:#FEE8D4;',
        style2:'background:#FEDBC4;',
        style3:'background:#FED7C0;',
        style4:'background:#FEDBC4;'
    },
    {
        name:'yellow',
        friendlyname:'Freundliches Gelb',
        style1:'background:#FEF4E4;',
        style2:'background:#FEEFD7;',
        style3:'background:#FEE2C8;',
        style4:'background:#FEEFD7;'
    },
    {
        name:'green',
        friendlyname:'Moderat(iv) Gr&uuml;n',
        style1:'background:#E8FED4;',
        style2:'background:#DBFEC4;',
        style3:'background:#D7FEC0;',
        style4:'background:#D7FEC0;'
    },
    {
        name:'blue',
        friendlyname:'Himmlisch Blau',
        style1:'background:#D4E4FE;',
        style2:'background:#B6D4FE;',
        style3:'background:#A8CCFE;',
        style4:'background:#A6C8FE;'
    },
    {
        name:'lila',
        friendlyname:'Heißes Pink',
        style1:'background:#E2CCFE;',
        style2:'background:#D7BBFE;',
        style3:'background:#DCC0FE;',
        style4:'background:#DAB9FE;'
    },
    {
        name:'pink',
        friendlyname:'Schwules Pink',
        style1:'background:#F8D4FE;',
        style2:'background:#FBC4FE;',
        style3:'background:#F0C0FE;',
        style4:'background:#FBC4FE;'
    },
    {
        name:'grey',
        friendlyname:'Trist Grau',
        style1:'background:#E8E8E8;',
        style2:'background:#DCDCDC;',
        style3:'background:#B0B0B0;',
        style4:'background:#C0C0C0;'
    },
    {
        name:'chrome',
        friendlyname:'Depressiv Monochrome',
        style1:'background:#D8D8D8',
        style2:'background:#BCBCBC',
        style3:'background:#A0A0A0',
        style4:'background:#AAAAAA'
    }
);

var data = {
  searchAnim: 'data:image/gif,GIF89a2%002%00%80%01%00%00%00%00%FF%FF%FF!%FF%0BNETSCAPE2.0%03%01%00%00%00!%F9%04%09%0A%00%01%00%2C%00%00%00%002%002%00%00%02%81%8C%'+
    '8F%A9%07%BD%0F%A3l%14%C8%8BW%AD%B9%E3%CDy%A2%06%3A%E3i%94%14%CA%AA%16%FB%AC%24%08%CF%B2BG%AFWB%A6%7F%FB%F4Z%A1%CC%10%B5%E1%E5%90Aa%11%B6%135k%D4%AA%F5%8'+
    'A%CDj%B7%DC%AE%F7%AB%033l%E0g%CA%ACM%22%D4%5D%F6%F9%D7%9E%A6%C4s%BA%FD%8E%CF%EB%F7%FC~%F9%1A%D5%81628Q(x%18%93%E8%04%C7H%B5%E8%03%F8%15%98%07%E9%E5%86%8'+
    '7yg9%E9%E7%99U%00%00!%F9%04%09%0A%00%01%00%2C%00%00%00%002%002%00%00%02%84%8C%8F%A9%CB%ED%CF%00%80%B4.%89%A7%DD0c%0E%5E%9E%14%96%C8%A8%99%25%1A%05%A4%1A'+
    'yq%16%A6%CD\'%8E%1Bm%A2%2F%25%5B%F9%2CA%90%EF%D7%C1%09Y%3B%D8%10V%2BB%A3%D3%AA%F5%8A%CDj%B7%DC%EE%CA%7B%CA%D9%B6%BCS%99%7Cv%A5%B3R5%12%FD%3E%8C%BBs%B0%FD'+
    '%8E%CF%EB%F7%FC%BE%3F%5CU%97%14g%A4D%B4%C6%D16H%B8%83%E8%E0%D8%C8%D8a%25H%F9%E7Vi%A7%88%B7y%07%C9y%19%8AU%00%00!%F9%04%09%0A%00%01%00%2C%00%00%00%002%00'+
    '2%00%00%02%7F%8C%8F%A9%CB%ED%0F%A3%9C%09%D0%2B%81%B6%B8%B3%ADy%22%02r%A3%08%9Ej%606%9B%D7%C2%E5%95%8Ee8%CD%F2M%E9%7B%9Dy%D9x4%15q%D5%11%22%97%CC%A6%F3%0'+
    '9%8DJ%9D%16%DC%F4%E3%23MoV%96%F2%C9%B5f%9Ba%D3xY6%7F%A9%E1%CA%96%7B%5D%1C%E3%8A.%FD%8E%CF%EB%F7%7C%23%3A%B9%06h%17qF%03%14%14h%98%E8p%F8%03%F3\'%15%A3%D7'+
    '%98WHg%19G9%D9%C7%19U%00%00!%F9%04%09%0A%00%01%00%2C%00%00%00%002%002%00%00%02%83%8C%8F%A9%CB%ED%0F%A3%9C%09%D0%2B%81%B6%B8%B3%ADy%22%02r%A3%08%9Ej%60%A'+
    'EK%7B%C2%D9%A6%A6W%19%DB%13%3E%F2%3B%9D%0Bud(%97%F1%88L*%97%CC%A6%F3%09u%01%15Dd%09%A6%5B%5E%5B%BE%E4%96%9B%F5%5EIS%ED%B8%F2%3CG%D1%C2%B5%FB%0D%8F%CB%D7'+
    '%966%5CM%A9%FE%F0%90%F0%ED%BBg%F7%B7%15%A8%F7%F0%25%E8%E0%97%07%98%17%D4ud%C8\'U%F6b%F8x%D9%04%E9%B6%F8%969%07*R%00%00!%F9%04%09%0A%00%01%00%2C%00%00%00%'+
    '002%002%00%00%02%81%8C%8F%A9%CB%ED%0F%A3%9C%09%D0%2B%81%B6%B8%B3%ADy%22%02r%A3%08%9Ej%60%AEK%7B%C2%D9%A6%A6W%19%DB%13%3E%F2%3B%9D%0Bud(%97%F1%88L*%97%CC'+
    '%A6%F3%09%85%12%97D%1D%D3j%F0Q%B1Ze%17%EB%05*%A6%DE%A8%F9%8CN%AB%D7%EC%F6%8C%FC%80%BF%C5%F3%20%D8%D1%A5%94%E8%90%BC~%FF\'%84%87%07xCx%C7%E2g%C7G%22h%B4%C'+
    '7%D8%04%19)9%896)%97d%99%06%B9%868Q%00%00!%F9%04%09%0A%00%01%00%2C%00%00%00%002%002%00%00%02%83%8C%8F%A9%CB%ED%0F%A3%9C%09%D0%2B%81%B6%B8%B3%ADy%22%02r%'+
    'A3%08%9Ej%60%AEK%7B%C2%D9%A6%A6W%19%DB%13%3E%F2%3B%9D%0Bud(%97%F1%88L*%97%CC%A6%F3%09%85%12%97D%1D%D3j%F0Q%B1Ze%17%EB%05*%A6%DE%A8%F9%8CN%AB%D7.%8BP%5D%'+
    '227%E3%EF%22%85%5E%BF%89%23x%F9%A3%DB%D0%E7%E7%00%18%88%87%B2%07q%F8%91%F7%82%11%C7%08%D6%26G%97%B6%88Vi%09%A9)%19%E56%C8FQ%00%00!%F9%04%09%0A%00%01%00%'+
    '2C%00%00%00%002%002%00%00%02%82%8C%8F%A9%CB%ED%0F%A3%9C%09%D0%2B%81%B6%B8%B3%ADy%22%02r%A3%08%9Ej%60%AEK%7B%C2%D9%A6%A6W%19%DB%13%3E%F2%3B%9D%0Bud(%97%F'+
    '1%88L*%97%CC%A6%B3a!%3E%0D%25%A9%B3*l%B6%B0%40%A5%8Ek%5D%F1%C0%E1%60%96%AB%ED%B2%B0OYu%FAa%C1%E7%F4%BA%FD%8E%A7%A8%EF%BE%DE%8D%8D%B2%07%01%E8%D1%F7%80%1'+
    '6(%E8%408%A4%B8hXX%98%05%95G%E5%08%079%97%89y%A9Y%F9%A9T%00%00!%F9%04%01%0A%00%01%00%2C%00%00%00%002%002%00%00%02%85%8C%8F%A9%CB%ED%0F%A3%9C%09%D0%2B%81'+
    '%B6%B8%B3%ADy%22%02r%E3b%85%0Dx~%E5c%B6d%A9%8EqDo%22%3B%E55%F6%C2%F9n%94%A00%B7%D3%F5%90\'%22%84%26KF%A7%D4%AA%F5%8A%CDjm%BF%AD%02%EA%252%B1%3C%83Ok%0C%8'+
    'C%AF%E9%B5%B5lNg%9D)%A7%F7%8E%CF%EB%F7%FC%BE%FFn%D7%11%E8%00%E7Qx%D4%05t%08%B3X%D4%B8%A2%C4%95%9815(c%19%16%D9\'%A7%C7%99%F7%F8%F9\'%9AU%00%00%3B',
  leyenFilter: 'data:image/svg+xml;base64,77u%2FPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8%2BDQo8c3ZnIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6Y2M9Imh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL25zIyIgeG1sbnM6cmRmPSJodHRwOi8vd3'+
    'd3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIiB4bWxuczpzdmc9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnNvZGlwb2RpPSJodHRwOi8vc29kaXBvZGkuc291cmNlZm9yZ2UubmV0L0RURC9zb2RpcG9kaS0wLmR0ZCIgeG1sbnM6aW5rc2NhcG'+
    'U9Imh0dHA6Ly93d3cuaW5rc2NhcGUub3JnL25hbWVzcGFjZXMvaW5rc2NhcGUiIHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiBpZD0ic3ZnMiIgc29kaXBvZGk6dmVyc2lvbj0iMC4zMiIgaW5rc2NhcGU6dmVyc2lvbj0iMC40NiIgc29kaXBvZGk6ZG9jbmFtZT0idGVzdC5zdmciIHZlcnNpb249IjEuMCI%2BDQogIDxnIGlua3NjYXBlOmxh'+
    'YmVsPSJFYmVuZSAxIiBpbmtzY2FwZTpncm91cG1vZGU9ImxheWVyIiBpZD0ibGF5ZXIxIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMTE1LjAyMjc3LC0yMjUuNzI4ODgpIj4NCiAgICA8ZyBpZD0iZzM1MzciIHRyYW5zZm9ybT0ibWF0cml4KDEuMDY2NjY2NywwLDAsMS4wNjY2NjY3LDExNS4wMjI3NywyMjUuNzI4ODYpIj4NCiAgICAgIDxw'+
    'YXRoIHRyYW5zZm9ybT0ibWF0cml4KDAuNjc5MDE0NSwtMC4yODEyNTcsMC4yODEyNTcsMC42NzkwMTQ1LC0xMDAuMzY4NjcsMjAyLjk1NjQzKSIgZD0iTSA3NTQuMjg1NzQsMjIzLjc5MDc2IEwgNjUzLjAyODM2LDQ2OC4yNDc2OCBMIDQwOC41NzE0NCw1NjkuNTA1MDUgTCAxNjQuMTE0NTIsNDY4LjI0NzY4IEwgNjIuODU3MTQ3LDIyMy43'+
    'OTA3NiBMIDE2NC4xMTQ1MiwtMjAuNjY2MTY2IEwgNDA4LjU3MTQ0LC0xMjEuOTIzNTQgTCA2NTMuMDI4MzYsLTIwLjY2NjE2NiBMIDc1NC4yODU3NCwyMjMuNzkwNzYgeiIgaW5rc2NhcGU6cmFuZG9taXplZD0iMCIgaW5rc2NhcGU6cm91bmRlZD0iMCIgaW5rc2NhcGU6ZmxhdHNpZGVkPSJ0cnVlIiBzb2RpcG9kaTphcmcyPSIwLjM5MjY5'+
    'OTA4IiBzb2RpcG9kaTphcmcxPSIwIiBzb2RpcG9kaTpyMj0iMzE5LjM5ODM1IiBzb2RpcG9kaTpyMT0iMzQ1LjcxNDI5IiBzb2RpcG9kaTpjeT0iMjIzLjc5MDc2IiBzb2RpcG9kaTpjeD0iNDA4LjU3MTQ0IiBzb2RpcG9kaTpzaWRlcz0iOCIgaWQ9InBhdGgzMjA5IiBzdHlsZT0iZmlsbDojZmZmZmZmO2ZpbGwtb3BhY2l0eToxO3N0cm9r'+
    'ZTojMDAwMDAwO3N0cm9rZS13aWR0aDo0O3N0cm9rZS1taXRlcmxpbWl0OjQ7c3Ryb2tlLWRhc2hhcnJheTpub25lO3N0cm9rZS1vcGFjaXR5OjEiIHNvZGlwb2RpOnR5cGU9InN0YXIiIC8%2BDQogICAgICA8cGF0aCBzb2RpcG9kaTp0eXBlPSJzdGFyIiBzdHlsZT0iZmlsbDojZmYwMDAwO2ZpbGwtb3BhY2l0eToxO3N0cm9rZTojZmZmZm'+
    'ZmO3N0cm9rZS13aWR0aDowO3N0cm9rZS1taXRlcmxpbWl0OjQ7c3Ryb2tlLWRhc2hhcnJheTpub25lO3N0cm9rZS1vcGFjaXR5OjEiIGlkPSJwYXRoMzIxMSIgc29kaXBvZGk6c2lkZXM9IjgiIHNvZGlwb2RpOmN4PSI0MDguNTcxNDQiIHNvZGlwb2RpOmN5PSIyMjMuNzkwNzYiIHNvZGlwb2RpOnIxPSIzNDUuNzE0MjkiIHNvZGlwb2RpOn'+
    'IyPSIzMTkuMzk4MzUiIHNvZGlwb2RpOmFyZzE9IjAiIHNvZGlwb2RpOmFyZzI9IjAuMzkyNjk5MDgiIGlua3NjYXBlOmZsYXRzaWRlZD0idHJ1ZSIgaW5rc2NhcGU6cm91bmRlZD0iMCIgaW5rc2NhcGU6cmFuZG9taXplZD0iMCIgZD0iTSA3NTQuMjg1NzQsMjIzLjc5MDc2IEwgNjUzLjAyODM2LDQ2OC4yNDc2OCBMIDQwOC41NzE0NCw1Nj'+
    'kuNTA1MDUgTCAxNjQuMTE0NTIsNDY4LjI0NzY4IEwgNjIuODU3MTQ3LDIyMy43OTA3NiBMIDE2NC4xMTQ1MiwtMjAuNjY2MTY2IEwgNDA4LjU3MTQ0LC0xMjEuOTIzNTQgTCA2NTMuMDI4MzYsLTIwLjY2NjE2NiBMIDc1NC4yODU3NCwyMjMuNzkwNzYgeiIgdHJhbnNmb3JtPSJtYXRyaXgoMC42MzYzNjM2LC0wLjI2MzU5MDQsMC4yNjM1OT'+
    'A0LDAuNjM2MzYzNiwtNzguOTg5MTMxLDIwNS4yODMyNCkiIC8%2BDQogICAgPC9nPg0KICAgIDx0ZXh0IHhtbDpzcGFjZT0icHJlc2VydmUiIHN0eWxlPSJmb250LXNpemU6NzhweDt0ZXh0LWFsaWduOmNlbnRlcjt0ZXh0LWFuY2hvcjptaWRkbGU7ZmlsbDojZmZmZmZmO2ZpbGwtb3BhY2l0eToxO3N0cm9rZTpub25lO3N0cm9rZS13aWR0'+
    'aDoxcHg7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLW9wYWNpdHk6MTtmb250LWZhbWlseTpQYXJvbGUtUmVndWxhcixBcmlhbCBCbGFjayxBcmlhbCIgeD0iMzg0IiB5PSI1MTIiPlMgVCBPIFA8L3RleHQ%2BDQogICAgPHRleHQgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgc3R5bGU9ImZvbnQtc2l6ZT'+
    'oxMHB4O2ZvbnQtc3R5bGU6bm9ybWFsO2ZvbnQtd2VpZ2h0Om5vcm1hbDt0ZXh0LWFsaWduOmNlbnRlcjt0ZXh0LWFuY2hvcjptaWRkbGU7ZmlsbDojZmZmZmZmO2ZpbGwtb3BhY2l0eToxO3N0cm9rZTpub25lO3N0cm9rZS13aWR0aDoxcHg7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLW9wYWNpdH'+
    'k6MTtmb250LWZhbWlseTpWZXJkYW5hO2xpbmUtaGVpZ2h0OjEyNSUiPgogICAgICA8dHNwYW4gc29kaXBvZGk6cm9sZT0ibGluZSIgeD0iMzg0LjAiIHk9IjI2OS45MjU2OSI%2BSWhyIEludGVybmV0LUJyb3dzZXIgdmVyc3VjaHQgZ2VyYWRlLDwvdHNwYW4%2BCiAgICAgIDx0c3BhbiBzb2RpcG9kaTpyb2xlPSJsaW5lIiB4PSIzODQuMC'+
    'IgeT0iMjgyLjQyNTY5Ij5Lb250YWt0IHp1IGVpbmVyIEZvcmVuLURpc2t1c3Npb24gaGVyLTwvdHNwYW4%2BCiAgICAgIDx0c3BhbiBzb2RpcG9kaTpyb2xlPSJsaW5lIiB4PSIzODQuMCIgeT0iMjk0LjkyNTY5Ij56dXN0ZWxsZW4sIGRpZSBpbSBadXNhbW1lbmhhbmcgbWl0IGRlcjwvdHNwYW4%2BCiAgICAgIDx0c3BhbiBzb2RpcG9kaT'+
    'pyb2xlPSJsaW5lIiB4PSIzODQuMCIgeT0iMzA3LjQyNTY5Ij5WZXJicmVpdHVuZyBtYXhpbWFsZW4gU2Nod2FjaHNpbm5zIGdlbnV0enQgd2lyZC48L3RzcGFuPgogICAgICA8dHNwYW4gc29kaXBvZGk6cm9sZT0ibGluZSIgeD0iMzg0LjAiIHk9IjMxOS45MjU2OSI%2BRGllIFZlcmJyZWl0dW5nLCBkaWUgVGVpbG5haG1lIHVuZCBkYXMg'+
    'VW50ZXJzdMO8dHplbjwvdHNwYW4%2BCiAgICAgIDx0c3BhbiBzb2RpcG9kaTpyb2xlPSJsaW5lIiB4PSIzODQuMCIgeT0iMzMyLjQyNTY5Ij5zaW5uZnJlaWVyIEZvcmVuYWt0aXZpdMOkdGVuIGlzdCBlbnRnZWdlbiBqZWRlciBWZXJudW5mdCB1bmQ8L3RzcGFuPgogICAgICA8dHNwYW4gc29kaXBvZGk6cm9sZT0ibGluZSIgeD0iMzg0Lj'+
    'AiIHk9IjM0NC45MjU2OSI%2BZGFoZXIgbmFjaCDCpzQyIENvbW1vblNlbnNlRyBlbnRnZWdlbiBsYW5kbMOkdWZpZ2VyPC90c3Bhbj4KICAgICAgPHRzcGFuIHNvZGlwb2RpOnJvbGU9ImxpbmUiIHg9IjM4NC4wIiB5PSIzNTcuNDI1NjkiPk1laW51bmcgc2l0dGVud2lkcmlnLjwvdHNwYW4%2BCiAgICAgIDx0c3BhbiBzb2RpcG9kaTpyb2'+
    'xlPSJsaW5lIiB4PSIzODQuMCIgeT0iMzY5LjkyNTY5Ij4gPC90c3Bhbj4KICAgICAgPHRzcGFuIHNvZGlwb2RpOnJvbGU9ImxpbmUiIHg9IjM4NC4wIiB5PSIzODIuNDI1NjkiPlNpbm5mcmVpZSBNZWludW5ncy0gdW5kIEJlaXRyYWdzw6R1w59lcnVuZyBiZWRldXRldCBmw7xyIGRpZSBNb2RlcmF0b3JlbiBkYXM8L3RzcGFuPgogICAgIC'+
    'A8dHNwYW4gc29kaXBvZGk6cm9sZT0ibGluZSIgeD0iMzg0LjAiIHk9IjM5NC45MjU2OSI%2BRXJsZWlkZW4gdm9uIHVuYmVzY2hyZWliYmFyZXIgU2NobWVyemVuIHVuZCBpc3QgaW4gZGVyIFJlZ2VsIG1pdCB1bm7DtnRpZ2VuPC90c3Bhbj4KICAgICAgPHRzcGFuIHNvZGlwb2RpOnJvbGU9ImxpbmUiIHg9IjM4NC4wIiB5PSI0MDcuNDI1'+
    'NjkiPkFyYmVpdHNzaXR6dW5nZW4gYW4gc29ubmlnZW4gU29tbWVydGFnZW4gdmVyYnVuZGVuLiBadWRlbSBlcmjDtmh0IGRpZTwvdHNwYW4%2BCiAgICAgIDx0c3BhbiBzb2RpcG9kaTpyb2xlPSJsaW5lIiB4PSIzODQuMCIgeT0iNDE5LjkyNTY5Ij5tYXNzZW53ZWlzZSBWZXJicmVpdHVuZyBzaW5uZnJlaWVyIEdlZGFua2VuIGltIEludG'+
    'VybmV0IGRpZSBTa2lwLVJhdGUgZGVyPC90c3Bhbj4KICAgICAgPHRzcGFuIHNvZGlwb2RpOnJvbGU9ImxpbmUiIHg9IjM4NC4wIiB5PSI0MzIuNDI1NjkiPkZvcmVudGVpbG5laG1lciB1bmQgZsO2cmRlcnQgc28genVtaW5kZXN0IG1pdHRlbGJhciBkYXMgSGVyYW53YWNoc2VuIHZvbjwvdHNwYW4%2BCiAgICAgIDx0c3BhbiBzb2RpcG9k'+
    'aTpyb2xlPSJsaW5lIiB4PSIzODQuMCIgeT0iNDQ0LjkyNTY2Ij5Ucm9sbGVuIHVuZCBUcm9sbHdpZXNlbiBpbSBGb3J1bS48L3RzcGFuPgogICAgICA8dHNwYW4gc29kaXBvZGk6cm9sZT0ibGluZSIgeD0iMzg0LjAiIHk9IjQ0Ny40MjU2NiI%2BIDwvdHNwYW4%2BCiAgICAgIDx0c3BhbiBzb2RpcG9kaTpyb2xlPSJsaW5lIiB4PSIzODQu'+
    'MCIgeT0iNTM0LjkyNTY2Ij5CaXR0ZSBkZW5rZW4gU2llIG5pY2h0IMO8YmVyIGRpZXNlIE1hw59uYWhtZSBuYWNoLCBzb25zdCBtYWNoZW4gYXVjaCBTaWUgc2ljaDwvdHNwYW4%2BCiAgICAgIDx0c3BhbiBzb2RpcG9kaTpyb2xlPSJsaW5lIiB4PSIzODQuMCIgeT0iNTQ3LjQyNTY2Ij5zdHJhZmJhci4gRsO8ciBkaWVzZW4gRmFsbCBoYW'+
    'JlbiB3aXIgYmVyZWl0cyBJaHJlIGtvbXBsZXR0ZW4gYmlvbWV0cmlzY2hlbiBEYXRlbjwvdHNwYW4%2BCiAgICAgIDx0c3BhbiBzb2RpcG9kaTpyb2xlPSJsaW5lIiB4PSIzODQuMCIgeT0iNTU5LjkyNTY2Ij5nZXNwZWljaGVydCB1bmQgYW4gZGllIEJLQSAoQmxvZ2dlcmtvbnRyb2xsYW5zdGFsdCkgd2VpdGVyZ2VsZWl0ZXQuIE1vbWVu'+
    'dGFuPC90c3Bhbj4KICAgICAgPHRzcGFuIHNvZGlwb2RpOnJvbGU9ImxpbmUiIHg9IjM4NC4wIiB5PSI1NzIuNDI1NjYiPndlcmRlbiBpaHJlIEZlc3RwbGF0dGVuIGdlc2Nhbm50IHVuZCBhbmFseXNpZXJ0LCBoYWJlbiBTaWUgZGVzaGFsYiBiaXR0ZTwvdHNwYW4%2BCiAgICAgIDx0c3BhbiBzb2RpcG9kaTpyb2xlPSJsaW5lIiB4PSIzOD'+
    'QuMCIgeT0iNTg0LjkyNTY2Ij5ub2NoIGVpbmVuIE1vbWVudCBHZWR1bGQuPC90c3Bhbj4KICAgICAgPHRzcGFuIHNvZGlwb2RpOnJvbGU9ImxpbmUiIHg9IjM4NC4wIiB5PSI1OTcuNDI1NjYiPiA8L3RzcGFuPgogICAgICA8dHNwYW4gc29kaXBvZGk6cm9sZT0ibGluZSIgeD0iMzg0LjAiIHk9IjYwOS45MjU2NiI%2BRGFzIFRyb2xsZW4g'+
    'w7xiZXJsYXNzZW4gU2llIGJlc3NlciB3ZWl0ZXJoaW4gZGVuIFVzZXJuIGltIEhlaXNlLUZvcnVtLjwvdHNwYW4%2BCiAgICAgIDx0c3BhbiBzb2RpcG9kaTpyb2xlPSJsaW5lIiB4PSIzODQuMCIgeT0iNjIyLjQyNTY2Ij4gPC90c3Bhbj4KICAgICAgPHRzcGFuIHNvZGlwb2RpOnJvbGU9ImxpbmUiIHg9IjM4NC4wIiB5PSI2MzQuOTI1Nj'+
    'YiPlNvbGx0ZW4gU2llIG51biwgZW50Z2VnZW4gZGllc2VyIFdhcm51bmcgdW5kIHRyb3R6IGRlbjwvdHNwYW4%2BCiAgICAgIDx0c3BhbiBzb2RpcG9kaTpyb2xlPSJsaW5lIiB4PSIzODQuMCIgeT0iNjQ3LjQyNTY2Ij5tw7ZnbGljaGVuIEdlZmFocmVuIHVuZCBGb2xnZW4sIGRpZXNlIGdldHJvbGx0ZTwvdHNwYW4%2BCiAgICAgIDx0c3'+
    'BhbiBzb2RpcG9kaTpyb2xlPSJsaW5lIiB4PSIzODQuMCIgeT0iNjU5LjkyNTY2Ij5JbnRlcm5ldGRpc2t1c3Npb24gZGVubm9jaCBiZXRyZXRlbiB3b2xsZW4sPC90c3Bhbj4KICAgICAgPHRzcGFuIHNvZGlwb2RpOnJvbGU9ImxpbmUiIHg9IjM4NC4wIiB5PSI2NzIuNDI1NjYiPnNvIGtsaWNrZW4gc2llPC90c3Bhbj4KICAgICAgPHRzcG'+
    'FuIHNvZGlwb2RpOnJvbGU9ImxpbmUiIHg9IjM4NC4wIiB5PSI2ODQuOTI1NzIiPiA8L3RzcGFuPgogICAgPC90ZXh0Pg0KICA8L2c%2BDQo8L3N2Zz4%3D'
}

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

function last_child(node,kind)
{
  var c = node.getElementsByTagName(kind);
  return c[c.length-1];
}

function previousNode(node)
{
  var res=node.previousSibling;
  while (res!=null && res.nodeType!=1) {
    res = res.previousSibling;
  }
  return res;
}

function nextNode(node)
{
  var res=node.nextSibling;
  while (res!=null && res.nodeType!=1) {
    res = res.nextSibling;
  }
  return res;
}


function isUndef(what)
{
  return (typeof what == "undefined");
}

function isEmpty(what)
{
  return isUndef(what) || null==what;
}

function isHTMLElement(what)
{
  return !isUndef && what instanceof HTMLElement;
}

//http://www.infocamp.de/javascript_htmlspecialchars.php
String.prototype.escapeHTML = function (typ) {
  if(typeof typ!="number")
    typ=2;
  typ = Math.max(0,Math.min(3,parseInt(typ)));

  var from = new Array(/&/g,/</g,/>/g);
  var to = new Array("&amp;","&lt;","&gt;");

  if(typ==1 || typ==3) {
    from.push(/'/g); to.push("&#039;");
  }
  if(typ==2 || typ==3) {
    from.push(/"/g); to.push("&quot;");
  }

  var str = this;
  for(var i in from)
    str=str.replace(from[i],to[i]);

  return str;
};

String.prototype.equals = function (what) {
  return this.toLowerCase()==what.toLowerCase();
};

// FF 3.1+ has it native (JS 1.8.1)
if (!String.prototype.trim) String.prototype.trim = function() {
  return this.replace(/^\s*/,'').replace(/\s*$/,'');
};

(function() {
    var default_replace = String.prototype.replace;

    String.prototype.replace = function(search,replace) {
        // replace is not function
        if(typeof replace != "function") {
            return default_replace.apply(this,arguments);
        }

        var str = "" + this;
        var callback = replace;

        // search string is not RegExp
        if(!(search instanceof RegExp)) {
            var idx = str.indexOf(search);
            return (
                idx == -1 ? str :
                default_replace.apply(str,[search,callback(search, idx, str)])
                );
        }

        var reg = search;
        var result = [];
        var lastidx = reg.lastIndex;
        var re;

        while((re = reg.exec(str)) != null) {
            var idx  = re.index;
            var args = re.concat(idx, str);
            result.push(
                str.slice(lastidx,idx),
                callback.apply(null,args).toString()
                );
            if(!reg.global) {
                lastidx += RegExp.lastMatch.length;
                break;
            } else {
                lastidx = reg.lastIndex;
            }
        }

        result.push(str.slice(lastidx));
        return result.join("");
    }
})();

function encodeLongShout(text)
{
  var b = '';
  var s = text.replace(/[^\w]/g, function(m) {
      if(' ' == m)
        return '-';

      b += m.charCodeAt(0).toString(16);
      return '.';
    });
  return '' != b ? s + '?' + b : s;
}

function decodeLongShout(text)
{
  if(/%/.test(text)) {
    return decodeURIComponent(text.replace(/\+/g, '%20'));
  }

  var p = text.split(/\?(?=(?:[a-f0-9]{2})+)/i, 2);
  var s = p[0];
  var b = p[1]!=''?p[1]:'';

  s = s.replace(/-/g, ' ');
  s = s.replace(/\./g, function(m) {
      var c = b.substr(0, 2);
      b = b.substr(2);

      if('' == c)
        return m;

      return String.fromCharCode(parseInt(c, 16));
    });

  return s;
}

function processLongShouts(container)
{
  var ll = queryXPathNodeSet(container, '//a[starts-with(@href,"http://ls.em.local/")]');
  for (var i=0; i<ll.length; i++) {
    var a = ll[i];
    var h = a.href.substr("http://ls.em.local/".length);
    a.parentNode.replaceChild(document.createTextNode(decodeLongShout(h)), a);
  }
}

function resolveForumSelect(patt, text)
{
  // never ever forget escaping here...
  // these are strings, not regexp; thus, they are parsed as such: \ gets killed.
  var re = new RegExp("^("+patt+")(?:\\sIN\\s(df|csf|dl|csl))?$","i");
  var res = null,
  m;
  if(m=text.match(re)) {
    res = {forum: 'delphi-forum', match: m, found: m[1]};
    switch (m[m.length-1].toLowerCase()) {
      case 'csf': res.forum = 'c-sharp-forum'; break;
      case 'csl': res.forum = 'c-sharp-library'; break;
      case 'dl': res.forum = 'delphi-library'; break;
    }
  }
  return res;
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
  if (this.y<0) this.y = 0;
}

Point.prototype.TranslateWindow = function()
{
  this.x += window.pageXOffset;
  this.y += window.pageYOffset;
}

function addEvent(elementObject, eventName, functionObject, wantCapture)
{
  var c = isUndef(wantCapture) ? false : wantCapture;
  var func = function (evt) {
        functionObject(elementObject, evt);
      };
  if(document.addEventListener) {
    elementObject.addEventListener(eventName, func, c);
    return func;
  }
  return null;
}

function addGlobalEvent(elementObject, eventName, functionObject, wantCapture)
{
  var c = isUndef(wantCapture) ? false : wantCapture;
  var func = function (evt) {
        functionObject(elementObject, evt);
      };
  if(document.addEventListener) {
    document.body.addEventListener(eventName, func, c);
    return func;
  }
  return null;
}

function removeEvent(elementObject, eventName, functionObject, wantCapture)
{
  var c = isUndef(wantCapture) ? false : wantCapture;
  if(document.removeEventListener)
    elementObject.removeEventListener(eventName, functionObject, c);
}

function removeGlobalEvent(eventName, functionObject, wantCapture)
{
  var c = isUndef(wantCapture) ? false : wantCapture;
  if(document.removeEventListener)
    document.body.removeEventListener(eventName, functionObject, c);
}


function SettingsGenerator(table, doc)
{
  this.tbl = table;
  this.Document = doc;
}

SettingsGenerator.prototype = {
  addHeadrow: function (content, colspan)
  {
    var r = this.tbl.insertRow(-1);
    var th = document.createElement('th');
    th.colSpan = colspan;
    th.innerHTML = content;
    r.appendChild(th);
    this.tbl.zebra = false;
  },
  addSettingsRow: function (caption, innerHTML) {
    var rowClass = this.tbl.zebra ? 'row1' : 'row2';
    this.tbl.zebra = !this.tbl.zebra;

    var r = this.tbl.insertRow(-1);

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
  },
  createColorSelection: function (name,def,includeignore){
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
  },
  createTextInput: function (name,value){
    return '<input name="'+name+'" type="text" value="' + new String(value).escapeHTML(3) + '" />';
  },
  createCheckbox: function (name,checked) {
    return '<input name="'+name+'" type="checkbox"'+(checked?' checked="checked"':'')+' />';
  },
  createSelect: function (name, selected, options) {
    var op='';
    options.forEach(function(o) {
      op+='<option value="'+o[1]+'"'+(selected==o[1]?' selected="selected"':'')+'>'+o[0]+'</option>';
    });
    return '<select name="'+name+'">'+op+'</select>';
  },
  createArrayInput: function (name, arr) {
    return '<textarea name="'+name+'">'+arr.map(function(e) {return new String(e).escapeHTML(3)}).join("\n")+'</textarea>';
  },
  getBool: function(name) {
    return this.Document.getElementsByName(name)[0].checked;
  },
  getValue: function(name) {
    return this.Document.getElementsByName(name)[0].value;
  },
  getArray: function(name) {
    return this.Document.getElementsByName(name)[0].value.split("\n").map(function(e) { return e.trim() });
  }
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
      if (typeof postData=='object') {
        request.postBody = "";
        for (name in postData)
          request.postBody += name+"="+escape(postData[name])+"&";
      } else
        request.postBody = postData;

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
  AsyncRequest: function(url,postData,responseContainer,callback) {
    function readyEvent(aEvt) {
      var req = aEvt.target;
      if (req.readyState == 4) {
        if(req.status == 200) {
          if (!isUndef(callback) && typeof callback=='function'){
            if (callback.length==1) {
              if (isHTMLElement(responseContainer)) {
                responseContainer.innerHTML = req.responseText;
                callback(responseContainer);
              } else {
                callback(req.responseText);
              }
            } else {
              var tmp = document.createElement('div');
              tmp.innerHTML = req.responseText;
              callback(tmp,responseContainer);
            }
          } else {
            if (isHTMLElement(responseContainer)) {
              div.innerHTML = req.responseText;
            }
          }
        }
      }
    }
    var request = this.prepareRequest(url,postData,true);
    request.addEventListener('load',readyEvent,false);
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
    '<html>'+
    '<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />'+
    '<meta http-equiv="Content-Style-Type" content="text/css" />'+
    '<link rel="stylesheet" type="text/css" href="styles/common.css" />'+
    '<link rel="stylesheet" type="text/css" href="styles/simple_main.css" />'+
    '<link rel="stylesheet" type="text/css" href="styles/styles_others.css" />'+
    '<style type="text/css">'+"\n"+
    '<!--'+"\n"+
    'input.mainoption { background-color:#FAFAFC; font-weight:bold; }'+
    'input.liteoption { background-color:#FAFAFC; font-weight:normal; }'+
    'td.cat,td.catHead,td.catSides,td.catLeft,td.catRight,td.catBottom {'+
    '    background-image: url(../templates/subSilver/images/cellpic1.gif);'+
    '    background-color:#DBE4EB; border: #FFFFFF; border-style: solid; height: 28px;'+
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
  wnd.EM = EM;
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

document.overlayWindows = {
  _list: [],
  add: function(win) {this._list.push(win); },
  remove: function(win) {
    var oldList = this._list;
    this._list = oldList.filter(function(el) {
      return el != win;
    });
  },
  getWindowById: function(id) {
    for (var i=0; i<this._list.length; i++) {
      if (this._list[i].id==id)
        return this._list[i];
    }
    return null;
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
  this.Outer.style.cssText = 'overflow:visible; left:'+x+';top:'+y+';min-width:'+w+';min-height:'+h+';width:'+w+';height:'+h;
  this.id = id;

  console.log('Overlay Frame Window');
  this.Frame = this.createElement('div');

  console.log('Overlay Drop Shadow');
  this.Shadows = [];
  var pwn = this.Outer;
  var swtop = 0;
  if(EM.Settings.GetValue('ui', 'showDropShadow')) {
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
  document.overlayWindows.add(this);
}

OverlayWindow.prototype = {
  createElement: function (tag) {
    var e = document.createElement(tag);
    e.Window=this;
    return e;
  },

  InitWindow: function() {
    console.log('Overlay Caption Bar Window');
    this.TitleBar=this.createElement('div');
    this.Frame.insertBefore(this.TitleBar, this.ContentArea);
    this.TitleBar.style.cssText='text-align:right;background:url(../templates/subSilver/images/cellpic3.gif);padding:3px;cursor:move;';

    console.log('Overlay Caption Bar Close Button');
    this.moving = false;
    this.evmousedown = addEvent(this.TitleBar,'mousedown',function(dv,event) {
      var win = dv.Window;
      var x=event.clientX + window.scrollX;
      var y=event.clientY + window.scrollY;
      win.moving = true;
      win.mov_pr_x = x;
      win.mov_pr_y = y;
      win.left = parseInt(win.Outer.style.left,10);
      win.top = parseInt(win.Outer.style.top,10);
      win.zSort = win.BringToFront();
    });
    this.evmousemove = addGlobalEvent(this.TitleBar,'mousemove',function(dv,event) {
      var win = dv.Window;
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
    this.evmouseup = addEvent(this.TitleBar,'mouseup',function(dv,event) {
      var win = dv.Window;
      if (win.moving) {
        win.moving=false;
        //win.style.zIndex = win.zSort;
      }
    });
    this.TitleBar.closebtn=this.createElement('span');
    this.TitleBar.appendChild(this.TitleBar.closebtn);
    this.TitleBar.closebtn.innerHTML='[Fenster schlie&szlig;en]';
    this.TitleBar.closebtn.style.cssText='cursor:pointer;color:#FF9E00;font-weight:bold';
    addEvent(this.TitleBar.closebtn,'click',function(sp, ev) {  sp.Window.Close() } );
  },

  InitDropdown: function() {
    console.log('Overlay Caption Bar Window');
    this.Outer.style.zIndex=1000;

    this.evgmousedown = addGlobalEvent(this.Frame,'mousedown',function(dv,event) {
      var clicked = event.target;

      while(clicked != null) {
        if(clicked == dv)
          return;
        clicked = clicked.offsetParent;
      }
      //if we get here, someone clicked outside

      dv.Window.Close();
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

    if (this.evmousedown) removeEvent(this.TitleBar,'mousedown',this.evmousedown);
    if (this.evmousemove) removeGlobalEvent('mousemove',this.evmousemove,true);
    if (this.evmouseup) removeEvent(this.TitleBar,'mouseup',this.evmouseup)
    if (this.evgmousedown) removeGlobalEvent('mousedown',this.evgmousedown,true);

    document.overlayWindows.remove(this);
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
  EM.Settings.store_field('settings', EM.Settings.Values);
}

SettingsStore.prototype = {
  store_field: function (key, data) {
    window.setTimeout(function() {
      GM_setValue(key, uneval(data));
    }, 0);
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
    this.Values['pagehack.quickProfMenu']=true;
    this.Values['pagehack.quickSearchMenu']=true;
    this.Values['pagehack.smileyOverlay']=1;
    this.Values['pagehack.answeredLinks']=true;

    this.Values['ui.showDropShadow']=true;
    this.Values['ui.useFlatStyle']=false;
    this.Values['ui.betaFeatures']=false;
    this.Values['ui.disableShouting']=false;

    this.Values['sb.longInput']=false;
    this.Values['sb.boldUser']=false;
    this.Values['sb.anek_active']=true;
    this.Values['sb.anek_reverse']=true;
    this.Values['sb.highlight_me']=0;
    this.Values['sb.highlight_mod']=0;
    this.Values['sb.highlight_stalk']=0;
    this.Values['sb.user_stalk']=new Array();
    this.Values['sb.pnlink_active']=true;

    this.Values['topic.highlight_me']=0;
    this.Values['topic.highlight_mod']=0;
    this.Values['topic.highlight_stalk']=0;
    this.Values['topic.user_stalk']=new Array();
    this.Values['topic.user_killfile']=new Array();
    this.Values['topic.killFileType']=1;
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
    tbl.style.cssText = 'width:98%; align:center; margin:5px;';
    var sg = new SettingsGenerator(tbl, this.Window.Document);
    with (sg) {
      addHeadrow('Design',2);
      addSettingsRow('Codebl&ouml;cke als monospace anzeigen', createCheckbox('ph_mono', this.GetValue('pagehack','monospace')));
      addSettingsRow( 'Schlagschatten unter Popup-Fenstern', createCheckbox('ui_dropshadow', this.GetValue('ui','showDropShadow')));
      addSettingsRow( 'Nutze ein flacheres Layout f&uuml;r Formulare', createCheckbox('ui_flatstyle', this.GetValue('ui', 'useFlatStyle')));
      addSettingsRow( 'Maximalbreite von Bildern erzwingen', createCheckbox('ph_imgmaxwidth', this.GetValue('pagehack','imgMaxWidth')));

      addHeadrow('Ergonomie',2);
      addSettingsRow( 'Dropdown-Men&uuml; f&uuml;r Meine Ecke', createCheckbox('ph_ddmyedge', this.GetValue('pagehack','quickProfMenu')));
      addSettingsRow( 'Dropdown-Men&uuml; f&uuml;r die Suche', createCheckbox('ph_ddsearch', this.GetValue('pagehack','quickSearchMenu')));
      addSettingsRow( 'Zus&auml;tzliche Navigationslinks bei leeren Suchergebnissen', createCheckbox('ph_extsearch', this.GetValue('pagehack','extSearchPage')));
      addSettingsRow( 'Weiterleitung auf ungelesene Themen nach dem Absenden von Beiträgen', createCheckbox('ph_extpost', this.GetValue('pagehack','extPostSubmission')));
      addSettingsRow( 'Smiley-Auswahlfenster in Overlays &ouml;ffnen',
          createSelect('ph_smileyOverlay', this.GetValue('pagehack','smileyOverlay'), [
            ['Nein', 0],
            ['Ja, verschiebbar', 1],
            ['Ja, fest', 2],
          ])
          );
      addSettingsRow( '"Meine offenen Fragen" um Inline-Markieren erweitern', createCheckbox('ph_addanswered', this.GetValue('pagehack','answeredLinks')));

      addHeadrow('Entwickler',2);
      addSettingsRow( 'Zus&auml;tzliche Funktionen f&uuml;r Beta-Tester', createCheckbox('ui_betaFeatures', this.GetValue('ui','betaFeatures')));
      addSettingsRow( 'Deaktivieren des Absenden von Shouts', createCheckbox('ui_disableShouting', this.GetValue('ui','disableShouting')));

      addHeadrow('Thread-Ansicht',2);
      addSettingsRow( 'Beitr&auml;ge von mir hervorheben',
          createColorSelection('topic_highlight_me',this.GetValue('topic','highlight_me'), false)
          );
      addSettingsRow( 'Beitr&auml;ge von ausgew&auml;hlten Nutzern hervorheben<br />',
          createColorSelection('topic_highlight_stalk',this.GetValue('topic','highlight_stalk'), false)
          );
      addSettingsRow( 'Beitr&auml;ge von Moderatoren/Admins hervorheben',
          createColorSelection('topic_highlight_mod',this.GetValue('topic','highlight_mod'), false)
          );
      addSettingsRow( 'Hervorzuhebende Benutzer<br />(Ein Benutzer je Zeile)',createArrayInput('topic_user_stalk',this.GetValue('topic','user_stalk')));
      addSettingsRow( 'Benutzer ausblenden',
          createSelect('topic_killFileType', this.GetValue('topic','killFileType'), [
            ['Nein', 0],
            ['Beitrag verkleinern', 1],
            ['Minimal', 2],
          ])
          );
      addSettingsRow( 'Terrorkartei<br />(Ein Benutzer je Zeile)',createArrayInput('topic_user_killfile',this.GetValue('topic','user_killfile')));

      addHeadrow('Shoutbox',2);
      addSettingsRow( 'Eingabefeld vergr&ouml;&szlig;ern', createCheckbox('sb_longinput', this.GetValue('sb','longInput')));
      addSettingsRow( 'Shoutenden Username hervorheben', createCheckbox('sb_bolduser', this.GetValue('sb','boldUser')));
      addSettingsRow( 'Shoutbox-Anekdoter aktivieren', createCheckbox('sb_anek_start', this.GetValue('sb','anek_active')));
      addSettingsRow( 'Anekdoten oben einf&uuml;gen', createCheckbox('sb_anek_rev', this.GetValue('sb','anek_reverse')));
      addSettingsRow( 'Shouts von mir hervorheben<br />(nur mit Auto-Login)',
          createColorSelection('sb_highlight_me',this.GetValue('sb','highlight_me'), false)
          );
      addSettingsRow( 'Shouts von ausgew&auml;hlten Nutzern hervorheben<br />',
          createColorSelection('sb_highlight_stalk',this.GetValue('sb','highlight_stalk'), false)
          );
      addSettingsRow( 'Shouts von Moderatoren/Admins hervorheben',
          createColorSelection('sb_highlight_mod',this.GetValue('sb','highlight_mod'), false)
          );
      addSettingsRow( 'Hervorzuhebende Benutzer<br />(Ein Benutzer je Zeile)',createArrayInput('sb_user_stalk',this.GetValue('sb','user_stalk')));
      addSettingsRow( 'Zeige Link zum Schreiben einer PN an Benutzer',createCheckbox('sb_pnlink', this.GetValue('sb','pnlink_active')));

    }
    this.Window.OptionsTable = tbl;
    this.Window.OptionsGenerator = sg;
    this.Window.Body.appendChild(tbl);
  },

  ev_SaveDialog: function(evt) {
    with (EM.Settings.Window.OptionsGenerator) {
      EM.Settings.SetValue('pagehack','monospace', getBool('ph_mono'));
      EM.Settings.SetValue('pagehack','quickProfMenu', getBool('ph_ddmyedge'));
      EM.Settings.SetValue('pagehack','quickSearchMenu', getBool('ph_ddsearch'));
      EM.Settings.SetValue('pagehack','extSearchPage', getBool('ph_extsearch'));
      EM.Settings.SetValue('pagehack','extPostSubmission', getBool('ph_extpost'));
      EM.Settings.SetValue('pagehack','imgMaxWidth', getBool('ph_imgmaxwidth'));
      EM.Settings.SetValue('pagehack','smileyOverlay', getValue('ph_smileyOverlay'));
      EM.Settings.SetValue('pagehack','answeredLinks', getBool('ph_addanswered'));

      EM.Settings.SetValue('ui','showDropShadow', getBool('ui_dropshadow'));
      EM.Settings.SetValue('ui','useFlatStyle', getBool('ui_flatstyle'));
      EM.Settings.SetValue('ui','betaFeatures', getBool('ui_betaFeatures'));
      EM.Settings.SetValue('ui','disableShouting', getBool('ui_disableShouting'));

      EM.Settings.SetValue('sb','anek_active', getBool('sb_anek_start'));
      EM.Settings.SetValue('sb','anek_reverse', getBool('sb_anek_rev'));
      EM.Settings.SetValue('sb','highlight_me', getValue('sb_highlight_me'));
      EM.Settings.SetValue('sb','highlight_mod', getValue('sb_highlight_mod'));
      EM.Settings.SetValue('sb','highlight_stalk', getValue('sb_highlight_stalk'));
      EM.Settings.SetValue('sb','longInput', getBool('sb_longinput'));
      EM.Settings.SetValue('sb','boldUser', getBool('sb_bolduser'));
      EM.Settings.SetValue('sb','user_stalk', getArray('sb_user_stalk'));
      EM.Settings.SetValue('sb','pnlink_active', getBool('sb_pnlink'));

      EM.Settings.SetValue('topic','highlight_me', getValue('topic_highlight_me'));
      EM.Settings.SetValue('topic','highlight_mod', getValue('topic_highlight_mod'));
      EM.Settings.SetValue('topic','highlight_stalk', getValue('topic_highlight_stalk'));
      EM.Settings.SetValue('topic','user_stalk', getArray('topic_user_stalk'));
      EM.Settings.SetValue('topic','user_killfile', getArray('topic_user_killfile'));
      EM.Settings.SetValue('topic','killFileType', getArray('topic_killFileType'));
    }
    Settings_SaveToDisk();
    if (confirm('Änderungen gespeichert.\nSie werden aber erst beim nächsten Seitenaufruf wirksam. Jetzt neu laden?')){
      window.location.reload(false);
    }
    EM.Settings.Window.close();
  },

  ev_ClearAll: function(evt) {
    if (!confirm("Sollen wirklich alle Einstellungen zurückgesetzt werden?"))
      return false;
    EM.Settings.RestoreDefaults();
    Settings_SaveToDisk();
    if (confirm("Einstellugen auf Standard zurückgesetzt.\nSie werden aber erst beim nächsten Seitenaufruf wirksam. Jetzt neu laden?")) {
      window.location.reload(false);
    }
    EM.Settings.Window.close();
  },

  ev_ClearUIDCache: function(evt) {
    if (!confirm("Soll der User-Cache wirklich gelöscht werden?"))
      return false;
    EM.User.knownUIDs = {};
    EM.User.AjaxAvail = true;
    EM.Settings.store_field('uidcache', EM.User.knownUIDs);
    alert("Cache gelöscht.");
    EM.Settings.Window.close();
  },

  ev_EditSettings: function(evt) {
    var _save = this;
    window.setTimeout(function() {
      _save.LoadFromDisk();
      _save.ShowSettingsDialog();
    },0);
  },

  ShowSettingsDialog: function() {
    this.Window = new UserWindow('EdgeMonkey :: Einstellungen', 'em_wnd_settings',
            'HEIGHT=400,WIDTH=500,resizable=yes,scrollbars=yes', this.Window);
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
      c.innerHTML += '&nbsp;';
      var i = c.getElementsByTagName('input');
      addEvent(i[0], 'click', this.ev_SaveDialog);
    }
    var row = tbl.insertRow(-1);
    with (row) {
      var c = document.createElement('td');
      row.appendChild(c);
      c.colSpan = 2;
      c.className = 'catBottom';
      c.style.cssText = 'text-align:center;';
      c.innerHTML = '&nbsp;';
      c.innerHTML += '<input type="button" value="Alles zur&uuml;cksetzen" class="liteoption">';
      c.innerHTML += '&nbsp;&nbsp;';
      c.innerHTML += '<input type="button" value="User-Cache l&ouml;schen" class="liteoption">';
      c.innerHTML += '&nbsp;';
      var i = c.getElementsByTagName('input');
      addEvent(i[0], 'click', this.ev_ClearAll);
      addEvent(i[1], 'click', this.ev_ClearUIDCache);
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
  this.AjaxAvail = true;
  this.knownUIDs = EM.Settings.load_field('uidcache',this.knownUIDs);
  this.loggedOnUserId = EM.Settings.cookies['ee_data']['userid'];
  this.loggedOnSessionId = "";
  this.loggedOnUser = this.knownUIDs[-1];
  var a=document.getElementsByTagName('a');
  for (var i=0;i<a.length;i++) {
    if (a[i].href.match(/login\.php\?logout=true/) && a[i].innerHTML.match(/Logout/)) {
      this.loggedOnUser = a[i].innerHTML.match(/\((.*)\)/)[1];
      this.knownUIDs[-1] = this.loggedOnUser;
      EM.Settings.store_field('uidcache', this.knownUIDs);

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
      if (!this.AjaxAvail) return -1;
      var prof = new AJAXObject();
      prof = prof.SyncRequest('ajax_get_userid.php?username='+name, null);
      if (/<(error)>.*<\/\1>/.test(prof)) {
        this.AjaxAvail = false;
        return -1;
      }
      var id = prof.match(/<userid><!\[CDATA\[([0-9]*)\]\]><\/userid>/ );
      if (id) this.knownUIDs[name] = id[1];
      EM.Settings.store_field('uidcache', this.knownUIDs);
    }
    return this.knownUIDs[name];
  },
  getUIDByProfile: function(href) {
    return this.getUID(this.usernameFromProfile(href));
  },
  usernameFromProfile: function(href) {
    var m = href.match(/user_(.*)\.html/);
    if (m)
      return unescape(m[1]);
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
  if (EM.Settings.GetValue('sb','longInput')) {
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
      var ev = EM.Settings.GetValue('pagehack','smileyOverlay')>0?"EM.Pagehacks.SmileyWin('shoutmessage')":"window.open('posting.php?mode=sbsmilies', '_phpbbsmilies', 'HEIGHT=396,resizable=yes,scrollbars=yes,WIDTH=484')";
      with (insertCell(-1)) {
        align='center';
        innerHTML='<span class="gensmall">'+
                '<a onclick="EM.Pagehacks.SBTagify(\'shoutmessage\',\'b\'); return false;" href="#" class="gensmall" title="Bold">B</a>'+
                '<a onclick="EM.Pagehacks.SBTagify(\'shoutmessage\',\'i\'); return false;" href="#" class="gensmall" title="Italic">I</a>'+
                '<a onclick="EM.Pagehacks.SBTagify(\'shoutmessage\',\'u\'); return false;" href="#" class="gensmall" title="Underlined">U</a>'+
                '<a onclick="EM.Pagehacks.SBTagify(\'shoutmessage\',\'s\'); return false;" href="#" class="gensmall" title="Strikeout">S</a>'+
                '<a onclick="EM.Pagehacks.SBInsertURL(\'shoutmessage\'); return false;" href="#" class="gensmall" title="Link">L</a>'+
                '<a onclick="EM.Pagehacks.SBTagify(\'shoutmessage\',\'user\'); return false;" href="#" class="gensmall" title="Member">M</a>'+
                '</span>';
      }
      with (insertCell(-1)) {
        align='right';
        innerHTML='<span class="gensmall">'+
                '<a onclick="'+ev+'; return false;" href="posting.php?mode=smilies" class="gensmall" style="font-weight: bold;">Smilies</a>'+
                '</span>';
      }
    }
    with (tab.insertRow(-1)) {
      with (insertCell(-1)) {
        align='left';
        colSpan=3;
        innerHTML='<textarea class="gensmall" onchange="shoutBoxKey()" onkeydown="EM.Shouts.ev_shoutkeys(event)" onkeyup="shoutBoxKey()" name="shoutmessage"'+
                  ' id="shoutmessage" style="width:100%; font-size: 11px; height: 4em"></textarea>';
      }
    }
    with (tab.insertRow(-1)) {
      with (insertCell(-1)) {
        align='left';
            colSpan=2;
        innerHTML='<span class="gensmall"><input style="color: green;" value="150" readonly="readonly" name="shoutchars" class="charcount" id="shoutchars" type="text"> Zeichen übrig</span>';
      }
      with (insertCell(-1)) {
        align='right';
        innerHTML='<input value="Go!" name="shoutgo" class="sidebarbutton" id="shoutsubmit" type="submit" style="width: 40px">';
      }
    }
  } else {
    if(EM.Settings.GetValue('pagehack','smileyOverlay')>0) {
      this.form.getElementsByTagName('a')[0].setAttribute('onclick','EM.Pagehacks.SmileyWin("shoutmessage"); return false;');
    }
  }
  this.form_text = document.getElementById('shoutmessage');
  this.form_chars = document.getElementById('shoutchars');
  //addEvent(this.form,'submit',function() {return false });
  this.form.setAttribute('onsubmit', 'return EM.Shouts.ev_sb_post()');

  var ifr=this.get_iframe();
  var sp = document.createElement('span');
  sp.innerHTML='<a href="#" title="Kleiner" onclick="EM.Shouts.ev_resize(-50); return false;">'+
                  '<img border="0" style="border-left: 1px solid rgb(46, 95, 134); width: 7px; height: 9px;" alt="Smaller" src="./graphics/categorie_up.gif"/></a>'+
               '<a href="#" title="Gr&ouml;&szlig;er" onclick="EM.Shouts.ev_resize(+50); return false;">'+
                  '<img border="0" alt="Move category down" src="./graphics/categorie_down.gif"/></a>';
  ifr.parentNode.appendChild(sp);
  var h=EM.Settings.GetValue('sb','displayHeight');
  if (!isEmpty(h)) ifr.style.height = h+'px';

  if (this.shout_obj) {
    this.btnUpdate = document.getElementsByName('shoutrefresh')[0];
    this.btnUpdate.style.cssText+='width: 152px !important';
    this.btnUpdate.value='Aktuellste zeigen';
    this.btnUpdate.setAttribute('onclick', 'EM.Shouts.ev_sb_update()');

    this.contButtons = document.createElement('<div>');
    this.btnUpdate.parentNode.appendChild(this.contButtons);

    this.btnNewer = this.btnUpdate.cloneNode(false);
    this.btnNewer.value='<<';
    this.btnNewer.style.cssText='width: 50px';
    this.btnNewer.setAttribute('onclick', 'EM.Shouts.newer_page()');
    this.btnNewer.title='Neuere Shouts';
    this.contButtons.appendChild(this.btnNewer);

    this.edtDirect = document.createElement('input');
    this.edtDirect.className = 'post'
    this.edtDirect.style.cssText='width: 50px;margin:0 1px 0 1px; text-align:center;';
    this.edtDirect.value = 0;
    this.edtDirect.setAttribute('onchange', '');
    this.edtDirect.setAttribute('onkeydown', '');
    this.edtDirect.setAttribute('onkeyup', 'EM.Shouts.ev_sb_goto(event)');
    this.edtDirect.title='Start-Shout, Enter zum aufrufen';
    this.contButtons.appendChild(this.edtDirect);

    this.btnOlder = this.btnNewer.cloneNode(false);
    this.btnOlder.value='>>';
    this.btnOlder.title='Ältere Shouts';
    this.btnOlder.setAttribute('onclick', 'EM.Shouts.older_page()');
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
    var s = EM.Shouts.form_text.value;
    s = s.replace(/\bbenbe\b/gi, "BenBE");
    s = s.replace(/\bcih\b/g, "ich");
    s = s.replace(/\bnciht\b/g, "nicht");
    s = s.replace(/\bmrg\b/gi, ":mrgreen:");
    s = s.replace(/(?=:\w{6,7}:):m?r?g?r?e?e?n?:/gi, ":mrgreen:");
    s = s.replace(/\bmrgreen\b/gi, ":mrgreen:");
    s = s.replace(/:+mrgreen:+/gi, ":mrgreen:");
    s = s.replace(/\bFIF\b/g, "Fragen in's Forum :mahn:");
    s = s.replace(/\bSIWO\b/g, "Suche ist weiter oben :mahn:");

    //Wall-Hack
    s = s.replace(/:wall:/g, ":autsch:");

    //Check for references to the branch
    if(/http:\/\/(?:branch|trunk)\./i.test(s)) {
      //Die Idee mit der Branch-Infektion habe ich bei TUFKAPL gesehen, BenBE.
      if(!confirm("Dein Shout ist mit Branch infiziert.\nKlicke auf \"Abbrechen\", falls Du ihn heilen willst.")) {
        return false;
      }
    }

    //Wikipedia Link Support ...
    s = s.replace(/\[\[(\w\w):(\w+)\|(.*?)\]\]/gi, "[url=http://$1.wikipedia.org/wiki/$2]$3[/url]");
    s = s.replace(/\[\[(\w+)\|(.*?)\]\]/gi, "[url=http://de.wikipedia.org/wiki/$1]$2[/url]");
    s = s.replace(/\[\[(\w\w):(\w+)\]\]/gi, "[url=http://$1.wikipedia.org/wiki/$2]$2[/url]");
    s = s.replace(/\[\[(\w+)\]\]/gi, "[url=http://de.wikipedia.org/wiki/$1]$1[/url]");

    //Check for brackets in the shout (possible BBCodes
    if(/[\[\]]/i.test(s)) {
      var uncleanBBCode = false;

      //Search for inbalanced opening square brackets ...
      uncleanBBCode |= /(?:\[(?:(?!\]|$).)*(?=\[|$))|\[\]/i.test(s);

      //Search for inbalanced closing square brackets ...
      uncleanBBCode |= /(?:\](?:(?!\[|$).)*(?=\]))/i.test(s);

      //Search for improperly started tags ...
      uncleanBBCode |= /\[(?!\w|\/\w|\.{3})/i.test(s);

      if(uncleanBBCode)
      {
        if(!confirm("Dein Shout scheint mit ungültigen oder falsch geschriebenen BBCodes infiziert zu sein. \"Abbrechen\" um dies zu korrigieren.")) {
          return false;
        }
      }
    }

    //Warn if 2 capital letters are found at the beginning of a word
    if(/\b(?!(?:IPv6|CAcert)\b)[A-Z]{2}[a-z]/.test(s)) {
      if(!confirm("Dein Shout enthält ein Wort mit mehreren Großbuchstaben am Anfang. \"Abbrechen\" um dies zu korrigieren.")) {
        return false;
      }
    }

    //User-Tag-Verlinkung
    s = s.replace(/^@(GTA):/g, "[user=\"GTA-Place\"]GTA-Place[/user]:");
    s = s.replace(/^@(TUFKAPL):/g, "[user=\"Christian S.\"]TUFKAPL[/user]:");
    s = s.replace(/^@(Wolle):/g, "[user=\"Wolle92\"]Wolle92[/user]:");

    //AutoTagging
    s = s.replace(/(^|\s)([\w\\]?@(?!@))(?:(?:\{(.+?)\})(?=$|[^\}])|([\w\.\-=@\(\)\[\]\{\}äöüÄÖÜß]+[\w\-=@\(\)\[\]\{\}äöüÄÖÜß]))/g,
                  function($0,before,cmd,brace,free) {
                    var txt = free?free:brace;
                    var re;
                    if (txt=='') return '';
                    switch(cmd) {
                      case '@': return before+'[user]'+txt+'[/user]';
                      case 'G@': return before+'[url=http://www.lmgtfy.com/?q='+encodeURIComponent(txt)+']LMGTFY: '+txt+'[/url]';
                      case '\\@': return before+'[url=http://ls.em.local/'+encodeLongShout(txt)+']...[/url]';
                      case 'T@': {
                        if(re = resolveForumSelect("\\d+", txt)) {
                          return before+"[url=http://www."+re.forum+".de/viewtopic.php?t="+
                                  re.found+"]Topic "+re.found+"[/url]";
                        }
                      } break;
                      case 'P@': {
                        if(re = resolveForumSelect("\\d+", txt)) {
                          return before+"[url=http://www."+re.forum+".de/viewtopic.php?p="+
                                  re.found+"#"+re.found+"]Post "+re.found+"[/url]";
                        }
                      } break;
                      case 'F@': {
                        if(re = resolveForumSelect("\\d+", txt)) {
                          return before+"[url=http://www."+re.forum+".de/viewforum.php?f="+
                                  re.found+"]Forum "+re.found+"[/url]";
                        }
                      } break;
                      case 'S@': {
                        if(re = resolveForumSelect(".*?", txt)) {
                          console.log(re);
                          return before+"[url=http://www."+re.forum+".de/search.php?search_keywords="+
                                  encodeURIComponent(re.found)+"]"+re.found+"[/url]";
                        }
                      } break;
                    }
                    return $0;
                  });
    s = s.replace(/@@/g, '@');

    s = s.replace(/\bRFC\s?0*((?!0)\d+)\b/g, "[url=http://www.rfc-editor.org/rfc/rfc$1.txt]RFC $1[/url]");


    //Implement /me-Tags (if present) ;-)
    s = s.replace(/^\/me\s(.*)$/, "[i][user]" + EM.User.loggedOnUser + "[/user] $1[/i]");

    EM.Shouts.form_text.value = s;

    if(EM.Settings.GetValue('ui','disableShouting')) {
      return false;
    }

    return true;
  },

  ev_shoutkeys: function(evt) {
    evt = (evt) ? evt : ((event) ? event : null);
    if (evt) {
      if (evt.keyCode==32 && !isEmpty(EM.Shouts._ACIndex)) {
        var edit = EM.Shouts.form_text;
        edit.selectionEnd = edit.value.length;
        edit.selectionStart = edit.selectionEnd;
        evt.preventDefault();
        evt.cancelBubble = true;
      }
      if (evt.keyCode==9) {
        evt.preventDefault();
        evt.cancelBubble = true;
        var edit = EM.Shouts.form_text;
        var n = edit.value.substring(0,edit.selectionStart);
        if (n.charAt(0)=='@' && n.charAt(1)!='@') {
          if (isEmpty(EM.Shouts._ACIndex)) {
            n = n.substring(1,n.length);
            if (n.charAt(0)=='{') n=n.substr(1);
            var ulist = [];
            for (var i=0; i<EM.ShoutWin.shouts.length; i++) {
              u = EM.ShoutWin.shouts[i].getElementsByTagName('a')[0].firstChild.innerHTML;
              if (u != EM.User.loggedOnUser && u.substring(0,n.length).toLowerCase()==n.toLowerCase() && ulist.indexOf(u)<0)
                ulist.push(u);
            }
            EM.Shouts._ACList = ulist;
            EM.Shouts._ACIndex = -1;
          }
          EM.Shouts._ACIndex = (EM.Shouts._ACIndex + 1) % EM.Shouts._ACList.length;
          if (EM.Shouts._ACList.length>0) {
            var p = edit.selectionStart;
            edit.value='@{'+EM.Shouts._ACList[EM.Shouts._ACIndex]+'}: ';
            edit.selectionStart = p;
            edit.selectionEnd = edit.value.length;
          }
        }
      } else {
        EM.Shouts._ACIndex = null;
        EM.Shouts._ACList = null;
      }
      if (evt.keyCode== 13) {
        evt.preventDefault();
        evt.cancelBubble = true;
        if (EM.Shouts.ev_sb_post()) {
          EM.Shouts.form.submit();
        }
      }
    }
    unsafeWindow.shoutBoxKey.apply(window,arguments);
  },

  ev_resize: function(delta) {
    var ifr=this.get_iframe();
    var ch= parseInt(ifr.style.height);
    ch += delta;
    ifr.style.height=ch+'px';
    EM.Settings.SetValue('sb','displayHeight',ch);
    Settings_SaveToDisk();
  }
}

function ShoutboxAnekdoter() {
  this.Wnd = new UserWindow('EdgeMonkey :: SB-Anekdoter', 'em_wnd_sbanekdote',
            'HEIGHT=400,resizable=yes,WIDTH=500,scrollbars=yes',undefined,'<pre id="cont"></pre>');
  this.Wnd.Body.setAttribute('ununload','EM.Anekdoter.onClose()');
  this.list = new Array();
}

ShoutboxAnekdoter.prototype = {
  UpdateContent: function() {
    var cont = this.Wnd.Document.getElementById('cont');
    var sh = [].concat(this.list);  // Kopie erstellen
    if (EM.Settings.GetValue('sb','anek_reverse')) {
      sh.reverse();
    }
    cont.innerHTML='[quote="Shoutbox-Anekdote, erstellt '+new Date().toLocaleString()+':"]\n'+sh.map(function(item) {
      return '[user]'+item.user+'[/user] [color=#777777]'+item.time+'[/color]\n'+item.shout;
      }).join("\n\n")+'\n[/quote]';
  },
  convertTag: function(elem,skip) {
    var sht = elem.childNodes;
    var res = [];
    for(var i=0; i<sht.length; i++) {
      if (sht[i]==skip) continue;
      switch (sht[i].tagName) {
        case 'A': {
          var ii;
          var tmp;
          if((tmp=sht[i].href.match(/\/profile.php\?.*&u=([^&]*)/)) && tmp!=null &&
             (ii=sht[i].firstChild) && ii.alt=="user profile icon") {
            var txt=sht[i].textContent;
            var usr=tmp[1];
            if (txt==usr)
              res.push('[user]'+usr+'[/user]');
            else
              res.push('[user="'+usr+'"]'+this.convertTag(sht[i],ii)+'[/user]');
          } else if (sht[i].className=="postlink") {
            res.push('[url='+sht[i].href+']'+this.convertTag(sht[i])+'[/url]');
          } else {
            res.push(this.convertTag(sht[i]));
          }
        }; break;
        case 'SPAN': {
          var s = sht[i].style.cssText;
          var t = '';
          if (/bold/.test(s)) t='b'; else
          if (/italic/.test(s)) t='i'; else
          if (/underline/.test(s)) t='u'; else
          if (/line-through/.test(s)) t='s';
          res.push((t?'['+t+']':'')+this.convertTag(sht[i])+(t?'[/'+t+']':''));
        }; break;
        case 'IMG': res.push(sht[i].alt);break;
        default: res.push(sht[i].textContent);break;
      }
    }
    return res.join('');
  },
  Anekdote: function(item) {
    var o = {user:'',time:'',shout:''};
    o.user = item.getElementsByTagName('a')[0].firstChild.innerHTML;
    o.time = item.getElementsByTagName('span')[2].innerHTML;
    o.shout = this.convertTag(item.childNodes[1]);
    this.list.push(o);
    this.UpdateContent();
  },
  focus: function() {
    this.Wnd.Window.focus();
  },
  onClose: function(dv,ev) {
    alert('closing');
  }
}

function ShoutboxWindow() {
  var trs = document.getElementsByTagName('tr');

  var shoutclass_me = 'emctpl' + EM.Settings.GetValue('sb','highlight_me');
  var shoutclass_mod = 'emctpl' + EM.Settings.GetValue('sb','highlight_mod');
  var shoutclass_stalk = 'emctpl' + EM.Settings.GetValue('sb','highlight_stalk');

  var user_stalk = EM.Settings.GetValue('sb','user_stalk');

  var anek_active = EM.Settings.GetValue('sb','anek_active');
  var pn_link = EM.Settings.GetValue('sb','pnlink_active');
//  console.log('me: '+shoutclass_me);
//  console.log('mod: '+shoutclass_mod);

  this.shouts = new Array();
  for (var i=0; i<trs.length; i++) {
    var shout = trs[i].firstChild;
    this.shouts.push(shout);
    var a = shout.firstChild;
    if(EM.Settings.GetValue('sb','boldUser')) {
        a.style.cssText+='font-weight: bold;';
    }
    var div = document.createElement('div');
    var std = document.createElement('span');
    var shout_user = EM.User.usernameFromProfile(a.href);
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
    if (shoutclass_mod) {
      if (a.style.cssText.match(/color\:/))
        shout.className+=' ' + shoutclass_mod;
    }
    // and after this the followed\stalked users, to allow overriding the style properly
    if (shoutclass_stalk) {
      if (user_stalk.some(
        function (e){
          return e.equals(shout_user);
        }))
        shout.className+=' ' + shoutclass_stalk;
    }
    // at last the logged on user, to allow overriding the style properly
    if (shoutclass_me) {
      if (shout_user==EM.User.loggedOnUser)
        shout.className+=' ' + shoutclass_me;
    }
    std.className = 'incell left';
    div.appendChild(std);
    var cnt = document.createElement('div');
    cnt.innerHTML = shout.innerHTML;
    shout.innerHTML = '';
    processLongShouts(cnt);
    shout.insertBefore(cnt, shout.firstChild);
    shout.insertBefore(div, shout.firstChild);

    var tools = null;
    var tool_html = '';
    if(anek_active) {
      tool_html+='<a href="javascript:EM.ShoutWin.ev_anekdote('+i+')">A</a>';
    }
    if(pn_link) {
      var uid = EM.User.getUID(shout_user);
      if (uid>=0)
        tool_html+='<a href="privmsg.php?mode=post&u=' + uid + '" target="_parent">P</a>';
      else
        tool_html+='P';
    }
    if(EM.Settings.GetValue('sb','highlight_stalk')>0) {
      tool_html+='<a href="javascript:EM.ShoutWin.ev_stalk(\''+escape(shout_user)+'\')">E</a>';
    }
    if(tool_html!='') {
      tools = document.createElement('span');
      tools.className+=' incell right';
      tools.innerHTML = tool_html;
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

  ev_anekdote: function(idx) {
    if (!EM.Anekdoter || EM.Anekdoter.Wnd.Window.closed) {
      EM.Anekdoter = new ShoutboxAnekdoter();
    }
    EM.Anekdoter.Anekdote(this.shouts[idx]);
    EM.Anekdoter.focus();
  },

  ev_stalk: function(user) {
// don't really know why it gets double-escaped...
//    user = unescape(user);

    var user_list = EM.Settings.GetValue('sb','user_stalk');

    if (user_list.some(function (item) { return item.equals(user); })) {
      user_list = user_list.filter(function(el) { return !el.equals(user); });
    } else {
      user_list.push(user);
    }

    EM.Settings.SetValue('sb','user_stalk',user_list);
    Settings_SaveToDisk();
    window.location.reload();
  }
}

function SmileyWindow(target) {
  if (typeof target != "object") {
    target = document.getElementById(target);
  }

  this.Target = target;
  var pt = new Point(0,0);
  pt.CenterInWindow(440,290);
  console.log(pt);
  this.win = new OverlayWindow(pt.x,pt.y,440,290,'','em_SmileyWin');
  if(EM.Settings.GetValue('pagehack','smileyOverlay')==1) {
    this.win.InitWindow();
  } else {
    this.win.InitDropdown();
  }
  this.tab = this.win.createElement('table');
  this.win.ContentArea.appendChild(this.tab);
  this.tab.width="100%";
  this.tab.cellSpacing=0;
  this.tab.cellPadding=5;
  this.tab.border=0;
  this.addLine(
    {cmd:':D', hint:'Very Happy', ico:'biggrin'},
    {cmd:':)', hint:'Smile', ico:'smile'},
    {cmd:':(', hint:'Sad', ico:'sad'},
    {cmd:':o', hint:'Surprised', ico:'surprised'},
    {cmd:':shock:', hint:'Shocked', ico:'eek'},
    {cmd:':?', hint:'Confused', ico:'confused'},
    {cmd:'8)', hint:'Cool', ico:'cool'},
    {cmd:':lol:', hint:'Laughing', ico:'lol'}
  );
  this.addLine(
    {cmd:':x', hint:'Mad', ico:'mad'},
    {cmd:':P', hint:'Razz', ico:'razz'},
    {cmd:':oops:', hint:'Embarassed', ico:'redface'},
    {cmd:':cry:', hint:'Crying or Very sad', ico:'cry'},
    {cmd:':evil:', hint:'Evil or Very Mad', ico:'evil'},
    {cmd:':twisted:', hint:'Twisted Evil', ico:'twisted'},
    {cmd:':roll:', hint:'Rolling Eyes', ico:'rolleyes'},
    {cmd:':wink:', hint:'Wink', ico:'wink'}
  );
  this.addLine(
    {cmd:':!:', hint:'Exclamation', ico:'exclaim'},
    {cmd:':?:', hint:'Question', ico:'question'},
    {cmd:':idea:', hint:'Idea', ico:'idea'},
    {cmd:':arrow:', hint:'Arrow', ico:'arrow'},
    {cmd:':|', hint:'Neutral', ico:'neutral'},
    {cmd:':mrgreen:', hint:'Mr. Green', ico:'mrgreen'},
    {cmd:':angel:', hint:'Angel', ico:'angel'},
    {cmd:':bawling:', hint:'Bawling', ico:'bawling'}
  );
  this.addLine(
    {cmd:':beer:', hint:'Beer chug', ico:'beerchug'},
    {cmd:':?!?:', hint:'Confused', ico:'confused2'},
    {cmd:':crying:', hint:'Crying', ico:'crying'},
    {cmd:':dance:', hint:'Dance', ico:'dance2'},
    {cmd:':dance2:', hint:'Dance', ico:'dance'},
    {cmd:':dunce:', hint:'Dunce', ico:'dunce'},
    {cmd:':eyecrazy:', hint:'Eyecrazy', ico:'eyecrazy'},
    {cmd:':eyes:', hint:'Eyes', ico:'eyes'}
  );
  this.addLine(
    {cmd:':hair:', hint:'Hair', ico:'hair'},
    {cmd:':nixweiss:', hint:'Nix weiss', ico:'nixweiss'},
    {cmd:':nut:', hint:'Nuß', ico:'nut'},
    {cmd:':party:', hint:'Party', ico:'party'},
    {cmd:':puke:', hint:'Puke', ico:'puke'},
    {cmd:':rofl:', hint:'Rofl mao', ico:'roflmao'},
    {cmd:':schmoll:', hint:'Schmoll', ico:'schmoll'},
    {cmd:':think:', hint:'Think', ico:'think'}
  );
  this.addLine(
    {cmd:':tongue:', hint:'Tongue', ico:'tongue'},
    {cmd:':wave:', hint:'Wave', ico:'wave'},
    {cmd:':welcome:', hint:'Willkommen', ico:'welcome'},
    {cmd:':wink2:', hint:'Wink 2', ico:'wink2'},
    {cmd:':mahn:', hint:'Mahn', ico:'znaika'},
    {cmd:':autsch:', hint:'Autsch', ico:'autsch'},
    {cmd:':flehan:', hint:'Fleh an', ico:'flehan'},
    {cmd:':gruebel:', hint:'Grübel', ico:'gruebel'}
  );
  this.addLine(
    {cmd:':les:', hint:'Les', ico:'les'},
    {cmd:':lupe:', hint:'Lupe', ico:'lupe'},
    {cmd:':motz:', hint:'Motz', ico:'motz'},
    {cmd:':gaehn:', hint:'Gähn', ico:'gaehn'},
    {cmd:':zustimm:', hint:'Zustimmen', ico:'zustimm'},
    {cmd:':zwinker:', hint:'Zwinkern', ico:'zwinkern'}
  );
}

SmileyWindow.prototype = {
  addLine: function(smileys) {
    var tr = this.tab.insertRow(-1);
    tr.valign='middle';
    tr.align='center';
    for (var i=0; i<arguments.length; i++) {
      var sm = arguments[i];
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
  if (EM.Settings.GetValue('pagehack','monospace'))
    this.cssHacks();
  EM.Buttons.addButton('/templates/subSilver/images/folder_new_open.gif','Auf neue PNs pr&uuml;fen','EM.Pagehacks.checkPMs()','em_checkPM');
  EM.Buttons.addButton('/graphics/sitemap/search.gif','Schnellsuche','EM.Pagehacks.fastSearch()','em_fastSearch');
  this.AddCustomStyles();
  if(EM.Settings.GetValue('pagehack','extSearchPage') &&
    /\bsearch\.php\?(?:mode=results|search_id=)/.test(Location))
  {
    this.FixEmptyResults();
  }
  if(/\bsites\.php\?id=|\b(?:help(?:_.*?)?|promotion)\.html.*?,19.*$/i.test(Location)) {
    this.HelpAJAXified();
  }
  if(EM.Settings.GetValue('pagehack','extPostSubmission') &&
    /\bposting\.php/i.test(Location)) {
    this.FixPostingDialog();
  }
  if(EM.Settings.GetValue('pagehack','quickProfMenu')) {
    this.AddQuickProfileMenu();
  }
  if(EM.Settings.GetValue('pagehack','quickSearchMenu')) {
    this.AddQuickSearchMenu();
  }
  if(EM.Settings.GetValue('ui','betaFeatures')) {
    this.AddBetaLinks();
  }
  if(EM.Settings.GetValue('pagehack','smileyOverlay')>0) {
    this.AddSmileyOverlay();
  }
  if(/\bviewtopic\.php|\btopic_/.test(Location)) {
    this.HighlightPosts();
  }
  if(EM.Settings.GetValue('pagehack','answeredLinks') &&
     /\bsearch\.php\?search_id=myopen/.test(Location)) {
    this.AddAnsweredLinks();
  }
}

Pagehacks.prototype = {
  checkPMs: function() {
    var lnk = document.getElementById('em_checkPM');
    var coords = new Point(lnk.getBoundingClientRect().left, lnk.getBoundingClientRect().bottom);
    coords.TranslateWindow();
    var w = new OverlayWindow(coords.x,coords.y,400,225-30,'','em_pmcheck');
    w.InitDropdown();
    var s = Ajax.AsyncRequest('privmsg.php?mode=newpm',undefined,w.ContentArea,
      function(div) {
        var a=div.getElementsByTagName('a');
        for(i=0;i<a.length;i++) {
          if (a[i].href.match(/window\.close/)) {
            a[i].removeAttribute('href');
            a[i].style.cssText+=' cursor:pointer';
            addEvent(a[i],'click',function() {div.Window.Close(); return false;});
          } else a[i].removeAttribute('target');
        }
      });
  },

  fastSearch: function() {
    var lnk = document.getElementById('em_fastSearch');
    var coords = new Point(lnk.getBoundingClientRect().left, lnk.getBoundingClientRect().bottom);
    coords.TranslateWindow();
    var w = new OverlayWindow(coords.x,coords.y,220,145-30,'','em_searchbox');
    w.InitDropdown();
    var ee_forum = null;
    var ee_topic = null;
    var bc = queryXPathNode(EM.Buttons.navTable,'tbody/tr[2]/td[2]/div');
    if (bc) {
      var as = bc.getElementsByTagName('a');
      for(var i = 0;i<as.length; i++) {
        var m;
        if (m=as[i].href.match(/forum_(?:\D+_)?(\d+)\.html/)) ee_forum = m[1];
        if (m=as[i].href.match(/t=(\d+)\D/)) ee_topic = m[1];
      }
    }
    w.ContentArea.innerHTML = '<form action="search.php" method="post" name="sb_searchform">'+
      '<input name="search_fields" value="all" checked="checked" type="hidden">'+
      '<input name="show_results" value="topics" checked="checked" type="hidden">'+
      '<input name="synonym_search" value="1" checked="checked" type="hidden">'+
      '<div style="white-space: nowrap; margin-left: 4px;"><span class="gen" style="font-family:Verdana,Arial,Helvetica,sans-serif">Suchw&ouml;rter:</span><br><input class="post" style="width: 98%;" name="search_keywords" type="text"></div>'+
      '<div style="white-space: nowrap; margin-left: 4px; margin-top: 5px;"><span class="gen" style="font-family:Verdana,Arial,Helvetica,sans-serif">Wo soll gesucht werden?</span><br>'+
      '<select name="website" style="width: 98%;">'+
      (ee_topic?'<option value="'+ee_topic+'__">nur in diesem Thema</option>':'')+
      (ee_forum?'<option value="__'+ee_forum+'">nur in dieser Sparte</option>':'')+
      '<option value="">Entwickler-Ecke</option>'+
      '<optgroup label="Delphi"><option id="intsearch_df" value="df">Forum</option><option id="intsearch_dl" value="dl">Library</option><option id="intsearch_dfdl" value="df,dl">Forum &amp; Library</option></optgroup>'+
      '<optgroup label="C#"><option id="intsearch_csf" value="csf">Forum</option><option id="intsearch_csl" value="csl">Library</option><option id="intsearch_csfcsl" value="csf,csl">Forum &amp; Library</option></optgroup>'+
      '</select></div>'+
      '<table style="margin-top: 5px; width: 98%;" cellpadding="0" cellspacing="0">'+
      '<tr><td><input id="sidebar_search_terms_any" name="search_terms" value="any" type="radio"></td>'+
      '<td><span class="gen"><label for="sidebar_search_terms_any">ein Wort</label></span></td>'+
      '<td>&nbsp;&nbsp;<input id="sidebar_search_terms_all" name="search_terms" value="all" checked="checked" type="radio"></td>'+
      '<td><span class="gen"><label for="sidebar_search_terms_all">alle W&ouml;rter</label></span></td>'+
      '</tr></table>'+
      '<div style="white-space: nowrap; margin-left: 4px; text-align:center;">'+
      '<input class="mainoption" style="width: 40%;" value="Go!" type="submit">&nbsp;<input class="liteoption" style="width: 40%;" value="Inline!" type="button" onclick="EM.Pagehacks.ev_fastSearch(this)"></div>'+

      '</form>';
  },

  ev_fastSearch: function(inp) {
    var el =inp.form.elements;
    var post = [];
    for (var i=0; i<el.length; i++) {
      with (el[i]) {
        if (disabled) continue;
       if (tagName=='SELECT') {
          post.push(name+'='+encodeURIComponent(value)); break;
        } else
          switch(type) {
            case 'hidden':
            case 'text': post.push(name+'='+encodeURIComponent(value)); break;
            case 'radio':
            case 'check': if (checked) post.push(name+'='+encodeURIComponent(value)); break;
            case 'submit': if (isSameNode(inp)) post.push(name+'='+encodeURIComponent(value)); break;
          }
      }
    }
    post=post.join('&');

    var coo = new Point(0,0);
    coo.CenterInWindow(640,480);
    var w = new OverlayWindow(coo.x,coo.y,640,480,'','em_searchresults');
    w.InitWindow();
    w.ContentArea.innerHTML = '<table width="100%" style="height:100%" cellspacing="0" cellpadding="1" border="0"><tr><td>&nbsp;</td></tr>'+
        '<tr><td align="center"><span class="gen">Suche l&auml;uft...</span></td></tr>'+
        '<tr><td style="vertical-align:center; text-align:center"><img src="'+data.searchAnim+'" /></td></tr>'+
        '<tr><td>&nbsp;</td></tr></table>';
    w.Frame.style.height = w.Frame.style.minHeight;
    var s = Ajax.AsyncRequest(inp.form.action,post,w.ContentArea,
    //search_fields=all&show_results=topics&synonym_search=1&search_keywords=Easteregg&website=
      /search_keywords=(\x45\x61\x73\x74\x65\x72\x65\x67\x67|\x4F\x73\x74\x65\x72\x65\x69(?:er)?)\&/i.test(post) ?
      function(div,target) {
        target.style.height=(parseInt(w.Frame.style.height)-30)+'px';
        target.style.overflow='hidden';
        target.style.textAlign='center';
        target.innerHTML = '<img src="'+unescape('%68%74%74%70%3A%2F%2F%77%77%77%2E%6B%61%72%69%6B%61%74%75%72%2D%63%61%72%74%6F%6F%6E%2E%64%65%2F%62%69%6C%64%65%72%2F%62%65%6D%61%6C%74%65%5F%6F%73%74%65%72%65%69%65%72%2E%6A%70%67')+'" style="align:center;"/>';
      } :
      function(div,target) {
        target.style.height=(parseInt(w.Frame.style.height)-30)+'px';
        target.style.overflow='scroll';
        var tab = queryXPathNode(div,'table[2]');
        var err = queryXPathNode(tab,"./tbody/tr[2]/td/div/table[@class='forumline']/tbody/tr[2]/td[@class='row1']");
        if (err && err.innerHTML.match(/Keine Beitr.*?ge entsprechen Deinen Kriterien./)) {
          target.innerHTML=err.innerHTML;
        } else {
          var h = queryXPathNode(tab,"./tbody/tr[1]/td/center/a[@class='maintitle' and @id='maintitle']");
          var cc = queryXPathNode(tab,"./tbody/tr[2]/td[1]/div");
          target.innerHTML = '';
          var d = document.createElement('div');
          d.style.textAlign='center';
          d.appendChild(h);
          d.appendChild(document.createElement('br'));
          d.appendChild(document.createTextNode('Nur die erste Seite wird angezeigt.'));
          target.appendChild(d);
          target.appendChild(cc);
        }
      });
      document.overlayWindows.getWindowById('em_searchbox').Close();
   },

  SmileyWin: function(target) {
    new SmileyWindow(target);
  },

  SBTagify: function(target, tag) {
    var edit = document.getElementById(target);
    var oldStart = edit.selectionStart;
    var oldEnd = edit.selectionEnd;
    var theSelection = edit.value.substring(oldStart, oldEnd);
    edit.value =
      edit.value.substring(0, oldStart) +
      '[' + tag + ']' +
      theSelection +
      '[/' + tag + ']' +
      edit.value.substring(oldEnd, edit.value.length);
    if (oldStart == oldEnd)
    {
      edit.selectionStart = oldStart + tag.length + 2;
      edit.selectionEnd = oldStart + tag.length + 2;
    } else {
      edit.selectionStart = oldStart + theSelection.length + tag.length + 2;
      edit.selectionEnd = oldStart + theSelection.length + tag.length + 2;
    }
  },

  SBInsertURL: function(target) {
    var edit = document.getElementById(target);
    var oldStart = edit.selectionStart;
    var oldEnd = edit.selectionEnd;
    var theSelection = edit.value.substring(oldStart, oldEnd);
    var theURL = '';
    if (theSelection=='') {
      theURL=prompt('Bitte die URL eingeben:','');
      if (theURL=='' || theURL==null) return false;
      theSelection=prompt('Bitte den Link-Text eingeben:',theURL);
      if (theSelection=='' || theSelection==null) theSelection=theURL;
      theURL = theURL.replace('[','\%5B').replace(']','\%5B');
      if (theSelection==theURL) {
        edit.value =
          edit.value.substring(0, oldStart) +
          '[url]' + theSelection + '[/url]' +
          edit.value.substring(oldEnd, edit.value.length);
      } else {
        edit.value =
          edit.value.substring(0, oldStart) +
          '[url=' + theURL + ']' + theSelection + '[/url]' +
          edit.value.substring(oldEnd, edit.value.length);
      }
      edit.selectionStart = oldEnd;
      edit.selectionEnd = oldEnd;
    } else
      this.SBTagify(target, 'url');
  },

  cssHacks: function() {
    for (var s = 0; s < document.styleSheets.length; s++) {
      var rules = document.styleSheets[s].cssRules;
      for (var r = 0; r < rules.length; r++) {
        var rule = rules[r];
        if (!isUndef(rule.selectorText) && rule.selectorText.match(/pre\.sourcecode|\.code(Cell|comment|key|string|char|number|compilerdirective)|textarea\.posting_body/))
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

      if(EM.Settings.GetValue('ui', 'useFlatStyle')) {
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

      if(EM.Settings.GetValue('pagehack', 'imgMaxWidth')) {
        style.innerHTML+=
          ".postbody img {"+
          "  max-width: 80%;"+
          "}";
      }

      style.innerHTML+= ' .incell { display: table-cell}';
      style.innerHTML+= ' .incell.left{float:none;text-align:left}';
      style.innerHTML+= ' .incell.right{text-align:right;padding-right:1px;}';
      style.innerHTML+= ' .intbl { display: table; width: 100%}';
      style.innerHTML+= ' .row1.mypost { background-color: #FEF4E4}';
      style.innerHTML+= ' .row2.mypost { background-color: #FEEFD7}';
      style.innerHTML+= ' .row1.modpost { background-color: #E8FED4}';
      style.innerHTML+= ' .row2.modpost { background-color: #DBFEC4}';
      for(var i = 0; i < colorTpl.length; i++) {
        var tpl = colorTpl[i];
        style.innerHTML+= ' .row1.emctpl'+i+',.userrow1.emctpl'+i+',.butrow1.emctpl'+i+' { '+tpl.style1+' }';
        style.innerHTML+= ' .row2.emctpl'+i+',.userrow2.emctpl'+i+',.butrow2.emctpl'+i+' { '+tpl.style2+' }';
        style.innerHTML+= ' .row3.emctpl'+i+',.userrow3.emctpl'+i+',.butrow3.emctpl'+i+' { '+tpl.style3+' }';
        style.innerHTML+= ' .row4.emctpl'+i+',.userrow4.emctpl'+i+',.butrow4.emctpl'+i+' { '+tpl.style4+' }';
      }

      head.appendChild(style);
    }
  },

  SetAnswered:function(topic){
    if(!topic) return;
    var img=document.getElementById('folderFor'+topic);
    if(!img) return;
    var template=img.src.match(/(.*[\/|\\])[^\/|\\]*\.[a-zA-Z]{3,4}\b/);
    if(!template || !template[1]){
        alert('No template?');
        return;
    }
    template=template[1];
    img.src=template+'folder.gif';
    Ajax.AsyncRequest('viewtopic.php?&t='+topic,undefined,null,
      function(content) {
        var p=content.match(/markanswered.{1,6}t.(\d+).{1,6}p.(\d+)[^0-9]/);
        if(!p || !p[2]) return;
        Ajax.AsyncRequest('posting.php?mode=markanswered&t='+topic+'&p='+p[2],undefined,null,
      	  function(content) {
            img.src=template+'folder_answered.gif';
    	    var link=document.getElementById('answerLink'+topic);
	        if(link) link.parentNode.removeChild(link);
        });
      });
  },

  AddAnsweredLinks: function(){
    var table=EM.Buttons.mainTable.getElementsByClassName('forumline')[1];
    if(!table) return;
    var th=table.getElementsByTagName('th')[0];
    if(!th || !th.textContent.match(/Themen/)) return;
    var trs=table.getElementsByTagName('tr');
    for(var i=1;i<trs.length;i++){
      var img=trs[i].getElementsByTagName('img')[0];
      if(!img) continue;
      img.title='Thread auf gelöst setzen';
      var parent=img.parentNode;
      parent.removeChild(img);
      var id=img.id.match(/[^0-9](\d+)\b/);
      var a2=document.createElement('a');
      a2.appendChild(img);
      a2.setAttribute("onclick",'EM.Pagehacks.SetAnswered("'+id[1]+'");return false;');
      a2.style.cursor='pointer';
      parent.appendChild(a2);
    }
  },

  FixEmptyResults: function () {
    if (!EM.Buttons.mainTable) return;
    var sp = EM.Buttons.mainTable.getElementsByTagName('span');
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
    var sp = EM.Buttons.mainTable;
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
    td.innerHTML='<span class="gensmall"><a href="#" class="gensmall" onclick="EM.Pagehacks.DisplayHelpAJAXified()">Edgemonkey-Hilfe</a></span>';
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
    var linkText = queryXPathNode(unsafeWindow.document, "/html/body/table/tbody/tr[3]/td[2]/table/tbody/tr/td[3]/a[1]");

    if('Meine Ecke' == linkText.textContent) {
      link.setAttribute('onclick','return EM.Pagehacks.QuickProfileMenu()');
    }
  },

  AddQuickSearchMenu: function() {
    var link = queryXPathNode(unsafeWindow.document, "/html/body/table/tbody/tr[3]/td[2]/table/tbody/tr/td[7]/a[img]");
    link.setAttribute('onclick','return EM.Pagehacks.QuickSearchMenu()');
  },

  QuickProfileMenu: function() {
    var link = queryXPathNode(unsafeWindow.document, "/html/body/table/tbody/tr[3]/td[2]/table/tbody/tr/td/a[img][1]");
    var bcr = link.getBoundingClientRect();
    var coords = new Point(bcr.left, bcr.bottom+10);
    coords.TranslateWindow();

    var w = new OverlayWindow(coords.x,coords.y,328,187,'','em_QPM');
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
        "/uacp.php?u="+escape(EM.User.loggedOnUserId)+"&amp;sid="+escape(EM.User.loggedOnSessionId),
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

    var w = new OverlayWindow(coords.x,coords.y,275,241,'','em_QSM');
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
          if (p<0) loc+='?sid='+EM.User.loggedOnSessionId;
          else loc = loc.substring(0,p+1)+'sid='+EM.User.loggedOnSessionId+'&'+loc.substring(p+1,loc.length);

        }
        Lks.push(['Branch', loc]);
      }
    }
    with (/http\:\/\/(www|branch)\./i) {
      if (test(Location))
        Lks.push(['Trunk', 'http://'+window.location.host.replace(/(www|branch)/i,'trunk')+'/my.php']);
    }
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
  },

  AddSmileyOverlay: function() {
    var f = document.forms.namedItem('post');
    if (f) {
      var links = f.getElementsByTagName('a');
      for (var i=0; i<links.length; i++) {
        if (links[i].href.match(/posting\.php\?mode=smilies/)) {
          links[i].setAttribute('onclick','EM.Pagehacks.SmileyWin("message"); return false;');
        }
      }
    }
  },

  HighlightPosts: function() {
    var tbl = queryXPathNode(unsafeWindow.document, "/html/body/table[2]/tbody/tr[2]/td/div/table[1]");
    var tr = queryXPathNodeSet(tbl, "tbody/tr");

    var postclass_me = ' emctpl' + EM.Settings.GetValue('topic','highlight_me');
    var postclass_mod = ' emctpl' + EM.Settings.GetValue('topic','highlight_mod');
    var postclass_stalk = ' emctpl' + EM.Settings.GetValue('topic','highlight_stalk');

    var user_stalk = EM.Settings.GetValue('topic','user_stalk');
    var user_killfile = EM.Settings.GetValue('topic','user_killfile');
    var kftype = EM.Settings.GetValue('topic','killFileType');
    for(var i = 1; i < tr.length - 1; i += 3) {
      var tdProfile = queryXPathNode(tr[i], "td[1]");
      var tdPost = queryXPathNode(tr[i], "td[2]");
      var tdBottom = queryXPathNode(tr[i+1], "td[1]");
      var linkUser = queryXPathNode(tdProfile, "b/a[1]");
      var spanUser = queryXPathNode(linkUser, "span[1]");
      var idPost = queryXPathNode(tdProfile, "a[1]").name;
      var strUser = spanUser.textContent;

      var isSelf = strUser == EM.User.loggedOnUser;
      var isMod = /color\:/.test(linkUser.style.cssText);

      var cssClassAdd = '';

      if (kftype && user_killfile.some(
          function (e){
            return e.equals(strUser);
          })) {
        if (kftype==1) {
          var userp = queryXPathNode(tdProfile,"./span[@class='postdetails']");
          var postc = queryXPathNode(tdPost,"./div[@class='postbody']");
          userp.style.display='none';
          postc.style.display='none';
          var show = document.createElement('span');
          show.className+=' gensmall';
          show.innerHTML='Post ausgeblendet. <a href="#'+idPost+'" onclick="EM.Pagehacks.ShowHiddenPosts('+idPost+')">Anzeigen</a>';
          tdPost.insertBefore(show,postc);
        } else
        if (kftype==2) {
          tr[i].style.display='none';
          tr[i+1].style.display='none';
          var tdSpacer = queryXPathNode(tr[i+2], "td[1]");
          tdSpacer.className+=' gensmall';
          tdSpacer.innerHTML='<b>'+strUser+'</b>: Post ausgeblendet. <a href="#'+idPost+'" onclick="EM.Pagehacks.ShowHiddenPosts('+idPost+')">Anzeigen</a>';
        }
      }

      //First detect Moderators ...
      if (postclass_mod) {
        if (isMod)
          cssClassAdd += postclass_mod;
      }

      // and after this the followed\stalked users, to allow overriding the style properly
      if (postclass_stalk) {
        if (user_stalk.some(
          function (e){
            return e.equals(strUser);
          }))
          cssClassAdd += postclass_stalk;
      }

      // at last the logged on user, to allow overriding the style properly
      if (postclass_me) {
        if (isSelf)
          cssClassAdd += postclass_me;
      }

      //Now lets check against the blacklist :P
      tdProfile.className += cssClassAdd;
      tdPost.className += cssClassAdd;
      tdBottom.className += cssClassAdd;

      //Remove the DF Highlighting to ensure proper colors :P
      tdProfile.className = tdProfile.className.replace(/Highlight/, '');
      tdPost.className = tdPost.className.replace(/Highlight/, '');
      tdBottom.className = tdBottom.className.replace(/Highlight/, '');
    }

    //Leyenfilter
    var vdL = queryXPathNode(unsafeWindow.document, "//a[@id='maintitle']");
    //alert(vdL);
    if("Wortkette"==vdL.textContent) {
      var coords = new Point(0,0);
      coords.CenterInWindow(512,512);
      var w = new OverlayWindow(coords.x,coords.y,512,512,'<object data="'+data.leyenFilter+'" width="512" height="512" type="image/svg+xml"></object>','leyenFilter');
      var link = document.createElement('a');
      link.style.cssText='cursor:pointer;position:absolute;left:240px;top:460px;font-family:Verdana,Arial;font-weight:bold;color:white';
      link.innerHTML='hier';
      addEvent(link,'click',function() {w.Close(); return false;});
      w.ContentArea.appendChild(link);
      w.InitDropdown();
    }
    //Leyenfilter
  },
  ShowHiddenPosts: function(rel) {
    var trPost = queryXPathNode(unsafeWindow.document, '//a[@name='+rel+']/../..');
    var trBottom = nextNode(trPost);
    var kftype = EM.Settings.GetValue('topic','killFileType');

    if (kftype==1) {
      var userp = queryXPathNode(trPost,"./td[1]/span[@class='postdetails']");
      var postc = queryXPathNode(trPost,"./td[2]/div[@class='postbody']");
      userp.style.display='';
      postc.style.display='';
      var span = queryXPathNode(trPost,"./td[2]/span");
      span.parentNode.removeChild(span);
    } else
    if (kftype==2) {
      trBottom.style.display='';
      trPost.style.display='';
      var tdSpacer = queryXPathNode(nextNode(trBottom),"td[1]");
      tdSpacer.innerHTML='';
    }
  }
}

function upgradeSettings(){
  var upgraded = false;

  //0.18: Upgrade of boolean to number for Shout Highlighting related settings
  var chk = EM.Settings.GetValue('sb','highlight_me');
//  console.log('sb.me:'+typeof chk);
  if(parseInt(chk, 10) == NaN) {
    upgraded = true;
    EM.Settings.SetValue('sb','highlight_me', chk?2:0);
  }

  chk = EM.Settings.GetValue('sb','highlight_mod');
//  console.log('sb.mod:'+typeof chk);
  if(parseInt(chk, 10) == NaN) {
    upgraded = true;
    EM.Settings.SetValue('sb','highlight_mod', chk?3:0);
  }

  //0.19: Upgrade of boolean to number for
  var chk = EM.Settings.GetValue('pagehack','smileyOverlay');
  if(parseInt(chk, 10) == NaN) {
    upgraded = true;
    EM.Settings.SetValue('pagehack','smileyOverlay', chk?1:0);
  }

  //0.19: remove that typo quickSearhMenu
  if (EM.Settings.GetValue('pagehack','quickSearhMenu')!=null) {
    upgraded = true;
    EM.Settings.Values['pagehack.quickSearhMenu'] = undefined;
    delete EM.Settings.Values['pagehack.quickSearhMenu'];
  }

  //0.19: Upgrade of string stalk list to array
  var chk = EM.Settings.GetValue('sb','user_stalk');
  if(typeof chk == 'string') {
    upgraded = true;
    var a = chk.trim().split(/\s*,\s*/);
    EM.Settings.SetValue('sb','user_stalk', a);
  }

  //0.19: remove that typo quickSearhMenu
  if (EM.Settings.GetValue('ui','disableShouting')==null) {
    upgraded = true;
    EM.Settings.Values['ui.disableShouting'] = false;
  }

  if (upgraded) {
    Settings_SaveToDisk();
    window.setTimeout(function() {
      window.alert(
        'Die Einstellungen wurden auf ein aktualisiertes Datenformat konvertiert.\n' +
        'Ein Downgrade von EdgeMonkey kann daher zu Fehlfunktionen oder Datenverlust führen.'
      );
      window.location.reload(false);
      }, 50);
  }
}

function initEdgeApe() {
  //No upgrade from inside any popup
  if(isEmpty(window.opener) && (window.parent==window) )
  {
    upgradeSettings();
  }

  if (Location.match(/shoutbox_view.php/)) {
    if (EM.User.loggedOnUser) {
      EM.ShoutWin = new ShoutboxWindow();
    }
  }
  else
  {
    EM.Buttons = new ButtonBar();

    with(EM.Buttons) {
      addButton('/graphics/Profil-Sidebar.gif','Einstellungen','EM.Settings.ev_EditSettings()');
    }
    EM.Pagehacks = new Pagehacks();
    EM.Shouts = new ShoutboxControls();
  }
}

//check if we can access the parent or if its against SOP.
var SOP_ok = false;
try {
  SOP_ok = unsafeWindow.parent.document?true:false;
}
catch(v) {
  SOP_ok = false;
}

if (SOP_ok && !isEmpty(unsafeWindow.parent.EM)) {
  window.EM = unsafeWindow.parent.EM;
  unsafeWindow.EM = EM;
} else {
  window.EM = {};
  EM.Settings = new SettingsStore();
  EM.User = new UserManager();
  unsafeWindow.EM = EM;
}
Ajax = new AJAXObject();
Location = window.location.href;

initEdgeApe(); //Should go as soon as possible ...
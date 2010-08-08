// ==UserScript==
// @name           EdgeMonkey
// @copyright      (c)2009, Martok
// @namespace      entwickler-ecke.de
// @description    Krams fuer die Entwickler-Ecke
// @include        *.entwickler-ecke.de/*
// @include        *.c-sharp-forum.de/*
// @include        *.c-sharp-library.de/*
// @include        *.delphi-forum.de/*
// @include        *.delphi-library.de/*
// @include        *.delphiforum.de/*
// @exclude
// ==/UserScript==

const ScriptVersion = 0.2499999999999999;

// @changelog
/*
0.25-1E-16        10-08-06
  -SB: AnekdoteAll (Kha)
  -SB: more shorttags, replacer rewrite (Flamefire, BenBE, Martok)
  -add: more controls next to userlinks in thread views & search (BenBE, Flamefire)
  -add: extend links to stay in same forum/subdomain (Martok)
  -add: login dropdown (BenBE)
  -add: settings dialog autogenerate (Martok)
  -add: settings dialog with tabs (Martok)
  -add: set answered from search=myopen (BenBE, Flamefire)
  -add: PN API (Martok)
  -add: flexible caching utility (BenBE)
  -add: PN notifier (Martok)
  -add: auto updater (BenBE)
  -add: sitemap dropdown (BenBE)
  -SB: ignorelist (Martok)

0.23           10-02-01
  -SB: anekdoter w/Linkification (Martok)
  -SB: moved Topic+Post+Forum+Search Autotags to new syntax (Martok)
  -generic header css fix (BenBE)
  -Topic autoclose buttons (Flamefire, Martok, BenBE)
  -SB: active list state marked bold (BenBE)
  -add: user marking and killfile links per post (BenBE)
  -additional option for killfile action (BenBE)
  -Colourized search results / forum overview (BenBE, Martok)
  -fix: some broken XPaths (BenBE)


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
    'FuIHNvZGlwb2RpOnJvbGU9ImxpbmUiIHg9IjM4NC4wIiB5PSI2ODQuOTI1NzIiPiA8L3RzcGFuPgogICAgPC90ZXh0Pg0KICA8L2c%2BDQo8L3N2Zz4%3D',
  close:
    'data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%06%00%00%00%1F%F3%FFa%00%00%00%04gAMA%00%00%AF%C87%05%8A%E9%00%00%00%19tEXtSoftware%00Adobe%20ImageReadyq%C9e%3C%00%00%02!IDAT8%CB%95%93%EBN%13Q%14%85%89%89%C9%89%CF%A0V%89%86%C8%'+
    '91%80%C4%1BB%5B%06(%AD%0D%08%26%D0%FB%85%5E%A4%80%B4%A5%ED%A4M%A16%EA%0FM%7C%12%9F%0BD%C5%DE%B0%D2%99v%3A%D3%E5%AE%98J-%25%E1%C7N%CEd%CE%FA%F6%AC%B5%F7%0C%00%18%B8L%D5%D7B%D7%CE%3Ew_%103%3A*%DEW%EC%0Fr%D9%ED%8D%D7lNC%2F%A0-%CE%EC%A2%95%CEB%8B\'%7B%20u_%80%D'+
    '7%03a46%B6%F0%EB%E5%CA%E7%EA%E2%D2%BD%7F%80%BFb%E4%DF%A1E%A5%25D47%B7%3B%10%D9%BB%C6%A9%3B%9A%D18%90%CB%A3%7D%3E6%5B%E3%E5%19%D3%95S%40*%CDZ%09Qk%ED%BE%01%3E~%82%96%CD%B5%01h%04B%5C%F6%F89u%87%B2%1D%03%E8%BD%EC%0F%E0x%FE%B9Z%16%E6%AEvY%D0b%09%A6%BE%8E%A9%9'+
    'A%98%01%DE%7F%80%9AJ%A3%1E%0C%83%BAC%D9%8A%02%D9%BD%3F%E7%8A%C9B%E2Yvn%88%CD%C8%26k%84%D6%D5ft%87%EC%BC%05%F6%F2%24%CC%01%99%2Cd%8F%0F%959%B3Z%9E%9Ea%FD%A7p%1A%16%93%5C%5E%0DY%B2%E3%F6%01%0E7%20%A6Q%99%9D%D7JF%81%FD%7F%BF%07%209%3D%EDQ%014%0D%D8%9C%C0%8A%1'+
    'D%D8I%92o%0B%0A%13S%FCB%80%E4ps%C9%E5%81%12%8E%00I%91%84)%20Fv(%40y%D5%8E%B2%DE%88%EFc%E3%FC%5C%40%CD%EE%E2%92%D3%0D%25%B4%0E%D0%18%25%87%0B%14%96Z%9C2h\'%8B%CB%40d%03%B5%17%CB(%3C%7C%8C%C3%A1a%DE%05%A0%CD%E2%D4%1DJ%F0%15uM%40%A2O%A7%B0%D4%E2%A4%81%15%9EL%B'+
    '0%A3%F1Gj%D5d%06%82!%9CX%AC8%1A%19%C5%C1%ADA%DE%01%D0f%095%9B%03J%20%04i%D5%01%0AK-%3E%D3w%02%FB62%C6%BE%0E%DFW%7F%1A%05H%D6%05%FC%18%7D%80%FD%1B%3A%A1%CB%02m%96P%5DXB%C90%ADQX%3Di%1F%DE%1Db_%06%EF%A8g%C5%3D!%96%F4F%A1%F0t%92%F5%FB%99%0Et%B7%D9%FE%F5%9B%C2'+
    '%85c%BCl%FD%06r%BB%A4%C7%DB%ED%BE%14%00%00%00%00IEND%AEB%60%82'
}

function queryXPath(node,xpath){
    //I hate having to always type this crap ...
    var docref = (node.body)?node:node.ownerDocument;
    return docref.evaluate(xpath, node, null, XPathResult.ANY_TYPE, null);
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
  if (!isHTMLElement(node))
    return null;
  var res=node.previousSibling;
  while (res!=null && res.nodeType!=1) {
    res = res.previousSibling;
  }
  return res;
}

function nextNode(node)
{
  if (!isHTMLElement(node))
    return null;
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
  return isUndef(what) || (null==what);
}

function isHTMLElement(what)
{
  return !isEmpty(what) &&
   ((what instanceof HTMLElement) || (what.nodeType));
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

Math.sign = function(a) {
  return a>0?1:(a<0?-1:0);
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

RegExp.prototype.execAll=function(data) {
  var result = [];
  var r;
  while((r = this.exec(data))!= null) {
    result.push(r);
  }
  if (result.length)
    return result;
  else
    return null;
}

//http://jacwright.com/projects/javascript/date_format
// Simulates PHP's date function
Date.prototype.format = function(format) {
  var returnStr = '';
  var replace = {
    shortMonths: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
    longMonths: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
    shortDays: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
    longDays: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],

    // Day
    d: function() { return (this.getDate() < 10 ? '0' : '') + this.getDate(); },
    D: function() { return replace.shortDays[this.getDay()]; },
    j: function() { return this.getDate(); },
    l: function() { return replace.longDays[this.getDay()]; },
    N: function() { return this.getDay() + 1; },
    S: function() { return (this.getDate() % 10 == 1 && this.getDate() != 11 ? 'st' : (this.getDate() % 10 == 2 && this.getDate() != 12 ? 'nd' : (this.getDate() % 10 == 3 && this.getDate() != 13 ? 'rd' : 'th'))); },
    w: function() { return this.getDay(); },
    z: function() { return "Not Yet Supported"; },
    // Week
    W: function() { return "Not Yet Supported"; },
    // Month
    F: function() { return replace.longMonths[this.getMonth()]; },
    m: function() { return (this.getMonth() < 9 ? '0' : '') + (this.getMonth() + 1); },
    M: function() { return replace.shortMonths[this.getMonth()]; },
    n: function() { return this.getMonth() + 1; },
    t: function() { return "Not Yet Supported"; },
    // Year
    L: function() { return (((this.getFullYear()%4==0)&&(this.getFullYear()%100 != 0)) || (this.getFullYear()%400==0)) ? '1' : '0'; },
    o: function() { return "Not Supported"; },
    Y: function() { return this.getFullYear(); },
    y: function() { return ('' + this.getFullYear()).substr(2); },
    // Time
    a: function() { return this.getHours() < 12 ? 'am' : 'pm'; },
    A: function() { return this.getHours() < 12 ? 'AM' : 'PM'; },
    B: function() { return "Not Yet Supported"; },
    g: function() { return this.getHours() % 12 || 12; },
    G: function() { return this.getHours(); },
    h: function() { return ((this.getHours() % 12 || 12) < 10 ? '0' : '') + (this.getHours() % 12 || 12); },
    H: function() { return (this.getHours() < 10 ? '0' : '') + this.getHours(); },
    i: function() { return (this.getMinutes() < 10 ? '0' : '') + this.getMinutes(); },
    s: function() { return (this.getSeconds() < 10 ? '0' : '') + this.getSeconds(); },
    // Timezone
    e: function() { return "Not Yet Supported"; },
    I: function() { return "Not Supported"; },
    O: function() { return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() / 60)) + '00'; },
    P: function() { return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() / 60)) + ':' + (Math.abs(this.getTimezoneOffset() % 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() % 60)); },
    T: function() { var m = this.getMonth(); this.setMonth(0); var result = this.toTimeString().replace(/^.+ \(?([^\)]+)\)?$/, '$1'); this.setMonth(m); return result;},
    Z: function() { return -this.getTimezoneOffset() * 60; },
    // Full Date/Time
    c: function() { return this.format("Y-m-d") + "T" + this.format("H:i:sP"); },
    r: function() { return this.toString(); },
    U: function() { return this.getTime() / 1000; }
  };
  for (var i = 0; i < format.length; i++) {
    var curChar = format.charAt(i);
    if (replace[curChar]) {
      returnStr += replace[curChar].call(this);
    } else {
      returnStr += curChar;
    }
  }
  return returnStr;
};

//Some ISO 8601 magic from http://delete.me.uk/2005/03/iso8601.html
Date.prototype.setISO8601 = function (string) {
    var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" +
        "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?" +
        "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";
    var d = string.match(new RegExp(regexp));

    var offset = 0;
    var date = new Date(d[1], 0, 1);

    if (d[3]) { date.setMonth(d[3] - 1); }
    if (d[5]) { date.setDate(d[5]); }
    if (d[7]) { date.setHours(d[7]); }
    if (d[8]) { date.setMinutes(d[8]); }
    if (d[10]) { date.setSeconds(d[10]); }
    if (d[12]) { date.setMilliseconds(Number("0." + d[12]) * 1000); }
    if (d[14]) {
        offset = (Number(d[16]) * 60) + Number(d[17]);
        offset *= ((d[15] == '-') ? 1 : -1);
    }

    offset -= date.getTimezoneOffset();
    time = (Number(date) + (offset * 60 * 1000));
    this.setTime(Number(time));
}

Date.prototype.toISO8601String = function (format, offset) {
    /* accepted values for the format [1-6]:
     1 Year:
       YYYY (eg 1997)
     2 Year and month:
       YYYY-MM (eg 1997-07)
     3 Complete date:
       YYYY-MM-DD (eg 1997-07-16)
     4 Complete date plus hours and minutes:
       YYYY-MM-DDThh:mmTZD (eg 1997-07-16T19:20+01:00)
     5 Complete date plus hours, minutes and seconds:
       YYYY-MM-DDThh:mm:ssTZD (eg 1997-07-16T19:20:30+01:00)
     6 Complete date plus hours, minutes, seconds and a decimal
       fraction of a second
       YYYY-MM-DDThh:mm:ss.sTZD (eg 1997-07-16T19:20:30.45+01:00)
    */
    if (!format) { var format = 6; }
    if (!offset) {
        var offset = 'Z';
        var date = this;
    } else {
        var d = offset.match(/([-+])([0-9]{2}):([0-9]{2})/);
        var offsetnum = (Number(d[2]) * 60) + Number(d[3]);
        offsetnum *= ((d[1] == '-') ? -1 : 1);
        var date = new Date(Number(Number(this) + (offsetnum * 60000)));
    }

    var zeropad = function (num) { return ((num < 10) ? '0' : '') + num; }

    var str = "";
    str += date.getUTCFullYear();
    if (format > 1) { str += "-" + zeropad(date.getUTCMonth() + 1); }
    if (format > 2) { str += "-" + zeropad(date.getUTCDate()); }
    if (format > 3) {
        str += "T" + zeropad(date.getUTCHours()) +
               ":" + zeropad(date.getUTCMinutes());
    }
    if (format > 5) {
        var secs = Number(date.getUTCSeconds() + "." +
                   ((date.getUTCMilliseconds() < 100) ? '0' : '') +
                   zeropad(date.getUTCMilliseconds()));
        str += ":" + zeropad(secs);
    } else if (format > 4) { str += ":" + zeropad(date.getUTCSeconds()); }

    if (format > 3) { str += offset; }
    return str;
}

function EventQueue() {}
EventQueue.prototype= new Array();
EventQueue.prototype.fire=function(data){
  for (var i=0; i<this.length; i++) {
    if (!this[i](data))
      return false;
  }
  return true;
};

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
    if (m.length>2 && !isUndef(m[m.length-1])) {
      switch (m[m.length-1].toLowerCase()) {
        case 'csf': res.forum = 'c-sharp-forum'; break;
        case 'csl': res.forum = 'c-sharp-library'; break;
        case 'df': res.forum = 'delphi-forum'; break;
        case 'dl': res.forum = 'delphi-library'; break;
      }
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


function CacheMonkey(){
    this.data = {};

    this.load();
}

CacheMonkey.prototype = {
    load: function(){
        this.data = EM.Settings.load_field('cachemonkey',this.data);
    },

    store: function(){
        EM.Settings.store_field('cachemonkey',this.data);
    },

    checkCurrent: function(value){
        return (new Date().getTime()/1000) < (1*value.lr + 1*value.et);
    },

    clear: function(name) {
        this.data[name] = {};
        this.store();
    },

    clearAll: function() {
        this.data = {};
        this.store();
    },

    clean: function() {
        var cacheData = this.data[name];
        if(isEmpty(cacheData)) {
            return;
        }
        for(var key in cacheData) {
            var value = this.get(name, key);
            if(!value.current && (new Date().getTime()/1000) > (value.lastRefresh + 5 * value.expireTimeout)) {
                delete cacheData[key];
            }
        }
        this.data[name] = cacheData;
        this.store();
    },

    cleanAll: function(name) {
        for(var name in this.data) {
            this.clean(name);
        }
    },

    get: function(name, key) {
        var cacheData = this.data[name];
        if(isEmpty(cacheData)) {
            return {
                lastRefresh:null,
                expireTimeout:0,
                current:false,
                data:null
                };
        }
        var val = cacheData[key];
        if(isEmpty(val)) {
            return {
                lastRefresh:null,
                expireTimeout:0,
                current:false,
                data:null
                };
        }
        return {
            lastRefresh:1*val.lr,
            expireTimeout:1*val.et,
            current:this.checkCurrent(val),
            data:val.data
            };
    },

    put: function(name, key, value, timeout) {
        var cacheData = this.data[name];
        if(isEmpty(cacheData)) {
            cacheData = {};
        }
        var val = cacheData[key];
        if(isEmpty(val)) {
            val = {lr:0, et:isEmpty(timeout)?86400:1*timeout, data:null};
        } else if(!isEmpty(timeout)) {
            val.et = 1*timeout;
        }
        val.lr = new Date().getTime()/1000;
        val.data = value;
        cacheData[key] = val;
        this.data[name] = cacheData;
        this.store();
    },

    touch: function(name, key, timeout) {
        var cacheData = this.data[name];
        if(isEmpty(cacheData)) {
            cacheData = {};
        }
        var val = cacheData[key];
        if(isEmpty(val)) {
            val = {lr:0, et:isEmpty(timeout)?86400:1*timeout, data:null};
        } else if(!isEmpty(timeout)) {
        	val.et = 1*timeout;
        }
        val.lr = new Date().getTime()/1000;
        cacheData[key] = val;
        this.data[name] = cacheData;
        this.store();
    }
};

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
  addFootrow: function (content, colspan)
  {
    var r = this.tbl.insertRow(-1);
    var c = document.createElement('td');
    r.appendChild(c);
    c.colSpan = colspan;
    c.className = 'catBottom';
    c.style.cssText = 'text-align:center;';
    c.innerHTML = content;
    this.tbl.zebra = false;
    return c;
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
        if (isHTMLElement(extralinks)) {
          appendChild(extralinks);
        } else {
          innerHTML = "<span class=\"gensmall\">"+extralinks+"</span>";
        }
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
    default:  bd+=body_element.toString();
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
  },
  getTopmost: function() {
    var agg=null;
    this._list.forEach(function (curr) {
      if (!agg || (curr.Outer.style.zIndex*1>agg.Outer.style.zIndex*1)) {
        agg = curr;
      }
    });
    return agg;
  }
}

function bringToFront(obj)
{
    var top = null;
    var max_index = 0;
    top = document.overlayWindows.getTopmost();
    if (top)
      max_index = top.Outer.style.zIndex;

    obj.style.zIndex = max_index + 1;
    return max_index;
}

function OverlayWindow(x,y,w,h,content,id)
{
  //Fix Popups that open to much to the right ...
  if (x+w+10 > unsafeWindow.innerWidth - 30){
      x = unsafeWindow.innerWidth - 30 - w - 10;
  }

  this.Outer = this.createElement('div');
  this.Outer.className='overlayWin';
  this.Outer.style.cssText = 'overflow:visible; left:'+x+';top:'+y+';min-width:'+w+';min-height:'+h+';width:'+w+';height:'+h;
  this.id = id;

  this.Frame = this.createElement('div');

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

  this.ContentArea=this.createElement('div');
  this.Frame.appendChild(this.ContentArea);
  this.ContentArea.innerHTML=content;
  this.Outer.appendChild(this.Frame);

  this.BringToFront();
  this.showing=true;
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
    this.TitleBar=this.createElement('div');
    this.Frame.insertBefore(this.TitleBar, this.ContentArea);
    this.TitleBar.style.cssText='text-align:right;background:url(../templates/subSilver/images/cellpic3.gif);padding:3px;cursor:move;';

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
    this.BringToFront();

    this.evgmousedown = addGlobalEvent(this.Frame,'mousedown',function(dv,event) {
      var clicked = event.target;

      while(clicked != null) {
        if(clicked == dv)
          return;
        clicked = clicked.offsetParent;
      }
      //if we get here, someone clicked outside
      if (document.overlayWindows.getTopmost()==dv.Window) {
        dv.Window.Close();
        event.preventDefault();
      }
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
    if (this.OnClose) this.OnClose(this);
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

  this.Categories = [];

  this.AddCategory('Design',[
    this.AddSetting('Codebl&ouml;cke als monospace anzeigen','pagehack.monospace', 'bool', true),
    this.AddSetting( 'Schlagschatten unter Popup-Fenstern', 'ui.showDropShadow', 'bool', true),
    this.AddSetting( 'Nutze ein flacheres Layout f&uuml;r Formulare', 'ui.useFlatStyle', 'bool', false),
    this.AddSetting( 'Maximalbreite von Bildern erzwingen', 'pagehack.imgMaxWidth', 'bool', false),
  ]);
  this.AddCategory('Ergonomie', [
    this.AddSetting( 'Dropdown-Men&uuml; f&uuml;r Meine Ecke', 'pagehack.quickProfMenu', 'bool', true),
    this.AddSetting( 'Separates Men&uuml; f&uuml;r PNs', 'pagehack.privmenu', 'bool', false),
    this.AddSetting( 'Dropdown-Men&uuml; f&uuml;r Login', 'pagehack.quickLoginMenu', 'bool', true),
    this.AddSetting( 'Dropdown-Men&uuml; f&uuml;r die Suche', 'pagehack.quickSearchMenu', 'bool', true),
    this.AddSetting( 'Dropdown-Men&uuml; f&uuml;r die Sitemap', 'pagehack.quickSitemapMenu', 'bool', true),
    this.AddSetting( 'Weiterleitung auf ungelesene Themen nach dem Absenden von Beiträgen', 'pagehack.extPostSubmission', 'bool', true),
    this.AddSetting( 'Smiley-Auswahlfenster in Overlays &ouml;ffnen', 'pagehack.smileyOverlay',[
          ['Nein', 0],
          ['Ja, verschiebbar', 1],
          ['Ja, fest', 2],
        ], 1),
    this.AddSetting( '"Meine offenen Fragen" um Inline-Markieren erweitern', 'pagehack.answeredLinks', 'bool', true),
    this.AddSetting( 'Links auf Unterforen mit SessionID versehen', 'ui.addsid', 'bool', true),
    this.AddSetting( 'PN-Dropdown: Ungelesene unten halten', 'pageghack.pndropkeepbottom', 'bool', true),
    this.AddSetting( 'Automatisch auf neue PNs pr&uuml;fen', 'pageghack.pnautocheck',[
          ['Nein', 0],
          ['1 Minute', 1],
          ['2 Minuten', 2],
          ['3 Minuten', 3],
          ['5 Minuten', 5],
          ['10 Minuten', 10],
          ['15 Minuten', 15],
          ['30 Minuten', 30]
        ], 0)
  ]);
  this.AddCategory('Entwickler', [
    this.AddSetting( 'Zus&auml;tzliche Funktionen f&uuml;r Beta-Tester', 'ui.betaFeatures', 'bool', false),
    this.AddSetting( 'Deaktivieren des Absenden von Shouts', 'ui.disableShouting', 'bool', false),
    this.AddSetting( 'Bei ge&auml;nderten Links auf gleicher Subdomain bleiben', 'ui.addsidSubdomain', [
          ['Deaktiviert', 0],
          ['Nur aktuelle', 1],
          ['Aktuelle [Original]', 2],
          ['Original [Aktuelle]', 3],
          ['[Aktuelle] Original', 4],
          ['[Original] Aktuelle', 5],
        ], 2)
  ]);

  this.AddCategory('Such-Ansicht', [
    this.AddSetting( 'Zus&auml;tzliche Navigationslinks bei leeren Suchergebnissen', 'pagehack.extSearchPage', 'bool', false),
    this.AddSetting( 'Zus&auml;tzliche Hervorhebungen bei Suchergebnissen', 'search.moremarkup', 'bool', true)
  ]);

  this.AddCategory('Thread-Ansicht', [
    this.AddSetting( 'Buttons f&uuml;r Benutzer-Hervorhebung', 'topic.button_stalk', 'bool', true),
    this.AddSetting( 'Buttons f&uuml;r Benutzer-Ausblendung', 'topic.button_killfile', 'bool', true),
    this.AddSetting( 'Beitr&auml;ge von mir hervorheben', 'topic.highlight_me', 'color', 0),
    this.AddSetting( 'Beitr&auml;ge von ausgew&auml;hlten Nutzern hervorheben','topic.highlight_stalk', 'color', 0),
    this.AddSetting( 'Beitr&auml;ge von Moderatoren/Admins hervorheben','topic.highlight_mod', 'color', 0),
    this.AddSetting( 'Hervorzuhebende Benutzer<br />(Ein Benutzer je Zeile)','topic.user_stalk', 'list', []),
    this.AddSetting( 'Benutzer ausblenden','topic.killFileType', [
          ['Nein', 0],
          ['Beitrag verkleinern', 1],
          ['Minimal', 2],
          ['Farblich markieren', 3]
        ], 1),
    this.AddSetting( 'Terrorkartei<br />(Ein Benutzer je Zeile)','topic.user_killfile', 'list', [])
  ]);

  this.AddCategory('Shoutbox', [
    this.AddSetting( 'Eingabefeld vergr&ouml;&szlig;ern', 'sb.longInput', 'bool', false),
    this.AddSetting( 'Shoutenden Username hervorheben', 'sb.boldUser', 'bool', false),
    this.AddSetting( 'Shoutbox-Anekdoter aktivieren', 'sb.anek_active', 'bool', false),
    this.AddSetting( 'Anekdoten oben einf&uuml;gen', 'sb.anek_reverse', 'bool', true),
    this.AddSetting( 'Shouts von mir hervorheben<br />(nur mit Auto-Login)', 'sb.highlight_me', 'color', 0),
    this.AddSetting( 'Shouts von ausgew&auml;hlten Nutzern hervorheben', 'sb.highlight_stalk', 'color', 0),
    this.AddSetting( 'Shouts von Moderatoren/Admins hervorheben', 'sb.highlight_mod', 'color', 0),
    this.AddSetting( 'Hervorzuhebende Benutzer<br />(Ein Benutzer je Zeile)', 'sb.user_stalk', 'list', []),
    this.AddSetting( 'Zeige Link zum Schreiben einer PN an Benutzer', 'sb.pnlink_active', 'bool', true),
    this.AddSetting( 'Auszublendende Benutzer<br />(Ein Benutzer je Zeile)', 'sb.user_killfile', 'list', [])
  ]);

  this.AddCategory('UpdateMonkey', [
    this.AddSetting( 'Automatisches Update aktivieren', 'update.enable', 'bool', false),
    this.AddSetting( 'Art zu installierender Updates','update.update_type', [
          ['Stable Releases (Release Tags)', 0],
          ['Testing Releases (Master Branch)', 1],
          ['Unstable Releases (Custom Branch)', 2]
        ], 0, {
        onChange: function (t,w,e) {
            var src = w.getControl('update_source_repo');
            var brn = w.getControl('update_source_branch');
            src.disabled=w.getValue('update_update_type')==0;
            brn.disabled=w.getValue('update_update_type')!=2;

            if (!brn.disabled) {
              //simulate change to get elected^W^W^W load branches
              var ev = document.createEvent("HTMLEvents");
              ev.initEvent("change", true, false);
              src.dispatchEvent(ev);
            }

            if (!src.disabled || isEmpty(e)) {
              if (isEmpty(e)) {
                //initial change-> display current setting
                r=EM.Settings.GetValue('update','source_repo');
              }
              for (var i=src.options.length-1; i>=0; i--) {
                src.remove(i);
              }
              EM.Updater.updateNetwork(function(upd,network) {
                [].concat(network).sort(function (l,r) {
                  return (new Date(l.created_at))-(new Date(r.created_at));
                }).forEach(function(rep) {
                  var n=rep.owner+'#'+rep.name;
                  src.options[src.options.length]=new Option(rep.owner,n,n==r);
                });
                return false;
              });
            }
          }
        }),
    this.AddSetting( 'Quelle f&uuml;r Updates<br><a href="http://github.com/martok/edgemonkey/network">GitHub network</a>',
        'update.source_repo', [
          ['Flamefire', 'Flamefire#edgemonkey'],
          ['BenBE', 'BenBE#edgemonkey'],
          ['Kha', 'Kha#edgemonkey'],
          ['martok', 'martok#edgemonkey']
        ], 'martok#edgemonkey', {
        onChange: function (t,w,e) {
            if (w.getValue('update_update_type')!=2)
              return;
            var repo = w.getValue('update_source_repo').split('#');
            var brn = w.getControl('update_source_branch');
            var b=brn.value;
            if (isEmpty(e)) {
              //initial change-> display current setting
              b=EM.Settings.GetValue('update','source_branch');
            }
            for (var i=brn.options.length-1; i>=0; i--) {
              brn.remove(i);
            }
            EM.Updater.updateBranches(repo[0],repo[1],function(upd,branches) {
              var lst=[];
              for (var branch in branches) {
                lst.push(branch);
              }
              lst.sort().forEach(function(br) {
                brn.options[brn.options.length]=new Option(br,br,br==b);
              });
            });
          }
        }),
    this.AddSetting( 'Source Branch (Nur bei Unstable Releases)','update.source_branch', [
          ['master', 'master']
        ], 'master'),
    this.AddSetting( 'Zeit zwischen Update-Checks','update.check_every', [
          ['30 Minuten', 1800],
          ['60 Minuten', 3600],
          ['2 Stunden', 7200],
          ['3 Stunden', 10800],
          ['6 Stunden', 21600],
          ['12 Stunden', 43200],
          ['24 Stunden', 86400],
          ['7 Tage', 86400*7],
          ['14 Tage', 86400*14],
        ], 86400)
  ]);

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

  this.onSettingChanged = new EventQueue();
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

  AddCategory: function(title, settings) {
    this.Categories.push({title: title, settings: settings});
  },

  AddSetting: function(description, key, type, standard, events) {
    return {desc: description, key: key, type: type, standard: standard, events:events||{}};
  },
  RestoreDefaults: function() {
    this.Values = new Object();
    this.Categories.forEach(function(c){
      c.settings.forEach(function(s) {
        this.Values[s.key] = s.standard;
      }, this);
    }, this);
  },

  GetValue: function(sec,key) {
    return this.Values[sec+'.'+key];
  },
  SetValue: function(sec,key,val) {
    this.Values[sec+'.'+key] = val;
  },

  FillDialog: function() {
    var st = this.Window.Document.createElement('style');
    st.type='text/css';
    st.innerHTML =
    '.em-tabbar{'+
    '  background: url("../graphics/navBar.gif") repeat scroll 0 0 transparent;'+
    '  height:30px;padding:0px;padding-bottom:1px;margin:0px;width:100%;border-bottom: 2px solid #197BB5'+
    '}'+
    '.em-tabbutton {'+
    '  background-color:#EFEFF4;'+
    '  height:20px;-moz-border-radius:5px 5px 0px 0px;padding:4px 4px 3px 4px;cursor:pointer;'+
    '  white-space:nowrap;text-align:center;-moz-user-select:none;'+
    '  font-size:10px;'+
    '}';

    this.Window.Body.appendChild(st);
    var head = this.Window.Document.createElement('table');
    head.className='em-tabbar';
    this.Window.Body.appendChild(head);
    head=head.insertRow(-1);
    var firstTab = null;
    var onChanges = [];
    this.Categories.forEach(function(c){
      if(head.children.length>=4) head=head.parentNode.insertRow(-1);
      var h=head.insertCell(-1);
      h.innerHTML = c.title;
      h.className='em-tabbutton';
      if (!firstTab) firstTab=h;
      var id = 'page'+Math.ceil(Math.random()*1E6);
      var doc = this.Window.Document;
      addEvent(h, 'click', function(el) {
        var l=doc.getElementsByTagName('table');
        for (var i=1; i<l.length-1;i++) {
          l[i].style.display='none';
        }
        var l=queryXPathNodeSet(el, '//*[@class="em-tabbutton"]')
        for (var i=0; i<l.length;i++) {
          l[i].style.cssText='';
        }

        doc.getElementById(id).style.display='';
        with (el.style) {
          backgroundColor='#BDD6EA';
          border='1px solid black';
          borderBottomWidth='0';
          padding='3px';
        }
      });

      var tbl = this.Window.Document.createElement('table');
      this.Window.Body.appendChild(tbl);
      tbl.id=id;
      tbl.className = 'forumline';
      tbl.style.cssText = 'width:98%; margin:5px;display:none';
      var sg = new SettingsGenerator(tbl, this.Window.Document);
      with (sg) {
        c.settings.forEach(function(s) {
          var html;
          var nm = s.key.replace('.','_');
          switch(s.type) {
            case 'bool': html = createCheckbox(nm, this.Values[s.key]); break;
            case 'color': html = createColorSelection(nm, this.Values[s.key], false); break;
            case 'list': html = createArrayInput(nm, this.Values[s.key]); break;
            default: if (s.type instanceof Array) {
              html = createSelect(nm, this.Values[s.key], s.type);
            } else
              html='::('+s.type+')';
          };
          var e = addSettingsRow(s.desc, html);
          e = queryXPathNode(e,'./td[2]/div/*');
          var w = this.Window;
          if (s.events.onChange) {
            e.addEventListener('change',function(e) { s.events.onChange(e.target,w,e); },true);
            onChanges.push(function() {s.events.onChange(e,w,null)});
          }
          if (s.events.onExit) {
            e.addEventListener('blur',function(e) { s.events.onExit(e.target,w,e); },true);
          }
          if (s.events.onEnter) {
            e.addEventListener('focus',function(e) { s.events.onEnter(e.target,w,e); },true);
          }
        }, this);
      }
    }, this);
    var ct=4,cs=Math.floor(4/head.children.length);
    var l=head.children;
    for (var i=0; i<l.length-1;i++) {
      l[i].colSpan=cs;
      ct-=cs;
    }
    l[l.length-1].colSpan=ct;

    this.Window.Window.setTimeout(function() {
      var ev = document.createEvent("HTMLEvents");
      ev.initEvent("click", true, false);
      firstTab.firstChild.dispatchEvent(ev);
    }, 1);

    this.Window.ButtonBar = this.Window.Document.createElement('table');
    this.Window.ButtonBar.className = 'forumline';
    this.Window.ButtonBar.style.cssText = 'width:98%; margin:5px;';
    this.Window.Body.appendChild(this.Window.ButtonBar);

    onChanges.forEach(function(f) {f()});
  },

  ev_SaveDialog: function(evt) {
    var old=eval(uneval(EM.Settings.Values));
    with (EM.Settings.Window) {
      EM.Settings.Categories.forEach(function(c){
        c.settings.forEach(function(s) {
          var nm = s.key.replace('.','_');
          switch(s.type) {
            case 'bool': EM.Settings.Values[s.key] = getBool(nm); break;
            case 'color': EM.Settings.Values[s.key] = getValue(nm); break;
            case 'list': EM.Settings.Values[s.key] = getArray(nm); break;
            default: if (s.type instanceof Array) {
              EM.Settings.Values[s.key] = getValue(nm);
            }
          };
        }, this);
      }, this);
    }
    var diff={};
    for (key in old) {
      if (old[key]!=EM.Settings.Values[key]) {
        diff[key]=EM.Settings.Values[key];
      }
    }

    EM.Settings.onSettingChanged.fire({Old:old, Modified:diff});
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
    this.Window.getControl= function(name) {
      return this.Document.getElementsByName(name)[0];
    };
    this.Window.getBool= function(name) {
      return this.getControl(name).checked;
    };
    this.Window.getValue= function(name) {
      return this.getControl(name).value;
    };
    this.Window.getArray= function(name) {
      return this.getControl(name).value.split("\n").map(function(e) { return e.trim() });
    };

    this.FillDialog();
    var sg = new SettingsGenerator(this.Window.ButtonBar, this.Window.Document);
    with (sg.addFootrow('',2)) {
      innerHTML = '&nbsp;';
      innerHTML += '<input type="button" class="mainoption" value="Speichern">';
      innerHTML += '&nbsp;&nbsp;';
      innerHTML += '<input type="button" class="liteoption" onclick="window.close()" value="Schlie&szlig;en">';
      innerHTML += '&nbsp;';
      var i = getElementsByTagName('input');
      addEvent(i[0], 'click', this.ev_SaveDialog);
    }
    with (sg.addFootrow('',2)) {
      innerHTML = '&nbsp;';
      innerHTML += '<input type="button" value="Alles zur&uuml;cksetzen" class="liteoption">';
      innerHTML += '&nbsp;&nbsp;';
      innerHTML += '<input type="button" value="User-Cache l&ouml;schen" class="liteoption">';
      innerHTML += '&nbsp;';
      var i = getElementsByTagName('input');
      addEvent(i[0], 'click', this.ev_ClearAll);
      addEvent(i[1], 'click', this.ev_ClearUIDCache);
    }
    var contr = ['Martok','BenBE','Kha','Flamefire'].map(function(a) {return '<a href="/user_'+a+'.html">'+a+'</a>';});
    var ver = document.createElement('p');
    ver.className="copyright";
    ver.style.textAlign="center";
    ver.innerHTML="Edgemonkey Version "+ScriptVersion+(isUndef(EM.Updater.installed)?'':' Git Revision '+EM.Updater.installed)+
      '<br>Contributors: '+contr.join(', ')+' &amp; more'+
      '<br>Developed with git on <a href="http://github.com/martok/edgemonkey">GitHub</a>'+
      '<br><br>Der Edgemonkey distanziert sich ausdr&uuml;cklich von Fremdbananen jeglicher Art!';
    this.Window.Body.appendChild(ver);
  },

  getControl: function (name) {
    if (this.Window && !this.Window.Window.closed) {
      var nm = name.replace('.','_');
      this.Window.getControl(nm);
    }
    return null;
  }
}

function PNAPI() {
  ['inbox','outbox','sentbox','savebox'].forEach(function(b) {
    this[b]=new PNAPI.PNBox(b);
  },this);
  if (window.location.href.match(/\/privmsg.php/) &&
      !window.location.search.match(/mode=/)) {
    var box = window.location.search.match(/folder=([^&]+)/);
    box = (box&&box.length)?box[1]:'inbox';
    var start = window.location.search.match(/start=(\d+)/);
    start = (start&&start.length)?start[1]*1:0;

    console.log('PNAPI', 'Refreshing',box,'from index',start);
    var table = queryXPathNode(document, '//table[@class="overall"]/tbody/tr[2]/td/div/form/table[@class="forumline"]');
    this[box].applyTableData(start, table);
    console.log('PNAPI','Refreshing done');
  }
}

PNAPI.VAPN_Team = 0;
PNAPI.VAPN_User = 1;
PNAPI.VAPN_Post = 2;
PNAPI.VAPN_Topic = 3;
PNAPI.VAPN_Synonym = 4;
PNAPI.VAPN_BlogEntry = 5;
PNAPI.VAPN_BlogComment = 6;

PNAPI.LIFETIME = 600;

PNAPI.prototype = {
  sendPN: function(recipient, title, message) {
    if("" == EM.User.loggedOnSessionId) {
      return false;
    }
    var pndata = {
      username: recipient,
      subject: title,
      message: message,
      folder:'inbox',
      mode:'post',
      post_submit:'Absenden'
    };
    var ajax = new AJAXObject();
    var res = ajax.SyncRequest('/privmsg.php', pndata);
    return /Deine\s+Nachricht\s+wurde\s+gesendet\./.test(res);
  },
  sendVAPN: function(reftype,id,title,message) {
    if("" == EM.User.loggedOnSessionId) {
      return false;
    }
    var vapndata = {
      mode:'new',
      ref_type:reftype,
      subject: title,
      message: message,
      post_submit:'Absenden'
    };
    if(reftype != PNAPI.VAPN_Team) {
        vapndata.id = id;
    }
    var ajax = new AJAXObject();
    var res = ajax.SyncRequest('/vc.php?mode=new&ref_type='+reftype+(reftype == PNAPI.VAPN_Team?'':'&id='+id), vapndata);
    return /Nachricht\s+erfolgreich\s+gesendet!/.test(res);
  },
  getUnread: function(box,count) {
    var e = EM.PN[box];
    if (e) {
      return e.list(0,count).filter(function(a) {
        return a.unread;
      });
    }
    return null;
  }
}

PNAPI.PNBox = function (boxname) {
  this.box = boxname;
}

PNAPI.PNBox.prototype = {
  list: function(first,count) {
    var result = [];

    //check if EVERYTHING is current
    var isCurrent=true;
    var cachedResult = EM.Cache.get('pmlisting',this.box);
    if(!cachedResult.current) {
      isCurrent=false;
    } else {
      isCurrent = !(cachedResult.data.slice(first,first+count).some(function(id){
        var info = EM.Cache.get('pmlisting',id);
        return !info.current;
      },this));
    }
    if (!isCurrent) {
      //something may not be okay, refresh required part
      console.log('PNAPI', 'Need to refresh ',this.box,' range ',first,',',count);
      this.forceUpdate(first,count);
    }
    //ok, now we definitely have it in cache

    //answer from there
    var list = EM.Cache.get('pmlisting',this.box);
    list=list.data.slice(first,first+count);
    return list.map(function(id){
      var cachedResult = EM.Cache.get('pmlisting',id);
      var ms = cachedResult.data;
      return new PNAPI.PN(this.box,id,ms);
    },this);
  },
  remove: function(msgid) {

  },
  archive: function(msgid) {
    if (this.box=='savebox') {
      return false;
    }
  },
  getMessage: function(msgid) {
    var cachedResult = EM.Cache.get('pmlisting',msgid);
    if (cachedResult.data) {
      var ms = cachedResult.data;
      return new PNAPI.PN(this.box,msgid,ms);
    } else {
      return null;
    }
  },
  postDatetoJSDate: function(pd) {
    //"Mo 07.12.09<br>23:17"
    // good thing DF always returns that and ignores user settings...
    var d = pd.match(/\S+\s(\d+)\.(\d+)\.(\d+)<\S+>(\d+):(\d+)/);
    return new Date(2000+parseInt(d[3]), d[2]-1, d[1], d[4], d[5], 0).getTime()/1000;
  },
  unescapeTitle: function(t) {
    while(/&amp;|&gt;|&lt;|&quot;/.test(t) && !/[<>"]/.test(t)) {
        t = t.replace(/&quot;/g, '"');
        t = t.replace(/&lt;/g, '<');
        t = t.replace(/&gt;/g, '>');
        t = t.replace(/&amp;/g, '&');
    }
    return t;
  },
  forceUpdate: function (first,count) {
    var p0=Math.floor(first / 50);
    var p1=Math.floor((first+count-1) / 50);
    var lister = new AJAXObject();
    for (var i=p0; i<=p1;i++) {
      var start = i*50;
      var host = document.createElement('div');
      host.innerHTML = lister.SyncRequest('/privmsg.php?folder='+this.box+'&start='+start, null);
      var table = queryXPathNode(host, '/table[@class="overall"]/tbody/tr[2]/td/div/form/table[@class="forumline"]');
      this.applyTableData(start, table);
    }
  },
  applyTableData: function(index,table) {
    console.log('PNAPI', 'Importing ',this.box,' starting from ',index);
    //first, parse the new data:
    var rows = queryXPathNodeSet(table, './/tr[./td[starts-with(@id,"folderFor")]]');
    var current = [];
    if (rows && rows.length) {
      var position = index;
      rows.forEach(function(row) {
        // extract everything we may want to know later
        current.push({
          postID: queryXPathNode(row, './td[2]/span/a[2]').href.match(/p=(\d+)/)[1],
          pos: position++,
          read: !queryXPathNode(row, './td[1]//img[contains(@title,"Ungelesene Nachricht")]'),
          title: this.unescapeTitle(queryXPathNode(row, './td[2]/span/a[2]').textContent),
          postSpecial: (function(){var a=queryXPathNode(row, './td[2]/span/b'); return a?a.textContent:'';})(),
          received: queryXPathNode(row, './td[2]/span[2]').textContent.trim().substr(0,3)=='von',
          partner: queryXPathNode(row, './td[2]/span[2]/span').textContent.trim(),
          partnerID: (function(){var a=queryXPathNode(row, './td[2]/span[2]/span/a'); return a?a.href.match(/u=(\d+)/)[1]:null;})(),
          date: this.postDatetoJSDate(queryXPathNode(row,'./td[3]/span').innerHTML)
        });
      }, this);
    }
    console.log('PNAPI', 'Found ',current.length,' messages to merge');

    var list = EM.Cache.get('pmlisting',this.box);
    if (list && list.data) {
      list = list.data;
    } else {
      list = [];
    }

    var _box = this.box;
    function CD(el) {
      //reformat data for cache
      return {
        box: _box,
        received: el.received,
        partner: el.partner,
        partnerID: el.partnerID,
        date: el.date,
        read: el.read,
        title: el.title,
        special: el.postSpecial
      };
    };

    var refel = [index,0];
    while (refel[1]<current.length) {
      var i = list.indexOf(current[refel[1]].postID,refel[0]);
      if (i<0){
        list.splice(refel[0],0,current[refel[1]].postID);
      } else {
        if(i==refel[0]) {  //where it should be
          list[i] = current[refel[1]].postID;
        } else {
          if (i>refel[0]) {  //elements missing now
            list.slice(refel[0],i-refel[0]).forEach(function(id) {
              EM.Cache.touch('pmlisting',id,-1);
            });
            list.splice(refel[0],i-refel[0]);
            list[refel[0]]=current[refel[1]].postID;
          }
        }
      }
      EM.Cache.put('pmlisting',current[refel[1]].postID, CD(current[refel[1]]), PNAPI.LIFETIME);
      refel[1]++;
      refel[0]++;
    }
    EM.Cache.put('pmlisting',this.box,list,PNAPI.LIFETIME);
    console.log('PNAPI', 'Caching for',PNAPI.LIFETIME,'secs');
  }
}

PNAPI.PN = function (box,id,ms) {
  this.box = box;
  this.id = id*1;
  this.title = ms.title;
  this.unread = !ms.read;
  this.date = ms.date;
  if (ms.received) {
    this.senderID = ms.partnerID*1;
    this.sender = ms.partner;
  } else {
    this.receiverID = ms.partnerID*1;
    this.receiver = ms.partner;
  }
  if (ms.postSpecial) {
    this.flag = ms.postSpecial;
  }
}

PNAPI.PN.prototype = {
  getContent: function() {
    var cachedResult = EM.Cache.get('pmdata',this.id+',text');
    if (cachedResult.current) {
      return cachedResult.data;
    }
    var get = new AJAXObject();
    var res = get.SyncRequest('/ajax_get_message_text.php?privmsg_id='+this.id+'&folder='+this.box, null);
    var re = /\[CDATA\[([\s\S]*?)\]\]/gi;
    var data = re.execAll(res).map(function(a){ return a[1]; }).join('');
    var host = document.createElement('div');
    host.innerHTML=data;
    data=host.firstChild.innerHTML.split('<hr>')[0].trim();
    EM.Cache.put('pmdata',this.id+',text',data,1800);
    return data;
  },
  getQuoted: function() {
    var cachedResult = EM.Cache.get('pmdata',this.id+',quote');
    if (cachedResult.current) {
      return cachedResult.data;
    }
    var get = new AJAXObject();
    var host = document.createElement('div');
    host.innerHTML = get.SyncRequest('/privmsg.php?mode=quote&p='+this.id, null);
    var data=queryXPathNode(host,'//textarea[@id="message"]').innerHTML;
    EM.Cache.put('pmdata',this.id+',quote',data,1800);
    return data;
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
  this.navTable.style.cssText += "z-index: 1; position:relative;";

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
  userlinkButtonFromLink: function(doc, user, handler, place, list) {
    if(isUndef(handler)) {
      return null;
    }
    if(isUndef(user)) {
      return null;
    }
    if(isUndef(doc)) {
      return null;
    }
    if(isUndef(place)) {
      place = 'sb';
    }
    if(isUndef(list)) {
      list = 'stalk';
    }

    var list_data = EM.Settings.GetValue(place,'user_'+list);

    var a = doc.createElement('a');
    if(list.equals('stalk')) {
      a.textContent = 'E';
    } else
    if(list.equals('killfile')) {
      a.textContent = 'X';
    } else {
      a.textContent = list;
    }

    if (list_data.some(
      function (e){
        return e.equals(user);
      })) {
      a.style.cssText +='font-weight: bold;';
    }

    //Do the click handling ...
    a.href="#";
    addEvent(a, 'click', function(obj, event) { return handler(user); });

    return a;
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
  },
  ev_sbkill: function(user) {
// don't really know why it gets double-escaped...
//    user = unescape(user);

    var user_list = EM.Settings.GetValue('sb','user_killfile');

    if (user_list.some(function (item) { return item.equals(user); })) {
      user_list = user_list.filter(function(el) { return !el.equals(user); });
    } else {
      user_list.push(user);
    }

    EM.Settings.SetValue('sb','user_killfile',user_list);
    Settings_SaveToDisk();
    window.location.reload();
  },
  ev_stalk_t: function(user) {
// don't really know why it gets double-escaped...
//    user = unescape(user);

    var user_list = EM.Settings.GetValue('topic','user_stalk');

    if (user_list.some(function (item) { return item.equals(user); })) {
      user_list = user_list.filter(function(el) { return !el.equals(user); });
    } else {
      user_list.push(user);
    }

    EM.Settings.SetValue('topic','user_stalk',user_list);
    Settings_SaveToDisk();
    window.location.reload();
  },
  ev_kill: function(user) {
// don't really know why it gets double-escaped...
//    user = unescape(user);

    var user_list = EM.Settings.GetValue('topic','user_killfile');

    if (user_list.some(function (item) { return item.equals(user); })) {
      user_list = user_list.filter(function(el) { return !el.equals(user); });
    } else {
      user_list.push(user);
    }

    EM.Settings.SetValue('topic','user_killfile',user_list);
    Settings_SaveToDisk();
    window.location.reload();
  },
  usernameFromProfile: function(href) {
    var m = href.match(/user_(.*)\.html/);
    if (m)
      return unescape(m[1]);
    else
      return '';
  },

  helper_getHLStyleByUserLink: function (user_link, group) {
    if(isUndef(group)) {
      group='topic';
    }
    if (isEmpty(user_link)) {
      return '';
    }

    var postclass_me = ' emctpl' + EM.Settings.GetValue(group,'highlight_me');
    var postclass_mod = ' emctpl' + EM.Settings.GetValue(group,'highlight_mod');
    var postclass_stalk = ' emctpl' + EM.Settings.GetValue(group,'highlight_stalk');
    var postclass_kill = ' emctpl' + 8;

    var user_stalk = EM.Settings.GetValue(group,'user_stalk');
    var user_killfile = EM.Settings.GetValue('topic','user_killfile');
    var kftype = EM.Settings.GetValue('topic','killFileType');

    var user_span = queryXPathNode(user_link,"./span");
    var user_name = user_span.textContent;

    var isSelf = user_name == EM.User.loggedOnUser;
    var isMod = /color\:/.test(user_link.style.cssText);

    var cssClassAdd = '';

    if (kftype && user_killfile.some(
        function (e){
          return e.equals(user_name);
        })) {
      cssClassAdd += postclass_kill;
    }

    //First detect Moderators ...
    if (postclass_mod && isMod) {
        cssClassAdd += postclass_mod;
    }

    // and after this the followed\stalked users, to allow overriding the style properly
    if (postclass_stalk && user_stalk.some(
        function (e){
          return e.equals(user_name);
        })) {
      cssClassAdd += postclass_stalk;
    }

    // at last the logged on user, to allow overriding the style properly
    if (postclass_me && isSelf) {
      cssClassAdd += postclass_me;
    }

    return cssClassAdd;
  }

}

function Notifier() {
  var c=queryXPathNode(document,'/html/body/table/tbody/tr[3]/td[2]/table/tbody/tr/td[6]');
  if (isEmpty(c))
    return;
  previousNode(c).style.paddingRight='12px';
  c.className="overall_menu";

  this.container = document.createElement('div');
  this.container.className="intbl";
  c.appendChild(this.container);

  this.PNs = new Notifier.Field(this,'notmen_PN',
     '<img src="/graphics/PN.gif" border="0"/>',
     'PNs');
  this.PNs.setImageAction('javascript:EM.Notifier.MenuPNDropdown()');
  this.PNs.setTextAction('javascript:EM.Notifier.MenuPNDropdown()');
  if (!EM.Settings.GetValue('pagehack','privmenu')) {
    this.PNs.setWidth('0px');
  }

  this.EMStuff = new Notifier.Field(this,'notmen_EM',
     '<img src="/graphics/Group.gif" border="0"/>',
     'EM');
  this.EMStuff.setImageAction('javascript:EM.Notifier.AlertDropdown()');
  this.EMStuff.setTextAction('javascript:EM.Notifier.AlertDropdown()');
  this._alerts=[];
  this._alertID=0;
  this._updateText();
}


Notifier.prototype = {
  MenuPNDropdown: function() {
    this.PNs.setHighlight(false);
    var link = this.PNs.field;
    var bcr = link.getBoundingClientRect();
    var coords = new Point(bcr.left, bcr.bottom-5);
    coords.TranslateWindow();

    var w = new OverlayWindow(coords.x,coords.y,400,EM.Settings.GetValue('pagehack','privmenu')?187:167,'','em_QPN');
    w.InitDropdown();

    var tbl = w.CreateMenu();
    w.ContentArea.appendChild(document.createElement('div'));
    with(w.ContentArea.lastElementChild) {
      innerHTML='<div class="incell" style="vertical-align:middle;text-align:center">Lade Nachrichten....<br>'+
                '<br><img src="chrome://global/skin/icons/loading_16.png"></div>';
      className='intbl';
      with(style) {
        height='100px';
        width='100%';
      }
    }
    if (EM.Settings.GetValue('pagehack','privmenu')) {
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
    }
    var l = EM.PN.inbox.list(0,20);
    if (EM.Settings.GetValue('pageghack','pndropkeepbottom')) {
      l.sort(function(a,b) {
        if (a.unread && !b.unread) return -1;
        if (!a.unread && b.unread) return 1;
        return b.date-a.date;
      });
    }
    l.slice(0,EM.Settings.GetValue('pagehack','privmenu')?4:5).reverse().forEach(function(pn) {
      var d = new Date(1000*pn.date);
      tbl.addMenuItem(
        '/templates/subSilver/images/folder'+(pn.unread?'_new':'')+'.gif',
        '/privmsg.php?folder=inbox&amp;mode=read&amp;p='+pn.id,
        pn.title,
        '<span class="intbl">'+
          '<span class="incell left"> von '+
            (pn.senderID?'<a class="gensmall" href="profile.php?mode=viewprofile&amp;u='+pn.senderID+'">'+
             pn.sender+'</a>':pn.sender)+
            ' am '+d.format("d.m.y")+' um '+d.format("H:i")+'</span>'+
          '<span class="incell right"><a href="javascript:EM.Notifier.MenuPNView('+pn.id+')"'+
            ' id="pn_dd_'+pn.id+'">Schnellansicht...</a></span></span>');
    },this);
    w.ContentArea.removeChild(w.ContentArea.lastElementChild);
  },
  MenuPNView: function(id) {
    var link= document.getElementById('pn_dd_'+id);
    var bcr = link.parentNode.parentNode.getBoundingClientRect();
    var coords = new Point(bcr.left, bcr.bottom);
    coords.TranslateWindow();

    var w = new OverlayWindow(coords.x,coords.y,442,196,'','em_pnview');
    w.InitDropdown();
    var msg = EM.PN.inbox.getMessage(id);
    w.ContentArea.innerHTML =
     msg?
      '<div style="background-color: rgb(225, 230, 236); font-family: Verdana,Arial,Helvetica,sans-serif; margin: 5px;">'+
      '<div style="border: 1px solid rgb(190, 207, 220); padding: 2px; overflow: auto; margin-top: 4px; height: 180px;" class="postbody">'+
       '<div style="float: right; position: relative; bottom: 3px;">'+
       '<a class="gensmall" href="privmsg.php?mode=reply&amp;p='+id+'">Auf Nachricht antworten</a>'+
       '&nbsp;&nbsp;<a class="gensmall" href="privmsg.php?mode=quote&amp;p='+id+'">Nachricht zitieren</a>'+
       '</div><hr style="clear:both">'+
      msg.getContent()+
      '</div></div>':
      '<div style="background-color: rgb(225, 230, 236); font-family: Verdana,Arial,Helvetica,sans-serif; margin: 5px;">'+
      '<div style="border: 1px solid rgb(190, 207, 220); padding: 2px; overflow: auto; margin-top: 4px; height: 180px;" class="postbody">'+
      'Nachricht nicht gefunden!'+
      '</div></div>';
  },
  AlertDropdown: function() {
    this.EMStuff.setHighlight(false);
    if (!this._alerts.length)
      return;
    var link = this.EMStuff.field;
    var bcr = link.getBoundingClientRect();
    var coords = new Point(bcr.left, bcr.bottom-5);
    coords.TranslateWindow();

    var w = new OverlayWindow(coords.x,coords.y,328,187,'','em_Alerts');
    this.window = w;
    w.InitDropdown();

    var tbl = w.CreateMenu();

    [].concat(this._alerts).reverse().forEach(function(el) {
      var collhtml='<img border="0" align="top" title="ausblenden" src="./graphics/code_half.gif"'+
                   ' onclick="EM.Notifier.removeAlert('+el.id+')" style="cursor:pointer">&nbsp;';
      if (isHTMLElement(el.html)) {
        var d=document.createElement('span');
        d.className='gensmall';
        d.innerHTML=collhtml;
        d.appendChild(el.html);
        tbl.addMenuItem(el.icon, el.href, el.title, d);
      } else {
        tbl.addMenuItem(el.icon, el.href, el.title, collhtml+el.html);
      }
    },this);
    w.ContentArea.appendChild(tbl);
    w.ContentArea.style.overflow='auto';
    w.ContentArea.style.height='187px';
    var t=this;
    w.OnClose = function() {
      t.window=null;
    };
  },
  _updateText: function() {
    if (this._alerts.length) {
      this.EMStuff.setText(this._alerts.length+' Meldung'+((this._alerts.length>1)?'en':''));
      this.EMStuff.setWidth('');
    } else {
      this.EMStuff.setText('EM');
      this.EMStuff.setWidth('0px');
    }
  },
  addAlert: function(icon, title, href, html) {
    this._alerts.push({"id":++this._alertID,"icon": icon, "title":title, "href":href, "html":html});
    this._updateText();
    this.EMStuff.setHighlight(true);
    return this._alertID;
  },
  removeAlert: function(id) {
    this._alerts = this._alerts.filter(function(e) {
      return e.id!==id;
    },this);
    this._updateText();
    if (this.window) {
      this.window.Close();
      this.AlertDropdown();
    }
  }
}

Notifier.BLINKTIME=700;

Notifier.Field = function(parent,id,img,text) {
  var cnt2 = document.createElement('div');
  cnt2.id=id;
  cnt2.className="incell";
  cnt2.style.cssText='vertical-align:middle';
  parent.container.appendChild(cnt2);

  var cnt = document.createElement('div');
  cnt2.appendChild(cnt);
  cnt.style.cssText='overflow:hidden;';

  this.field = document.createElement('div');
  cnt.appendChild(this.field);
  this.field.style.cssText='display:table;padding-right:12px';

  this.field.innerHTML='<a href="" class="dfnav">'+img+'</a>';

  this.text = document.createElement('a');
  this.text.style.cssText='display:table-cell;vertical-align:middle';
  this.text.className='dfnav';
  this.field.appendChild(this.text);
  this.text.innerHTML=text;

  this._hilight=null;
}

Notifier.Field.prototype = {
  setImageAction: function(act) {
    this.field.firstChild.href=act;
  },
  setTextAction: function(act) {
    this.text.href=act;
  },
  setText: function(text) {
    this.text.innerHTML=text;
  },
  setWidth: function(w) {
    this.field.parentNode.style.width=w;
  },
  setHighlight: function(hl) {
    window.clearTimeout(this._hilight);
    this.field.firstChild.style.visibility='';
    this._hilight=null;
    if (hl) {
      var t = this;
      this._hilight = window.setTimeout(function() {
        t.field.firstChild.style.visibility=t.field.firstChild.style.visibility?'':'hidden';
        t._hilight = window.setTimeout(arguments.callee,Notifier.BLINKTIME);
      },Notifier.BLINKTIME);
    }
  }
}

function ShoutboxReplacer(){
  //suchString, Replacement, WortGrenzen, CaseSensitive
  this.replacements = new Array(
    "benbe", "BenBE",true,false,
    "cih", "ich",true,false,
    "mrg", ":mrgreen:",true,false,
    /(?=:\w{6,7}:):m?r?g?r?e?e?n?:/, ":mrgreen:",true,false,
    "mrgreen", ":mrgreen:",true,false,
    ":+mrgreen:+", ":mrgreen:",false,false,
    "FIF", "Fragen in's Forum :mahn:",true,false,
    "SIWO", "Suche ist weiter oben :mahn:",true,false,
    //Wall-Hack
    ":wall:", ":autsch:",true,false,
    //Wikipedia Link support
    /\[\[(\w\w):(\w+)\|(.*?)\]\]/, "[url=http://$1.wikipedia.org/wiki/$2]$3[/url]",true,false,
    /\[\[(\w+)\|(.*?)\]\]/, "[url=http://de.wikipedia.org/wiki/$1]$2[/url]",true,false,
    /\[\[(\w\w):(\w+)\]\]/, "[url=http://$1.wikipedia.org/wiki/$2]$2[/url]",true,false,
    /\[\[(\w+)\]\]/, "[url=http://de.wikipedia.org/wiki/$1]$1[/url]",true,false,
    /RFC\s?0*((?!0)\d+)/, "[url=http://www.rfc-editor.org/rfc/rfc$1.txt]RFC $1[/url]",true,false,
    //Implement /me-Tags ;-)
    /^\/me\s(.*)$/, "[i][user]" + EM.User.loggedOnUser + "[/user] $1[/i]",false,false,
    /^me\{(.+?)\}/, "[i][user]" + EM.User.loggedOnUser + "[/user] $1[/i]",false,false,
    //User-Tag-Verlinkung
    "@GTA", "[user=\"GTA-Place\"]GTA-Place[/user]",true,false,
    "@TUFKAPL", "[user=\"Christian S.\"]TUFKAPL[/user]",true,false,
    "@Wolle", "[user=\"Wolle92\"]Wolle92[/user]",true,false
    );
  this.fixedReplacements=this.length();
  this.allowedTextChars="\\w\\-=@\\(\\)\\[\\]\\{\\}äöüÄÖÜß";
  this.load();
}

ShoutboxReplacer.prototype = {
  regexp_toString: function (regE){
    if(regE instanceof RegExp){
      var s=regE.toString();
      s=s.substr(1,s.lastIndexOf('/')-1);
      return s;
    }else return regE;
  },

  do_replace: function (str){
    var regExp,s,replacement,sRepl;
    var reg=/(^|[^\\])(\\*)\$(\d+)(?=$|\D)/g; //RegExp to increase references
    for(var i=0;i<this.length();i++){
      replacement=this.get(i);
      if(replacement.length<4) continue;
      s=this.regexp_toString(replacement[0]);
      sRepl=replacement[1];
      if(replacement[2]){
        sRepl="$1"+sRepl.replace(reg,function (str, start, bs, digit, offset, s){
          if(bs.length % 2==1) return str;//odd count of backslashes -->escape $
          return start+bs+"$"+(digit*1+1);
        });
        var noText=this.allowedTextChars;
        noText='[^'+noText+']';
        s="(^|"+noText+")"+s+"(?=$|"+noText+")";
      }
      if(replacement[3]) regExp=new RegExp(s,"g");
      else regExp=new RegExp(s,"gi");
      for(var j=0;j<2;j++){
        str=str.replace(regExp,sRepl);
      }
    }
    //AutoTagging
    str = str.replace(/(^|\s)([\w\\]?@(?!@))(?:(?:\{(.+?)\})(?=$|[^\}])|([\w\.\-=@\(\)\[\]\{\}äöüÄÖÜß:\/]+[\w\-=@\(\[\]\{\}äöüÄÖÜß]))/g,
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
              case 'K@': {
              if(txt.indexOf('://')<0) txt='http://'+txt;
              return before+"[url="+txt+"]*klick*[/url]";
              } break;
            }
            return $0;
            });

    str = str.replace(/@@/g, '@');
    return str;
  },

  getSearchString: function (index){
    if(index<0 || index>=this.length()) return "";
    return this.regexp_toString(this.replacements[index*4]);
  },

  findSearchString: function (sSearch){
    sSearch=this.regexp_toString(sSearch);
    for(var i=0; i<this.length(); i++){
      if(this.getSearchString(i)==sSearch) return i;
    }
    return -1;
  },

  length: function (){
    return Math.floor(this.replacements.length/4);
  },

  get: function (index){
    if(index<0 || index>=this.length()) return new Array();
    index*=4;
    return this.replacements.slice(index,index+4);
  },

  add: function (sSearch,sReplace,useWordbounds,caseSensitive,doSave){
    if(isUndef(sSearch) || isUndef(sReplace)) return;
    var index=this.findSearchString(sSearch);
    if(index<0){
      //add new
      index=this.length();
    }else if(index<this.fixedReplacements) return; //Don't overwrite standart
    index*=4;
    this.replacements[index]=sSearch;
    this.replacements[index+1]=sReplace;
    this.replacements[index+2]=(useWordbounds!=false); //standart is true
    this.replacements[index+3]=(caseSensitive==true); //standart is false
    if(doSave!=false) this.save();
  },

  remove: function (sSearch){
    var index=this.findSearchString(sSearch);
    if(index>=0){
      this.replacements.splice(index*4,4);
      this.save();
    }
  },

  load: function (){
    var newEntries=EM.Settings.load_field('sb-replacements');
    if(isUndef(newEntries)) return;
    for(var i=0; i<newEntries.length-3; i+=4){
      this.add(newEntries[i],newEntries[i+1],newEntries[i+2],newEntries[i+3],false);
    }
  },

  save: function (){
    EM.Settings.store_field('sb-replacements',this.replacements);
  }
}

function ShoutboxControls() {
  this.replacer=new ShoutboxReplacer();

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
        innerHTML='<textarea class="gensmall" onchange="EM.Shouts.ev_shoutchange(event)" onkeydown="EM.Shouts.ev_shoutkeys(event)" onkeyup="EM.Shouts.ev_shoutchange(event)" name="shoutmessage"'+
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
  this.form.setAttribute('onsubmit', 'return EM.Shouts.ev_sb_post()');

  var ifr=this.get_iframe();
  var sp = document.createElement('span');
  sp.innerHTML='<a href="#" title="Kleiner" onclick="EM.Shouts.ev_resize(-50); return false;">'+
                  '<img border="0" style="border-left: 1px solid rgb(46, 95, 134); width: 7px; height: 9px;" alt="Smaller" src="./graphics/categorie_up.gif"/></a>'+
               '<a href="#" title="Gr&ouml;&szlig;er" onclick="EM.Shouts.ev_resize(+50); return false;">'+
                  '<img border="0" alt="Move category down" src="./graphics/categorie_down.gif"/></a>';
  if (EM.Settings.GetValue('sb', 'anek_active'))
    sp.innerHTML += '<a href="#" onclick="EM.ShoutWin.ev_anekdoteAll(); return false;" style="font-size: 10px; margin: 0 5px;">A</a>';
  ifr.parentNode.appendChild(sp);
  var h=EM.Settings.GetValue('sb','displayHeight');
  if (!isEmpty(h)) ifr.style.height = h+'px';

  if (this.shout_obj) {
    this.btnUpdate = document.getElementsByName('shoutrefresh')[0];
    this.btnUpdate.style.cssText+='width: 152px !important';
    this.btnUpdate.value='Aktuellste zeigen';
    this.btnUpdate.setAttribute('onclick', 'EM.Shouts.ev_sb_update()');

    this.contButtons = document.createElement('div');
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

	//replace some stuff
    s=this.replacer.do_replace(s);

    //Check for references to the branch
    if(/http:\/\/(?:branch|trunk)\./i.test(s)) {
      //Die Idee mit der Branch-Infektion habe ich bei TUFKAPL gesehen, BenBE.
      if(!confirm("Dein Shout ist mit Branch infiziert.\nKlicke auf \"Abbrechen\", falls Du ihn heilen willst.")) {
        return false;
      }
    }

    //Check for brackets in the shout (possible BBCodes
    if(/[\[\]]/i.test(s)) {
      var uncleanBBCode = false;

      //Search for inbalanced opening square brackets ...
      uncleanBBCode |= /(?:\[(?:(?!\]|$).)*(?=\[|$))|\[\]/i.test(s);

      //Search for inbalanced closing square brackets ...
      uncleanBBCode |= /(?:\](?:(?!\[|$).)*(?=\]))/i.test(s);

      //Search for improperly started tags ...
      uncleanBBCode |= /\[(?!\w|\/\w|\.{3})/i.test(s);

      if(!uncleanBBCode) {
        var open = [];
        s.replace(/(?!\[\.\.\.\])\[(\/)?(\w+)/g,
          function (m,c,t){
            var ic = undefined!=c;
            if(ic) {
              if(!open.length) {
                open.push('+');
              } else {
                uncleanBBCode |= t!=open.pop();
              }
            } else {
              open.push(t);
            }
            return m;
          });
        uncleanBBCode |= !!open.length;
      }

      //Search for improperly started tags ...
      uncleanBBCode |= /\[7\w+\]/i.test(s);

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

    EM.Shouts.form_text.value = s;

    if(EM.Settings.GetValue('ui','disableShouting')) {
      return false;
    }

    return true;
  },

  ev_shoutchange: function(evt) {
	var shout = this.form_text.value;
	shout=this.replacer.do_replace(shout);
	unsafeWindow.setShoutChars(shout, this.form_chars);
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
		this.ev_shoutchange(evt);
      }
      if (evt.keyCode== 13) {
        evt.preventDefault();
        evt.cancelBubble = true;
        if (EM.Shouts.ev_sb_post()) {
          EM.Shouts.form.submit();
        }
      }
    }
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
      return '[user]'+item.user+'[/user] [color=#777777]'+item.time+'[/color]\n'+item.shout.escapeHTML();
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
  AddAnekdote: function(item) {
    this.list.push({
      user: item.getElementsByTagName('a')[0].firstChild.innerHTML,
      time: item.getElementsByTagName('span')[2].innerHTML,
      shout: this.convertTag(item.childNodes[1])
    });
  },
  Anekdote: function(item) {
    this.AddAnekdote(item)
    this.UpdateContent();
  },
  AnekdoteAll: function(items) {
    items.forEach(this.AddAnekdote, this)
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

  var anek_active = EM.Settings.GetValue('sb','anek_active');
  var pn_link = EM.Settings.GetValue('sb','pnlink_active');

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

    shout.className += EM.User.helper_getHLStyleByUserLink(a, 'sb');

    std.className = 'incell left';
    div.appendChild(std);
    var cnt = document.createElement('div');
    cnt.innerHTML = shout.innerHTML;
    shout.innerHTML = '';
    processLongShouts(cnt);
    shout.insertBefore(cnt, shout.firstChild);
    shout.insertBefore(div, shout.firstChild);

    var user_list = EM.Settings.GetValue('sb','user_killfile');

    if (user_list.some(function (item) { return item.equals(shout_user); })) {
      cnt.style.cssText="display:none";
      a.style.cssText="padding-left:1em;color:#777777";
      (function(cnt,a) {
        addEvent(a,'click',function(d,e) {
          cnt.style.cssText="";
          a.style.paddingLeft="";
          if(EM.Settings.GetValue('sb','boldUser')) {
            a.style.fontWeight="bold";
          }
          e.preventDefault();
        });
      })(cnt,a);
    }

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
      var l_stalk = EM.User.userlinkButtonFromLink(document, shout_user, EM.User.ev_stalk, 'sb', 'stalk');
    }
    var l_kill = EM.User.userlinkButtonFromLink(document, shout_user, EM.User.ev_sbkill, 'sb', 'killfile');
    if(tool_html!='') {
      tools = document.createElement('span');
      tools.className+=' incell right';
      tools.innerHTML = tool_html;
      if(l_stalk) tools.appendChild(l_stalk);
      tools.appendChild(l_kill);
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
  EnsureWindow: function() {
    if (!EM.Anekdoter || EM.Anekdoter.Wnd.Window.closed) {
      EM.Anekdoter = new ShoutboxAnekdoter();
    }
  },
  ev_anekdote: function(idx) {
    this.EnsureWindow();
    EM.Anekdoter.Anekdote(this.shouts[idx]);
    EM.Anekdoter.focus();
  },
  ev_anekdoteAll: function() {
    this.EnsureWindow();
    var rev = this.shouts.slice(0);
    rev.reverse();
    EM.Anekdoter.AnekdoteAll(rev);
    EM.Anekdoter.focus();
  }
}

function SmileyWindow(target) {
  if (typeof target != "object") {
    target = document.getElementById(target);
  }

  this.Target = target;
  var pt = new Point(0,0);
  pt.CenterInWindow(440,290);
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
    /\bsearch\.php(\?(?:mode=results|search_id=.*|search_author=.*)|$)/.test(Location))
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
  if(EM.Settings.GetValue('pagehack','quickLoginMenu')) {
    this.AddQuickLoginMenu();
  }
  if(EM.Settings.GetValue('pagehack','quickSearchMenu')) {
    this.AddQuickSearchMenu();
  }
  if(EM.Settings.GetValue('pagehack','quickSitemapMenu')) {
    this.AddQuickSitemapMenu();
  }
  if(EM.Settings.GetValue('ui','betaFeatures')) {
    this.AddBetaLinks();
  }
  if(EM.Settings.GetValue('pagehack','smileyOverlay')>0) {
    this.AddSmileyOverlay();
  }
  if(/\bviewtopic\.php|\btopic_|posting\.php\?mode=topicreview/.test(Location)) {
    this.HighlightPosts();
  }
  if(EM.Settings.GetValue('pagehack','answeredLinks') &&
     /\bsearch\.php\?search_id=myopen/.test(Location)) {
    this.AddAnsweredLinks();
  }
  if(/\bforum_(\S+_)?\d+\.html|viewforum\.php/.test(Location)) {
    if(EM.Buttons.mainTable){
      var resTable = queryXPathNode(EM.Buttons.mainTable, "tbody/tr[2]/td[1]/div/form/table");
      this.TLColourize(resTable, "forum");
    }
  }
  if(EM.Settings.GetValue('ui','addsid')) {
    this.AddLinkSIDs();
  }
  if(1*EM.Settings.GetValue('pageghack','pnautocheck')) {
    var min = EM.Settings.GetValue('pageghack','pnautocheck');
    if(1 > 1 * min) min = 1;
    PNAPI.LIFETIME = min * 60 - 30; // 30s less => definitely expired on next regular check
    window.setInterval('EM.Pagehacks.checkPMAuto()', min * 60000);
  }
  // do a first check, regardless of when regular checks will occur (if at all)
  window.setTimeout('EM.Pagehacks.checkPMAuto()', 30*1000);
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

  checkPMAuto: function() {
    var l = EM.PN.getUnread('inbox',20);
    if (l.length) {
      var s=l.length==1?'Eine neue PN':l.length+' neue PNs';
      EM.Notifier.PNs.setText(s);
      EM.Notifier.PNs.setWidth('');
      EM.Notifier.PNs.setHighlight(true);
    }
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

  TLColourize: function (tltable, isForum) {
    if(!tltable) return;
    var entries = queryXPathNodeSet(tltable,"./tbody/tr");
    var col_ofs = (isForum)?1:0;
    var singlePostMode=false;;

    for(var i = 1; i < entries.length - col_ofs; i++) { //Skip entry 0 (table header)
      var row = entries[i];
      var cols = queryXPathNodeSet(row, './td');
      if(!cols.length) continue;

      if (cols.length<2){
        if(i==1 && cols[0].className=='catHead'){ // looks like single post mode
          singlePostMode=true;
        }
        continue;
      }else if(singlePostMode){
        var tuser_l = queryXPathNode(row,"./td[1]/span[1]/b[1]/a[1]");
      }else{
        var tuser_l = queryXPathNode(row,"./td[2]/span[2]/span[1]/a[1]");
        if (isForum) {
          var puser_l = queryXPathNode(row,"./td[5]/a[2]");
          var pcount = queryXPathNode(row,"./td[4]/div");
        } else {
          var puser_l = queryXPathNode(row,"./td[4]/span/a[2]");
          var pcount = queryXPathNode(row,"./td[3]/div/span");
        }
      }
      if(tuser_l){
        var t_cssClassAdd = EM.User.helper_getHLStyleByUserLink(tuser_l);
      }else{
        var t_cssClassAdd = "";
        tuser_l = queryXPathNode(row,"./td[2]/span[2]/span[1]");
        if(!tuser_l){
          console.log('No user link');
          continue;
        }
      }
      if(!singlePostMode){
        var p_cssClassAdd = EM.User.helper_getHLStyleByUserLink(puser_l);

        var c_cssClassAdd = '';
        if (pcount.textContent == 0) {
            c_cssClassAdd += ' emctpl' + 1; //Red
        } else if (pcount.textContent < 3) {
            c_cssClassAdd += ' emctpl' + 2; //Orange
        } else if (pcount.textContent < 10) {
            c_cssClassAdd += ' emctpl' + 3; //Yellow
        } else if (pcount.textContent < 40) {
            c_cssClassAdd += ' emctpl' + 4; //Green
        } else if (pcount.textContent < 100) {
            c_cssClassAdd += ' emctpl' + 5; //Blue
        } else if (pcount.textContent < 500) {
            c_cssClassAdd += ' emctpl' + 6; //Magenta
        } else {
            c_cssClassAdd += ' emctpl' + 7; //Lila
        }
      }

      var std_own = document.createElement('span');
      std_own.innerHTML = /Highlight/.test(cols[0].className) ? 'B' : '-';

      if(EM.Settings.GetValue('search','moremarkup')) {
        var rowfix = col_ofs?' row'+(2-i%2):'';

        //Now lets check against the blacklist :P
        cols[0].className += t_cssClassAdd;
        cols[1].className += t_cssClassAdd;

        //Remove the DF Highlighting to ensure proper colors :P
        cols[0].className = cols[0].className.replace(/Highlight/, '');
        cols[1].className = cols[1].className.replace(/Highlight/, '');

        if(singlePostMode){
          var cols2=queryXPathNodeSet(entries[i+1], './td');
          cols2[0].className += t_cssClassAdd;
          cols2[0].className = cols2[0].className.replace(/Highlight/, '');
        }else{
          if (col_ofs) cols[2].className += rowfix + t_cssClassAdd;
          cols[2+col_ofs].className += rowfix + c_cssClassAdd;
          cols[3+col_ofs].className += rowfix + p_cssClassAdd;
          if (col_ofs) cols[2].className = cols[2].className.replace(/Highlight/, '');
          cols[2+col_ofs].className = cols[2+col_ofs].className.replace(/Highlight/, '');
          cols[3+col_ofs].className = cols[3+col_ofs].className.replace(/Highlight/, '');
        }
      }

      var div = document.createElement('div');
      div.className='intbl';

      var std = document.createElement('span');
      std.className = 'gensmall incell right';

      var strUser=queryXPathNode(tuser_l, './span').textContent;

      var isSelf = tuser_l && (strUser == EM.User.loggedOnUser);

      if(singlePostMode){
        i++;
        var it_span_user = document.createElement('span');
        it_span_user.className = 'incell left';
        it_span_user.innerHTML=cols[0].innerHTML;
        cols[0].innerHTML='';
        div.appendChild(it_span_user);
        if(!isSelf){
          if(EM.Settings.GetValue('topic','button_stalk')) {
            var l_stalk = EM.User.userlinkButtonFromLink(document, strUser, EM.User.ev_stalk_t, 'topic', 'stalk');
            std.appendChild(l_stalk);
          }
          if(EM.Settings.GetValue('topic','button_killfile')) {
            var l_kill = EM.User.userlinkButtonFromLink(document, strUser, EM.User.ev_kill, 'topic', 'killfile');
            std.appendChild(l_kill);
          }
        }
      }else{
        var img = queryXPathNode(cols[0], './/img');

        var cnt = document.createElement('span');
        cnt.className = 'incell left';
        cnt.innerHTML = cols[0].innerHTML;
        cols[0].innerHTML = '';

        //Fix for a bug in TUFKAPL source
        cnt.id = cols[0].id;
        cols[0].id = '';

        div.appendChild(cnt);

        if(img && isSelf && !img.src.match(/answered/) && !img.src.match(/lock/)) {
          var topicid = img.id.match(/^folderFor(\d+)$/);
          var std_a = document.createElement('a');
          std_a.innerHTML = '&#x2714;';
          std_a.id = 'answerLink'+topicid[1];
          std_a.setAttribute("onclick",'EM.Pagehacks.SetAnswered("'+topicid[1]+'"); return false;');
          std_a.style.cssText+=' cursor:pointer;';
          std.appendChild(std_a);
        }
        var std_br = document.createElement('br');
        std.appendChild(std_br);
        std.appendChild(std_own);

        std.style.cssText+=' vertical-align:top;';
        std.style.cssText+=' min-width:1.1em;';
        std.style.cssText+=' min-height:23px;';

      }
      div.appendChild(std);

      cols[0].appendChild(div);
    }

    return true;
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
        style.innerHTML+= ' .row1.emctpl'+i+',.editrow1.emctpl'+i+',.userrow1.emctpl'+i+',.butrow1.emctpl'+i+' { '+tpl.style1+' }';
        style.innerHTML+= ' .row2.emctpl'+i+',.editrow2.emctpl'+i+',.userrow2.emctpl'+i+',.butrow2.emctpl'+i+' { '+tpl.style2+' }';
        style.innerHTML+= ' .row3.emctpl'+i+',.editrow3.emctpl'+i+',.userrow3.emctpl'+i+',.butrow3.emctpl'+i+' { '+tpl.style3+' }';
        style.innerHTML+= ' .row4.emctpl'+i+',.editrow4.emctpl'+i+',.userrow4.emctpl'+i+',.butrow4.emctpl'+i+' { '+tpl.style4+' }';
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
    if (!EM.Buttons.mainTable) return;
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
    var noresult = false;
    for (var i=0; i<sp.length; i++) {
      if (sp[i].textContent.match( /Keine Beitr.*?ge entsprechen Deinen Kriterien./ )) {
        sp[i].innerHTML+='<br><br><a href="javascript:history.go(-1)">Zur&uuml;ck zum Suchformular</a>';
        sp[i].innerHTML+='<br><br><a href="/index.php">Zur&uuml;ck zum Index</a>';
        noresult = true;
        break;
      }
    }
    if(noresult) return;

    //TLColourize hack:
    var resTable = queryXPathNode(EM.Buttons.mainTable, "tbody/tr[2]/td/div/table[2]");
    this.TLColourize(resTable);
  },

  FixPostingDialog: function () {
    //Get the Content Main Table
    var sp = EM.Buttons.mainTable;

    if(isUndef(sp) || null == sp) {
      return;
    }

    //Get the Information Table
    sp = queryXPathNode(sp, "tbody/tr[2]/td/div/table");
    if(isUndef(t) || null == t) {
      return;
    }

    var t = queryXPathNode(sp, "tbody/tr[1]/th/b");
    if(isUndef(t) || null == t) {
      return;
    }

    if(t.textContent != "Information") {
      return;
    }

    //Get the Information Span with all those links ...
    sp = queryXPathNode(sp, "tbody/tr[2]/td/table/tbody/tr[2]/td/span");

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
    if(link==null) return;
    if('Meine Ecke' == linkText.textContent) {
      link.setAttribute('onclick','return EM.Pagehacks.QuickProfileMenu()');
    }
  },

  AddQuickLoginMenu: function() {
    var link = queryXPathNode(unsafeWindow.document, "/html/body/table/tbody/tr[3]/td[2]/table/tbody/tr/td[4]/a[img][1]");
    if(link==null) return;
    link.setAttribute('onclick','return EM.Pagehacks.QuickLoginMenu()');
  },

  AddQuickSearchMenu: function() {
    var link = queryXPathNode(unsafeWindow.document, "/html/body/table/tbody/tr[3]/td[2]/table/tbody/tr/td[7]/a[img]");
	if(link==null) return;
    link.setAttribute('onclick','return EM.Pagehacks.QuickSearchMenu()');
  },

  AddQuickSitemapMenu: function() {
    var link = queryXPathNode(unsafeWindow.document, "/html/body/table/tbody/tr[3]/td[2]/table/tbody/tr/td[12]/a[img]");
	if(link==null) return;
    link.setAttribute('onclick','return EM.Pagehacks.QuickSitemapMenu()');
  },

  QuickProfileMenu: function() {
    var link = queryXPathNode(unsafeWindow.document, "/html/body/table/tbody/tr[3]/td[2]/table/tbody/tr/td/a[img][1]");
	if(link==null) return;
    var bcr = link.getBoundingClientRect();
    var coords = new Point(bcr.left, bcr.bottom+10);
    coords.TranslateWindow();

    var w = new OverlayWindow(coords.x,coords.y,328,EM.Settings.GetValue('pagehack','privmenu')?148:187,'','em_QPM');
    w.InitDropdown();

    var tbl = w.CreateMenu();

    if (!EM.Settings.GetValue('pagehack','privmenu')) {
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
    }
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

  QuickLoginMenu: function() {
    var link = queryXPathNode(unsafeWindow.document, "/html/body/table/tbody/tr[3]/td[2]/table/tbody/tr/td[4]/a[img][1]");
    var bcr = link.getBoundingClientRect();
    var coords = new Point(bcr.left, bcr.bottom+10);
    coords.TranslateWindow();

    var w = new OverlayWindow(coords.x,coords.y,320,108,'','em_QLM');
    w.InitDropdown();

    var Eru = unsafeWindow.document.location;
    var redirectLink = Eru.pathname.replace(/^\//, '') + Eru.search.replace(/sid=[0-9a-f]+/ig, '').replace(/([\?&])&/g, '\1') + Eru.hash;

    var tbl = w.CreateMenu();
    var sg = new SettingsGenerator(tbl, unsafeWindow.document);

    sg.addHeadrow(("" != EM.User.loggedOnSessionId) ? "Benutzerwechsel" : "Anmeldung", 2);
    sg.addSettingsRow(
        '<span class="gen">Mitgliedsname:</span>',
        '<input type="text" value="" maxlength="40" size="25" name="username">'
        );
    sg.zebra = false;
    sg.addSettingsRow(
        '<span class="gen">Kennwort:</span>',
        '<input type="password" maxlength="32" size="25" name="password">'
        );
    sg.zebra = false;
    sg.addSettingsRow(
        '<span class="gen"><label for="autologin">Angemeldet bleiben:</label></span>',
        '<input type="checkbox" id="autologin" name="autologin">'
        );
    sg.addFootrow('<input type="hidden" value="'+encodeURI(redirectLink)+'" name="redirect"><input type="submit" value="Login" class="mainoption" name="login">', 2);

    var f = unsafeWindow.document.createElement('form');
    f.name = "loginForm";
    f.method = "post";
    f.target = "_top";
    f.action="login.php";

    f.appendChild(tbl);
    w.ContentArea.appendChild(f);

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

  QuickSitemapMenu: function() {
    var link = queryXPathNode(unsafeWindow.document, "/html/body/table/tbody/tr[3]/td[2]/table/tbody/tr/td[12]/a[img]");
    var bcr = link.getBoundingClientRect();
    var coords = new Point(bcr.left, bcr.bottom+10);
    coords.TranslateWindow();

    var w = new OverlayWindow(coords.x,coords.y,275,576,'','em_QSM');
    w.InitDropdown();
    var tbl = w.CreateMenu();

    tbl.addMenuItem(
        "/graphics/sitemap/home.gif",
        "/index.php",
        "Index");

    tbl.addMenuItem(
        "/graphics/sitemap/users.gif",
        "/memberlist.php",
        "Benutzer");
    tbl.addMenuItem(
        "/graphics/sitemap/group.gif",
        "/groupcp.php",
        "Gruppen");

    tbl.addMenuItem(
        "/graphics/sitemap/my.gif",
        "/my.php",
        "Meine Ecke");
    tbl.addMenuItem(
        "/graphics/sitemap/synonyms.gif",
        "/viewsynonyms.php",
        "Synonyme");

    tbl.addMenuItem(
        "/graphics/sitemap/staff.gif",
        "/staff.php",
        "Das Team");
    tbl.addMenuItem(
        "/graphics/sitemap/blog.gif",
        "/blogs.php?blog_id=1",
        "Team-Blog"); //Should be blag ...
    tbl.addMenuItem(
        "/graphics/sitemap/rssfeed.gif",
        "/sites.php?id=13",
        "Foren-Newsfeeds");
    tbl.addMenuItem(
        "/graphics/sitemap/newsfeeds.gif",
        "/newsfeeds.php",
        "Weitere Newsfeeds");
    tbl.addMenuItem(
        "/graphics/sitemap/museum.gif",
        "/museum.html",
        "Museum");

    tbl.addMenuItem(
        "/graphics/sitemap/help.gif",
        "/sites.php?id=19",
        "Hilfe");
    tbl.addMenuItem(
        "/graphics/sitemap/guidelines.gif",
        "/sites.php?id=9",
        "Richtlinien");
    tbl.addMenuItem(
        "/graphics/sitemap/legend.gif",
        "/sites.php?id=6",
        "Legende");
    tbl.addMenuItem(
        "/graphics/sitemap/df_banner.gif",
        "/sites.php?id=16",
        "Banner &amp; Grafiken");

    tbl.addMenuItem(
        "/graphics/sitemap/copyright.gif",
        "/sites.php?id=3",
        "Copyright");
    tbl.addMenuItem(
        "/graphics/sitemap/imprint.gif",
        "/sites.php?id=2",
        "Impressum");

    return false;
  },

  AddBetaLinks: function() {
    var table = queryXPathNode(unsafeWindow.document, "/html/body/table/tbody/tr/td[4]/table");
    if (!table) return;
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
    var tbl=null;
    var tbls = unsafeWindow.document.getElementsByClassName("forumline");
    var elAutor,elNachricht;
    for(var i=0;i<tbls.length;i++){
      elAutor=queryXPathNode(tbls[i],"tbody/tr/th[1]");
      elNachricht=queryXPathNode(tbls[i],"tbody/tr/th[2]");
      if(elAutor && elNachricht && elAutor.textContent=="Autor" && elNachricht.textContent=="Nachricht"){
        tbl=tbls[i];
        break;
      }
    }
    if(tbl==null) return;
    var tr = queryXPathNodeSet(tbl, "tbody/tr");

    var user_killfile = EM.Settings.GetValue('topic','user_killfile');
    var kftype = EM.Settings.GetValue('topic','killFileType');
    for(var i = 1; i < tr.length - 1; i ++) {
      if(tr[i].getElementsByTagName("td").length<=1) continue;
      var tdProfile = queryXPathNode(tr[i], "td[1]");
      var tdPost = queryXPathNode(tr[i], "td[2]");
      var tdBottom = queryXPathNode(tr[i+1], "td[1]");
      var linkUser = queryXPathNode(tdProfile, "b/a[1]");
      if(!linkUser){
        linkUser=tdProfile;
        var spanUser = queryXPathNode(linkUser, "span[1]/b");
        if(!spanUser) spanUser = queryXPathNode(linkUser, "b[1]/span[1]");
      }else{
        var spanUser = queryXPathNode(linkUser, "span[1]");
      }
      if(!spanUser){
        console.log("Error on higlighter");
        continue;
      }
      var idPost = queryXPathNode(tdProfile, "a[1]");
      if(idPost) idPost = idPost.name;
      else{
        idPost=i;
        var newA=document.createElement("a");
        newA.name=idPost;
        tdProfile.insertBefore(newA,tdProfile.firstChild);
      }

      var strUser = spanUser.textContent;
      var isSelf=strUser==EM.User.loggedOnUser
      var cssClassAdd = EM.User.helper_getHLStyleByUserLink(linkUser);


      if (!isSelf && kftype && user_killfile.some(
          function (e){
            return e.equals(strUser);
          })) {
        if (kftype==1) {
          var userp = queryXPathNode(tdProfile,"./span[@class='postdetails']");
          var postc = tdPost.getElementsByClassName("postbody")[0];
          if(userp) userp.style.display='none';
          postc.style.display='none';
          var show = document.createElement('span');
          show.className+=' gensmall';
          show.innerHTML='Post ausgeblendet. <a href="#'+idPost+'" onclick="EM.Pagehacks.ShowHiddenPosts('+idPost+')">Anzeigen</a>';
          show.id="showIDSpan"+idPost;
          postc.parentNode.insertBefore(show,postc);
        } else
        if (kftype==2) {
          tr[i].style.display='none';
          var tdSpacer = queryXPathNode(tr[i+1], "td[1]");
          if(tdSpacer.className!="spaceRow"){
            tr[i+1].style.display='none';
            tdSpacer = queryXPathNode(tr[i+2], "td[1]");
          }
          tdSpacer.className+=' gensmall';
          tdSpacer.innerHTML='<b>'+strUser+'</b>: Post ausgeblendet. <a href="#'+idPost+'" onclick="EM.Pagehacks.ShowHiddenPosts('+idPost+')">Anzeigen</a>';
        }
      }

      //Now lets check against the blacklist :P
      tdProfile.className += cssClassAdd;
      tdPost.className += cssClassAdd;
      tdBottom.className += cssClassAdd;

      //Remove the DF Highlighting to ensure proper colors :P
      tdProfile.className = tdProfile.className.replace(/Highlight/, '');
      tdPost.className = tdPost.className.replace(/Highlight/, '');
      tdBottom.className = tdBottom.className.replace(/Highlight/, '');

      var user_b = queryXPathNode(tdProfile, "b");
      if(!user_b) user_b = queryXPathNode(tdProfile, "span");
      var post_idlink = queryXPathNode(tdProfile, "a");
      var it_div = document.createElement('span');
      var it_span_user = document.createElement('span');
      var it_span_marks = document.createElement('span');
      it_div.className = 'intbl';
      it_span_user.className = 'incell left';
      it_span_marks.className = 'gensmall incell right';
      if(user_b) user_b.parentNode.removeChild(user_b);
      if(post_idlink) post_idlink.parentNode.removeChild(post_idlink);
      if(user_b) it_span_user.appendChild(user_b);
      if(post_idlink && user_b) it_span_user.insertBefore(post_idlink, user_b);
      if(!isSelf){
        if(EM.Settings.GetValue('topic','button_stalk')) {
          var l_stalk = EM.User.userlinkButtonFromLink(document, strUser, EM.User.ev_stalk_t, 'topic', 'stalk');
          it_span_marks.appendChild(l_stalk);
        }
        if(EM.Settings.GetValue('topic','button_killfile')) {
          var l_kill = EM.User.userlinkButtonFromLink(document, strUser, EM.User.ev_kill, 'topic', 'killfile');
          it_span_marks.appendChild(l_kill);
        }
      }
      it_div.appendChild(it_span_user);
      it_div.appendChild(it_span_marks);
      var br=queryXPathNode(tdProfile, "br");
      if(!br) br=queryXPathNode(tdProfile, "span/br");
      if(br) br.parentNode.removeChild(br);
      tdProfile.insertBefore(it_div, tdProfile.firstChild);
    }

    //Leyenfilter
    var vdL = queryXPathNode(unsafeWindow.document, "//a[@id='maintitle']");
    //alert(vdL);
    if(vdL && "Wortkette"==vdL.textContent) {
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
    var trPost = queryXPathNode(unsafeWindow.document, '//a[@name='+rel+']/../../../..');
    var trBottom = nextNode(trPost);
    var kftype = EM.Settings.GetValue('topic','killFileType');

    if (kftype==1) {
      var userp = queryXPathNode(trPost,"./td[1]/span[@class='postdetails']");
      var postc = queryXPathNode(trPost,"./td[2]").getElementsByClassName("postbody")[0];
      if(userp) userp.style.display='';
      postc.style.display='';
      var span = unsafeWindow.document.getElementById('showIDSpan'+rel);
      span.parentNode.removeChild(span);
    } else
    if (kftype==2) {
      trPost.style.display='';
      var tdSpacer = queryXPathNode(trBottom, "td[1]");
      if(tdSpacer.className.indexOf("spaceRow")<0){
        trBottom.style.display='';
        tdSpacer = queryXPathNode(nextNode(trBottom), "td[1]");
      }
      tdSpacer.innerHTML='';
    }
  },
  AddLinkSIDs: function () {
    if (!EM.Buttons.mainTable) return;
    var lk = EM.Buttons.mainTable.getElementsByTagName('a');
    //copy dynamic list to static array
    var links = [];
    for (var i=0; i<lk.length; i++) {
      links.push(lk[i]);
    }
    for (var i=0; i<links.length; i++) {
      var hr = links[i];
      if (hr.className=='postlink' &&
          /.*\.(delphi|c-sharp)-(forum|library)\.de|.*\.entwickler-ecke\.de/.test(hr.host) &&
          hr.host!=window.location.host &&
          /^\/(view(topic|forum)\.php|search\.php|(topic|forum)_.*\.html)/.test(hr.pathname)) {
        var oldsearch = hr.search;
        var prms = hr.search.substr(1).split('&');
        for (var j=0; j<prms.length;j++) {
          if (/^sid=/i.test(prms[j])) {
            prms.splice(j--,1);
          }
        }
        prms.push('sid='+EM.User.loggedOnSessionId);
        hr.search='?'+prms.join('&');
        hr.title='EE-Interner Link (Session wird übernommen)';
        if(EM.Settings.GetValue('ui','betaFeatures') && EM.Settings.GetValue('ui','addsidSubdomain')) {
          function makeLinkBtn(link, href, before) {
            if(isUndef(before)) before = false;
            var ax = document.createElement('a');
            ax.className='gensmall';
            ax.target=link.target;
            ax.innerHTML='<img border="0" style="margin-left:2px" src="/templates/subSilver/images/icon_latest_reply.gif" />';
            link.parentNode.insertBefore(ax,before?link:link.nextSibling);
            ax.href = href;
            return ax;
          }

          var here = window.location.host.match(/^(.*?)\./);
          here = here?here[1]:'www';
          var there = hr.host.replace(/^(.*?)\./,here+'.');
          var text_samedomain = 'Auf gleicher Subdomain bleiben';
          var text_samesession = ' (Session wird übernommen)';
          var settingVal = 1*EM.Settings.GetValue('ui','addsidSubdomain');
          switch (settingVal) {
            case 1: {
              hr.host = there;
              hr.title = text_samedomain;
              if (window.location.host==there) {
                // only subdomain would change, but this link doesnt-> no change needed
                hr.search = oldsearch;
              } else {
                hr.title+= text_samesession;
              }
            }; break;
            case 2:
            case 5: {
              var ax = makeLinkBtn(hr, hr.href, 5 == settingVal);
              ax.title = hr.title;
              hr.host = there;
              hr.title = text_samedomain;
              if (window.location.host==there) {
                // only subdomain would change, but this link doesnt-> no change needed
                hr.search = oldsearch;
              } else {
                hr.title+= text_samesession;
              }
            }; break;
            case 3:
            case 4: {
              var ax = makeLinkBtn(hr, hr.href, 4 == settingVal);
              ax.host = there;
              ax.title = text_samedomain;
              if (window.location.host==there) {
                // only subdomain would change, but this link doesnt-> no change needed
                ax.search = oldsearch;
              } else {
                ax.title+= text_samesession;
              }
            } ; break;
            default:
              alert(settingVal + (typeof settingVal));
          }
        }
      }
    }
  }
}

function UpdateMonkey() {
    this.state = 'init';
    this.network = [];
    this.branches = {};
    this.tags = {};
    this.commits = {};

    this.stack = [];
    this.running = false;

    this.settings = {
      enabled: EM.Settings.GetValue('update','enable'),
      installed: EM.Settings.GetValue('update','installed'),
      updateType: EM.Settings.GetValue('update','update_type'),
      updateSource: EM.Settings.GetValue('update','source_repo'),
      updateBranch: EM.Settings.GetValue('update','source_branch'),
      updateTimeout: EM.Settings.GetValue('update','check_every')
    };

    this.ghapi = {
        parent: this,
        defaultUser : 'martok',
        defaultRepo : 'edgemonkey',

        request: function(method, url, headers, data, cb, cbdata) {
            if(isEmpty(method)) method = 'GET';
            if(isEmpty(headers))
                headers = {
                    'User-agent': 'Mozilla/4.0 (compatible) Greasemonkey',
                    'Accept': '*'
                };
            if(isEmpty(data)) data = '';
            console.log('Asking for Bananas @ ' + url);

            GM_xmlhttpRequest({
                method: method,
                url: url,
                headers: headers,
                data: data,
                onload: function(rd) {
                    cb(1,1,rd,cbdata);
                },
                onerror: function(rd) {
                    cb(1,0,rd,cbdata);
                },
                onreadystatechange: function(rd) {
                    cb(0,rd.readyState,rd,cbdata);
                }
            });
        },
        queryRepo: function (method,user,repo,cb,cbdata) {
            if(isEmpty(method)) method = 'network';
            if(isEmpty(user)) user = this.defaultUser;
            if(isEmpty(repo)) repo = this.defaultRepo;
            this.request('GET', 'http://github.com/api/v2/json/repos/show/'+user+'/'+repo+'/'+method,null,null,cb,cbdata);
        },
        queryCommit: function (commit,user,repo,cb,cbdata) {
            if(isEmpty(commit)) commit = 'HEAD';
            if(isEmpty(user)) user = this.defaultUser;
            if(isEmpty(repo)) repo = this.defaultRepo;
            this.request('GET', 'http://github.com/api/v2/json/commits/show/'+user+'/'+repo+'/'+commit,null,null,cb,cbdata);
        }
    };

    EM.Settings.onSettingChanged.push(this.evSettingChanged);
}
UpdateMonkey.prototype.updateEngine = function(stage, success, response) {}; //Telling JS something it doesn't believe me without telling it directly
UpdateMonkey.prototype = {
    actionPush: function(actionProc,checkProc,doneProc,data) {
        var action = {
            perform:actionProc,
            check:checkProc,
            done:doneProc,
            data:data
            };
        this.stack.push(action);
        this.actionPerform();
    },
    actionPop: function() {
        if(!this.stack.length){
            return null;
        }
        return this.stack.shift();
    },
    actionPerform: function() {
        if(this.running) {
            return;
        }
        var action = this.actionPop();
        if(isEmpty(action)) {
            console.log('UpdateMonkey can haz cheezeburger?');
            return;
        }
        if(!action.check(action)) {
            console.log('UpdateMonkey rescheduling ... feed more or other bananas!');
            this.actionPerform();
            this.stack.push(action);
            return;
        }
        this.running = true;
        action.perform(action);
    },
    actionDone:function() {
        this.running = false;
        this.actionPerform();
    },

    checkNetwork: function() {
        var skynet = EM.Cache.get('updatemonkey.networks', 'main');
        return skynet.current;
    },

    failMonkeyMessage:function(msg) {
        console.log('UpdateMonkey failed liek crazy: ' + msg);
    },

    updateCommit: function(user,repo,commit) {
        console.log('commit:'+commit);
        var obj = this;
        this.actionPush(
            function(a) {
                var commitinfo = EM.Cache.get('updatemonkey.commits', a.data.commit);
                if(!commitinfo.current) {
                    obj.ghapi.queryCommit(a.data.commit,a.data.user,a.data.repo,
                        function(stage,success,response) {
                            //console.log('UpdateMonkey eating bananas in state: ' + this.state + ' at stage ' + stage + ' with as little success as ' + success + ' politicians');
                            if(1 == stage) {
                                console.log('Something happened to UpdateMonkey - IZ LIEK ' + (success ? '#SAXEZ' : '#FAIL'));
                                if(success) {
                                    var tmp = JSON.parse(response.responseText);
                                    if (isEmpty(tmp.commit)) {
                                        obj.failMonkeyMessage('Commit request returned no commit information!');
                                        return;
                                    }
                                    EM.Cache.put('updatemonkey.commits', a.data.commit, tmp.commit);
                                    obj.commits[a.data.commit] = tmp.commit;
                                    a.done(a);
                                }
                            }
                        }
                    );
                    return;
                }
                obj.commits[a.data.commit] = commitinfo.data;
                a.done(a);
            },
            function(a) {
                return true;
            },
            function(a) {
                obj.actionDone(a);
            },
            {
                user:user,
                repo:repo,
                commit:commit
            }
        );
    },

    updateBranches: function(user,repo,callback) {
        console.log('branches:'+user+','+repo);
        var obj = this;
        this.actionPush(
            function(a) {
                var branches = EM.Cache.get('updatemonkey.branches', a.data.user+'#'+a.data.repo);
                if(!branches.current) {
                    obj.ghapi.queryRepo('branches',a.data.user,a.data.repo,
                        function(stage,success,response) {
                            //console.log('UpdateMonkey eating bananas in state: ' + this.state + ' at stage ' + stage + ' with as little success as ' + success + ' politicians');
                            if(1 == stage) {
                                console.log('Something happened to UpdateMonkey - IZ LIEK ' + (success ? '#SAXEZ' : '#FAIL'));
                                if(success) {
                                    var tmp = JSON.parse(response.responseText);
                                    if (isEmpty(tmp.branches)) {
                                        obj.failMonkeyMessage('Branch List request returned no branch information!');
                                        return;
                                    }
                                    EM.Cache.put('updatemonkey.branches', a.data.user+'#'+a.data.repo, tmp.branches, obj.settings.updateTimeout);
                                    obj.branches[a.data.user+'#'+a.data.repo] = tmp.branches;
                                    a.done(a);
                                }
                            }
                        }
                    );
                    return;
                }
                obj.branches[a.data.user+'#'+a.data.repo] = branches.data;
                a.done(a);
            },
            function(a) {
                return obj.checkNetwork();
            },
            function(a) {
            	var branches = obj.branches[a.data.user+'#'+a.data.repo];
                for(var branch in branches) {
                    obj.updateCommit(a.data.user,a.data.repo,branches[branch]);
                }
                if (!isEmpty(callback))
                  callback(obj, branches);
                obj.actionDone(a);
            },
            {
                user:user,
                repo:repo
            }
        );
    },

    updateTags: function(user,repo) {
        console.log('tags:'+user+','+repo);
        var obj = this;
        this.actionPush(
            function(a) {
                var tags = EM.Cache.get('updatemonkey.tags', a.data.user+'#'+a.data.repo);
                if(!tags.current) {
                    obj.ghapi.queryRepo('tags',a.data.user,a.data.repo,
                        function(stage,success,response) {
                            //console.log('UpdateMonkey eating bananas in state: ' + this.state + ' at stage ' + stage + ' with as little success as ' + success + ' politicians');
                            if(1 == stage) {
                                console.log('Something happened to UpdateMonkey - IZ LIEK ' + (success ? '#SAXEZ' : '#FAIL'));
                                if(success) {
                                    var tmp = JSON.parse(response.responseText);
                                    if (isEmpty(tmp.tags)) {
                                        obj.failMonkeyMessage('Tag List request returned no tag information!');
                                        return;
                                    }
                                    EM.Cache.put('updatemonkey.tags', a.data.user+'#'+a.data.repo, tmp.tags);
                                    obj.tags[a.data.user+'#'+a.data.repo] = tmp.tags;
                                    a.done(a);
                                }
                            }
                        }
                    );
                    return;
                }
                obj.tags[a.data.user+'#'+a.data.repo] = tags.data;
                a.done(a);
            },
            function(a) {
                return obj.checkNetwork();
            },
            function(a) {
            	var tags = obj.tags[a.data.user+'#'+a.data.repo];
                for(var tag in tags) {
                    obj.updateCommit(a.data.user,a.data.repo,tags[tag]);
                }
                obj.actionDone(a);
            },
            {
                user:user,
                repo:repo
            }
        );
    },

    updateNetwork: function(callback) {
        console.log('networks');
        var obj = this;
        this.actionPush(
            function(a) {
                var skynet = EM.Cache.get('updatemonkey.networks', 'main');
                if(!skynet.current) {
                    obj.ghapi.queryRepo('network',null,null,
                        function(stage,success,response) {
                            //console.log('UpdateMonkey eating bananas in state: ' + this.state + ' at stage ' + stage + ' with as little success as ' + success + ' politicians');
                            if(1 == stage) {
                                console.log('Something happened to UpdateMonkey - IZ LIEK ' + (success ? '#SAXEZ' : '#FAIL'));
                                if(success) {
                                    var tmp = JSON.parse(response.responseText);
                                    if (isEmpty(tmp.network)) {
                                        obj.failMonkeyMessage('Network request returned no network information!');
                                        return;
                                    }
                                    EM.Cache.put('updatemonkey.networks', 'main', tmp.network, obj.settings.updateTimeout);
                                    obj.network = tmp.network;
                                    a.done(a);
                                }
                            }
                        }
                    );
                    return;
                }
                obj.network = skynet.data;
                a.done(a);
            },
            function(a) {
                return true;
            },
            function(a) {
                var nodef = false;
                if (!isEmpty(callback))
                  nodef = callback(obj, obj.network)===false; // require false, undef would be falsy too
                if (!nodef)
                  obj.network.forEach(
                      function(e) {
                          obj.updateBranches(e.owner,e.name);
                          obj.updateTags(e.owner,e.name);
                      }
                  );
                obj.actionDone(a);
            },
            null
        );
    },

    checkUpdateAvail: function() {
        console.log('update');
        var obj = this;
        this.actionPush(
            function(a) {
              //Check the cache for the various commits we need ...
              var mode = 1*a.data.updateType;
              var repo = a.data.updateSource;
              var branch = a.data.updateBranch;

              if(!mode) {
                repo = 'martok#edgemonkey';
              }
              if(2 > mode) {
                branch = 'master';
              }

              var commit = null;
              var c = null;
              switch(mode) {
                case 0:    //Only use tags
                  var mostcurrent = new Date(0);
                          for(var tag in obj.tags[repo]) {
                            c = obj.tags[repo][tag];
                            var rev_date = new Date();
                            rev_date.setISO8601(obj.commits[c].committed_date);
                              if(rev_date > mostcurrent) {
                                commit = c;
                                mostcurrent = rev_date;
                              }
                          }
                  break;
                case 1:    //Use the master branch
                case 2:    //Use a custom branch
                  c = obj.branches[repo][branch];
                            if(isEmpty(obj.commits[c])) {
                              break;
                            }
                            commit = c;
                  break;
                default:
                  obj.failMonkeyMessage('Unknown Update mode!');
                  return;
              }

              if(!isEmpty(commit)) {
                console.log('OLD: ' + a.data.installed);
                console.log('NEW: ' + commit);
                if(commit.trim() != (''+a.data.installed).trim()) {
                  console.log('UpdateMonkey haz njuz!');
                  ur = repo.match(/^([^#]+)#([^#]+)$/);
                  EM.Cache.put('updatemonkey.networks', 'update',
                    {user:ur[1], repo:ur[2], branch:branch, tag:tag, commit:commit, mode:mode}, obj.settings.updateTimeout);
                  obj.notifyUpdate(ur[1], ur[2], branch, tag, commit, mode);
                }
              }

              a.done(a);
            },
            function(a) {
              //Check the cache for the various commits we need ...
              var mode = 1*a.data.updateType;
              var repo = a.data.updateSource;
              var branch = a.data.updateBranch;

              if(!mode) {
                repo = 'martok#edgemonkey';
              }
              if(2 > mode) {
                branch = 'master';
              }

              switch(mode) {
                case 0:    //Only use tags
                  if(isEmpty(obj.tags[repo])) {
                    return false;
                  }
                          for(var tag in obj.tags[repo]) {
                              if(isEmpty(obj.commits[obj.tags[repo][tag]])) {
                                return false;
                              }
                          }
                  break;
                case 1:    //Use the master branch
                case 2:    //Use a custom branch
                  if(isEmpty(obj.branches[repo])) {
                    return false;
                  }
                            if(isEmpty(obj.commits[obj.branches[repo][branch]])) {
                              return false;
                            }
                  break;
                default:
                  obj.failMonkeyMessage('Unknown Update mode!');
                  return true;
              }
              return true;
            },
            function(a) {
                obj.actionDone(a);
            },
            obj.settings
        );
    },

    checkUpdate: function() {
      if(!this.settings.enabled) {
        return true;
      }
      var update = EM.Cache.get('updatemonkey.networks', 'update');
      if(update.current) {
        var u = update.data;
        this.notifyUpdate(u.user, u.repo,u.branch,u.tag,u.commit,u.mode);
        return;
      }

      this.updateNetwork();
      this.checkUpdateAvail();
    },

    notifyUpdate: function(user,repo,branch,tag,commit,mode) {
      var e = document.createElement('div');
      e.innerHTML =
        '<div class="gensmall">Ein neues Update von EdgeMonkey wurde gefunden.</div>' +
        '<table>'+
        '<tr><td><span class="gensmall">Benutzer:</span></td><td><span class="gensmall">' + user + '</span></td></tr>' +
        '<tr><td><span class="gensmall">Repository:</span></td><td><span class="gensmall">' + repo + '</span></td></tr>' +
        '<tr><td><span class="gensmall">Branch:</span></td><td><span class="gensmall">' + branch + '</span></td></tr>' +
        (isEmpty(tag)?'':'<tr><td><span class="gensmall">Tag:</span></td><td><span class="gensmall">' + tag + '</span></td></tr>' )+
        '<tr><td><span class="gensmall">Commit:</span></td><td><span class="gensmall"><a href="http://github.com/'+user+'/'+repo+'/commit/'+commit+'/" target="_blank">' + commit.substr(0,16) + '</a></span></td></tr>' +
        '</table><br/>' +
        '<div class="dfnav"><a href="http://github.com/'+user+'/'+repo+'/raw/'+commit+'/edgemonkey.user.js" onClick="return EM.Updater.installUpdate(\''+commit+'\');">Installation der neuen Version</a></div>'+
        '<div class="gensmall">(Bitte die Sicherheitsmeldung von GreaseMonkey mit OK best&auml;tigen)</div>';

      EM.Notifier.addAlert(
        '/graphics/Profil-Sidebar.gif',
        'Neues EM-Update',
        'http://github.com/'+user+'/'+repo+'/commit/'+commit+'/',
        e
      );
    },

    installUpdate: function(commit) {
      console.log('install:'+commit);
      EM.Settings.SetValue('update','installed',commit);
      Settings_SaveToDisk();
      EM.Cache.touch('updatemonkey.networks', 'update', -1);
      return true;
    },

    evSettingChanged: function(data) {
      if (!(isUndef(data.Modified['update.update_type']) &&
          isUndef(data.Modified['update.source_repo']) &&
          isUndef(data.Modified['update.source_branch']))) {
        EM.Cache.touch('updatemonkey.networks', 'update', -1);
      }
    }
}

function checkUpdate(){
    EM.Updater = new UpdateMonkey();
    EM.Updater.checkUpdate();
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
  try {
    //Work around Firefox Security by Obscurity
    isEmpty(window.opener);
  } catch(foo) {
    window.opener = null;
  }
  if(isEmpty(window.opener) && (window.parent==window) )
  {
    upgradeSettings();
    setTimeout(function() {checkUpdate()}, 100);
  }

  if (Location.match(/shoutbox_view\.php/)) {
    if (EM.User.loggedOnUser) {
      EM.ShoutWin = new ShoutboxWindow();
    }
  }
  else
  if (Location.match(/posting\.php\?mode=topicreview/)) {
    EM.Pagehacks = new Pagehacks();
  }
  else
  {
    EM.Buttons = new ButtonBar();
    EM.Notifier = new Notifier();

    with(EM.Buttons) {
      addButton('/graphics/Profil-Sidebar.gif','Einstellungen','EM.Settings.ev_EditSettings()');
    }
    EM.Pagehacks = new Pagehacks();
    EM.Shouts = new ShoutboxControls();

    EM.Cache = new CacheMonkey();
    EM.PN = new PNAPI();
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
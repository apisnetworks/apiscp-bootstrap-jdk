/*import 'babel-polyfill';
require("jquery");
require("tether");
import jQuery from 'jquery';*/

window.jQuery = window.$ = require("jquery");
require("./jquery_ui");
window.Tether = require("tether");
window.Clipboard = require("./clipboard.js");
require('./apnscp-bundle');
require("./apnscp");
require("./apnscp_init");


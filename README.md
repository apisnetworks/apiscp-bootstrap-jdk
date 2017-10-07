# apnscp JavaScript Kit

apnscp Bootstrap JDK is a kit to build apnscp's JavaScript libraries. The JDK relies on Bootstrap 4, which is mated to this repository (and panel). As of now, the current version is **4.0.0-alpha.6**.

[Node LTS](https://nodejs.org/en/download/) (6.x) is recommended.

## Getting Started

```shell
git clone https://github.com/apisnetworks/apnscp-bootstrap-jdk.git
cd apnscp-bootstrap-jdk
npm install
```

## Building On-the-fly

JDK makes use of [grunt-contrib-watch](https://www.npmjs.com/package/grunt-contrib-watch) to rebuild whenever a watched file is changed. Simply run `grunt watch` from the command-line.

## Enabling in apnscp

apnscp must be configured with **[style]** => **override_js** set to true on config.ini. Once enabled, apnscp will use `/public/js/apnscp-custom.js` instead of `/public/js/apnscp.js`. This will also futureproof apnscp updates that will overwrite apnscp.js.

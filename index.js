const fs = require('fs');
const httpProxy = require('http-proxy');
const proxy = httpProxy.createProxyServer({});

function getProxyConf(confPath) {
  let proxyConf = fs.readFileSync(confPath, 'utf8');
  proxyConf = proxyConf.replace(/\n|\s/g, '');
  proxyConf = proxyConf.split(';');
  return proxyConf;
}

module.exports = function(confPath) {
  let proxyConf = getProxyConf(confPath);
  fs.watch(confPath, (err) => {
    proxyConf = getProxyConf(confPath, 'utf8');
  });
  return function(req, res, next) {
    const url = req.url.indexOf('?') > -1 ? req.url.split('?')[0] : req.url;
    let host;
    proxyConf.forEach((item) => {
      item = item.split('=>');
      if (item[0] === url) {
        host = item[1];
      }
    });
    if (host) {
      req.url = url;
      proxy.web(req, res, {
        target: host,
        changeOrigin: true,
      });
      next = null;
    }
    next && next();
  }
}

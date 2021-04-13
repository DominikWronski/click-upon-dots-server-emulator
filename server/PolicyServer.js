const net = require("net");

    function policy() {

        let policyServer = net.createServer((socket) => {
            var xml = '<?xml version="1.0"?>\n<!DOCTYPE cross-domain-policy SYSTEM \n"http://www.adobe.com/xml/dtds/cross-domain-policy.dtd">\n<cross-domain-policy>\n';
            xml += '<site-control permitted-cross-domain-policies="master-only"/>\n';
            xml += '<allow-access-from domain="*" to-ports="*"/>\n';
            xml += '</cross-domain-policy>\n';
            if(socket && socket.readyState == 'open'){
            socket.write(xml);
            socket.end(); 
            }
        })

        policyServer.listen(843);
    }

    module.exports = policy;
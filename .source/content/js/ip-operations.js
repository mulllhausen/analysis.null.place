// take basic data from 1 line of the route table and fill in missing data
function get1RouteMissingData(dataIn) {
    var dataOut = {
        originalLineNum: dataIn.originalLineNum,

        originalDestination: dataIn.originaldestination,
        destination: dataIn.destination, // always an ip
        destinationList: ip2List(dataIn.destination),
        destinationIPVersion: getIPVersion(dataIn.destination),

        mask: dataIn.mask,
        maskList: ip2List(dataIn.mask),
        maskIPVersion: getIPVersion(dataIn.mask),

        interface: dataIn.interface,
        originalGateway: dataIn.originalgateway,
        gateway: dataIn.gateway,
        isLinkLocalGateway: dataIn.isLinkLocalGateway
    };
    if (dataIn.hasOwnProperty('error')) dataOut.error = dataIn.error;
    validIP(dataOut.destinationList, dataOut.destinationIPVersion);
    validIP(dataOut.maskList, dataOut.maskIPVersion);

    if (dataOut.destinationIPVersion != dataOut.maskIPVersion) throw 'dest ' +
    dataOut.destination + ' is ipv' + dataOut.destinationIPVersion +
    ' but mask ' + dataOut.mask + ' is ipv' + dataOut.maskIPVersion;

    // https://networkengineering.stackexchange.com/questions/7106
    dataOut.networkAddressList = getNetworkAddress(
        dataOut.destinationList, dataOut.maskList
    );
    dataOut.broadcastAddress = getBroadcastAddress(
        dataOut.destinationList, dataOut.maskList
    );
    dataOut.hostStartList = copyList(dataOut.networkAddressList); // init  
    dataOut.hostEndList = copyList(dataOut.broadcastAddress); // init
    if (dataOut.maskList[dataOut.maskList.length - 1] != 255) {
        dataOut.hostStartList[dataOut.hostStartList.length - 1]++;
        dataOut.hostEndList[dataOut.hostEndList.length - 1]--;
    }
    if (dataOut.maskList[dataOut.maskList.length - 1] == 254) {
        var startCopy = copyList(hostStartList);
        var endCopy = copyList(hostEndList);
        dataOut.hostStartList = endCopy;
        dataOut.hostEndList = startCopy;
    }
    return dataOut;
}

function getNetworkAddress(destinationList, maskList) {
    var networkAddressList = []; // init
    for (var i = 0; i < destinationList.length; i++) {
        networkAddressList[i] = destinationList[i] & maskList[i];
    }
    return networkAddressList;
}

function getBroadcastAddress(destinationList, maskList) {
    var broadcastAddressList = []; // init
    for (var i = 0; i < destinationList.length; i++) {
        broadcastAddressList[i] =
        destinationList[i] | binInvert(maskList[i], maskList.length);
    }
    return broadcastAddressList;
}

// check if the gateway indicates our own LAN. thanks to:
// - superuser.com/a/580708 (`route` on linux)
// - superuser.com/a/60003 (`route print` on windows)
// - superuser.com/a/1067742 (`netstat` on macos or bsd)
// - wikipedia.org/wiki/Link-local_address (general info)
function isLinkLocalGateway(gateway) {
    gateway = gateway.toLowerCase();
    switch (gateway) {
        case '0.0.0.0':
        case '*':
        case 'on-link':
            return true;
    }
    if (gateway.substr(0, 5) == 'link#') return true;
    return false;
}

function maskList2Bits(maskList) {
    var foundAZero = false;
    var bits = 0;
    for (var i = 0; i < maskList.length; i++) {
        var octet = maskList[i]; 
        for (var j = 7; j >= 0; j--) {
            var bit = (octet & (1 << j)) > 0; // eg (255 & 64) > 0
            if (bit) {
                if (foundAZero) throw 'invalid mask: ' + ipList2IP(maskList) +
                ' (non contiguous bits are not supported)';
                else bits++;
            } else foundAZero = true;
        }
    }
    return bits;
}

// thanks to superuser.com/q/1502902
// for now just use 8 x num octets. if this is found to be incorrect then update
// to analyzing the class of network based on partial ip
function getClassfulCIDRForIP(incompleteIP) {
    var ipMayBeIncomplete = true;
    if (getIPVersion(incompleteIP, ipMayBeIncomplete) != 4) throw 'the' +
    ' classful CIDR can only be determined for ipv4 addresses. ' +
    incompleteIP + ' is not IPv4';
    var ipList = ip2List(incompleteIP);
    return ipList.length * 8;
}

function maskBits2List(bits, ipVersion) {
    // 32 -> 255.255.255.255
    // 8 -> 255.0.0.0
    // 24 -> 255.255.255.0
    // 1 -> 128.0.0.0
    var numOctets = 0; // init
    var bitsPerOctet = 0;
    var maskList = [];
    switch (ipVersion) {
        case 4:
            numOctets = 4;
            bitsPerOctet = 8;
            break;
    }
    for (var i = 0; i < numOctets; i++) {
        var thisOctet = 0; // init
        if (bits >= bitsPerOctet) thisOctet = (2 ** bitsPerOctet) - 1;
        else {
            for (var j = 0; j < bits; j++) { // skips when bits <= 0
                thisOctet += (2 ** (bitsPerOctet - 1 - j));
            }
        }
        maskList.push(thisOctet);
        bits -= bitsPerOctet;
    }
    return maskList;
}

function validIP(ipList, ipVersion) {
    for (var i = 0; i < ipVersion; i++) {
        if ((ipList[i] == null) || (ipList[i] < 0)) return false;
        switch (ipVersion) {
            case 4:
                if (ipList[i] > 0xff) return false;
                break;
            case 6:
                if (ipList[i] > 0xffff) return false;
                break;
        }
    }
    return true;
}

function getIPVersion(ip, ipIsIncomplete) {
    if (ip.indexOf('.') != -1) return 4;
    if (ip.indexOf(':') != -1) return 6;
    if (ipIsIncomplete) return 4; // default
    throw 'unknown ip version: ' + ip;
}

function ip2List(ip) {
    var ipVersion = getIPVersion(ip);
    var ipList = []; // init
    switch (ipVersion) {
        case 4:
            ipList = ip.split('.');
            break;
        case 6:
            ipList = ip.split(':');
            break;
    }
    for (var i = 0; i < ipList.length; i++) {
        switch (ipVersion) {
            case 4:
                ipList[i] = betterParseInt(ipList[i]);
                break;
            case 6:
                ipList[i] = betterParseInt(ipList[i], 16);
                break;
        }
    }
    return ipList;
}

function ipList2IP(ipList) {
    var ipVersion = (ipList.length == 4) ? 4 : 6;
    var delimiter = (ipVersion == 4) ? '.' : ':';
    var newIPList = [];
    for (var i = 0; i < ipList.length; i++) {
        newIPList.push(ipList[i].toString(ipVersion == 4 ? 10 : 16));
    }
    return newIPList.join(delimiter);
}

function ipList2Int(ipList) {
    if (ipList.length != 4) throw 'ipList2Int only supports ipv4 addresses';
    var ipHex = ''; // init
    for (var i = 0; i < ipList.length; i++) {
        var hex = ipList[i].toString(16);
        if (hex.length == 1) hex = '0' + hex;
        ipHex += hex;
    }
    return parseInt(ipHex, 16);
}

function binInvert(intt, ipVersion) {
    switch (ipVersion) {
        case 4: return 0xff - intt;
        case 6: return 0xffff - intt;
    }
}

function extrapolateIP(incompleteIP, ipVersion) {
    // ipv4: '127' -> '127.0.0.0'
    var completeIP = [];
    var numOctets;
    switch (ipVersion) {
        case 4:
            if (incompleteIP == 'default') return '0.0.0.0';
            incompleteIP = incompleteIP.split('.');
            numOctets = 4;
            break;
        default:
            return null;
    }
    for (var i = 0; i < numOctets; i++) {
        if ((incompleteIP.length - 1) < i) completeIP.push('0');
        else completeIP.push(incompleteIP[i]);
    }
    switch (ipVersion) {
        case 4: return completeIP.join('.');
        default: return null;
    }
}

// thanks to superuser.com/a/1502933
function extrapolateMaskBits(incompleteIP, ipVersion) {
    // x.x -> 2 * 8 -> 16
    // x.x.x -> 3 * 8 -> 24
    var numOctets;
    switch (ipVersion) {
        case 4:
            if (incompleteIP == 'default') return 0;
            return incompleteIP.split('.').length * 8;
        default:
            return null;
    }
}

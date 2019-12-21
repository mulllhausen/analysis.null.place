// todo: ipv6
// todo: rules for 192, 10, etc

// init globals

var preloadData = {
    linux: '$ route -ve\n' +
'Kernel IP routing table\n' +
'Destination     Gateway  Genmask         Flags   MSS Window  irtt Iface\n' +
'default         net1     0.0.0.0         UG        0 0          0 eth1\n' +
'172.16.0.0      wan      255.255.0.0     UG        0 0          0 eth0\n' +
'192.168.0.0     *        255.255.255.0   U         0 0          0 eth0\n' +
'192.168.1.0     *        255.255.255.0   U         0 0          0 eth1',
    windows: '$ route print\n' +
'===========================================================================\n' +
'Interface List\n' +
' 55...00 00 00 00 00 00 ......Intel(R) Ethernet Connection I217-LM\n' +
'  1...........................Software Loopback Interface 1\n' +
' 31...00 00 00 00 00 00 00 e0 Microsoft ISATAP Adapter\n' +
' 16...00 00 00 00 00 00 00 e0 Teredo Tunneling Pseudo-Interface\n' +
'===========================================================================\n' +
'\n' +
'IPv4 Route Table\n' +
'===========================================================================\n' +
'Active Routes:\n' +
'Network Destination        Netmask          Gateway       Interface  Metric\n' +
'          0.0.0.0          0.0.0.0      192.168.0.1      192.168.0.2     20\n' +
'        127.0.0.0        255.0.0.0         On-link         127.0.0.1    306\n' +
'        127.0.0.1  255.255.255.255         On-link         127.0.0.1    306\n' +
'  127.255.255.255  255.255.255.255         On-link         127.0.0.1    306\n' +
'       172.16.0.0      255.255.0.0      192.168.0.8      192.168.0.2     21\n' +
'       172.16.0.0    255.255.255.0      192.168.0.8      192.168.0.2     21\n' +
'      192.168.0.0    255.255.255.0         On-link       192.168.0.2    276\n' +
'      192.168.0.2  255.255.255.255         On-link       192.168.0.2    276\n' +
'    192.168.0.255  255.255.255.255         On-link       192.168.0.2    276\n' +
'      192.168.3.0    255.255.255.0      192.168.0.8      192.168.0.2     21\n' +
'      192.168.5.0    255.255.255.0      192.168.0.8      192.168.0.2     21\n' +
'    203.41.188.96  255.255.255.240      192.168.0.8      192.168.0.2     21\n' +
'    203.42.70.224  255.255.255.240      192.168.0.8      192.168.0.2     21\n' +
'    203.44.43.160  255.255.255.240      192.168.0.8      192.168.0.2     21\n' +
'       203.52.0.0    255.255.254.0      192.168.0.8      192.168.0.2     21\n' +
'        224.0.0.0        240.0.0.0         On-link         127.0.0.1    306\n' +
'        224.0.0.0        240.0.0.0         On-link       192.168.0.2    276\n' +
'  255.255.255.255  255.255.255.255         On-link         127.0.0.1    306\n' +
'  255.255.255.255  255.255.255.255         On-link       192.168.0.2    276\n' +
'===========================================================================\n' +
'Persistent Routes:\n' +
'  Network Address          Netmask  Gateway Address  Metric\n' +
'       172.16.0.0    255.255.255.0      192.168.0.8       1\n' +
'===========================================================================\n' +
'\n' +
'IPv6 Route Table\n' +
'===========================================================================\n' +
'Active Routes:\n' +
' If Metric Network Destination      Gateway\n' +
'  1    306 ::1/128                  On-link\n' +
'  1    306 ff00::/8                 On-link\n' +
'===========================================================================\n' +
'Persistent Routes:\n' +
'  None',
    macOS: '$ netstat -rn\n' +
'Routing tables\n' +
'\n' +
'\n' +
'\n' +
'Internet:\n' +
'\n' +
'Destination        Gateway            Flags        Refs      Use   Netif Expire\n' +
'\n' +
'default            192.168.1.1        UGSc          192        0     en0       \n' +
'\n' +
'127                127.0.0.1          UCS             0        0     lo0       \n' +
'\n' +
'127.0.0.1          127.0.0.1          UH              1      248     lo0       \n' +
'\n' +
'169.254            link#5             UCS             1        0     en0      !\n' +
'\n' +
'192.168.1          link#5             UCS             1        0     en0      !\n' +
'\n' +
'192.168.1.1/32     link#5             UCS             1        0     en0      !\n' +
'\n' +
'192.168.1.1        1:0:0:0:0:0        UHLWIir        68     1450     en0   1144\n' +
'\n' +
'192.168.1.101      2:0:0:0:0:0        UHLWI           0        0     en0   1073\n' +
'\n' +
'192.168.1.103/32   link#5             UCS             0        0     en0      !\n' +
'\n' +
'224.0.0/4          link#5             UmCS            2        0     en0      !\n' +
'\n' +
'224.0.0.251        3:0:0:0:0:0        UHmLWI          0        0     en0       \n' +
'\n' +
'239.255.255.250    4:0:0:0:0:0        UHmLWI          0      540     en0       \n' +
'\n' +
'255.255.255.255/32 link#5             UCS             0        0     en0      !'
};
var routeTableFormat = {
    linux: {
        routes: {
            0: 'destination',
            1: 'gateway',
            2: 'genmask',
            3: 'flags',
            4: 'metric',
            last: 'iface'
        }
    },
    windows: {
        routes: {
            0: 'network destination',
            1: 'netmask',
            2: 'gateway',
            3: 'interface',
            4: 'metric'
        }
    }
};
var translations = {
    'network destination': 'destination',
    genmask: 'mask',
    netmask: 'mask',
    iface: 'interface'
}
var svgProperties = {
    overallHeight: 400, // gets updated to match the svg
    overallWidth: 400, // gets updated to fit elements
    topHalfHeight: 0, // gets updated to fit elements
    fontSize: 12,
    areaBorderWidth: 1,

    verticalGapBeforeAndAfterIPRange: 20, // the gap before the ip ranges, repeated at the bottom too
    ipTextVerticalMargin: 4,
    ipLeft: 113, // the left position of the ip ranges
    ipHorizontalMargin: 2,
    ipColors: [
        'blue'//,'green', 'red', 'purple'
    ],

    deviceSquareHeight: 100, // the height for interfaces and gateways
    interfaceLeft: 260, // the left position of the interfaces
    minVerticalGapBetweenInterfaces: 10,
    verticalGapBeforeAndAfterInterfaces: 30, // the gap before interfaces, repeated at the bottom too

    gatewayLeft: 460, // the left position of the gateways
    minVerticalGapBetweenGateways: 10,
    verticalGapBeforeAndAfterGateways: 30, // the gap before gateways, repeated at the bottom too
    
    externalDestinationLeft: 650, // the left position of the external destination
    verticalGapBetweenOtherNicAndGateways: 70,
    verticalGapAfterOtherNic: 20
};
var donePaths = []; // keep a list of z1 paths

// events

addEvent(window, 'load', function () {
    initSVGProperties();

    addEvent(document.getElementById('routeTable'), 'change,keyup', routeTableChanged);
    addEvent(document.getElementById('preload'), 'change', preloadChanged);
    preloadChanged(); // init    
    
    removeGlassCase('form0', true); // permanently = true
    removeGlassCase('visualRouteTable', true); // permanently = true

    addEvent(svg, 'click', function(e) { svgAction(e, 'clicked'); });
    addEvent(svg, 'mouseover', function(e) { svgAction(e, 'hovered'); });

    addEvent(document.getElementById('parse'), 'click', parseButton);
    parseButton(); // init
    addEvent(document.getElementById('edit'), 'click', editButton);

    addEvent(document.getElementById('interactiveCLI'), 'click', function(e) {
        interactiveCLIAction(e, 'clicked');
    });
    addEvent(document.getElementById('interactiveCLI'), 'mouseover', function(e) {
        interactiveCLIAction(e, 'hovered');
    });
});

// functions

function initSVGProperties() {
    svg = document.getElementById('routeTableSVG').contentDocument.
    getElementsByTagName('svg')[0];
    svgDefs = svg.getElementsByTagName('defs')[0];
    var nicEl = svgDefs.querySelectorAll('.nic')[0];
    svgProperties.overallWidth = svg.getBBox().width;
}

function editButton() {
    switchCLITo('input');
}

function routeTableChanged() {
    var preload = document.getElementById('preload').value;
    if (preload == 'no') return;
    var actualRouteTable = document.getElementById('routeTable').value;
    if (actualRouteTable == preloadData[preload]) return; // no change
    document.getElementById('preload').value = 'no';
}

function preloadChanged() {
    var preload = document.getElementById('preload').value;
    if (preload == 'no') return;
    document.getElementById('routeTable').value = preloadData[preload];
    switchCLITo('input');
    clearSVG();
}

function svgAction(e, what) {
    var actionEl = e.srcElement;
    clearSVGSelection(what);
    clearInteractiveCLISelection(what);

    if (actionEl.tagName.toLowerCase() != 'path') return;
    if (getClassList(actionEl).indexOf('ipRange') == -1) return;
    var actionGroup = actionEl.parentNode;
    if (actionGroup.tagName.toLowerCase() != 'g') return;
    if (actionGroup.parentNode.tagName.toLowerCase() != 'g') return;
    if (actionGroup.parentNode.id != 'z2') return;

    makeSVGSelection(actionGroup, what);
    var routeLineEl = document.querySelector('#interactiveCLI td#' + actionGroup.id);
    makeInteractiveCLISelection(routeLineEl, what);
}

function clearSVGSelection(what) {
    var allPaths = svg.querySelectorAll('#z2 g.ipRange');
    for (var i = 0; i < allPaths.length; i++) {
        var path = allPaths[i];
        path.classList.remove(what);
    }
}

function makeSVGSelection(svgEl, what) {
    if (svgEl.tagName.toLowerCase() != 'g') return;
    svgEl.classList.add(what);
}

function parseButton() {
    svg.style.display = 'inline';
    clearSVG();
    var routeTableStr = document.getElementsByTagName('textarea')[0].value;
    var routeTableList = routeTableStr.split('\n');
    var routeTableData = parseRouteTable(routeTableList);
    if (routeTableData.routes.length == 0) {
        error('no routes found');
        return null;
    }
    try {
        for (var i = 0; i < routeTableData.routes.length; i++) {
            routeTableData.routes[i] = getMissingData(routeTableData.routes[i]);

            // extract the minimum and maximum ip addresses
            var routeTableLine = routeTableData.routes[i];
            if (
                (routeTableData.minIPList == null) || (
                    ipList2Int(routeTableData.minIPList) >
                    ipList2Int(routeTableLine.hostStartList)
                )
            ) routeTableData.minIPList = routeTableLine.hostStartList;
            if (
                (routeTableData.maxIPList == null) || (
                    ipList2Int(routeTableData.maxIPList) <
                    ipList2Int(routeTableLine.hostEndList)
                )
            ) routeTableData.maxIPList = routeTableLine.hostEndList;
        }
    } catch (e) {
        error(e);
        return null;
    }
    render(routeTableData);
    convertTextarea(routeTableList, routeTableData);
    switchCLITo('interactive');
}

function switchCLITo(what) {
    switch(what) {
        case 'input':
            document.getElementById('routeTable').style.display = 'block';
            document.getElementById('interactiveCLI').style.display = 'none';

            // buttons
            document.getElementById('edit').style.display = 'none';
            document.getElementById('parse').style.display = 'inline-block';
            break;
        case 'interactive':
            document.getElementById('routeTable').style.display = 'none';
            document.getElementById('interactiveCLI').style.display = 'block';

            // buttons
            document.getElementById('edit').style.display = 'inline-block';
            document.getElementById('parse').style.display = 'none';
            break;
    }
}

function convertTextarea(routeTableList, routeTableData) {
    var interactiveCLI = document.getElementById('interactiveCLI');
    var html = ''; // init
    // lines that have route rules in them (examples of other lines are headings, separators, and empty lines)
    //var actualRouteLines = [];
    var mapRouteLines = {}; // from route table list to routeTableData.routes
    for (var i = 0; i < routeTableData.routes.length; i++) {
        var route = routeTableData.routes[i];
        mapRouteLines[route.originalLineNum] = i;
    }
    for (var i = 0; i < routeTableList.length; i++) {
        var routeTableLine = routeTableList[i];
        var extra = '';

        if (mapRouteLines.hasOwnProperty(i)) extra = ' id="routeLine' +
        mapRouteLines[i] + '" class="is-route"';

        html += '<tr><td' + extra + '>' + routeTableLine + '</td></tr>';
    }
    interactiveCLI.innerHTML = html;
}

function interactiveCLIAction(e, what) {
    clearInteractiveCLISelection(what);
    clearSVGSelection(what);
    var actionEl = e.srcElement;
    var validElForSelection = makeInteractiveCLISelection(actionEl, what);
    if (!validElForSelection) return;
    var svgGroupEl = svg.getElementById(actionEl.id);
    makeSVGSelection(svgGroupEl, what);
}

function clearInteractiveCLISelection(what) {
    var selectedEls = document.querySelectorAll('#interactiveCLI td.' + what);
    for (var i = 0; i < selectedEls.length; i++) {
        var previouslyClickedEl = selectedEls[i];
        removeCSSClass(previouslyClickedEl, what);
    }
}

function makeInteractiveCLISelection(el, what) {
    if (el.tagName.toLowerCase() != 'td') return false;
    if (getClassList(el).indexOf('is-route') == -1) return false;
    addCSSClass(el, what);
    return true;
}


function parseRouteTable(routeTableList) {
    var section = '';
    var parsedData = {
        os: null,
        minIPList: null,
        maxIPList: null,
        routes: []
    };
    for (var i = 0; i < routeTableList.length; i++) {
        var thisLine = trim(routeTableList[i].toLowerCase());
        var thisLineList = thisLine.split(/[\s]+/);

        if (thisLineList[0] == '') continue; // ignore empty lines
        if (thisLine[0] == '=') continue; // ignore separators

        if (thisLineList[0] == 'kernel') {
            parsedData.os = 'linux';
            section = 'routes';
            continue;
        }
        if (thisLineList[0] == 'interface' && thisLineList[1] == 'list') {
            parsedData.os = 'windows';
            section = ''; // not implemented
            continue;
        }
        if (
            thisLineList[0] == 'ipv4'
            && thisLineList[1] == 'route'
            && thisLineList[2] == 'table'
        ) {
            parsedData.os = 'windows';
            section = 'routes';
            continue;
        }
        if (
            thisLineList[0] == 'ipv6'
            && thisLineList[1] == 'route'
            && thisLineList[2] == 'table'
        ) {
            parsedData.os = 'windows';
            section = ''; // not implemented
            continue;
        }
        if (thisLineList[0] == 'persistent' && thisLineList[1] == 'routes:') {
            parsedData.os = 'windows';
            section = ''; // not implemented
            continue;
        }

        if (parsedData.os == null || section == '') continue;

        if (
            parsedData.os == 'linux'
            && section == 'routes'
            && parsedData[section].length == 0 // we have not yet begun
            && thisLineList[0] == 'destination'
        ) continue; // ignore route table header row

        if (parsedData.os == 'windows') {
            if (section == 'interfaces') continue; // ignore windows interfaces

            if (
                section == 'routes'
                && parsedData[section].length == 0 // we have not yet begun
                && thisLineList[0] == 'network'
                && thisLineList[1] == 'destination'
            ) continue; // ignore route table header row

            if (
                section == 'routes'
                && parsedData[section].length == 0 // we have not yet begun
                && thisLineList[0] == 'active'
                && thisLineList[1] == 'routes:'
            ) continue; // ignore 'active routes:' line
        }

        var lineDict = {
            originalLineNum: i
        };
        for (var key in routeTableFormat[parsedData.os][section]) {
            var name = routeTableFormat[parsedData.os][section][key];
            var translatedName = name; // init
            if (translations.hasOwnProperty(name)) {
                translatedName = translations[name];
            }
            var value;
            if (parseInt(key) == key) value = thisLineList[key];
            else if (key == 'last') value = thisLineList[thisLineList.length - 1];
            switch (translatedName) {
                case 'destination':
                    lineDict['original' + translatedName] = value;
                    if (value == 'default') value = '0.0.0.0';
                    break;
                case 'gateway':
                    lineDict['original' + translatedName] = value;
                    switch (value) {
                        case '*':
                        case 'on-link':
                            value = '0.0.0.0';
                            break;
                    }
                    break;
            }
            lineDict[translatedName] = value;
        }
        parsedData[section].push(lineDict);
    }
    return parsedData;
}

function error(txt) {
    document.getElementById('error').innerHTML = txt;
}

// rendering

function clearSVG() {
    removeAllChildren(svg.getElementById('z0'));
    removeAllChildren(svg.getElementById('z1'));
    removeAllChildren(svg.getElementById('z2'));
    removeAllChildren(svg.getElementById('z3'));
    removeAllChildren(svg.getElementById('z4'));
    donePaths = []; // reset
}

function removeAllChildren(el) {
    while (el.lastChild) {
        el.removeChild(el.lastChild);
    }
}

function render(routeTableData) {
    document.getElementById('visualRouteTable').style.display = 'block';
    // resize the svg height to fit the interfaces and gateways
    resizeSVGHeight(routeTableData);

    // render the areas
    renderNamedArea(
        svgProperties.topHalfHeight,
        -1, // otherwise the svg border + the div border is extra thick
        svgProperties.interfaceLeft + svgProperties.deviceSquareHeight,
        'this machine'
    );
    renderNamedArea(
        svgProperties.overallHeight,
        svgProperties.interfaceLeft + svgProperties.deviceSquareHeight -
        svgProperties.areaBorderWidth,
        svgProperties.gatewayLeft + svgProperties.deviceSquareHeight,
        'LAN'
    );
    renderNamedArea(
        svgProperties.overallHeight,
        svgProperties.gatewayLeft + svgProperties.deviceSquareHeight -
        svgProperties.areaBorderWidth,
        svgProperties.overallWidth + 1, // +1 as with -1 above
        'WAN'
    );
    renderIPLimits(routeTableData);

    // get the interface coordinates
    var interfaceData = getInterfaceCoordinates(routeTableData);

    // get the gateway coordinates
    var gatewayData = getGatewayCoordinates(routeTableData);

    // render the interfaces
    renderInterfaces(interfaceData);

    // render the gateways
    renderGateways(gatewayData);

    // render the external destinations
    renderExternalDestinations(gatewayData);

    // then get the ip range coordinates
    var ipRangesData = getIPRangeCoordinates(routeTableData);
    // render the ip ranges going to the interfaces

    renderIPRanges(ipRangesData, interfaceData, gatewayData);

    // select the correct route table line
    var destinationIP = document.getElementById('inputDestinationIP').value;
    var destinationIPList = ip2List(destinationIP);
    var routeTableDataLine = pickPath(destinationIPList, routeTableData);
    if (routeTableDataLine == null) return;

    // render the desination ip flow
    renderDestinationIPFlow(
        destinationIP,
        destinationIPList,
        routeTableDataLine,
        interfaceData,
        gatewayData,
        routeTableData
    );
}

function resizeSVGHeight(routeTableData) {
    var interfaceNames = []; // init
    var gatewayNames = []; // init
    var defaultGWFound = false;
    for (var i = 0; i < routeTableData.routes.length; i++) {
        var routeLine = routeTableData.routes[i];

        var interfaceName = routeLine.interface;
        if (interfaceNames.indexOf(interfaceName) == -1) {
            interfaceNames.push(interfaceName);
        }
        var gatewayName = routeLine.gateway;
        if (gatewayNames.indexOf(gatewayName) == -1) {
            switch (gatewayName) {
                case '0.0.0.0':
                case '*':
                case 'on-link':
                    defaultGWFound = true;
                    break;
            }
            gatewayNames.push(gatewayName);
        }
    }

    var minHeightForInterfaces =
    (2 * svgProperties.verticalGapBeforeAndAfterInterfaces) +
    (interfaceNames.length * svgProperties.deviceSquareHeight) + (
        (interfaceNames.length - 1) * svgProperties.minVerticalGapBetweenInterfaces
    );

    var minHeightForGateways =
    (2 * svgProperties.verticalGapBeforeAndAfterGateways) +
    (gatewayNames.length * svgProperties.deviceSquareHeight) + (
        (gatewayNames.length - 1) * svgProperties.minVerticalGapBetweenGateways
    );
    svgProperties.topHalfHeight = minHeightForInterfaces; // init
    if (minHeightForGateways > svgProperties.topHalfHeight) {
        svgProperties.topHalfHeight = minHeightForGateways;
    }
    var minHeightForGatewaysAndOtherMachines = 0;
    if (defaultGWFound) minHeightForGatewaysAndOtherMachines =
    svgProperties.topHalfHeight -
    svgProperties.verticalGapBeforeAndAfterGateways +
    svgProperties.verticalGapAfterOtherNic +
    svgProperties.verticalGapBetweenOtherNicAndGateways +
    svgProperties.deviceSquareHeight

    svgProperties.overallHeight = svgProperties.topHalfHeight; // init
    if (minHeightForGatewaysAndOtherMachines > svgProperties.overallHeight) {
        svgProperties.overallHeight = minHeightForGatewaysAndOtherMachines;
    }
    svg.style.height = svgProperties.overallHeight;
    svg.setAttribute('viewBox', '0 0 800 ' + svgProperties.overallHeight);
}

function renderNamedArea(height, startX, endX, text) {
    var rectEl = newSVGEl('rect');
    rectEl.setAttribute('x', startX + (svgProperties.areaBorderWidth / 2));
    // -1 to prevent the top border appearing double width
    rectEl.setAttribute('y', (svgProperties.areaBorderWidth / 2) - 1);
    rectEl.setAttribute('width', endX - startX - svgProperties.areaBorderWidth);
    // +1 for -1 earlier, +1 to prevent the bottom border appearing double width
    rectEl.setAttribute('height', height - svgProperties.areaBorderWidth + 2);
    rectEl.setAttribute('stroke-width', svgProperties.areaBorderWidth);
    rectEl.setAttribute('class', 'namedArea');
    svg.getElementById('z0').appendChild(rectEl);

    var textEl = newSVGEl('text');
    textEl.textContent = text;
    textEl.setAttribute('x', startX + ((endX - startX) / 2));
    textEl.setAttribute('y', svgProperties.areaBorderWidth + 4);
    textEl.setAttribute('class', 'areaName');
    svg.getElementById('z0').appendChild(textEl);
}

function renderIPLimits(routeTableData) {
    var minIPTextEl = newSVGEl('text');
    minIPTextEl.setAttribute(
        'x',
        svgProperties.ipLeft - svgProperties.ipHorizontalMargin
    );
    minIPTextEl.setAttribute(
        'y',
        svgProperties.topHalfHeight -
        svgProperties.verticalGapBeforeAndAfterIPRange -
        svgProperties.ipTextVerticalMargin
    );
    minIPTextEl.setAttribute('id', 'smallestIP');
    minIPTextEl.textContent = ipList2IP(routeTableData.minIPList);
    svg.getElementById('z1').appendChild(minIPTextEl);

    var maxIPTextEl = newSVGEl('text');
    maxIPTextEl.setAttribute(
        'x', svgProperties.ipLeft - svgProperties.ipHorizontalMargin
    );
    maxIPTextEl.setAttribute(
        'y',
        svgProperties.verticalGapBeforeAndAfterIPRange +
        svgProperties.ipTextVerticalMargin
    );
    maxIPTextEl.setAttribute('id', 'largestIP');
    maxIPTextEl.textContent = ipList2IP(routeTableData.maxIPList);
    svg.getElementById('z1').appendChild(maxIPTextEl);
}

function getInterfaceCoordinates(routeTableData) {
    var interfaceNames = [];
    for (var i = 0; i < routeTableData.routes.length; i++) {
        var interfaceName = routeTableData.routes[i].interface;
        if (interfaceNames.indexOf(interfaceName) != -1) continue;
        interfaceNames.push(interfaceName);
    }
    if (interfaceNames.length == 0) return null;
    var interfaceData = []; // init
    var heightForInterfaces =
    svgProperties.topHalfHeight -
    (svgProperties.verticalGapBeforeAndAfterInterfaces * 2);
    var verticalGapBetweenInterfaces = (
        heightForInterfaces -
        (interfaceNames.length * svgProperties.deviceSquareHeight)
    ) / (interfaceNames.length - 1);
    for (var i = 0; i < interfaceNames.length; i++) {
        var top = svgProperties.verticalGapBeforeAndAfterInterfaces + (
            i * (
                svgProperties.deviceSquareHeight + verticalGapBetweenInterfaces
            )
        );
        interfaceData.push({
            name: interfaceNames[i],
            top: top,
            midway: top + (svgProperties.deviceSquareHeight / 2),
            bottom: top + svgProperties.deviceSquareHeight
        });
    }
    return interfaceData;
}

function renderInterfaces(interfaceData) {
    for (var i = 0; i < interfaceData.length; i++) {
        var nicData = interfaceData[i];
        render1Nic(svgProperties.interfaceLeft, nicData.top, nicData.name);
    }
}

function getGatewayCoordinates(routeTableData) {
    var gatewayNames = [];
    var defaultGWFound = false;
    var defaultGWName;
    for (var i = 0; i < routeTableData.routes.length; i++) {
        var gatewayName = routeTableData.routes[i].originalGateway;
        switch (gatewayName) {
            case '0.0.0.0':
            case '*':
            case 'on-link':
                defaultGWName = gatewayName;
                defaultGWFound = true;
                continue;
        }
        if (gatewayNames.indexOf(gatewayName) != -1) continue;
        gatewayNames.push(gatewayName);
    }
    // the default gateway must go on the end
    if (defaultGWFound) gatewayNames.push(defaultGWName);
    if (gatewayNames.length == 0) return null;
    var gatewayData = []; // init
    var heightForGateways = svgProperties.topHalfHeight -
    (svgProperties.verticalGapBeforeAndAfterGateways * 2);
    var verticalGapBetweenGateways = (
        heightForGateways -
        (gatewayNames.length * svgProperties.deviceSquareHeight)
    ) / (gatewayNames.length - 1);
    for (var i = 0; i < gatewayNames.length; i++) {
        var top = svgProperties.verticalGapBeforeAndAfterGateways + (
            i * (svgProperties.deviceSquareHeight + verticalGapBetweenGateways)
        );
        gatewayData.push({
            name: gatewayNames[i],
            top: top,
            midway: top + (svgProperties.deviceSquareHeight / 2),
            bottom: top + svgProperties.deviceSquareHeight
        });
    }
    return gatewayData;
}

function renderGateways(gatewayData) {
    for (var i = 0; i < gatewayData.length; i++) {
        var gwData = gatewayData[i];
        var text = gwData.name;
        switch (text) {
            case '0.0.0.0':
            case '*':
            case 'on-link':
                text += '\n(default)';
                break;
        }
        render1Gateway(svgProperties.gatewayLeft, gwData.top, text);
    }
}

function renderExternalDestinations(gatewayData) {
    for (var i = 0; i < gatewayData.length; i++) {
        var gwData = gatewayData[i];
        switch (gwData.name) {
            case '0.0.0.0':
            case '*':
            case 'on-link':
                // LAN
                render1Nic(
                    svgProperties.gatewayLeft,
                    gwData.top + svgProperties.deviceSquareHeight +
                    svgProperties.verticalGapBetweenOtherNicAndGateways,
                    'other\nmachines'
                );
                break;
            default: // WAN or internet
                render1Gateway(
                    svgProperties.externalDestinationLeft,
                    gwData.top,
                    ''
                );
                break;
        }
    }
}

function render1Nic(left, top, text) {
    var nicEl = svgDefs.querySelectorAll('.nic')[0].cloneNode(true);
    var rectEl = nicEl.getElementsByTagName('rect')[0];

    rectEl.setAttribute('height', svgProperties.deviceSquareHeight);
    rectEl.setAttribute('width', svgProperties.deviceSquareHeight);
    nicEl.setAttribute('transform', 'translate(' + left + ',' + top + ')');
    var nicTextEl = nicEl.getElementsByTagName('text')[0];
    nicTextEl.setAttribute('x', svgProperties.deviceSquareHeight / 2);
    nicTextEl.setAttribute('y', (svgProperties.deviceSquareHeight / 2));
    renderMultilineText(nicTextEl, text);
    svg.getElementById('z4').appendChild(nicEl);
}

function render1Gateway(left, top, text) {
    var gwEl = svgDefs.querySelectorAll('.gateway')[0].cloneNode(true);
    gwEl.getElementsByTagName('circle')[0].setAttribute(
        'r',
        svgProperties.deviceSquareHeight / 2
    );
    gwEl.setAttribute(
        'transform',
        'translate(' + (left + (svgProperties.deviceSquareHeight / 2)) + ',' +
        (top + (svgProperties.deviceSquareHeight / 2)) + ')'
    );
    renderMultilineText(gwEl.getElementsByTagName('text')[0], text);
    svg.getElementById('z4').appendChild(gwEl);
}

function renderMultilineText(textEl, text) {
    var textLines = text.split('\n');
    textEl.setAttribute('y', (-0.55 * (textLines.length - 1)) + 'em');
    for (var i = 0; i < textLines.length; i++) {
        var tspanEl = newSVGEl('tspan');
        tspanEl.textContent = textLines[i];
        tspanEl.setAttribute('x', 0);
        if (i > 0) tspanEl.setAttribute('dy', '1.2em');
        textEl.appendChild(tspanEl); 
    }
}

function getIPRangeCoordinates(routeTableData) {
    var interfaceData = []; // init
    for (var i = 0; i < routeTableData.routes.length; i++) {
        var routeTableLine = routeTableData.routes[i];
        var start = ipInt2Y(
            ipList2Int(routeTableLine.hostStartList),
            routeTableData
        );
        var end = ipInt2Y(
            ipList2Int(routeTableLine.hostEndList),
            routeTableData
        );
        interfaceData.push({
            routeLine: i,
            startIP: routeTableLine.hostStartList.join('.'), 
            endIP: routeTableLine.hostEndList.join('.'),
            top: end,
            bottom: start,
            interfaceName: routeTableLine.interface,
            gatewayName: routeTableLine.originalGateway
        });
    }
    return interfaceData;
}

function ipInt2Y(ipInt, routeTableData) {
    var maxIPInt = ipList2Int(routeTableData.maxIPList);
    var minIPInt = ipList2Int(routeTableData.minIPList);
    // given 2 points, we can find the line between them:
    var p1x = minIPInt;
    var p1y = svgProperties.topHalfHeight -
    svgProperties.verticalGapBeforeAndAfterIPRange;
    var p2x = maxIPInt;
    var p2y = svgProperties.verticalGapBeforeAndAfterIPRange;
    var slope = (p2y - p1y) / (p2x - p1x);
    // y1 = mx1 + c
    var intercept = p1y - (slope * p1x);
    return (slope * ipInt) + intercept;
}

function renderIPRanges(ipRangesData, interfacesData, gatewaysData) {
    for (var i = 0; i < ipRangesData.length; i++) {
        var pathColor = svgProperties.ipColors[
            i % svgProperties.ipColors.length
        ];
        var ipRangeData = ipRangesData[i];
        var interfaceData = null; //init/reset
        for (var j = 0; j < interfacesData.length; j++) {
            if (ipRangeData.interfaceName != interfacesData[j].name) continue;
            interfaceData = interfacesData[j]; // use this one
            break;
        }

        var gatewayData = null; //init/reset
        for (var j = 0; j < gatewaysData.length; j++) {
            if (ipRangeData.gatewayName != gatewaysData[j].name) continue;
            gatewayData = gatewaysData[j]; // use this one
            break;
        }
        var group = newSVGEl('g');
        group.setAttribute('class', 'ipRange');

        // the path from the ip range to the interface
        var startX = svgProperties.ipLeft;
        var startY = ipRangeData.bottom;
        var path = 'M' + startX + ',' + startY + ' ';

        var endX = svgProperties.interfaceLeft;
        var endY = interfaceData.bottom;
        path += getIPBezier(startX, startY, endX, endY);

        startX = endX;
        startY = interfaceData.top;
        path += 'V' + startY + ' ';

        endX = svgProperties.ipLeft;
        endY = ipRangeData.top;
        path += getIPBezier(startX, startY, endX, endY) + 'Z';
        group = renderIPRange(path, group, pathColor);

        // the path from the interface to the gateway
        startX = svgProperties.interfaceLeft + svgProperties.deviceSquareHeight;
        startY = interfaceData.top;
        path = 'M' + startX + ',' + startY + ' '; // new path

        endX = svgProperties.gatewayLeft +
        (svgProperties.deviceSquareHeight / 2);
        endY = gatewayData.top;
        path += getIPBezier(startX, startY, endX, endY);

        endY = gatewayData.bottom;
        path += 'V' + endY;

        startX = endX;
        startY = endY;
        endX = svgProperties.interfaceLeft + svgProperties.deviceSquareHeight;
        endY = interfaceData.bottom;
        path += getIPBezier(startX, startY, endX, endY) + 'Z';
        group = renderIPRange(path, group, pathColor);

        // the path from the gateway to the foreign gateway
        switch (gatewayData.name) {
            case '0.0.0.0':
            case '*':
            case 'on-link':
                // LAN - go downwards
                startX = svgProperties.gatewayLeft;
                startY = gatewayData.top +
                (svgProperties.deviceSquareHeight / 2);
                path = 'M' + startX + ',' + startY + ' '; // new path

                endY = gatewayData.bottom +
                svgProperties.verticalGapBetweenOtherNicAndGateways;
                path += 'V' + endY;

                endX = svgProperties.gatewayLeft +
                svgProperties.deviceSquareHeight;
                path += 'H' + endX;

                endY = startY;
                path += 'V' + endY + 'Z';
                break;
            default: // WAN - go right
                startX = svgProperties.gatewayLeft +
                (svgProperties.deviceSquareHeight / 2);
                startY = gatewayData.top;
                path = 'M' + startX + ',' + startY + ' '; // new path

                endX = svgProperties.overallWidth;
                path += 'H' + endX;

                endY = gatewayData.bottom;
                path += 'V' + endY;

                endX = startX;
                path += 'H' + endX + 'Z';
                break;
        }
        group = renderIPRange(path, group, pathColor);
        group = renderIPText(group, ipRangeData);
        group.setAttribute('id', 'routeLine' + ipRangeData.routeLine);
        svg.getElementById('z2').appendChild(group);
    }
}

function renderIPRange(path, group, color) {
    var pathEl = newSVGEl('path');
    pathEl.setAttribute('d', path);
    pathEl.setAttribute('fill', color);
    pathEl.setAttribute('class', 'ipRange');
    group.appendChild(pathEl);
    if (donePaths.indexOf(path) == -1) {
        svg.getElementById('z1').appendChild(pathEl.cloneNode(true));
    }
    donePaths.push(path); // global
    return group;
}

function renderIPText(group, ipRangeData) {
    var startIPTextClass = ''; // init
    var startIPTextY = 0; //init
    var endIPTextClass = ''; // init
    var endIPTextY = 0; //init

    var startIPNearEndIP = (ipRangeData.bottom - ipRangeData.top) <=
    ((2 * svgProperties.fontSize) + svgProperties.ipTextVerticalMargin);

    var startIPNearBottom = (
        svgProperties.topHalfHeight -
        svgProperties.verticalGapBeforeAndAfterIPRange -
        ipRangeData.bottom
    ) < svgProperties.fontSize;
    var endIPNearBottom = (
        svgProperties.topHalfHeight -
        svgProperties.verticalGapBeforeAndAfterIPRange -
        ipRangeData.top
    ) < svgProperties.fontSize;
    var startIPNearTop = (
        ipRangeData.bottom -
        svgProperties.verticalGapBeforeAndAfterIPRange
    ) < svgProperties.fontSize;
    var endIPNearTop = (
        ipRangeData.top - svgProperties.verticalGapBeforeAndAfterIPRange
    ) < svgProperties.fontSize;
    var startIPtext = newSVGEl('text');

    if (ipRangeData.startIP == ipRangeData.endIP) {
        startIPtext.setAttribute(
            'x',
            svgProperties.ipLeft + svgProperties.ipHorizontalMargin
        );
        startIPTextY = ipRangeData.bottom;
        if (startIPNearBottom) {
            startIPTextClass = 'startIP';
            startIPTextY -= svgProperties.ipTextVerticalMargin;
        } else if (startIPNearTop) {
            startIPTextClass = 'endIP';
            startIPTextY += svgProperties.ipTextVerticalMargin;
        } else startIPTextClass = 'hostIP';
        startIPtext.setAttribute('y', startIPTextY);
        startIPtext.textContent = ipRangeData.startIP;
        startIPtext.setAttribute('class', startIPTextClass);
        group.appendChild(startIPtext);
        return group;
    }

    startIPtext.setAttribute(
        'x',
        svgProperties.ipLeft + svgProperties.ipHorizontalMargin
    );
    startIPTextY = ipRangeData.bottom;
    if (startIPNearEndIP && !startIPNearBottom) {
        startIPTextClass = 'startIP-near-endIP';
        startIPTextY += svgProperties.ipTextVerticalMargin;
        if (endIPNearTop) startIPTextY = ipRangeData.top +
        svgProperties.fontSize + (2 * svgProperties.ipTextVerticalMargin);
    } else {
        startIPTextY -= svgProperties.ipTextVerticalMargin;
        startIPTextClass = 'startIP';
    }
    startIPtext.setAttribute('y', startIPTextY);
    startIPtext.textContent = ipRangeData.startIP;
    startIPtext.setAttribute('class', startIPTextClass);
    group.appendChild(startIPtext);

    var endIPtext = newSVGEl('text');
    endIPtext.setAttribute(
        'x',
        svgProperties.ipLeft + svgProperties.ipHorizontalMargin
    );
    endIPTextY = ipRangeData.top;
    if (startIPNearEndIP && !endIPNearTop) {
        endIPTextClass = 'endIP-near-startIP';
        endIPTextY -= svgProperties.ipTextVerticalMargin;
        if (startIPNearBottom) endIPTextY = ipRangeData.bottom -
        svgProperties.fontSize - (2 * svgProperties.ipTextVerticalMargin);
    } else {
        endIPTextY += svgProperties.ipTextVerticalMargin;
        endIPTextClass = 'endIP';
    }
    endIPtext.setAttribute('y', endIPTextY);
    endIPtext.textContent = ipRangeData.endIP;
    endIPtext.setAttribute('class', endIPTextClass);
    group.appendChild(endIPtext);
    return group;
}

// given a destination ip (list), choose the line from the route table that
// applies to it. if there is more than one line then set an error and return
// null
function pickPath(destinationIPList, routeTableData) {
    // first find all route table lines that apply
    var applicableRouteLines = []; // init
    var largestNetmaskBits = 0; // init (largest = 32 = the most specific)
    for (var i = 0; i < routeTableData.routes.length; i++) {
        var routeTableDataLine = routeTableData.routes[i];
        var inRange = true; // start optimistic
        for (var j = 0; j < destinationIPList.length; j++) {
            if (
                (destinationIPList[j] < routeTableDataLine.hostStartList[j])
                || (destinationIPList[j] > routeTableDataLine.hostEndList[j])
            ) {
                inRange = false;
                break;
            }
        }
        if (!inRange) continue;
        var netmaskBits = maskList2Bits(routeTableDataLine.maskList);
        applicableRouteLines.push({
            line: i,
            netmaskBits: netmaskBits
        });
        if (netmaskBits > largestNetmaskBits) largestNetmaskBits = netmaskBits;
    }

    // then only keep the largest netmask item(s)
    var keep = []; // init
    for (var i = 0; i < applicableRouteLines.length; i++) {
        var applicableRouteData = applicableRouteLines[i];
        if (applicableRouteData.netmaskBits < largestNetmaskBits) continue;
        keep.push(applicableRouteData.line);
    }
    
    if (keep.length == 0) {
        error('no route rules apply to this destination ip');
        return null;
    }
    if (keep.length > 1) {
        error('more than 1 route rule applies to this destination ip');
        return null;
    }
    return routeTableData.routes[keep[0]];
}

function renderDestinationIPFlow(
    destinationIP, destinationIPList, routeTableLine, interfaceData,
    gatewayData, routeTableData
) {
    var destinationIPInt = ipList2Int(destinationIPList);

    var startX = svgProperties.ipLeft;
    var startY = ipInt2Y(destinationIPInt, routeTableData);
    var path = 'M' + startX + ',' + startY + ' ';

    var relevantInterface = null;
    for (var i = 0; i < interfaceData.length; i++) {
        if (interfaceData[i].name != routeTableLine.interface) continue;
        relevantInterface = interfaceData[i];
        break;
    }
    var endY = relevantInterface.midway;
    var endX = svgProperties.interfaceLeft;
    path += getIPBezier(startX, startY, endX, endY);
    
    var destinationIPtext = newSVGEl('text');
    destinationIPtext.setAttribute('x', svgProperties.ipLeft - 2);
    destinationIPtext.setAttribute('y', startY);
    destinationIPtext.textContent = destinationIP;
    destinationIPtext.setAttribute('class', 'destinationIP');
    svg.getElementById('z3').appendChild(destinationIPtext);
    
    startX = svgProperties.interfaceLeft + svgProperties.deviceSquareHeight;
    startY = endY;
    path += 'H' + startX;
    
    var relevantGateway = null;
    for (var i = 0; i < gatewayData.length; i++) {
        if (gatewayData[i].name != routeTableLine.gateway) continue;
        relevantGateway = gatewayData[i];
        break;
    }
    endY = relevantGateway.midway;
    endX = svgProperties.gatewayLeft + (svgProperties.deviceSquareHeight / 2);
    var angledEnd = true;
    path += getIPBezier(startX, startY, endX, endY, angledEnd);
    switch (relevantGateway.name) {
        case '0.0.0.0':
        case '*':
        case 'on-link':
            path += 'V' + (
                svgProperties.overallHeight -
                svgProperties.verticalGapAfterOtherNic -
                svgProperties.deviceSquareHeight
            );
            break;
        default:
            path += 'H' + svgProperties.externalDestinationLeft;
            break;
    }
    
    pathEl = newSVGEl('path');
    pathEl.setAttribute('d', path);
    pathEl.setAttribute('class', 'destinationIPFlow');
    svg.getElementById('z3').appendChild(pathEl);
}

function getIPBezier(startX, startY, endX, endY, angledEnd) {
    // svg beziers look like this:
    // M start-x,start-y C control-x1 control-y1, control-x2 control-y2, end-x end-y
    // the start position must be set-up outside this function
    if (angledEnd == null) angledEnd = false;
    var controlSize = (endX - startX) / 2;
    var controlX1 = startX + controlSize;
    var controlY1 = startY;
    var controlX2, controlY2; // init
    if (angledEnd) {
        controlX2 = startX;
        controlY2 = startY;
    } else {
        controlX2 = endX - controlSize;
        controlY2 = endY;
    }
    return 'C ' + controlX1 + ' ' + controlY1 + ',' + controlX2 + ' ' +
    controlY2 + ',' + endX + ' ' + endY + ' ';
}

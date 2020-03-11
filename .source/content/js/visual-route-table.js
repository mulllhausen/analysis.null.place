// note: computers count from 0 (code), humans count from 1 (gui)
// todo: ipv6
// todo: rules for 192, 10, etc
// todo: prevent script injection

(function () { // new namespace

// init globals

var preloadData = {
    linux: '$ route -ve\n' +
'Kernel IP routing table\n' +
'Destination     Gateway  Genmask         Flags   MSS Window  irtt Iface\n' +
'default         net1     0.0.0.0         UG        0 0          0 eth1\n' +
'172.16.0.0      wan      255.255.0.0     UG        0 0          0 eth0\n' +
'192.168.0.0     *        255.255.255.0   U         0 0          0 eth0\n' +
'192.168.1.0     *        255.255.255.0   U         0 0          0 eth1',
    windows: '> route print\n' +
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
var maxErrorListHeight = 100; // px (copy this to keep in sync with ul#errorList max-height css)
var mode = null; // 'editing' or 'parsed'
var parseErrors = false; // init
var parseWarnings = false; // init
var destinationIPErrors = false; // init
var routeTableFormat = [ // list of objects. 1 object = 1 rule
    {
        action: 'ignore',
        type: 'regex',
        regex: '^\\s*$' // any amount of whitespace
    },
    {
        action: 'ignore',
        type: 'regex',
        regex: '^\\s*=*\\s*$' // something like '   ======== '
    },
    {
        action: 'match',
        type: 'regex',
        regex: '^\\s*kernel\\s+ip\\s+routing\\s+table\\s*$',
        beginsSection: 'routes',
        os: 'linux'
    },
    {
        action: 'match',
        type: 'regex',
        regex: '^\\s*ipv4\\s+route\\s+table\\s*$',
        beginsSection: 'routes',
        ipv: 4,
        os: 'windows'
    },
    {
        action: 'match',
        type: 'regex',
        regex: '^\\s*ipv6\\s+route\\s+table\\s*$',
        beginsSection: 'routes',
        ipv: 6,
        os: 'windows'
    },
    {
        action: 'match',
        type: 'regex',
        regex: '^\\s*active\\s+routes\\s*:\\s*$',
        withinSection: 'routes',
        os: 'windows'
    },
    {
        action: 'match',
        type: 'regex',
        regex: '^\\s*persistent\\s+routes\\s*:\\s*$',
        terminatesSection: 'routes',
        os: 'windows'
    },
    {
        action: 'match',
        type: 'regex',
        regex: '^\\s*persistent\\s+routes\\s*$',
        beginsSection: 'persistent routes',
        os: 'windows'
    },
    {
        action: 'match',
        type: 'regex',
        regex: '^\\s*routing\\s+tables\\s*$',
        beginsSection: 'routes',
        os: 'macos'
    },
    {
        action: 'match',
        type: 'regex',
        regex: '^\\s*internet:\\s*$',
        withinSection: 'routes',
        os: 'macos'
    },
    {
        action: 'match',
        type: 'list',
        list: [
            'destination', 'gateway', 'genmask', 'flags', 'metric', 'ref',
            'use', 'iface'
        ],
        beginsSection: 'routes',
        os: 'linux',
        isCIDRFormat: false,
        deducedCommand: 'route',
        isHeaderRow: true
    },
    {
        action: 'match',
        type: 'list',
        list: [
            'destination', 'gateway', 'genmask', 'flags', 'mss', 'window',
            'irtt', 'iface'
        ],
        beginsSection: 'routes',
        os: 'linux',
        isCIDRFormat: false,
        deducedCommand: 'route -e',
        isHeaderRow: true
    },
    {
        action: 'match',
        type: 'list',
        list: [
            'destination', 'gateway', 'genmask', 'flags', 'metric', 'ref',
            'use', 'iface', 'mss', 'window', 'irtt'
        ],
        beginsSection: 'routes',
        os: 'linux',
        isCIDRFormat: false,
        deducedCommand: 'route -ee',
        isHeaderRow: true
    },
    {
        action: 'match',
        type: 'list',
        list: [
            'network destination', 'netmask', 'gateway', 'interface', 'metric'
        ],
        beginsSection: 'routes',
        os: 'windows',
        isCIDRFormat: false,
        deducedCommand: 'route print',
        isHeaderRow: true
    },
    {
        action: 'match',
        type: 'list',
        list: ['if', 'metric', 'network destination', 'gateway'],
        beginsSection: 'routes',
        os: 'windows',
        isCIDRFormat: true,
        deducedCommand: 'route print',
        isHeaderRow: true
    },
    {
        action: 'match',
        type: 'list',
        list: [
            'destination', 'gateway', 'flags', 'refs', 'use', 'netif', 'expire'
        ],
        withinSection: 'routes',
        os: 'macos',
        isCIDRFormat: true,
        deducedCommand: 'netstat -rn',
        isHeaderRow: true
    },
    {
        action: 'match',
        type: 'dynamic-list',
        dynamicListLength: function (argsList) {
            var headers = argsList[0];
            if (headers == null) return 0;
            return headers.length;
        },
        dynamicListLengthArgs: ['parsedData.headers'],
        dynamicListItem: '\\S+',
        withinSection: 'routes',
        isRoute: true
    }
];
var translations = {
    'network destination': 'destination',
    genmask: 'mask',
    netmask: 'mask',
    iface: 'interface',
    netif: 'interface'
}
var svgProperties = {
    overallHeight: 400, // gets updated to match the svg
    overallWidth: 400, // gets updated to fit elements
    topHalfHeight: 0, // gets updated to fit elements
    fontSize: 12,
    areaBorderWidth: 1,

    // the gap before the ip ranges, repeated at the bottom too
    verticalGapBeforeAndAfterIPRange: 20,

    ipTextVerticalMargin: 4,
    ipLeft: 113, // the left position of the ip ranges
    ipHorizontalMargin: 2,
    ipColors: [
        'blue'//,'green', 'red', 'purple'
    ],

    deviceSquareHeight: 100, // the height for interfaces and gateways
    interfaceLeft: 260, // the left position of the interfaces
    minVerticalGapBetweenInterfaces: 10,

    // the gap before interfaces, repeated at the bottom too
    verticalGapBeforeAndAfterInterfaces: 30,

    gatewayLeft: 460, // the left position of the gateways
    minVerticalGapBetweenGateways: 10,

    // the gap before gateways, repeated at the bottom too
    verticalGapBeforeAndAfterGateways: 30,
    
    externalDestinationLeft: 650, // the left position of the wan destination
    verticalGapBetweenOtherNicAndGateways: 70,
    verticalGapAfterOtherNic: 20
};
var donePaths = []; // keep a list of z1 paths

// globals so that the destination ip and input route table can be updated
// independently without requiring a complete recalc each time
var routeTableData = null; // init
var interfaceData = null; // init
var gatewayData = null; // init

// events

addEvent(window, 'load', function () {
    initSVGProperties();

    addEvent(
        document.getElementById('routeTable'),
        'change,keyup',
        routeTableChanged
    );
    addEvent(document.getElementById('preload'), 'change', preloadChanged);
    preloadChanged(); // init    
    addEvent(
        document.getElementById('inputDestinationIP'),
        'change,keyup',
        updateDestinationIP
    );

    addEvent(svg, 'mouseover,click', svgAction);

    addEvent(document.getElementById('parse'), 'click', parseButton);
    addEvent(document.getElementById('edit'), 'click', editButton);

    addEvent(
        document.getElementById('interactiveCLI'),
        'mouseover,click',
        interactiveCLIAction
    );

    addEvent(
        document.getElementById('errorList'),
        'mouseover,mouseout,click',
        function(e) { highlightWarningOrError(e, 'errorList'); }
    );
    addEvent(
        document.querySelector('#interactiveCLI.warning, #interactiveCLI.error'),
        'mouseover,mouseout,click',
        function(e) { highlightWarningOrError(e, 'interactiveCLI'); }
    );

    document.getElementById('preload').removeAttribute('disabled');
    document.getElementById('inputDestinationIP').removeAttribute('disabled');
    document.getElementById('routeTable').removeAttribute('disabled');
    document.getElementById('edit').removeAttribute('disabled');
    document.getElementById('parse').removeAttribute('disabled');
    removeGlassCase('form0', true); // permanently = true
    removeGlassCase('visualRouteTable', true); // permanently = true
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
    clearSVG();
    hideSVG();
    writeErrorList();
    mode = 'editing';
}

function routeTableChanged() {
    var preload = document.getElementById('preload').value;
    if (preload == 'no') return;
    var actualRouteTable = document.getElementById('routeTable').value;
    if (actualRouteTable == preloadData[preload]) return; // no change
    document.getElementById('preload').value = 'no';
}

function updateDestinationIP(doNotRender) {
    // select the correct route table line
    clearDestinationIPFlow();
    var destinationIP = document.getElementById('inputDestinationIP').value;
    var destinationIPList = ip2List(destinationIP);
    if (!validIP(destinationIPList, 4)) {
        destinationIPErrors = true; // global
        writeDestinationIPError('invalid destination IP address');
        return;
    }
    var routeTableDataLine = pickPath(destinationIPList, routeTableData);
    if (typeof routeTableDataLine == 'string') {
        // string = error
        destinationIPErrors = true; // global
        writeDestinationIPError(routeTableDataLine);
        return;
    }

    // render the desination ip flow
    if (mode == 'parsed' && doNotRender != true) renderDestinationIPFlow(
        destinationIP,
        destinationIPList,
        routeTableDataLine,
        interfaceData,
        gatewayData,
        routeTableData
    );
    destinationIPErrors = false; // global
    writeDestinationIPError(); // clear previous errors
}

function showErrorLegend() {
    document.getElementById('routeTableErrorContainer').style.display =
    (parseErrors || parseWarnings) ? 'block' : 'none';
}

function writeDestinationIPError(text) {
    var errorContainer = document.getElementById('destinationIPErrorContainer');
    var destinationIPInput = document.getElementById('inputDestinationIP');
    var errorText = document.getElementById('destinationIPErrors');
    if (text == null) {
        errorContainer.style.display = 'none';
        destinationIPInput.style.borderColor =
        'rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.25)';
        errorText.innerHTML = '';
    } else {
        errorContainer.style.display = 'block';
        destinationIPInput.style.borderColor = 'red';
        errorText.innerHTML = text;
    }
}

function writeErrorList(routeTableData) {
    parseErrors = false; // init (global)
    parseWarnings = false; // init (global)
    var errorContainer = document.getElementById('routeTableErrorContainer');
    var errorText = document.getElementById('errorList');
    if (routeTableData == null) {
        errorContainer.style.display = 'none';
        errorText.innerHTML = '';
        showErrorLegend();
        return;
    }
    errorContainer.style.display = 'block';
    var html = ''; // init

    // write the general warnings
    if (routeTableData.generalWarnings.length > 0) {
        parseWarnings = true; // global
        foreach (routeTableData.generalWarnings, function (i, k) {
            html += write1RouteTableError(k, 'warning');
        });
        addCSSClass(document.getElementById('interactiveCLI'), 'warning');
    }

    // write the general errors
    if (routeTableData.generalErrors.length > 0) {
        parseErrors = true; // global
        foreach (routeTableData.generalErrors, function (i, k) {
            html += write1RouteTableError(k, 'error');
        });
        addCSSClass(document.getElementById('interactiveCLI'), 'error');
    }

    // write the route errors
    var anyRouteErrors = false;
    for (var i = 0; i < routeTableData.routes.length; i++) {
        var route = routeTableData.routes[i];
        if (!route.hasOwnProperty('error')) continue;
        html += write1RouteTableError(route.error, 'error');
        anyRouteErrors = true;
        parseErrors = true; // global
    }
    if (anyRouteErrors) {
        addCSSClass(document.getElementById('interactiveCLI'), 'error');
    }
    errorText.innerHTML = html;
    showErrorsWarningsBorder();
    clearInteractiveCLISelection('hovered');
    clearInteractiveCLISelection('clicked');
    if (parseErrors) hideSVG();
    showErrorLegend();
}

function write1RouteTableError(k, type) {
    var startLink = ''; // init
    var endLink = ''; // init
    if (k.hasOwnProperty('routeNum') && k.hasOwnProperty('fieldNum')) {
        startLink = '<span' +
            ' class="' + type + '"' +
            ' routenum="' + k.routeNum + '"' +
            ' fieldnum="' + k.fieldNum + '">';
        endLink = '</span>';
    } else if (k.hasOwnProperty('lineNum')) {
        startLink = '<span' +
            ' class="' + type + '"' +
            ' linenum="' + k.lineNum + '">';
        endLink = '</span>';
    }
    return '<li class="' + type + '">' + startLink + k.text + endLink + '</li>\n';
}

function showErrorsWarningsBorder() {
    var errorListEl = document.getElementById('errorList');
    var actualHeight = errorListEl.offsetHeight;
    if (actualHeight >= maxErrorListHeight) addCSSClass(errorListEl, 'with-border');
    else removeCSSClass(errorListEl, 'with-border');
}

function preloadChanged() {
    writeErrorList();
    hideSVG();
    var preload = document.getElementById('preload').value;
    if (preload == 'no') return;
    document.getElementById('routeTable').value = preloadData[preload];
    parseButton();
}

function svgAction(e) {
    var what;
    switch (e.type) {
        case 'click':
            what = 'clicked';
            break;
        case 'mouseover':
            what = 'hovered';
            break;
    }
    var actionEl = e.srcElement;
    clearSVGSelection(what);
    clearInteractiveCLISelection(what);

    if (actionEl.tagName.toLowerCase() != 'path') return;
    if (!inArray('ipRange', getClassList(actionEl))) return;
    var actionGroup = actionEl.parentNode;
    if (actionGroup.tagName.toLowerCase() != 'g') return;
    if (actionGroup.parentNode.tagName.toLowerCase() != 'g') return;
    if (actionGroup.parentNode.id != 'z2') return;

    makeSVGSelection(actionGroup, what);
    var routeNum = actionGroup.getAttribute('routenum');
    var routeLineEl = document.querySelector(
        '#interactiveCLI td[routenum="' + routeNum + '"]'
    );
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
    writeErrorList(); // clear previous errors
    showSVG(); // css
    clearSVG(); // set svg innerHTML to empty
    var routeTableStr = document.getElementById('routeTable').value; // textarea
    var routeTableList = routeTableStr.split('\n');
    routeTableData = parseRouteTable(routeTableList); // global
    if (
        (routeTableData.generalErrors.length > 0)
        || (routeTableData.generalWarnings.length > 0)
    ) writeErrorList(routeTableData);
    if (routeTableData.generalErrors.length == 0) {
        try {
            routeTableData = getAllMissingData(routeTableData);
        } catch (e) {
            routeTableData.generalErrors.push({ text: e });
            writeErrorList(routeTableData);
            return null;
        }
    }
    var anyErrors = convertTextarea(routeTableList, routeTableData);
    switchCLITo('interactive');
    mode = 'parsed';
    if (anyErrors) return null;

    parseErrors = false; // global
    removeCSSClass(document.getElementById('interactiveCLI'), 'error');
    render(routeTableData);
    updateDestinationIP(anyErrors); // uses globals
}

function getAllMissingData(routeTableData) {
    for (var i = 0; i < routeTableData.routes.length; i++) {
        var route = routeTableData.routes[i];
        routeTableData.routes[i] = get1RouteMissingData(route);

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
    return routeTableData;
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

function convertTextarea(routeTableList, tmpRouteTableData) {
    var anyErrors = false; // init
    var interactiveCLI = document.getElementById('interactiveCLI');
    var html = ''; // init
    // lines that have route rules in them (examples of other lines are
    // headings, separators, and empty lines)
    var mapRouteLines = {}; // from route table list to tmpRouteTableData.routes
    for (var i = 0; i < tmpRouteTableData.routes.length; i++) {
        var route = tmpRouteTableData.routes[i];
        mapRouteLines[route.originalLineNum] = i;
    }
    var errorLines = {}; // list of all lines that have errors
    for (var i = 0; i < tmpRouteTableData.generalErrors.length; i++) {
        var error = tmpRouteTableData.generalErrors[i];
        errorLines[error.lineNum] = null; // keys avoid duplicates
        anyErrors = true;
    }
    var warningLines = {}; // list of all lines that have warnings
    for (var i = 0; i < tmpRouteTableData.generalWarnings.length; i++) {
        var warning = tmpRouteTableData.generalWarnings[i];
        warningLines[warning.lineNum] = null; // keys avoid duplicates
    }
    for (var i = 0; i < routeTableList.length; i++) {
        var routeTableLine = routeTableList[i];
        var tdExtra = '';

        if (warningLines.hasOwnProperty(i) || errorLines.hasOwnProperty(i)) {
            var classes = [];
            if (warningLines.hasOwnProperty(i)) classes.push('warning');
            if (errorLines.hasOwnProperty(i)) classes.push('error');
            var lineNum = 'linenum="' + i + '"';
            var clas = 'class="' + classes.join(' ') + '"';
            routeTableLine = '<span ' + lineNum + ' ' + clas + '>' +
                routeTableLine +
            '</span>';
        }

        if (mapRouteLines.hasOwnProperty(i)) {
            tdExtra = ' routenum="' + mapRouteLines[i] + '" class="is-route"';

            var routeTableDataItem = tmpRouteTableData.routes[mapRouteLines[i]];
            if (routeTableDataItem.hasOwnProperty('error')) {
                routeTableLine = renderTextareaLineWithError(
                    routeTableLine, routeTableDataItem.error.fieldNum
                );
                anyErrors = true;
            }
        }

        html += '<tr><td' + tdExtra + '>' + routeTableLine + '</td></tr>';
    }
    interactiveCLI.innerHTML = html;
    writeErrorList(tmpRouteTableData);
    return anyErrors;
}

function renderTextareaLineWithError(tmpRouteTableLine, errorOnFieldNum) {
    var lineAsList = splitRouteTableLineKeepSpaces(tmpRouteTableLine);
    var currentFieldNum = 0;
    // 0 1 2 3 4 5 6 ~ i
    // x   x   x   x ~ fields
    // 0   1   2   3 ~ fieldNum
    var line = ''; // init
    for (var i = 0; i < lineAsList.length; i++) {
        var fieldNum = i / 2;
        var field = lineAsList[i];
        if (errorOnFieldNum == fieldNum) field = '<span class="error"' +
        ' fieldnum="' + fieldNum + '">' + field + '</span>';
        line += field;
    }
    return line;
}

function highlightWarningOrError(e, me) {
    // this function is called when the user hovers or clicks an error or
    // warning in either the <ul> of errors or in the interactive cli.
    // it keeps the highlighted warnings/errors in sync between the <ul> and the
    // interactive cli
    var el = e.srcElement;
    if (el.tagName.toLowerCase() != 'span') return;
    var classList = getClassList(el);
    if (!inArray('warning', classList) && !inArray('error', classList)) return;
    clearAllLights('hover'); // clear all hoverlights first
    var eventType = e.type;
    var newClass;
    switch (eventType) {
        case 'mouseout':
            // all hoverlights have already been removed - exit here
            return;
        case 'mouseover':
            newClass = 'hoverlighted';
            break;
        case 'click':
            var alreadyClicked = inArray('clicklighted', classList);
            clearAllLights('click'); // clear all clicklights first
            if (alreadyClicked) return; // click when already clicked deselects
            newClass = 'clicklighted';
            break;
    }
    // highlight the associated error. clicks for me and you. hoverlights only
    // for you (me already has :hover, which is the same as 'hoverlighted').
    var cliCell = '#interactiveCLI ';
    var errCell = '#errorList ';
    if (el.hasAttribute('fieldnum')) { // error for a field (cell within row)
        var fieldNum = el.getAttribute('fieldnum');
        var fieldCSS = '[fieldnum="' + fieldNum + '"]';

        // in the interactive cli the route belongs to the row (parent of el),
        // but in the <ul> the route number belongs to el
        var routeNum;
        switch (me) {
            case 'interactiveCLI':
                routeNum = el.parentNode.getAttribute('routenum');
                break;
            case 'errorList':
                routeNum = el.getAttribute('routenum');
                break;
        }
        var routeCSS = '[routenum="' + routeNum + '"]';
        cliCell += routeCSS + ' ' + fieldCSS;
        errCell += routeCSS + fieldCSS;
    } else { // error for entire row
        var lineNum = el.getAttribute('linenum');
        var lineCSS = '[linenum="' + lineNum + '"]';
        cliCell += lineCSS;
        errCell += lineCSS;
    }
    var you, meCell, youCell;
    switch (me) {
        case 'interactiveCLI':
            meCell = cliCell;
            youCell = errCell;
            you = 'errorList';
            break;
        case 'errorList':
            meCell = errCell;
            youCell = cliCell;
            you = 'interactiveCLI';
            break;
    }
    var correspondingCells = youCell; // item 0 always = you
    if (eventType == 'click') correspondingCells += ',' + meCell;

    var errorEl = document.querySelectorAll(correspondingCells);
    addCSSClass(errorEl, newClass);
    var errParent = errorEl[0].parentNode; // item 0 = you
    var scrollingEl = document.getElementById(you);
    var scrollOffset = (errParent.offsetHeight - scrollingEl.offsetHeight) / 2;
    scrollToElementWithinElement(scrollingEl, errParent, scrollOffset);
}

function clearAllLights(type) {
    type = type + 'lighted';
    var query = '#interactiveCLI .' + type + ',#errorList .' + type;
    removeCSSClass(document.querySelectorAll(query), type);
}

function interactiveCLIAction(e) {
    if (parseErrors) return; // svg does not exist - nothing to select
    var what;
    switch (e.type) {
        case 'click':
            what = 'clicked';
            break;
        case 'mouseover':
            what = 'hovered';
            break;
    }
    clearInteractiveCLISelection(what);
    clearSVGSelection(what);
    var actionEl = e.srcElement;
    var validElForSelection = makeInteractiveCLISelection(actionEl, what);
    if (!validElForSelection) return;
    var routeNum = actionEl.getAttribute('routenum');
    var svgGroupEl = svg.querySelector('[routenum="' + routeNum + '"]');
    makeSVGSelection(svgGroupEl, what);
}

function clearInteractiveCLISelection(what) {
    removeCSSClass(document.querySelectorAll('#interactiveCLI td.' + what), what);
}

function makeInteractiveCLISelection(el, what) {
    if (el.tagName.toLowerCase() != 'td') return false;
    if (!inArray('is-route', getClassList(el))) return false;
    addCSSClass(el, what);
    return true;
}

function splitRouteTableLine(routeLine) {
    return routeLine.split(/[\s]+/);
}

function splitRouteTableLineKeepSpaces(routeLine) {
    return routeLine.split(/(\s+)/);
}

function parseRouteTable(routeTableList) {
    var section = ''; // what section are we currently in?
    var parsedData = {
        os: null,
        isCIDRFormat: null,
        headers: null,
        generalWarnings: [],
        generalErrors: [],
        ipv: null,
        minIPList: null,
        maxIPList: null,
        deducedCommand: null, // deduced from the header row
        routes: []
    };
    var routeNum = 0; // init
    for (var lineNum = 0; lineNum < routeTableList.length; lineNum++) {
        var thisLine = trim(routeTableList[lineNum].toLowerCase());
        var rulei = findMatchingRule(thisLine, parsedData);
        if (rulei == null) {
            // no matching rules - ignore this line
            var humanLineNum = lineNum + 1;
            parsedData.generalWarnings.push({
                lineNum: lineNum,
                text: 'ignoring unexpected character sequence on line ' +
                humanLineNum
            });
            continue;
        }
        var rule = routeTableFormat[rulei];
        var tmp = implementRule(rule, section, parsedData, lineNum);
        section = tmp[0];
        parsedData = tmp[1];
        if (parsedData.generalErrors.length > 0) break;
        if (!rule.hasOwnProperty('isRoute') || !rule.isRoute) continue;
        parsedData = parseRoute(routeNum, thisLine, parsedData, lineNum);
        routeNum++;
    }
    if (parsedData.headers == null) {
        parsedData.generalErrors.push({ text: 'unable to find header row' });
    }
    if (parsedData.routes.length == 0) {
        parsedData.generalErrors.push({ text: 'no routes found' });
    }
    return parsedData;
}

function findMatchingRule(lineText, parsedData) {
    // loop through all rules and exit when a match is found
    // note: routeTableFormat is global and gets updated here
    for (var rulei = 0; rulei < routeTableFormat.length; rulei++) {
        var rule = routeTableFormat[rulei]; // by reference
        switch (rule.type) {
            case 'regex':
                if (!rule.hasOwnProperty('regexObj')) {
                    // save for speed later
                    rule.regexObj = new RegExp(rule.regex);
                }
                break;
            case 'dynamic-list':
                var vars = { // any vars used in rules go in this object
                    parsedData: parsedData
                };
                var tmpList = [];
                var dynamicListLengthArgs = []; // init

                // first convert var names to their values
                var tmpLen = rule.dynamicListLengthArgs.length;
                for (var argi = 0; argi < tmpLen; argi++) {
                    dynamicListLengthArgs[argi] = getVar(
                        vars, rule.dynamicListLengthArgs[argi]
                    );
                }

                var listLength = rule.dynamicListLength(
                    dynamicListLengthArgs
                );
                if (listLength == 0) return null;
                for (var listi = 0; listi < listLength; listi++) {
                    tmpList.push(rule.dynamicListItem);
                }
                rule.regex = '^\\s*' + tmpList.join('\\s+') + '\\s*$';
                rule.regexObj = new RegExp(rule.regex);
                break;
            case 'list':
                if (!rule.hasOwnProperty('regex')) {
                    var tmpList = [];
                    for (var listi = 0; listi < rule.list.length; listi++) {
                        tmpList.push(rule.list[listi].replace(/ /g, '\\s*'));
                    }
                    // save for speed later
                    rule.regex = '^\\s*' + tmpList.join('\\s+') + '\\s*$';
                    rule.regexObj = new RegExp(rule.regex);
                }
                break;
        }
        if (rule.regexObj.test(lineText)) return rulei;
    }
    return null;
}

function implementRule(rule, section, parsedData, lineNum) {
    var humanLineNum = lineNum + 1;
    switch (rule.action) {
        case 'match':
            // not allowewd to change os
            if (rule.hasOwnProperty('os')) {
                if ((parsedData.os != null) && (rule.os != parsedData.os)) {
                    parsedData.generalErrors.push({
                        lineNum: lineNum,
                        text: 'os <i>' + parsedData.os + '</i> was previously' +
                        ' detected, however line ' + humanLineNum +
                        ' exclusively matches <i>' + rule.os + '</i>'
                    });
                    break;
                }
                parsedData.os = rule.os;
            }
            if (rule.hasOwnProperty('isCIDRFormat')) {
                if (
                    (parsedData.isCIDRFormat != null)
                    && (rule.isCIDRFormat != parsedData.isCIDRFormat)
                ) {
                    parsedData.generalErrors.push({
                        lineNum: lineNum,
                        text: 'it was previously determined that the' +
                        ' destination field did ' +
                        (parsedData.isCIDRFormat ? '' : 'not') +
                        ' contain the mask, however line ' + humanLineNum +
                        ' indicates that the destination field does ' +
                        (rule.isCIDRFormat ? '' : 'not') +
                        ' contain the mask. this property is immutable.'
                    });
                    break;
                }
                parsedData.isCIDRFormat = rule.isCIDRFormat;
            }
            if (
                rule.hasOwnProperty('withinSection')
                && (section != rule.withinSection)
            ) {
                parsedData.generalErrors.push({
                    lineNum: lineNum,
                    text: 'supposed to be within section <i>' + section
                    + '</i> but line ' + humanLineNum +
                    ' corresponds to section <i>' + rule.withinSection + '</i>'
                });
                break;
            }

            if (
                (section != '')
                && rule.hasOwnProperty('terminatesSection')
            ) {
                if (section != rule.terminatesSection) {
                    parsedData.generalErrors.push({
                        lineNum: lineNum,
                        text: 'attempted to terminate section <i>' +
                        rule.terminatesSection + '</i> during section' +
                        ' <i>' + section + '</i>'
                    });
                    break;
                }
                section = ''; // terminated
            }

            // not allowed to change section without ending the previous
            // section
            if (rule.hasOwnProperty('beginsSection')) {
                if ((section != '') && (section != rule.beginsSection)) {
                    parsedData.generalErrors.push({
                        lineNum: lineNum,
                        text: 'section <i>' + section + '</i> was not' +
                        ' terminated before section <i>' + rule.beginsSection +
                        '</i> was found.'
                    });
                    break;
                }
                section = rule.beginsSection;
            }
            if (rule.hasOwnProperty('ipv')) parsedData.ipv = rule.ipv;
            if (rule.hasOwnProperty('isHeaderRow') && rule.isHeaderRow) {
                parsedData.headers = rule.list;
            }
            if (
                rule.hasOwnProperty('deducedCommand')
                && (rule.deducedCommand != null)
            ) parsedData.deducedCommand = rule.deducedCommand;
            break;
        case 'ignore':
            break;
    }
    return [section, parsedData];
}

function parseRoute(routeNum, thisLine, parsedData, lineNum) {
    var thisLineList = splitRouteTableLine(thisLine);
    var error = null; // init
    var lineDict = { // init
        originalLineNum: lineNum
    };
    var humanLineNum = lineNum + 1;
    var humanRouteNum = routeNum + 1;
    for (var headeri = 0; headeri < parsedData.headers.length; headeri++) {
        var name = parsedData.headers[headeri];

        var translatedName = name; // init
        if (translations.hasOwnProperty(name)) {
            translatedName = translations[name];
        }
        var value = thisLineList[headeri];
        switch (translatedName) {
            case 'destination':
                var cidr, incompleteDestination; // init
                if (parsedData.isCIDRFormat) {
                    if (inArray('/', value)) {
                        var tmp = value.split('/');
                        incompleteDestination = tmp[0];
                        cidr = tmp[1];
                    } else {
                        incompleteDestination = value;
                        cidr = 0; // default
                    }
                    lineDict['mask'] = ipList2IP(maskBits2List(cidr, 4));
                } else incompleteDestination = value;
                lineDict['original' + translatedName] = incompleteDestination;
                value = extrapolateIP(incompleteDestination, 4);
                if ((error == null) && !validIP(ip2List(value), 4)) {
                    error = {
                        routeNum: routeNum,
                        fieldNum: headeri,
                        text: 'invalid destination IP address in route ' +
                        humanRouteNum
                    };
                }
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
            case 'mask':
                if ((error == null) && !validIP(ip2List(value), 4)) {
                    error = {
                        routeNum: routeNum,
                        fieldNum: headeri,
                        text: 'invalid mask IP address in route ' + humanRouteNum
                    };
                }
                break;
        }
        lineDict[translatedName] = value;
    }
    if (error != null) lineDict.error = error;
    parsedData.routes.push(lineDict);
    return parsedData;
}

// rendering

function hideSVG() {
    document.getElementById('visualRouteTable').style.visibility = 'hidden';
}

function showSVG() {
    document.getElementById('visualRouteTable').style.visibility = 'visible';
}

function clearSVG() {
    removeAllChildren(svg.getElementById('z0'));
    removeAllChildren(svg.getElementById('z1'));
    removeAllChildren(svg.getElementById('z2'));
    removeAllChildren(svg.getElementById('z3'));
    removeAllChildren(svg.getElementById('z4'));
    donePaths = []; // reset
}

function render(tmpRouteTableData) {
    document.getElementById('visualRouteTable').style.display = 'block';
    // resize the svg height to fit the interfaces and gateways
    resizeSVGHeight(tmpRouteTableData);

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
    renderIPLimits(tmpRouteTableData);

    // get the interface coordinates
    interfaceData = getInterfaceCoordinates(tmpRouteTableData); // global

    // get the gateway coordinates
    gatewayData = getGatewayCoordinates(tmpRouteTableData); // global

    // render the interfaces
    renderInterfaces(interfaceData);

    // render the gateways
    renderGateways(gatewayData);

    // render the external destinations
    renderExternalDestinations(gatewayData);

    // then get the ip range coordinates
    var ipRangesData = getIPRangeCoordinates(tmpRouteTableData);

    // render the ip ranges going to the interfaces
    renderIPRanges(ipRangesData, interfaceData, gatewayData);
}

function resizeSVGHeight(tmpRouteTableData) {
    var interfaceNames = []; // init
    var gatewayNames = []; // init
    var defaultGWFound = false;
    for (var i = 0; i < tmpRouteTableData.routes.length; i++) {
        var routeLine = tmpRouteTableData.routes[i];

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

function renderIPLimits(tmpRouteTableData) {
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
    minIPTextEl.textContent = ipList2IP(tmpRouteTableData.minIPList);
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
    maxIPTextEl.textContent = ipList2IP(tmpRouteTableData.maxIPList);
    svg.getElementById('z1').appendChild(maxIPTextEl);
}

function getInterfaceCoordinates(tmpRouteTableData) {
    var interfaceNames = [];
    for (var i = 0; i < tmpRouteTableData.routes.length; i++) {
        var interfaceName = tmpRouteTableData.routes[i].interface;
        if (interfaceNames.indexOf(interfaceName) != -1) continue;
        interfaceNames.push(interfaceName);
    }
    if (interfaceNames.length == 0) return null;
    var tmpInterfaceData = []; // init
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
        tmpInterfaceData.push({
            name: interfaceNames[i],
            top: top,
            midway: top + (svgProperties.deviceSquareHeight / 2),
            bottom: top + svgProperties.deviceSquareHeight
        });
    }
    return tmpInterfaceData;
}

function renderInterfaces(tmpInterfaceData) {
    for (var i = 0; i < tmpInterfaceData.length; i++) {
        var nicData = tmpInterfaceData[i];
        render1Nic(svgProperties.interfaceLeft, nicData.top, nicData.name);
    }
}

function getGatewayCoordinates(tmpRouteTableData) {
    var gatewayNames = [];
    var defaultGWFound = false;
    var defaultGWName;
    for (var i = 0; i < tmpRouteTableData.routes.length; i++) {
        var gatewayName = tmpRouteTableData.routes[i].originalGateway;
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
    var tmpGatewayData = []; // init
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
        tmpGatewayData.push({
            name: gatewayNames[i],
            top: top,
            midway: top + (svgProperties.deviceSquareHeight / 2),
            bottom: top + svgProperties.deviceSquareHeight
        });
    }
    return tmpGatewayData;
}

function renderGateways(tmpGatewayData) {
    for (var i = 0; i < tmpGatewayData.length; i++) {
        var gwData = tmpGatewayData[i];
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

function renderExternalDestinations(tmpGatewayData) {
    for (var i = 0; i < tmpGatewayData.length; i++) {
        var gwData = tmpGatewayData[i];
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

function getIPRangeCoordinates(tmpRouteTableData) {
    var tmpInterfaceData = []; // init
    for (var i = 0; i < tmpRouteTableData.routes.length; i++) {
        var routeTableLine = tmpRouteTableData.routes[i];
        var start = ipInt2Y(
            ipList2Int(routeTableLine.hostStartList),
            tmpRouteTableData
        );
        var end = ipInt2Y(
            ipList2Int(routeTableLine.hostEndList),
            tmpRouteTableData
        );
        tmpInterfaceData.push({
            routeLine: i,
            startIP: routeTableLine.hostStartList.join('.'), 
            endIP: routeTableLine.hostEndList.join('.'),
            top: end,
            bottom: start,
            interfaceName: routeTableLine.interface,
            gatewayName: routeTableLine.originalGateway
        });
    }
    return tmpInterfaceData;
}

function ipInt2Y(ipInt, tmpRouteTableData) {
    var maxIPInt = ipList2Int(tmpRouteTableData.maxIPList);
    var minIPInt = ipList2Int(tmpRouteTableData.minIPList);
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
        var tmpInterfaceData = null; //init/reset
        for (var j = 0; j < interfacesData.length; j++) {
            if (ipRangeData.interfaceName != interfacesData[j].name) continue;
            tmpInterfaceData = interfacesData[j]; // use this one
            break;
        }

        var tmpGatewayData = null; //init/reset
        for (var j = 0; j < gatewaysData.length; j++) {
            if (ipRangeData.gatewayName != gatewaysData[j].name) continue;
            tmpGatewayData = gatewaysData[j]; // use this one
            break;
        }
        var group = newSVGEl('g');
        group.setAttribute('class', 'ipRange');

        // the path from the ip range to the interface
        var startX = svgProperties.ipLeft;
        var startY = ipRangeData.bottom;
        var path = 'M' + startX + ',' + startY + ' ';

        var endX = svgProperties.interfaceLeft;
        var endY = tmpInterfaceData.bottom;
        path += getIPBezier(startX, startY, endX, endY);

        startX = endX;
        startY = tmpInterfaceData.top;
        path += 'V' + startY + ' ';

        endX = svgProperties.ipLeft;
        endY = ipRangeData.top;
        path += getIPBezier(startX, startY, endX, endY) + 'Z';
        group = renderIPRange(path, group, pathColor);

        // the path from the interface to the gateway
        startX = svgProperties.interfaceLeft + svgProperties.deviceSquareHeight;
        startY = tmpInterfaceData.top;
        path = 'M' + startX + ',' + startY + ' '; // new path

        endX = svgProperties.gatewayLeft +
        (svgProperties.deviceSquareHeight / 2);
        endY = tmpGatewayData.top;
        path += getIPBezier(startX, startY, endX, endY);

        endY = tmpGatewayData.bottom;
        path += 'V' + endY;

        startX = endX;
        startY = endY;
        endX = svgProperties.interfaceLeft + svgProperties.deviceSquareHeight;
        endY = tmpInterfaceData.bottom;
        path += getIPBezier(startX, startY, endX, endY) + 'Z';
        group = renderIPRange(path, group, pathColor);

        // the path from the gateway to the foreign gateway
        switch (tmpGatewayData.name) {
            case '0.0.0.0':
            case '*':
            case 'on-link':
                // LAN - go downwards
                startX = svgProperties.gatewayLeft;
                startY = tmpGatewayData.top +
                (svgProperties.deviceSquareHeight / 2);
                path = 'M' + startX + ',' + startY + ' '; // new path

                endY = tmpGatewayData.bottom +
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
                startY = tmpGatewayData.top;
                path = 'M' + startX + ',' + startY + ' '; // new path

                endX = svgProperties.overallWidth;
                path += 'H' + endX;

                endY = tmpGatewayData.bottom;
                path += 'V' + endY;

                endX = startX;
                path += 'H' + endX + 'Z';
                break;
        }
        group = renderIPRange(path, group, pathColor);
        group = renderIPText(group, ipRangeData);
        group.setAttribute('routenum', ipRangeData.routeLine);
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
function pickPath(destinationIPList, tmpRouteTableData) {
    // first find all route table lines that apply
    var applicableRouteLines = []; // init
    var largestNetmaskBits = 0; // init (largest = 32 = the most specific)
    for (var i = 0; i < tmpRouteTableData.routes.length; i++) {
        var routeTableDataLine = tmpRouteTableData.routes[i];
        var inRange = true; // start optimistic
        for (var j = 0; j < destinationIPList.length; j++) {
            var startRange = routeTableDataLine.hostStartList[j];
            var endRange = routeTableDataLine.hostEndList[j];
            if (j == (destinationIPList.length - 1)) {
                startRange--;
                endRange++;
            }
            if (
                (destinationIPList[j] < startRange)
                || (destinationIPList[j] > endRange)
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
    
    if (keep.length == 0) return 'no route rules apply to this destination IP';
    if (keep.length > 1) return 'more than 1 route rule applies to this destination IP';
    return tmpRouteTableData.routes[keep[0]];
}

function clearDestinationIPFlow() {
    deleteElement(svg.querySelector('.destinationIPFlow'));
    deleteElement(svg.querySelector('.destinationIP'));
}

function renderDestinationIPFlow(
    destinationIP, destinationIPList, routeTableLine, tmpInterfaceData,
    tmpGatewayData, tmpRouteTableData
) {
    var destinationIPInt = ipList2Int(destinationIPList);

    var startX = svgProperties.ipLeft;
    var startY = ipInt2Y(destinationIPInt, tmpRouteTableData);
    var path = 'M' + startX + ',' + startY + ' ';

    var relevantInterface = null;
    for (var i = 0; i < tmpInterfaceData.length; i++) {
        if (tmpInterfaceData[i].name != routeTableLine.interface) continue;
        relevantInterface = tmpInterfaceData[i];
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
    for (var i = 0; i < tmpGatewayData.length; i++) {
        if (tmpGatewayData[i].name != routeTableLine.originalGateway) continue;
        relevantGateway = tmpGatewayData[i];
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
})();

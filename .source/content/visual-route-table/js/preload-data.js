{% set PRELOAD_DATA = {
    "Linux-typicalOutput": """
$ route -ve
Kernel IP routing table
Destination     Gateway  Genmask         Flags   MSS Window  irtt Iface
default         net1     0.0.0.0         UG        0 0          0 eth1
172.16.0.0      wan      255.255.0.0     UG        0 0          0 eth0
192.168.0.0     *        255.255.255.0   U         0 0          0 eth0
192.168.1.0     *        255.255.255.0   U         0 0          0 eth1
""",
    "Windows-typicalOutput": """
> route print
===========================================================================
Interface List
 55...00 00 00 00 00 00 ......Intel(R) Ethernet Connection I217-LM
  1...........................Software Loopback Interface 1
 31...00 00 00 00 00 00 00 e0 Microsoft ISATAP Adapter
 16...00 00 00 00 00 00 00 e0 Teredo Tunneling Pseudo-Interface
===========================================================================

IPv4 Route Table
===========================================================================
Active Routes:
Network Destination        Netmask          Gateway       Interface  Metric
          0.0.0.0          0.0.0.0      192.168.0.1      192.168.0.2     20
        127.0.0.0        255.0.0.0         On-link         127.0.0.1    306
        127.0.0.1  255.255.255.255         On-link         127.0.0.1    306
  127.255.255.255  255.255.255.255         On-link         127.0.0.1    306
       172.16.0.0      255.255.0.0      192.168.0.8      192.168.0.2     21
       172.16.0.0    255.255.255.0      192.168.0.8      192.168.0.2     21
      192.168.0.0    255.255.255.0         On-link       192.168.0.2    276
      192.168.0.2  255.255.255.255         On-link       192.168.0.2    276
    192.168.0.255  255.255.255.255         On-link       192.168.0.2    276
      192.168.3.0    255.255.255.0      192.168.0.8      192.168.0.2     21
      192.168.5.0    255.255.255.0      192.168.0.8      192.168.0.2     21
    203.41.188.96  255.255.255.240      192.168.0.8      192.168.0.2     21
    203.42.70.224  255.255.255.240      192.168.0.8      192.168.0.2     21
    203.44.43.160  255.255.255.240      192.168.0.8      192.168.0.2     21
       203.52.0.0    255.255.254.0      192.168.0.8      192.168.0.2     21
        224.0.0.0        240.0.0.0         On-link         127.0.0.1    306
        224.0.0.0        240.0.0.0         On-link       192.168.0.2    276
  255.255.255.255  255.255.255.255         On-link         127.0.0.1    306
  255.255.255.255  255.255.255.255         On-link       192.168.0.2    276
===========================================================================
Persistent Routes:
  Network Address          Netmask  Gateway Address  Metric
       172.16.0.0    255.255.255.0      192.168.0.8       1
===========================================================================

IPv6 Route Table
===========================================================================
Active Routes:
 If Metric Network Destination      Gateway
  1    306 ::1/128                  On-link
  1    306 ff00::/8                 On-link
===========================================================================
Persistent Routes:
  None
""",
    "macOS IPv4-typicalOutput": """
$ netstat -rn
Routing tables



Internet:

Destination        Gateway            Flags        Refs      Use   Netif Expire

default            192.168.1.1        UGSc          192        0     en0       

127                127.0.0.1          UCS             0        0     lo0       

127.0.0.1          127.0.0.1          UH              1      248     lo0       

169.254            link#5             UCS             1        0     en0      !

192.168.1          link#5             UCS             1        0     en0      !

192.168.1.1/32     link#5             UCS             1        0     en0      !

192.168.1.1        1:0:0:0:0:0        UHLWIir        68     1450     en0   1144

192.168.1.101      2:0:0:0:0:0        UHLWI           0        0     en0   1073

192.168.1.103/32   link#5             UCS             0        0     en0      !

224.0.0/4          link#5             UmCS            2        0     en0      !

224.0.0.251        3:0:0:0:0:0        UHmLWI          0        0     en0       

239.255.255.250    4:0:0:0:0:0        UHmLWI          0      540     en0       

255.255.255.255/32 link#5             UCS             0        0     en0      !
""",
    "multiple link-local gateways-unitTest": """
Routing tables
Internet:
Destination        Gateway            Flags        Refs      Use   Netif Expire
192.168.1          link#1             UCS             1        0     en0      !
192.168.2          link#2             UCS             1        0     en0      !
"""
} %}
var preloadData = {{ PRELOAD_DATA | tojson }};

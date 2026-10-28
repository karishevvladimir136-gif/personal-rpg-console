# Epilogue 1 — the OpenRouter ledger

Cap $25; spent before this run $2.9923; this run $0.0631; total $3.0554; 63 calls.

| Session | Purpose | Model | Calls | Input (uncached) | Cache read | Cache write | Output | USD | Errors | Refusals | 429 waits |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| gp1-B-opus | epilogue | anthropic/claude-opus-5.5 | 1 | 13174 | 0 | 0 | 2121 | $0.0951 | 0 | 0 | 0 |
| gp1-B-opus | judge gp1-B-opus first | anthropic/claude-haiku-5.5 | 1 | 14965 | 0 | 0 | 1088 | $0.0020 | 0 | 0 | 0 |
| gp1-B-opus | referee gp1-B-opus first | anthropic/claude-opus-5.5 | 1 | 14965 | 0 | 0 | 1815 | $0.0962 | 0 | 0 | 0 |
| gp1-B-sol | epilogue | anthropic/claude-opus-5.5 | 1 | 7771 | 0 | 0 | 2050 | $0.0721 | 0 | 0 | 0 |
| gp1-B-sol | judge gp1-B-sol first | anthropic/claude-haiku-5.5 | 1 | 9526 | 0 | 0 | 1138 | $0.0015 | 0 | 0 | 0 |
| gp1-B-sol | referee gp1-B-sol first | anthropic/claude-opus-5.5 | 1 | 9526 | 0 | 0 | 1923 | $0.0766 | 0 | 0 | 0 |
| gp2-C1-opus | epilogue | anthropic/claude-opus-5.5 | 1 | 8763 | 0 | 0 | 1939 | $0.0738 | 0 | 0 | 0 |
| gp2-C1-opus | judge gp2-C1-opus first | anthropic/claude-haiku-5.5 | 1 | 10448 | 0 | 0 | 868 | $0.0015 | 0 | 0 | 0 |
| gp2-C1-opus | referee gp2-C1-opus first | anthropic/claude-opus-5.5 | 1 | 10448 | 0 | 0 | 1394 | $0.0697 | 0 | 0 | 0 |
| gp2-C1-fable | epilogue | anthropic/claude-opus-5.5 | 1 | 8796 | 0 | 0 | 1920 | $0.0736 | 0 | 0 | 0 |
| gp2-C1-fable | judge gp2-C1-fable first | anthropic/claude-haiku-5.5 | 1 | 10486 | 0 | 0 | 1041 | $0.0016 | 0 | 0 | 0 |
| gp2-C1-fable | referee gp2-C1-fable first | anthropic/claude-opus-5.5 | 1 | 10486 | 0 | 0 | 1723 | $0.0764 | 0 | 0 | 0 |
| gp2-C1-astra | epilogue | anthropic/claude-opus-5.5 | 1 | 10511 | 0 | 0 | 2094 | $0.0839 | 0 | 0 | 0 |
| gp2-C1-astra | judge gp2-C1-astra first | anthropic/claude-haiku-5.5 | 1 | 12142 | 0 | 0 | 1211 | $0.0018 | 0 | 0 | 0 |
| gp2-C1-astra | referee gp2-C1-astra first | anthropic/claude-opus-5.5 | 1 | 12142 | 0 | 0 | 2365 | $0.0959 | 0 | 0 | 0 |
| gp2-C1-sol | epilogue | anthropic/claude-opus-5.5 | 1 | 9304 | 0 | 0 | 1869 | $0.0746 | 0 | 0 | 0 |
| gp2-C1-sol | judge gp2-C1-sol first | anthropic/claude-haiku-5.5 | 1 | 11001 | 0 | 0 | 2670 | $0.0024 | 0 | 0 | 0 |
| gp2-C2-opus | epilogue | anthropic/claude-opus-5.5 | 1 | 13022 | 0 | 0 | 2096 | $0.0940 | 0 | 0 | 0 |
| gp2-C2-opus | judge gp2-C2-opus first | anthropic/claude-haiku-5.5 | 1 | 14734 | 0 | 0 | 962 | $0.0020 | 0 | 0 | 0 |
| gp2-C2-opus | referee gp2-C2-opus first | anthropic/claude-opus-5.5 | 1 | 14734 | 0 | 0 | 1574 | $0.0904 | 0 | 0 | 0 |
| gp2-C2-fable | epilogue | anthropic/claude-opus-5.5 | 1 | 11920 | 0 | 0 | 2301 | $0.0937 | 0 | 0 | 0 |
| gp2-C2-fable | judge gp2-C2-fable first | anthropic/claude-haiku-5.5 | 1 | 13667 | 0 | 0 | 1477 | $0.0021 | 0 | 0 | 0 |
| gp2-C2-fable | referee gp2-C2-fable first | anthropic/claude-opus-5.5 | 1 | 13667 | 0 | 0 | 2400 | $0.1027 | 0 | 0 | 0 |
| gp2-C2-fable | repair | anthropic/claude-opus-5.5 | 1 | 13168 | 0 | 0 | 1298 | $0.0786 | 0 | 0 | 0 |
| gp2-C2-fable | judge gp2-C2-fable repaired | anthropic/claude-haiku-5.5 | 1 | 13676 | 0 | 0 | 1630 | $0.0022 | 0 | 0 | 0 |
| gp2-C2-fable | referee gp2-C2-fable repaired | anthropic/claude-opus-5.5 | 1 | 13676 | 0 | 0 | 2304 | $0.1008 | 0 | 0 | 0 |
| gp2-C2-astra | epilogue | anthropic/claude-opus-5.5 | 1 | 10662 | 0 | 0 | 2142 | $0.0855 | 0 | 0 | 0 |
| gp2-C2-astra | judge gp2-C2-astra first | anthropic/claude-haiku-5.5 | 1 | 12476 | 0 | 0 | 1296 | $0.0019 | 0 | 0 | 0 |
| gp2-C2-astra | referee gp2-C2-astra first | anthropic/claude-opus-5.5 | 1 | 12476 | 0 | 0 | 1571 | $0.0813 | 0 | 0 | 0 |
| gp2-C2-sol | epilogue | anthropic/claude-opus-5.5 | 1 | 9276 | 0 | 0 | 1821 | $0.0735 | 0 | 0 | 0 |
| gp2-C2-sol | judge gp2-C2-sol first | anthropic/claude-haiku-5.5 | 1 | 10927 | 0 | 0 | 1112 | $0.0016 | 0 | 0 | 0 |
| gp2-C2-sol | referee gp2-C2-sol first | anthropic/claude-opus-5.5 | 1 | 10927 | 0 | 0 | 1273 | $0.0692 | 0 | 0 | 0 |
| r1-A-opus | epilogue | anthropic/claude-opus-5.5 | 1 | 9603 | 0 | 0 | 1924 | $0.0769 | 0 | 0 | 0 |
| r1-A-opus | judge r1-A-opus first | anthropic/claude-haiku-5.5 | 1 | 11356 | 0 | 0 | 1208 | $0.0017 | 0 | 0 | 0 |
| r1-A-opus | referee r1-A-opus first | anthropic/claude-opus-5.5 | 1 | 11356 | 0 | 0 | 2122 | $0.0879 | 0 | 0 | 0 |
| sw-B-opus-1 | epilogue | anthropic/claude-opus-5.5 | 1 | 29488 | 0 | 0 | 2271 | $0.1634 | 0 | 0 | 0 |
| sw-B-opus-1 | judge sw-B-opus-1 first | anthropic/claude-haiku-5.5 | 1 | 31282 | 0 | 0 | 1697 | $0.0040 | 0 | 0 | 0 |
| sw-B-opus-1 | referee sw-B-opus-1 first | anthropic/claude-opus-5.5 | 1 | 31282 | 0 | 0 | 2834 | $0.1818 | 0 | 0 | 0 |
| sw-B-opus-1 | repair | anthropic/claude-opus-5.5 | 1 | 30760 | 0 | 0 | 1327 | $0.1496 | 0 | 0 | 0 |
| sw-B-opus-1 | judge sw-B-opus-1 repaired | anthropic/claude-haiku-5.5 | 1 | 31281 | 0 | 0 | 1516 | $0.0039 | 0 | 0 | 0 |
| sw-B-opus-1 | referee sw-B-opus-1 repaired | anthropic/claude-opus-5.5 | 1 | 31281 | 0 | 0 | 2998 | $0.1851 | 0 | 0 | 0 |
| sw-B-astra-2 | epilogue | anthropic/claude-opus-5.5 | 1 | 28830 | 0 | 0 | 2418 | $0.1637 | 0 | 0 | 0 |
| sw-B-astra-2 | judge sw-B-astra-2 first | anthropic/claude-haiku-5.5 | 1 | 30639 | 0 | 0 | 1825 | $0.0040 | 0 | 0 | 0 |
| sw-B-astra-2 | referee sw-B-astra-2 first | anthropic/claude-opus-5.5 | 1 | 30639 | 0 | 0 | 3489 | $0.1923 | 0 | 0 | 0 |
| own gp1-B-opus | own gp1-B-opus | anthropic/claude-haiku-5.5 | 1 | 1150 | 0 | 0 | 86 | $0.0002 | 0 | 0 | 0 |
| own gp1-B-opus | own referee gp1-B-opus | anthropic/claude-opus-5.5 | 1 | 1150 | 0 | 0 | 240 | $0.0094 | 0 | 0 | 0 |
| own gp1-B-sol | own gp1-B-sol | anthropic/claude-haiku-5.5 | 1 | 1347 | 0 | 0 | 538 | $0.0004 | 0 | 0 | 0 |
| own gp1-B-sol | own referee gp1-B-sol | anthropic/claude-opus-5.5 | 1 | 1347 | 0 | 0 | 326 | $0.0119 | 0 | 0 | 0 |
| own gp2-C1-opus | own gp2-C1-opus | anthropic/claude-haiku-5.5 | 1 | 1001 | 0 | 0 | 64 | $0.0001 | 0 | 0 | 0 |
| own gp2-C1-opus | own referee gp2-C1-opus | anthropic/claude-opus-5.5 | 1 | 1001 | 0 | 0 | 149 | $0.0070 | 0 | 0 | 0 |
| own gp2-C1-fable | own gp2-C1-fable | anthropic/claude-haiku-5.5 | 1 | 1093 | 0 | 0 | 381 | $0.0003 | 0 | 0 | 0 |
| own gp2-C1-astra | own gp2-C1-astra | anthropic/claude-haiku-5.5 | 1 | 1316 | 0 | 0 | 304 | $0.0003 | 0 | 0 | 0 |
| own gp2-C1-sol | own gp2-C1-sol | anthropic/claude-haiku-5.5 | 1 | 1017 | 0 | 0 | 292 | $0.0002 | 0 | 0 | 0 |
| own gp2-C2-opus | own gp2-C2-opus | anthropic/claude-haiku-5.5 | 1 | 1349 | 0 | 0 | 606 | $0.0004 | 0 | 0 | 0 |
| own gp2-C2-fable | own gp2-C2-fable | anthropic/claude-haiku-5.5 | 1 | 1509 | 0 | 0 | 235 | $0.0003 | 0 | 0 | 0 |
| own gp2-C2-astra | own gp2-C2-astra | anthropic/claude-haiku-5.5 | 1 | 1263 | 0 | 0 | 275 | $0.0003 | 0 | 0 | 0 |
| own gp2-C2-sol | own gp2-C2-sol | anthropic/claude-haiku-5.5 | 1 | 974 | 0 | 0 | 438 | $0.0003 | 0 | 0 | 0 |
| own r1-A-opus | own r1-A-opus | anthropic/claude-haiku-5.5 | 1 | 1316 | 0 | 0 | 716 | $0.0005 | 0 | 0 | 0 |
| own r1-A-opus | own referee r1-A-opus | anthropic/claude-opus-5.5 | 1 | 1316 | 0 | 0 | 286 | $0.0110 | 0 | 0 | 0 |
| own sw-B-opus-1 | own sw-B-opus-1 | anthropic/claude-haiku-5.5 | 1 | 1185 | 0 | 0 | 728 | $0.0005 | 0 | 0 | 0 |
| own sw-B-opus-1 | own referee sw-B-opus-1 | anthropic/claude-opus-5.5 | 1 | 1185 | 0 | 0 | 304 | $0.0108 | 0 | 0 | 0 |
| own sw-B-astra-2 | own sw-B-astra-2 | anthropic/claude-haiku-5.5 | 1 | 1204 | 0 | 0 | 576 | $0.0004 | 0 | 0 | 0 |
| own sw-B-astra-2 | own referee sw-B-astra-2 | anthropic/claude-opus-5.5 | 1 | 1204 | 0 | 0 | 200 | $0.0088 | 0 | 0 | 0 |


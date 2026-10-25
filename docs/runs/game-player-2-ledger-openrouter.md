# Game player 2 — the OpenRouter ledger

Cap $90; spent before this run $0.0000; this run $58.9258; total $58.9258; 1177 calls.

| Session | Purpose | Model | Calls | Input (uncached) | Cache read | Cache write | Output | USD | Errors | Refusals | 429 waits |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| smoke | smoke judge haiku | anthropic/claude-haiku-5.5 | 1 | 31 | 0 | 0 | 9 | $0.0000 | 0 | 0 | 0 |
| smoke | smoke player opus | anthropic/claude-opus-5.5 | 1 | 50 | 0 | 0 | 45 | $0.0011 | 0 | 0 | 0 |
| smoke | smoke player fable | anthropic/claude-fable-5.1 | 1 | 50 | 0 | 0 | 34 | $0.0022 | 0 | 0 | 0 |
| C-opus | wizard | anthropic/claude-opus-5.5 | 4 | 22990 | 1567 | 1567 | 24619 | $0.5925 | 0 | 0 | 0 |
| C-fable | wizard | anthropic/claude-opus-5.5 | 4 | 23718 | 1567 | 1567 | 26107 | $0.6252 | 0 | 0 | 0 |
| C-astra | wizard | anthropic/claude-opus-5.5 | 4 | 23804 | 1567 | 1567 | 25824 | $0.6198 | 0 | 0 | 0 |
| C-sol | wizard | anthropic/claude-opus-5.5 | 4 | 23386 | 1567 | 1567 | 27139 | $0.6445 | 0 | 0 | 0 |
| C-sol | check C-sol opening | anthropic/claude-haiku-5.5 | 2 | 1390 | 0 | 0 | 148 | $0.0002 | 0 | 0 | 0 |
| C-fable | check C-fable opening | anthropic/claude-haiku-5.5 | 2 | 1266 | 0 | 0 | 158 | $0.0002 | 0 | 0 | 0 |
| C-fable | player t* | anthropic/claude-fable-5.1 | 27 | 108 | 738110 | 75401 | 17789 | $2.0176 | 0 | 0 | 0 |
| C-sol | check C-sol t* player | anthropic/claude-haiku-5.5 | 28 | 34798 | 0 | 0 | 1880 | $0.0044 | 0 | 0 | 0 |
| C-opus | check C-opus opening | anthropic/claude-haiku-5.5 | 2 | 1340 | 0 | 0 | 136 | $0.0002 | 0 | 0 | 0 |
| C-astra | check C-astra opening | anthropic/claude-haiku-5.5 | 2 | 1348 | 0 | 0 | 169 | $0.0002 | 0 | 0 | 0 |
| C-sol | dm t* | anthropic/claude-opus-5.5 | 61 | 240 | 1584807 | 1480258 | 163546 | $11.1830 | 0 | 0 | 0 |
| C-opus | player t* | anthropic/claude-opus-5.5 | 21 | 84 | 446737 | 56247 | 17329 | $0.7175 | 0 | 0 | 0 |
| C-astra | check C-astra t* player | anthropic/claude-haiku-5.5 | 28 | 34509 | 0 | 0 | 1872 | $0.0044 | 0 | 0 | 0 |
| C-astra | dm t* | anthropic/claude-opus-5.5 | 62 | 244 | 1615052 | 1572374 | 191232 | $12.0876 | 0 | 0 | 0 |
| C-fable | check C-fable t* player | anthropic/claude-haiku-5.5 | 27 | 49584 | 0 | 0 | 1943 | $0.0059 | 0 | 0 | 0 |
| C-fable | dm t* | anthropic/claude-opus-5.5 | 60 | 238 | 1994851 | 1667913 | 197069 | $12.8101 | 0 | 0 | 0 |
| C-opus | check C-opus t* player | anthropic/claude-haiku-5.5 | 21 | 35525 | 0 | 0 | 1600 | $0.0044 | 0 | 0 | 0 |
| C-opus | dm t* | anthropic/claude-opus-5.5 | 39 | 150 | 1079080 | 848941 | 114728 | $6.8483 | 0 | 0 | 0 |
| C-sol | dm t* | anthropic/claude-haiku-5.5 | 31 | 73678 | 0 | 0 | 12057 | $0.0134 | 0 | 0 | 0 |
| C-sol | check C-sol t* dm | anthropic/claude-haiku-5.5 | 27 | 34534 | 0 | 0 | 1980 | $0.0044 | 0 | 0 | 0 |
| C-astra | dm t* | anthropic/claude-haiku-5.5 | 31 | 76690 | 0 | 0 | 11642 | $0.0135 | 0 | 0 | 0 |
| C-opus | dm t* | anthropic/claude-haiku-5.5 | 15 | 41465 | 0 | 0 | 5645 | $0.0070 | 0 | 0 | 0 |
| C-astra | check C-astra t* dm | anthropic/claude-haiku-5.5 | 27 | 34214 | 0 | 0 | 2016 | $0.0044 | 0 | 0 | 0 |
| C-opus | check C-opus t* dm | anthropic/claude-haiku-5.5 | 19 | 33060 | 0 | 0 | 1684 | $0.0041 | 0 | 0 | 0 |
| C-fable | dm t* | anthropic/claude-haiku-5.5 | 33 | 100671 | 0 | 0 | 16064 | $0.0181 | 0 | 0 | 0 |
| C-fable | check C-fable t* dm | anthropic/claude-haiku-5.5 | 26 | 50373 | 0 | 0 | 2032 | $0.0061 | 0 | 0 | 0 |
| C-sol | check C-sol t* dm (told before a card) | anthropic/claude-haiku-5.5 | 4 | 2345 | 0 | 0 | 244 | $0.0004 | 0 | 0 | 0 |
| C-sol | check C-sol t* player (card) | anthropic/claude-haiku-5.5 | 7 | 3906 | 0 | 0 | 409 | $0.0006 | 0 | 0 | 0 |
| C-sol | dm t* onward | anthropic/claude-opus-5.5 | 7 | 22 | 237317 | 82049 | 16504 | $0.7879 | 0 | 0 | 0 |
| C-astra | check referee C-astra t* dm | anthropic/claude-opus-5.5 | 1 | 1152 | 0 | 0 | 51 | $0.0056 | 0 | 0 | 0 |
| C-sol | dm t* onward | anthropic/claude-haiku-5.5 | 6 | 11579 | 0 | 0 | 1279 | $0.0018 | 0 | 0 | 0 |
| C-fable | check C-fable t* dm (told before a card) | anthropic/claude-haiku-5.5 | 6 | 7173 | 0 | 0 | 389 | $0.0009 | 0 | 0 | 0 |
| C-fable | player t* card 1 | anthropic/claude-fable-5.1 | 6 | 24 | 245105 | 5984 | 165 | $0.1446 | 0 | 0 | 0 |
| C-fable | check C-fable t* player (card) | anthropic/claude-haiku-5.5 | 16 | 10235 | 0 | 0 | 1015 | $0.0015 | 0 | 0 | 0 |
| C-fable | player t* card 2 | anthropic/claude-fable-5.1 | 6 | 24 | 251089 | 847 | 554 | $0.1013 | 0 | 0 | 0 |
| C-fable | dm t* onward | anthropic/claude-opus-5.5 | 19 | 64 | 1158941 | 319173 | 53499 | $2.8979 | 0 | 0 | 1 |
| C-fable | dm t* onward | anthropic/claude-haiku-5.5 | 14 | 43848 | 0 | 0 | 5697 | $0.0072 | 0 | 0 | 0 |
| C-opus | check C-opus t* dm (told before a card) | anthropic/claude-haiku-5.5 | 9 | 10495 | 0 | 0 | 614 | $0.0014 | 0 | 0 | 0 |
| C-opus | player t* card 1 | anthropic/claude-opus-5.5 | 9 | 36 | 239733 | 8723 | 829 | $0.1083 | 0 | 0 | 0 |
| C-opus | check C-opus t* player (card) | anthropic/claude-haiku-5.5 | 22 | 13717 | 0 | 0 | 1397 | $0.0021 | 0 | 0 | 0 |
| C-opus | player t* card 2 | anthropic/claude-opus-5.5 | 9 | 36 | 248456 | 1488 | 1372 | $0.0847 | 0 | 0 | 0 |
| C-opus | dm t* onward | anthropic/claude-opus-5.5 | 23 | 76 | 916678 | 268153 | 58169 | $2.6878 | 0 | 0 | 0 |
| C-opus | dm t* onward | anthropic/claude-haiku-5.5 | 18 | 43621 | 0 | 0 | 5428 | $0.0071 | 0 | 0 | 0 |
| C-astra | check C-astra t* dm (told before a card) | anthropic/claude-haiku-5.5 | 1 | 488 | 0 | 0 | 60 | $0.0001 | 0 | 0 | 0 |
| C-astra | check C-astra t* player (card) | anthropic/claude-haiku-5.5 | 2 | 966 | 0 | 0 | 131 | $0.0002 | 0 | 0 | 0 |
| C-astra | dm t* onward | anthropic/claude-opus-5.5 | 3 | 10 | 107831 | 25883 | 2976 | $0.2105 | 0 | 0 | 0 |
| C-astra | dm t* onward | anthropic/claude-haiku-5.5 | 2 | 3231 | 0 | 0 | 201 | $0.0004 | 0 | 0 | 0 |
| C-opus | player t* card 3 | anthropic/claude-opus-5.5 | 2 | 8 | 69996 | 336 | 527 | $0.0263 | 0 | 0 | 0 |
| C-opus | player t* card 4 | anthropic/claude-opus-5.5 | 2 | 8 | 70332 | 591 | 185 | $0.0208 | 0 | 0 | 0 |
| C-opus | check referee C-opus t* dm | anthropic/claude-opus-5.5 | 1 | 1789 | 0 | 0 | 68 | $0.0085 | 0 | 0 | 0 |
| C-sol | check C-sol note | anthropic/claude-haiku-5.5 | 1 | 1089 | 0 | 0 | 72 | $0.0001 | 0 | 0 | 0 |
| C-sol | check C-sol after | anthropic/claude-haiku-5.5 | 1 | 527 | 0 | 0 | 71 | $0.0001 | 0 | 0 | 0 |
| C-opus | note | anthropic/claude-opus-5.5 | 1 | 4 | 42196 | 124 | 2207 | $0.0532 | 0 | 0 | 0 |
| C-opus | check C-opus note | anthropic/claude-haiku-5.5 | 1 | 1727 | 0 | 0 | 65 | $0.0002 | 0 | 0 | 0 |
| C-opus | after | anthropic/claude-opus-5.5 | 1 | 4 | 42320 | 1392 | 1342 | $0.0423 | 0 | 0 | 0 |
| C-opus | check C-opus after | anthropic/claude-haiku-5.5 | 1 | 1118 | 0 | 0 | 68 | $0.0001 | 0 | 0 | 0 |
| C-astra | check C-astra note | anthropic/claude-haiku-5.5 | 1 | 1412 | 0 | 0 | 63 | $0.0002 | 0 | 0 | 0 |
| C-astra | check C-astra after | anthropic/claude-haiku-5.5 | 1 | 618 | 0 | 0 | 79 | $0.0001 | 0 | 0 | 0 |
| C-fable | player t* card 3 | anthropic/claude-fable-5.1 | 1 | 4 | 54307 | 294 | 79 | $0.0212 | 0 | 0 | 0 |
| C-fable | player t* card 4 | anthropic/claude-fable-5.1 | 1 | 4 | 54601 | 147 | 144 | $0.0227 | 0 | 0 | 0 |
| C-fable | player t* card 5 | anthropic/claude-fable-5.1 | 1 | 4 | 54748 | 155 | 313 | $0.0313 | 0 | 0 | 0 |
| C-fable | player t* card 6 | anthropic/claude-fable-5.1 | 1 | 4 | 54903 | 374 | 590 | $0.0479 | 0 | 0 | 0 |
| C-fable | note | anthropic/claude-fable-5.1 | 1 | 4 | 59308 | 3283 | 1726 | $0.1422 | 0 | 0 | 0 |
| C-fable | check C-fable note | anthropic/claude-haiku-5.5 | 1 | 1380 | 0 | 0 | 81 | $0.0002 | 0 | 0 | 0 |
| C-fable | after | anthropic/claude-fable-5.1 | 1 | 4 | 62591 | 1045 | 1634 | $0.1105 | 0 | 0 | 0 |
| C-fable | check C-fable after | anthropic/claude-haiku-5.5 | 1 | 1300 | 0 | 0 | 78 | $0.0002 | 0 | 0 | 0 |
| score C-sol | tag player C-sol t* 1 | anthropic/claude-haiku-5.5 | 20 | 52270 | 0 | 0 | 3458 | $0.0070 | 0 | 0 | 0 |
| score C-sol | tag player C-sol t* 2 | anthropic/claude-haiku-5.5 | 20 | 52270 | 0 | 0 | 3706 | $0.0071 | 0 | 0 | 0 |
| score C-sol | tag player C-sol t* referee | anthropic/claude-opus-5.5 | 2 | 3972 | 0 | 0 | 508 | $0.0260 | 0 | 0 | 0 |
| score C-sol | tag dm C-sol t* 1 | anthropic/claude-haiku-5.5 | 20 | 28230 | 0 | 0 | 6557 | $0.0061 | 0 | 0 | 0 |
| score C-sol | tag dm C-sol t* 2 | anthropic/claude-haiku-5.5 | 20 | 28230 | 0 | 0 | 6867 | $0.0063 | 0 | 0 | 0 |
| score C-sol | tag dm C-sol t* referee | anthropic/claude-opus-5.5 | 1 | 1753 | 0 | 0 | 355 | $0.0141 | 0 | 0 | 0 |
| score C-sol | threads C-sol | anthropic/claude-opus-5.5 | 1 | 18405 | 0 | 0 | 553 | $0.0847 | 0 | 0 | 0 |
| score C-sol | rollcheck C-sol t* | anthropic/claude-haiku-5.5 | 1 | 1524 | 0 | 0 | 46 | $0.0002 | 0 | 0 | 0 |
| score C-sol | note C-sol 1 | anthropic/claude-haiku-5.5 | 1 | 1003 | 0 | 0 | 114 | $0.0002 | 0 | 0 | 0 |
| score C-sol | note C-sol 2 | anthropic/claude-haiku-5.5 | 1 | 1003 | 0 | 0 | 122 | $0.0002 | 0 | 0 | 0 |
| score C-opus | tag player C-opus t* 1 | anthropic/claude-haiku-5.5 | 14 | 47049 | 0 | 0 | 2317 | $0.0059 | 0 | 0 | 0 |
| score C-opus | tag player C-opus t* 2 | anthropic/claude-haiku-5.5 | 14 | 47049 | 0 | 0 | 2039 | $0.0057 | 0 | 0 | 0 |
| score C-opus | tag player C-opus t* referee | anthropic/claude-opus-5.5 | 1 | 2278 | 0 | 0 | 87 | $0.0109 | 0 | 0 | 0 |
| score C-opus | tag dm C-opus t* 1 | anthropic/claude-haiku-5.5 | 13 | 25993 | 0 | 0 | 5046 | $0.0051 | 0 | 0 | 0 |
| score C-opus | tag dm C-opus t* 2 | anthropic/claude-haiku-5.5 | 13 | 25993 | 0 | 0 | 5080 | $0.0051 | 0 | 0 | 0 |
| score C-opus | tag dm C-opus t* referee | anthropic/claude-opus-5.5 | 1 | 1992 | 0 | 0 | 110 | $0.0102 | 0 | 0 | 0 |
| score C-opus | threads C-opus | anthropic/claude-opus-5.5 | 1 | 15433 | 0 | 0 | 664 | $0.0750 | 0 | 0 | 0 |
| score C-opus | rollcheck C-opus t* | anthropic/claude-haiku-5.5 | 7 | 14622 | 0 | 0 | 1314 | $0.0021 | 0 | 0 | 0 |
| score C-opus | note C-opus 1 | anthropic/claude-haiku-5.5 | 1 | 1641 | 0 | 0 | 106 | $0.0002 | 0 | 0 | 0 |
| score C-opus | note C-opus 2 | anthropic/claude-haiku-5.5 | 1 | 1641 | 0 | 0 | 112 | $0.0002 | 0 | 0 | 0 |
| score C-astra | tag player C-astra t* 1 | anthropic/claude-haiku-5.5 | 20 | 50654 | 0 | 0 | 4348 | $0.0072 | 0 | 0 | 0 |
| score C-astra | tag player C-astra t* 2 | anthropic/claude-haiku-5.5 | 20 | 50654 | 0 | 0 | 4860 | $0.0075 | 0 | 0 | 0 |
| score C-astra | tag player C-astra t* referee | anthropic/claude-opus-5.5 | 3 | 7440 | 0 | 0 | 450 | $0.0388 | 0 | 0 | 0 |
| score C-astra | tag dm C-astra t* 1 | anthropic/claude-haiku-5.5 | 20 | 27328 | 0 | 0 | 6784 | $0.0061 | 0 | 0 | 0 |
| score C-astra | tag dm C-astra t* 2 | anthropic/claude-haiku-5.5 | 20 | 27328 | 0 | 0 | 6605 | $0.0060 | 0 | 0 | 0 |
| score C-astra | threads C-astra | anthropic/claude-opus-5.5 | 1 | 17792 | 0 | 0 | 588 | $0.0829 | 0 | 0 | 0 |
| score C-astra | rollcheck C-astra t* | anthropic/claude-haiku-5.5 | 1 | 1477 | 0 | 0 | 137 | $0.0002 | 0 | 0 | 0 |
| score C-astra | note C-astra 1 | anthropic/claude-haiku-5.5 | 1 | 1326 | 0 | 0 | 103 | $0.0002 | 0 | 0 | 0 |
| score C-astra | note C-astra 2 | anthropic/claude-haiku-5.5 | 1 | 1326 | 0 | 0 | 124 | $0.0002 | 0 | 0 | 0 |
| score C-fable | tag player C-fable t* 1 | anthropic/claude-haiku-5.5 | 20 | 75995 | 0 | 0 | 5355 | $0.0103 | 0 | 0 | 0 |
| score C-fable | tag player C-fable t* 2 | anthropic/claude-haiku-5.5 | 20 | 75995 | 0 | 0 | 5185 | $0.0102 | 0 | 0 | 0 |
| score C-fable | tag player C-fable t* referee | anthropic/claude-opus-5.5 | 3 | 13710 | 0 | 0 | 352 | $0.0619 | 0 | 0 | 0 |
| score C-fable | tag dm C-fable t* 1 | anthropic/claude-haiku-5.5 | 20 | 44657 | 0 | 0 | 6836 | $0.0079 | 0 | 0 | 0 |
| score C-fable | tag dm C-fable t* 2 | anthropic/claude-haiku-5.5 | 20 | 44657 | 0 | 0 | 6934 | $0.0079 | 0 | 0 | 0 |
| score C-fable | threads C-fable | anthropic/claude-opus-5.5 | 1 | 26873 | 0 | 0 | 828 | $0.1241 | 0 | 0 | 0 |
| score C-fable | deception C-fable t* 1 | anthropic/claude-haiku-5.5 | 2 | 4764 | 0 | 0 | 1253 | $0.0011 | 0 | 0 | 0 |
| score C-fable | deception C-fable t* 2 | anthropic/claude-haiku-5.5 | 2 | 4764 | 0 | 0 | 807 | $0.0009 | 0 | 0 | 0 |
| score C-fable | rollcheck C-fable t* | anthropic/claude-haiku-5.5 | 6 | 16240 | 0 | 0 | 1154 | $0.0022 | 0 | 0 | 0 |
| score C-fable | note C-fable 1 | anthropic/claude-haiku-5.5 | 1 | 1294 | 0 | 0 | 91 | $0.0002 | 0 | 0 | 0 |
| score C-fable | note C-fable 2 | anthropic/claude-haiku-5.5 | 1 | 1294 | 0 | 0 | 100 | $0.0002 | 0 | 0 | 0 |
| score C-sol | authorship C-sol 1 | anthropic/claude-opus-5.5 | 1 | 24347 | 0 | 0 | 1180 | $0.1210 | 0 | 0 | 0 |
| score C-sol | authorship C-sol 2 | anthropic/claude-opus-5.5 | 1 | 24347 | 0 | 0 | 1181 | $0.1210 | 0 | 0 | 0 |
| score C-sol | goal scale C-sol t* 1 | anthropic/claude-haiku-5.5 | 1 | 399 | 0 | 0 | 280 | $0.0002 | 0 | 0 | 0 |
| score C-sol | goal scale C-sol t* 2 | anthropic/claude-haiku-5.5 | 1 | 399 | 0 | 0 | 206 | $0.0001 | 0 | 0 | 0 |
| score C-opus | authorship C-opus 1 | anthropic/claude-opus-5.5 | 1 | 29188 | 0 | 0 | 915 | $0.1351 | 0 | 0 | 0 |
| score C-opus | authorship C-opus 2 | anthropic/claude-opus-5.5 | 1 | 29188 | 0 | 0 | 1121 | $0.1392 | 0 | 0 | 0 |
| score C-astra | authorship C-astra 1 | anthropic/claude-opus-5.5 | 1 | 23615 | 0 | 0 | 1301 | $0.1205 | 0 | 0 | 0 |
| score C-astra | authorship C-astra 2 | anthropic/claude-opus-5.5 | 1 | 23615 | 0 | 0 | 1257 | $0.1196 | 0 | 0 | 0 |
| score C-fable | authorship C-fable 1 | anthropic/claude-opus-5.5 | 1 | 43180 | 0 | 0 | 1665 | $0.2060 | 0 | 0 | 0 |
| score C-fable | authorship C-fable 2 | anthropic/claude-opus-5.5 | 1 | 43180 | 0 | 0 | 1561 | $0.2039 | 0 | 0 | 0 |
| score C-fable | goal scale C-fable t* 1 | anthropic/claude-haiku-5.5 | 1 | 781 | 0 | 0 | 322 | $0.0002 | 0 | 0 | 0 |
| score C-fable | goal scale C-fable t* 2 | anthropic/claude-haiku-5.5 | 1 | 781 | 0 | 0 | 246 | $0.0002 | 0 | 0 | 0 |
| ab A-astra | authorship A-astra 1 | anthropic/claude-opus-5.5 | 1 | 25056 | 0 | 0 | 1427 | $0.1288 | 0 | 0 | 0 |
| ab A-astra | authorship A-astra 2 | anthropic/claude-opus-5.5 | 1 | 25056 | 0 | 0 | 1535 | $0.1309 | 0 | 0 | 0 |
| ab A-fable | authorship A-fable 1 | anthropic/claude-opus-5.5 | 1 | 30308 | 0 | 0 | 2112 | $0.1635 | 0 | 0 | 0 |
| ab A-fable | authorship A-fable 2 | anthropic/claude-opus-5.5 | 1 | 30308 | 0 | 0 | 2491 | $0.1711 | 0 | 0 | 0 |
| ab A-opus | authorship A-opus 1 | anthropic/claude-opus-5.5 | 1 | 43240 | 0 | 0 | 1564 | $0.2042 | 0 | 0 | 0 |
| ab A-opus | authorship A-opus 2 | anthropic/claude-opus-5.5 | 1 | 43240 | 0 | 0 | 1846 | $0.2099 | 0 | 0 | 0 |
| ab A-sol | authorship A-sol 1 | anthropic/claude-opus-5.5 | 1 | 27251 | 0 | 0 | 1623 | $0.1415 | 0 | 0 | 0 |
| ab A-sol | authorship A-sol 2 | anthropic/claude-opus-5.5 | 1 | 27251 | 0 | 0 | 1567 | $0.1403 | 0 | 0 | 0 |

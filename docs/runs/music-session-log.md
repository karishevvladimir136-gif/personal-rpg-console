# Music stage — a 20-turn synthetic session: which mood played when and why

The 20-turn «Мир Шва» scene of Stage V (`test-fixtures/stage-v/shov-scene.json`), with the public scene signal of every turn labelled by the session the way `finish_turn` records it (`test-fixtures/music/shov-20-turn-signals.json`: scene kinds, the server's tension reading, the DM's hint for the next turn, an active encounter, the player's moment, the world clock), replayed through `chooseMood` and the hysteresis reducer `stepMood` with one turn every 70 s. No paid call. «Wanted» is the mood the scene asks for; «Playing» is what the player keeps after hysteresis (↺ marks a switch). 9 switches in 20 turns.

Rules in one line: a fight or a jump of two energy steps switches at once; anything else waits until the new mood held for two turns or the current one played 90 s; nothing private is read (no ambush music for a private note).

The last column is the ambient layer: the place's sound from the public place name and the hour, the weather from the committed turn's public text (held for two turns after the word disappears).

| Turn | At | Place | Player | Scene kinds | Tension → hint | Wanted | Playing | Why | Ambient |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 0 s | Пещера дома Альвареш | Даю команду отдать швартовы. Взлетаем. | travel, conversation | calm | Дорога | **Дорога** ↺ | on the road (first track) | Пещера |
| 2 | 70 s | Пещера дома Альвареш | Оборачиваюсь к Изольде: она летит с нами или остаётся? | conversation, quiet | calm | Тепло | **Дорога** | a quiet talk with a companion (waiting: 1/2 turns, 70 s of 90) | Пещера |
| 3 | 140 s | Небо над Пиренеями | Иду к Вольфу в машинное: как правый двигатель? | conversation | calm | Тепло | **Тепло** ↺ | a calm conversation (held for 2 turns) | Палуба |
| 4 | 210 s | Небо над Пиренеями | Поднимаюсь на палубу к Зарге. Спрашиваю, что она слышит. | mystery, conversation | calm | Тайна | **Тепло** | a mystery scene (waiting: 1/2 turns, 70 s of 90) | Палуба + Ветер |
| 5 | 280 s | Небо над Пиренеями | Замечаю точку на горизонте. Беру подзорную трубу. | mystery, exploration | tense → tense | Напряжение | **Напряжение** ↺ | a tense mystery (escalation, switched at once) | Палуба + Ветер |
| 6 | 350 s | Небо над Пиренеями | Приказываю уходить вверх, в облака. Мэг, выжимай всё. | travel | tense → climax | Напряжение | **Напряжение** | a climax tension without a fight (unchanged) | Палуба |
| 7 | 420 s | Небо над Пиренеями | Бегу на корму: что в нас попало? | combat | tense → climax · fight | Кульминация | **Кульминация** ↺ | combat with a climax tension (escalation, switched at once) | Палуба + Ветер |
| 8 | 490 s | Небо над Пиренеями | Кладу руку на цепь и бью в неё огненным снарядом — пусть лопнет. | combat | climax → calm · fight · moment | Кульминация | **Кульминация** | combat with the player's moment (unchanged) | Палуба + Ветер |
| 9 | 560 s | Небо над Пиренеями | Иду на камбуз. Нам всем нужно поесть и отдышаться. | quiet, humor | calm | Шутка | **Шутка** ↺ | a humour scene (the current mood played its minimum) | Палуба |
| 10 | 630 s | Небо над Пиренеями | Изольда выглядит плохо. Подхожу и предлагаю ей воды. | quiet, conversation | calm | Тепло | **Шутка** | a quiet talk with a companion (waiting: 1/2 turns, 70 s of 90) | Палуба |
| 11 | 700 s | Небо над Пиренеями | Поднимаюсь к Мэг. Рассказываю ей про Дом голосов. | conversation, mystery | calm | Тайна | **Тайна** ↺ | a mystery scene (the current mood played its minimum) | Палуба + Снег |
| 12 | 770 s | Небо над Пиренеями | Ночь. Выхожу на палубу — не спится. | quiet | calm | Ночь | **Тайна** | a quiet scene at night (waiting: 1/2 turns, 70 s of 90) | Палуба + Снег |
| 13 | 840 s | Женева | Утро. Женева. Ищу, где сесть незаметно. | travel, exploration | calm | Дорога | **Дорога** ↺ | on the road (the current mood played its minimum) | Город |
| 14 | 910 s | Женева | Иду к лагерю Рурка один, как договаривались. | conversation | tense → tense | Напряжение | **Дорога** | a tense conversation (waiting: 1/2 turns, 70 s of 90) | Город |
| 15 | 980 s | Женева | Показываю Рурку сердечник. Изольда стоит за мной. | conversation, mystery | tense → tense | Напряжение | **Напряжение** ↺ | a tense mystery (held for 2 turns) | Город |
| 16 | 1050 s | Женева | Кричу своим занять позиции. Кто это? | other | tense → climax | Напряжение | **Напряжение** | a climax tension without a fight (unchanged) | Город |
| 17 | 1120 s | Женева | Отвечаю: сердечник не продаётся. Пусть уезжают. | combat, conversation | climax → climax · fight | Кульминация | **Кульминация** ↺ | combat with a climax tension (escalation, switched at once) | Город |
| 18 | 1190 s | Женева | Бросаю огненный шар в фургон — пусть им будет не на чем уехать. | combat | climax → climax · fight · moment | Кульминация | **Кульминация** | combat with the player's moment (unchanged) | Город |
| 19 | 1260 s | Женева | Рурк ранен. Бегу к нему, прикрываясь дымом. | combat, conversation | tense → tense · fight | Бой | **Кульминация** | an encounter is active (waiting: 1/2 turns, 140 s of 90) | Город |
| 20 | 1330 s | Женева | Поднимаю сердечник над головой и приказываю Шву замолчать. | combat | climax → calm · fight · moment | Кульминация | **Кульминация** | combat with the player's moment (unchanged) | Город |

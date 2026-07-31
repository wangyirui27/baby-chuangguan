# Codex Automated Semantic Scan - Desert L006-L050 r2

Generated: 2026-07-23T11:10:51.852Z

Scope: canonical r2 prompt-only QA. No prompt/code files were modified. No LibTV/Seedance calls were made. No real MP4, audio, ASR, or contact-sheet evidence was reviewed.

Fail policy: provider-blocking warnings are recorded as `FAIL`; non-blocking boilerplate observations are kept as notes.

## Counts

- expectedLevels: 45
- canonicalR2Dirs: 45
- levelsWithExactlyOneR2: 45
- promptFiles: 45
- manifests: 45
- promptChecks: 45
- oldV1DirsIgnored: 45
- checkerPass: 45
- checkerFail: 0
- promptOnlyBlockedManifests: 45
- passLevels: 41
- failLevels: 4
- totalFindings: 4

## Top Failures

- POSITIVE_TEACHER_CUE: 2 (L039, L047)
- DIALOGUE_NON_ENGLISH_SOUND: 1 (L046)
- VISUAL_ANCHOR_TOO_FEW_SPECIFIC: 1 (L034)

## Per-Level Table

| Level | Title | Checker | Manifest prompt-only blocked | Status | Findings |
|---:|---|---|---|---|---|
| L006 | My name is... | PASS | YES | PASS | none |
| L007 | What's your name? | PASS | YES | PASS | none |
| L008 | I'm Chen Jie | PASS | YES | PASS | none |
| L009 | Let's play together | PASS | YES | PASS | none |
| L010 | Share with friends | PASS | YES | PASS | none |
| L011 | Are you OK? | PASS | YES | PASS | none |
| L012 | I can help | PASS | YES | PASS | none |
| L013 | friend mind map | PASS | YES | PASS | none |
| L014 | kind words | PASS | YES | PASS | none |
| L015 | help a friend | PASS | YES | PASS | none |
| L016 | say hello first | PASS | YES | PASS | none |
| L017 | be a good friend | PASS | YES | PASS | none |
| L018 | This is my mum | PASS | YES | PASS | none |
| L019 | This is my dad | PASS | YES | PASS | none |
| L020 | This is my grandma | PASS | YES | PASS | none |
| L021 | This is my grandpa | PASS | YES | PASS | none |
| L022 | Who lives with you? | PASS | YES | PASS | none |
| L023 | My family is big | PASS | YES | PASS | none |
| L024 | My family is small | PASS | YES | PASS | none |
| L025 | I live with my parents | PASS | YES | PASS | none |
| L026 | I have a sister | PASS | YES | PASS | none |
| L027 | I have a brother | PASS | YES | PASS | none |
| L028 | This is my family | PASS | YES | PASS | none |
| L029 | We love each other | PASS | YES | PASS | none |
| L030 | family tree | PASS | YES | PASS | none |
| L031 | add a family photo | PASS | YES | PASS | none |
| L032 | draw my family | PASS | YES | PASS | none |
| L033 | talk about family | PASS | YES | PASS | none |
| L034 | different families | PASS | YES | FAIL | VISUAL_ANCHOR_TOO_FEW_SPECIFIC: project/craft level has only 1 specific visual anchors |
| L035 | a pet dog | PASS | YES | PASS | none |
| L036 | a little cat | PASS | YES | PASS | none |
| L037 | a fish | PASS | YES | PASS | none |
| L038 | a bird | PASS | YES | PASS | none |
| L039 | What pets do you know? | PASS | YES | FAIL | POSITIVE_TEACHER_CUE: positive prompt contains teacher cue outside the Negative Prompt |
| L040 | I like dogs | PASS | YES | PASS | none |
| L041 | I have a cat | PASS | YES | PASS | none |
| L042 | Is it a pet? | PASS | YES | PASS | none |
| L043 | a wild panda | PASS | YES | PASS | none |
| L044 | a big tiger | PASS | YES | PASS | none |
| L045 | an elephant | PASS | YES | PASS | none |
| L046 | a monkey | PASS | YES | FAIL | DIALOGUE_NON_ENGLISH_SOUND: line 4 is animal sound/gibberish, not child English: "Ooh ooh aah aah!" |
| L047 | What wild animals do you know? | PASS | YES | FAIL | POSITIVE_TEACHER_CUE: positive prompt contains teacher cue outside the Negative Prompt |
| L048 | animal picture book | PASS | YES | PASS | none |
| L049 | draw a pet | PASS | YES | PASS | none |
| L050 | draw a wild animal | PASS | YES | PASS | none |

## Checker Inputs

| Level | --spoken | --answer | Prompt sha256 |
|---:|---|---|---|
| L006 | My name is Tom. | My name is... | 58e9c6b6bf94e99613b11ffbd1fe42cfa162cc47ace24e8e5f8d6512d72d6a2f |
| L007 | What's your name? | What's your name? | 7e714c1519368a18282086e350e3958d0e6057fe56e7a9e68613fadba7485817 |
| L008 | I'm Chen Jie. What's your name? | I'm Chen Jie | bcd92e6dd9a56b7898bae4a9729254b87b6465f872d9bb0dacb62218a6c80411 |
| L009 | Let's play together! | Let's play together | 0d8eb22df862d25e94ab83e25bd05f250e56add5e56bc16536253c8dee7f905d |
| L010 | Here, you can have this. | Share with friends | 8de0b6d17c98d513696195814a93eaffed08370c05bc3eb6f8e5d840bafcb008 |
| L011 | Are you OK? | Are you OK? | 789bb14e17b81e364fac1c10e2751d00ffb3a30727bd1f343a70d7b442dddb57 |
| L012 | I can help! | I can help | a2c4ac5e18391f783e125a8ed2992af38cc0f44ee2241bead375a9d11d3c4960 |
| L013 | Look! She is my friend. | friend mind map | a54d7142bb16e24f6ddc27584ea74cf823bf82a192719cb0672aabfe9edbc310 |
| L014 | Here you go. | kind words | 7727e0f0fcc9488668ceaf8d0cb0af5a2061f69530014b9edcecb9b6cf99efdd |
| L015 | Let me help you! | help a friend | f62384f325a9b8db0eb0080061ed5c68ce8238056226d8b139a6ec40201ea880 |
| L016 | Hello! | say hello first | a112848d36914f3665dd7a1116a92909156e66ca868f9e7665f9644d4af07a30 |
| L017 | You are my friend. | be a good friend | e16a64df245d48124aa0b3202829dab377f0ef240a1274e4b82f39bb8e4b35bb |
| L018 | This is my mum. | This is my mum | bdf741b5969b483e2d295f8f980b65eceb8b9e147dffa5c6636e252b830d8d32 |
| L019 | This is my dad. | This is my dad | 1aab14fcf07eec5804dcf62390eb1e85e21dbca378ca64efc610a2b9e3a6320b |
| L020 | This is my grandma. | This is my grandma | 4cae2c28d8b0bc6a7d42ff9dc490cae5f29f52b8598b3003baf52808d29b7312 |
| L021 | This is my grandpa. | This is my grandpa | 17c59cfa847764c1347de0a601161ff6bb1cc695fe0c6f2869a8fcb9314b5403 |

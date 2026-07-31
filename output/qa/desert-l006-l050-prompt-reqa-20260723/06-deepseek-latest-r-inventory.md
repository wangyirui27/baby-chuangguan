# Desert L006-L050 Latest-R Inventory & Fresh Checker Audit

Generated: 2026-07-23T13:31:02Z
Scope: L006–L050 (45 levels)
Version preference: r3 > r2

## Summary

| Metric | Value |
|---|---|
| Total levels | 45 |
| r3 versions | 15 |
| r2 versions (r3 missing) | 30 |
| Missing any version | 0 |
| Fresh checker PASS | 45 |
| Fresh checker FAIL | 0 |
| Fresh checker N/A | 0 |
| Field drift detected | 30 |
| Fail-closed (structure/preflight) | 0 |
| Has MP4 | 0 |
| Levels with errors | 30 |

## Commands Executed

```bash
# Inventory script: /Users/yr/宝宝闯关/output/qa/desert-l006-l050-prompt-reqa-20260723/inventory-script.py
# Fresh checker ran for each level with valid prompt + spokenTarget + answerLabel:
#   node tools/video-prompts/check-desert-video-prompt.js <prompt.txt> --spoken "<spokenTarget>" --answer "<answerLabel>"
# Total fresh checker invocations: 45
```

## Per-Level Details

| Lvl | Title | Ver | Prompt SHA (first 12) | SpokenTarget | AnswerLabel | Fresh OK | Fresh SpokenCnt | Drift | FailClosed | MP4 | Errors |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 6 | My name is... | r3 | ea154903b98c | My name is Tom. | My name is... | PASS | 1 | - | NO (independent_qa pending) | - | - |
| 7 | What's your name? | r2 | 7e714c151936 | What's your name? | What's your name? | PASS | 1 | YES | NO (independent_qa pending) | - | field drift: spokenCount: saved=8 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=8 fresh=1 |
| 8 | I'm Chen Jie | r3 | 26786cf6bb4d | I'm Chen Jie. | I'm Chen Jie | PASS | 2 | - | NO (independent_qa pending) | - | - |
| 9 | Let's play together | r2 | 0d8eb22df862 | Let's play together! | Let's play together | PASS | 2 | YES | NO (independent_qa pending) | - | field drift: spokenCount: saved=5 fresh=2; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=5 fresh=2 |
| 10 | Share with friends | r2 | 8de0b6d17c98 | Here, you can have this. | Share with friends | PASS | 1 | YES | NO (independent_qa pending) | - | field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1 |
| 11 | Are you OK? | r3 | 0bcfad421eb1 | Are you OK? | Are you OK? | PASS | 1 | - | NO (independent_qa pending) | - | - |
| 12 | I can help | r2 | a2c4ac5e1839 | I can help! | I can help | PASS | 1 | YES | NO (independent_qa pending) | - | field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1 |
| 13 | friend mind map | r2 | a54d7142bb16 | Look! She is my friend. | friend mind map | PASS | 1 | YES | NO (independent_qa pending) | - | field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1 |
| 14 | kind words | r3 | a16318bec048 | Here you go. | kind words | PASS | 1 | - | NO (independent_qa pending) | - | - |
| 15 | help a friend | r2 | f62384f325a9 | Let me help you! | help a friend | PASS | 1 | YES | NO (independent_qa pending) | - | field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1 |
| 16 | say hello first | r2 | a112848d3691 | Hello! | say hello first | PASS | 1 | YES | NO (independent_qa pending) | - | field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1 |
| 17 | be a good friend | r3 | efb18fa22994 | You are my friend. | be a good friend | PASS | 1 | - | NO (independent_qa pending) | - | - |
| 18 | This is my mum | r2 | bdf741b5969b | This is my mum. | This is my mum | PASS | 1 | YES | NO (independent_qa pending) | - | field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1 |
| 19 | This is my dad | r2 | 1aab14fcf07e | This is my dad. | This is my dad | PASS | 1 | YES | NO (independent_qa pending) | - | field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1 |
| 20 | This is my grandma | r2 | 4cae2c28d8b0 | This is my grandma. | This is my grandma | PASS | 1 | YES | NO (independent_qa pending) | - | field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1 |
| 21 | This is my grandpa | r2 | 17c59cfa8477 | This is my grandpa. | This is my grandpa | PASS | 1 | YES | NO (independent_qa pending) | - | field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1 |
| 22 | Who lives with you? | r3 | 67b6625448be | Who lives with you? | Who lives with you? | PASS | 1 | - | NO (independent_qa pending) | - | - |
| 23 | My family is big | r2 | 1684ba40686b | My family is big. | My family is big | PASS | 1 | YES | NO (independent_qa pending) | - | field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1 |
| 24 | My family is small | r2 | eb98aaafae21 | My family is small. | My family is small | PASS | 1 | YES | NO (independent_qa pending) | - | field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1 |
| 25 | I live with my parents | r3 | 5f2dc39661e8 | I live with my parents. | I live with my parents | PASS | 1 | - | NO (independent_qa pending) | - | - |
| 26 | I have a sister | r2 | 63ab3ba75b30 | I have a sister. | I have a sister | PASS | 1 | YES | NO (independent_qa pending) | - | field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1 |
| 27 | I have a brother | r2 | f50929c590a5 | I have a brother. | I have a brother | PASS | 1 | YES | NO (independent_qa pending) | - | field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1 |
| 28 | This is my family | r2 | 29ed83f0b784 | This is my family. | This is my family | PASS | 1 | YES | NO (independent_qa pending) | - | field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1 |
| 29 | We love each other | r2 | 647e71e9e1bf | This is my family. | We love each other | PASS | 1 | YES | NO (independent_qa pending) | - | field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1 |
| 30 | family tree | r2 | f45d3a09e372 | Look! This is me. | family tree | PASS | 1 | YES | NO (independent_qa pending) | - | field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1 |
| 31 | add a family photo | r3 | eb27bf51ea62 | Look! Here is my family. | add a family photo | PASS | 1 | - | NO (independent_qa pending) | - | - |
| 32 | draw my family | r2 | c187ad240de3 | I'm drawing my family. | draw my family | PASS | 1 | YES | NO (independent_qa pending) | - | field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1 |
| 33 | talk about family | r3 | 00304f481dd9 | This is my family. | talk about family | PASS | 1 | - | NO (independent_qa pending) | - | - |
| 34 | different families | r3 | d81b718af2bb | My family is big! | different families | PASS | 1 | - | NO (independent_qa pending) | - | - |
| 35 | a pet dog | r2 | 9e06ce969be2 | Look! A pet dog! | a pet dog | PASS | 1 | YES | NO (independent_qa pending) | - | field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1 |
| 36 | a little cat | r2 | fe32eadb3723 | Look! A little cat! | a little cat | PASS | 1 | YES | NO (independent_qa pending) | - | field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1 |
| 37 | a fish | r2 | bcf12284d7d8 | Look! A fish! | a fish | PASS | 1 | YES | NO (independent_qa pending) | - | field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1 |
| 38 | a bird | r2 | d86834b46986 | Look! A bird! | a bird | PASS | 1 | YES | NO (independent_qa pending) | - | field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1 |
| 39 | What pets do you know? | r3 | 3de9919e739c | What pets do you know? | What pets do you know? | PASS | 1 | - | NO (independent_qa pending) | - | - |
| 40 | I like dogs | r2 | 65e0bb7a9550 | I like dogs. | I like dogs | PASS | 1 | YES | NO (independent_qa pending) | - | field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1 |
| 41 | I have a cat | r2 | 2db216541f28 | I have a cat. | I have a cat | PASS | 1 | YES | NO (independent_qa pending) | - | field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1 |
| 42 | Is it a pet? | r3 | 9dae022d9ba4 | Is it a pet? | Is it a pet? | PASS | 1 | - | NO (independent_qa pending) | - | - |
| 43 | a wild panda | r2 | d5b73e055e68 | Look! A wild panda! | a wild panda | PASS | 1 | YES | NO (independent_qa pending) | - | field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1 |
| 44 | a big tiger | r2 | c262bbc61d13 | Look! A big tiger! | a big tiger | PASS | 1 | YES | NO (independent_qa pending) | - | field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1 |
| 45 | an elephant | r2 | 8dbaf6d75ed8 | Look! An elephant! | an elephant | PASS | 1 | YES | NO (independent_qa pending) | - | field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1 |
| 46 | a monkey | r3 | d19d2906716c | Look! A monkey! | a monkey | PASS | 1 | - | NO (independent_qa pending) | - | - |
| 47 | What wild animals do you know? | r3 | 9fcc85cdb706 | What wild animals do you know? | What wild animals do you know? | PASS | 1 | - | NO (independent_qa pending) | - | - |
| 48 | animal picture book | r2 | 4d34cbef2bbc | Look! A dog! | animal picture book | PASS | 1 | YES | NO (independent_qa pending) | - | field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1 |
| 49 | draw a pet | r3 | 1829de179468 | I'm drawing a cat! | draw a pet | PASS | 1 | - | NO (independent_qa pending) | - | - |
| 50 | draw a wild animal | r2 | 45696b6dd04f | Now I'm drawing a tiger! | draw a wild animal | PASS | 1 | YES | NO (independent_qa pending) | - | field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1 |

## Errors & Drift Detail

### L007 — What's your name? (v=r2)

- Errors: field drift: spokenCount: saved=8 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=8 fresh=1
- Field drift: spokenCount: saved=8 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=8 fresh=1

### L009 — Let's play together (v=r2)

- Errors: field drift: spokenCount: saved=5 fresh=2; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=5 fresh=2
- Field drift: spokenCount: saved=5 fresh=2; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=5 fresh=2

### L010 — Share with friends (v=r2)

- Errors: field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1
- Field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1

### L012 — I can help (v=r2)

- Errors: field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1
- Field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1

### L013 — friend mind map (v=r2)

- Errors: field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1
- Field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1

### L015 — help a friend (v=r2)

- Errors: field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1
- Field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1

### L016 — say hello first (v=r2)

- Errors: field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1
- Field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1

### L018 — This is my mum (v=r2)

- Errors: field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1
- Field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1

### L019 — This is my dad (v=r2)

- Errors: field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1
- Field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1

### L020 — This is my grandma (v=r2)

- Errors: field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1
- Field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1

### L021 — This is my grandpa (v=r2)

- Errors: field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1
- Field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1

### L023 — My family is big (v=r2)

- Errors: field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1
- Field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1

### L024 — My family is small (v=r2)

- Errors: field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1
- Field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1

### L026 — I have a sister (v=r2)

- Errors: field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1
- Field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1

### L027 — I have a brother (v=r2)

- Errors: field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1
- Field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1

### L028 — This is my family (v=r2)

- Errors: field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1
- Field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1

### L029 — We love each other (v=r2)

- Errors: field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1
- Field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1

### L030 — family tree (v=r2)

- Errors: field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1
- Field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1

### L032 — draw my family (v=r2)

- Errors: field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1
- Field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1

### L035 — a pet dog (v=r2)

- Errors: field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1
- Field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1

### L036 — a little cat (v=r2)

- Errors: field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1
- Field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1

### L037 — a fish (v=r2)

- Errors: field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1
- Field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1

### L038 — a bird (v=r2)

- Errors: field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1
- Field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1

### L040 — I like dogs (v=r2)

- Errors: field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1
- Field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1

### L041 — I have a cat (v=r2)

- Errors: field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1
- Field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1

### L043 — a wild panda (v=r2)

- Errors: field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1
- Field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1

### L044 — a big tiger (v=r2)

- Errors: field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1
- Field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1

### L045 — an elephant (v=r2)

- Errors: field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1
- Field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1

### L048 — animal picture book (v=r2)

- Errors: field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1
- Field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1

### L050 — draw a wild animal (v=r2)

- Errors: field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1
- Field drift: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1

## R3 Coverage Gap

Levels still on r2 (no r3): 7, 9, 10, 12, 13, 15, 16, 18, 19, 20, 21, 23, 24, 26, 27, 28, 29, 30, 32, 35, 36, 37, 38, 40, 41, 43, 44, 45, 48, 50


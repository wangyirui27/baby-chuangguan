#!/usr/bin/env python3
"""Audit desert L001-L050 dialogue for mechanical/stupid patterns."""
from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CONTRACTS = ROOT / "tools/video-prompts/desert-level-semantic-contracts-l006-l050.json"
PROD = ROOT / "output/media-production"

FILLER_CLOSE = re.compile(
    r"^(we are (friends|happy|good friends)!?|we did it!?|families are different!?"
    r"|we love pets!?|pets and wild animals!?|sisters are fun!?|brothers are fun!?"
    r"|cats are cute!?|birds can sing!?|monkeys are silly!?|elephants are amazing!?"
    r"|tigers are strong!?|stay safe!?|family is love!?|wow, you know many pets!?"
    r"|wow, you know many wild animals!?)$",
    re.I,
)
NAME_PAIR_CHANT = re.compile(r"^[A-Z][a-z]+ and [A-Z][a-z]+!$")
YES_IM_LOOP = re.compile(r"^yes,?\s*i['’]?m\b", re.I)
LABEL_UTTER = re.compile(
    r"^(kind words|friend mind map|family tree|share with friends|add a family photo|"
    r"animal picture book|help a friend|say hello first|be a good friend|talk about family|"
    r"different families|draw my family|draw a pet|draw a wild animal)\.?$",
    re.I,
)


def norm(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", (s or "").lower())


def quotes_from_prompt(text: str) -> list[str]:
    m = re.search(
        r"Dialogue:\s*(.*?)(?:\nAction & Performance:|\nCamera:|\nAudio:)",
        text,
        re.S | re.I,
    )
    return re.findall(r'"([^"\n]{1,160})"', m.group(1) if m else "")


def latest_prompt(n: int) -> Path | None:
    cands = list(PROD.glob(f"desert-level-{n:03d}-*/prompts/*.txt"))
    if not cands:
        return None

    def score(p: Path) -> float:
        s = p.stat().st_mtime
        sp = str(p)
        if "r4-batchready" in sp:
            s += 1e13
        elif "natural-name" in sp:
            s += 1e12
        return s

    return max(cands, key=score)


def audit_lines(lines: list[str], spoken: str | None) -> list[tuple[str, str, object]]:
    flags: list[tuple[str, str, object]] = []
    if not lines or len(lines) < 5:
        flags.append(("FAIL", "need_5_lines", len(lines) if lines else 0))
        return flags

    norms = [norm(x) for x in lines]
    counts = Counter(norms)
    for k, v in counts.items():
        if v >= 3:
            flags.append(("FAIL", "line_repeat_ge3", f"{k} x{v}"))

    if spoken and norms.count(norm(spoken)) >= 2 and str(spoken).strip().endswith("?"):
        flags.append(("FAIL", "question_target_twice", spoken))

    for i, line in enumerate(lines):
        s = line.strip()
        if NAME_PAIR_CHANT.match(s):
            flags.append(("FAIL", "name_pair_chant", line))
        if YES_IM_LOOP.match(s):
            flags.append(("FAIL", "yes_im_loop", line))
        if LABEL_UTTER.match(s):
            flags.append(("FAIL", "label_as_utterance", line))
        if FILLER_CLOSE.match(s) and i == len(lines) - 1:
            flags.append(("FAIL", "empty_filler_close", line))
        if FILLER_CLOSE.match(s) and i < len(lines) - 1:
            flags.append(("WARN", "filler_mid", line))

    myname: set[str] = set()
    im: set[str] = set()
    for line in lines:
        m = re.match(r"^my name is ([a-z]+)\.?$", line.strip(), re.I)
        if m:
            myname.add(m.group(1).lower())
        m = re.match(r"^i['’]?m ([a-z]+)\.?$", line.strip(), re.I)
        if m:
            im.add(m.group(1).lower())
    if myname & im:
        flags.append(("FAIL", "redundant_myname_and_im_same_names", sorted(myname & im)))

    if len(set(norms)) <= 2:
        flags.append(("FAIL", "low_diversity_le2", len(set(norms))))

    if norms[0] == norms[2] and lines[0].strip().endswith("?"):
        flags.append(("FAIL", "robot_same_question_0_2", lines[0]))

    return flags


def main() -> None:
    contracts = json.loads(CONTRACTS.read_text())["levels"]
    rows = []
    for n in range(1, 51):
        c = contracts.get(str(n))
        p = latest_prompt(n)
        title = spoken = None
        lines: list[str] = []
        skip = False
        if c:
            title = c.get("title")
            skip = bool(c.get("skipGeneration") or c.get("curriculumVerdict") == "DELETE")
            sd = c.get("spokenDialogue") or {}
            lines = list(sd.get("lines") or sd.get("requiredLines") or [])
            spoken = (
                sd.get("targetExpression")
                or sd.get("cefrTargetExpression")
                or (lines[0] if lines else None)
            )
        prompt_lines: list[str] = []
        if p:
            prompt_lines = quotes_from_prompt(p.read_text(encoding="utf-8"))
        use = lines if lines else prompt_lines
        flags = audit_lines(use, spoken)
        if prompt_lines and [norm(x) for x in prompt_lines] != [norm(x) for x in use]:
            for f in audit_lines(prompt_lines, spoken):
                if f not in flags:
                    flags.append(f)
        sev = (
            "SKIP"
            if skip
            else (
                "FAIL"
                if any(f[0] == "FAIL" for f in flags)
                else ("WARN" if flags else "OK")
            )
        )
        rows.append(
            {
                "n": n,
                "title": title,
                "spoken": spoken,
                "lines": use,
                "flags": flags,
                "sev": sev,
                "path": str(p.relative_to(ROOT)) if p else None,
            }
        )

    fails = [r for r in rows if r["sev"] == "FAIL"]
    warns = [r for r in rows if r["sev"] == "WARN"]
    print(
        json.dumps(
            {
                "FAIL": len(fails),
                "WARN": len(warns),
                "OK": sum(1 for r in rows if r["sev"] == "OK"),
                "SKIP": sum(1 for r in rows if r["sev"] == "SKIP"),
            }
        )
    )
    for r in fails:
        print(f"L{r['n']:03d} FAIL {r['title']!r}")
        print(" ", r["lines"])
        print(" ", [f[1] for f in r["flags"] if f[0] == "FAIL"])

    out = ROOT / "output/qa/desert-l006-l050-batch-ready-20260723/15-stupid-dialogue-audit.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("wrote", out)


if __name__ == "__main__":
    main()

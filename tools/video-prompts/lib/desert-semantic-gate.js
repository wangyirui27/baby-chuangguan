function evaluateNaturalDialogue(contract) {
  const title = contract?.title || '';
  const lines = dialogueLinesOf(contract?.spokenDialogue);
  if (!lines.length) {
    return fail('dialogue', 'placeholder or noun-label dialogue is not natural child speech');
  }
  let substantive = 0;
  for (const line of lines) {
    if (PLACEHOLDER_RE.test(line)) {
      return fail('dialogue', 'placeholder or noun-label dialogue is not natural child speech');
    }
    if (FILLER_ONLY_RE.test(normalizeLine(line))) continue;
    if (looksLikeNounLabel(line, title) && contract?.spokenDialogue?.allowObjectLabelDialogue !== true) {
      return fail('dialogue', 'placeholder or noun-label dialogue is not natural child speech');
    }
    substantive += 1;
  }
  if (substantive === 0) {
    return fail('dialogue', 'placeholder or noun-label dialogue is not natural child speech');
  }
  return pass();
}

/** Empty slogan closings / robot drills / name-pair chants — not teachable child dialogue. */
const EMPTY_FILLER_CLOSE_RE = /^(we are (friends|happy|good friends)|we did it|families are different|we love pets|pets and wild animals|sisters are fun|brothers are fun|cats are cute|birds can sing|monkeys are silly|elephants are amazing|tigers are strong|stay safe|family is love|wow,? you know many pets|wow,? you know many wild animals)\.?$/i;
const NAME_PAIR_CHANT_RE = /^[a-z]+ and [a-z]+!$/i;
const YES_IM_LOOP_RE = /^yes,?\s*i['’]?m\b/i;
const PROJECT_LABEL_UTTER_RE = /^(kind words|friend mind map|family tree|share with friends|add a family photo|animal picture book|help a friend|say hello first|be a good friend|talk about family|different families|draw my family|draw a pet|draw a wild animal)\.?$/i;

function evaluateDialogueCraft(contract) {
  const lines = dialogueLinesOf(contract?.spokenDialogue);
  if (!lines.length) {
    return fail('dialogue', 'dialogue craft: missing spoken lines');
  }
  if (lines.length < 5) {
    return fail('dialogue', `dialogue craft: need 5 beat lines, got ${lines.length}`);
  }

  const norms = lines.map((line) => normalizeLine(line));
  const counts = new Map();

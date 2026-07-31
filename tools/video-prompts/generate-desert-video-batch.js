  };
}

/**
 * Pre-generation phase only:
 * curriculum authored + independent prompt QA + user single-sample executionApproval.
 * ASR/silent/entailment are intentionally NOT checked here.
 */
function assertLibtvAllowed(outDir, promptText) {
  const { manifest } = readApprovalManifest(outDir);
  const status = approvalManifestStatus(manifest, { promptText });
  if (!status.ok) {
    throw new BlockedSemanticError(
      `${status.reason || 'approval incomplete'}; refuse LibTV so dry-run burns zero credits`,
      'contract',
    );
  }
  return manifest;
}

/** --run-libtv hard limit: exactly one level per invocation. */
function assertSingleSampleRunAllowed({ shouldRun, selectedCount, start, end }) {
  if (!shouldRun) return true;
  if (Number(selectedCount) !== 1 || Number(start) !== Number(end)) {
    throw new BlockedSemanticError(
      `contract: --run-libtv is single-sample only (got start=${start} end=${end} selectedCount=${selectedCount}); batch run blocked`,
      'contract',
    );
  }
  return true;
}

/** Post-generation: block desertLevelVideoOverrides mount until release evidence complete. */
function assertOverrideMountAllowed(manifest) {
  assertReleaseAllowed(manifest);

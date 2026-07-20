#!/bin/bash
cd ~/Library/Mobile\ Documents/com~apple~CloudDocs/skills

skills=(
  agent-introspection-debugging agent-sort api-design article-writing
  backend-patterns brand-voice bun-runtime cefr-video-prompt chronicle
  coding-standards content-engine crosspost deep-research design-taste-frontend
  dmux-workflows documentation-lookup e2e-testing eval-harness
  everything-claude-code exa-search fal-ai-media frontend-patterns
  frontend-slides gpt-taste investor-materials investor-outreach
  karpathy-guidelines market-research mcp-server-patterns mle-workflow
  nextjs-turbopack product-capability redesign-existing-projects
  short-video-image-prompts strategic-compact superpowers tdd-workflow
  verification-loop video-editing x-api
)

for skill in "${skills[@]}"; do
  if [ -d "$skill" ] && [ ! -L ~/.reasonix/skills/$skill ]; then
    ln -sf "$(pwd)/$skill" ~/.reasonix/skills/$skill && echo "✓ $skill"
  fi
done

echo "完成！重启 Reasonix 即可全局使用这些技能。"

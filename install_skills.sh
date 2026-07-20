#!/bin/bash
# 安装 iCloud Skills 到 Claude Code

cd ~/Library/Mobile\ Documents/com~apple~CloudDocs/skills

skills=(
  agent-introspection-debugging
  agent-sort
  api-design
  article-writing
  backend-patterns
  brand-voice
  bun-runtime
  cefr-video-prompt
  chronicle
  coding-standards
  content-engine
  crosspost
  deep-research
  design-taste-frontend
  dmux-workflows
  documentation-lookup
  e2e-testing
  eval-harness
  everything-claude-code
  exa-search
  fal-ai-media
  frontend-patterns
  frontend-slides
  gpt-taste
  investor-materials
  investor-outreach
  karpathy-guidelines
  market-research
  mcp-server-patterns
  mle-workflow
  nextjs-turbopack
  product-capability
  redesign-existing-projects
  short-video-image-prompts
  strategic-compact
  superpowers
  tdd-workflow
  verification-loop
  video-editing
  x-api
)

success=0
skipped=0

for skill in "${skills[@]}"; do
  if [ -d "$skill" ]; then
    if [ -L ~/.claude/skills/$skill ] || [ -d ~/.claude/skills/$skill ]; then
      echo "- $skill (已存在跳过)"
      ((skipped++))
    else
      ln -sf "$(pwd)/$skill" ~/.claude/skills/$skill && echo "✓ $skill" && ((success++))
    fi
  else
    echo "✗ $skill (目录不存在)"
  fi
done

echo ""
echo "=== 安装完成: $success 成功, $skipped 已跳过 ==="
echo "重启 Claude Code 即可使用新技能。"

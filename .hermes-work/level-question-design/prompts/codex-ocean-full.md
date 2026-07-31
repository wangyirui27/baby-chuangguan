你是七席团队里的 Codex gpt-5.5/xhigh 席。任务：只做内容文档草案，不改业务代码。

项目路径：/tmp/baobao-chuangguan（指向 /Users/yr/宝宝闯关）。
事实锚点：script.js 导出 levels、desertLevels、questionPromptText；海岛地图 visible levels=200。正式答题页题型一实际只展示 2 个选项：正确答案 + level.options 里第一个干扰项。

请读取 script.js，不要猜字段。输出且只输出到：docs/curriculum/team-drafts/06-codex-ocean-full.md

产物要求：
1. 生成海岛地图 1-200 关完整题目/答案表。每行字段：关卡、主题、英文目标、中文含义、孩子看到的题目中文文案、正确答案、实际2选1干扰项、备注。
2. 抽 10 关做审题样本：1、7、18、29、40、61、82、103、154、200。逐条判断：题干是否清楚、答案是否唯一、干扰项是否误导过强/过弱。
3. 标出任何你发现的问题，不要改代码。
4. 不要修改除该输出文件以外的任何文件。

完成后最终回复只给：输出路径 + 覆盖关卡数 + 样本关卡数 + 发现的问题数。
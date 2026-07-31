你是七席团队里的 Cursor Auto 席。任务：只做审题抽样和交叉检查，不改业务代码。

项目路径：/tmp/baobao-chuangguan（指向 /Users/yr/宝宝闯关）。
事实锚点：script.js 导出 levels、desertLevels、questionPromptText；两个地图 visible levels 都是 200；正式答题页题型一实际只展示 2 个选项：正确答案 + level.options 里第一个干扰项。

请读取 script.js 和 quiz.test.js，不要猜字段。输出且只输出到：docs/curriculum/team-drafts/07-cursor-sample-audit.md

产物要求：
1. 海岛抽 10 关：1、7、18、29、40、61、82、103、154、200。
2. 沙漠抽 10 关：1、15、37、58、79、100、123、145、168、200。
3. 对每关给：题目中文文案、正确答案、实际2选1干扰项、审题结论。
4. 专门检查 desert 是短语却被 questionPromptText 叫“单词”这类产品文案问题。
5. 不要修改除该输出文件以外的任何文件。

完成后最终回复只给：输出路径 + 海岛样本数 + 沙漠样本数 + 发现的问题清单。
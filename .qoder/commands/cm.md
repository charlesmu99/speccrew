---
description: Auto commit and push to GitHub/Gitee
---
# Git 自动提交和推送到 GitHub/Gitee

## 功能说明
此命令用于自动执行 Git 提交和推送操作到 GitHub 或 Gitee 远程仓库。

## 使用方法

### 基本用法（自动生成提交消息）
/qoder git commit

### 自定义提交消息
/qoder git commit "自动生成的英文描述信息"

### 指定远程仓库
/qoder git commit --remote github
/qoder git commit --remote gitee

## 执行流程

1. **检查工作目录状态**
   git status

2. **添加所有更改文件**
   git add .

3. **创建提交**
   git commit -m "feat: auto commit message"

4. **推送到远程仓库**
   git push github main
   # 或推送到 Gitee
   git push gitee main

## 注意事项
- 确保已正确配置远程仓库地址
- 确保拥有推送权限
- 如遇冲突，需先解决后再推送
- 建议提交前检查更改内容
- 提交的备注内容以英文形式撰写

## 查看远程仓库
git remote -v

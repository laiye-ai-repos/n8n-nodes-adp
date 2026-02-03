# 🚀 快速开始指南

## 一分钟上手

### 1. 安装依赖
```bash
cd src/n8n-nodes-adp
npm install
```

### 2. 构建项目
```bash
npm run build
```

### 3. 在 n8n 中安装
```bash
# 在 n8n 目录下执行
npm install /path/to/src/n8n-nodes-adp
```

### 4. 配置凭证
在 n8n 中：
- Credentials → New → "ADP API"
- 填写：Base URL, Access Key, App Key, App Secret, Tenant Name

### 5. 使用节点
创建工作流，添加任意 ADP 节点，选择凭证，开始使用！

## 📋 三个节点速查

| 节点名称 | 用途 | 何时使用 |
|---------|------|---------|
| **ADP Sync Extract** | 同步提取 | 快速处理小文件，立即获取结果 |
| **ADP Create Async Task** | 创建异步任务 | 处理大文件，需要轮询查询结果 |
| **ADP Query Task** | 查询任务 | 获取异步任务的状态和结果 |

## 🎯 常见配置

### 同步提取（最常用）
```
文件来源: Base64
文件内容: <your base64 string>
卡证类型: 身份证_大陆
```

### 异步处理
```
步骤 1: ADP Create Async Task (创建任务)
步骤 2: Wait 节点 (等待 10 秒)
步骤 3: ADP Query Task (查询结果)
步骤 4: 循环直到完成
```

## 🔑 认证信息获取

从您的 ADP 管理后台获取：
- **Access Key**: 租户级密钥
- **App Key**: 应用密钥
- **App Secret**: 应用秘钥
- **Tenant Name**: 租户名（默认 laiye）

## 📝 API 端点

```
同步: POST /open/agentic_doc_processor/{tenant}/v1/app/doc/extract
异步: POST /open/agentic_doc_processor/{tenant}/v1/app/doc/extract/create/task
查询: GET /open/agentic_doc_processor/{tenant}/v1/app/doc/extract/query/task/{id}
```

## ⚡ 快速测试

### 测试 1: 同步模式
```
Manual Trigger → ADP Sync Extract → Code Node
```

### 测试 2: 异步模式
```
Manual Trigger → ADP Create Async Task → Wait (10s) → ADP Query Task
```

## 🆘 遇到问题？

1. **节点不显示**: 检查 `npm run build` 是否成功
2. **认证失败**: 验证 Access Key、App Key、App Secret 是否正确
3. **超时错误**: 使用异步模式处理大文件

## 📚 更多文档

- [README.md](./README.md) - 完整文档
- [EXAMPLES.md](./EXAMPLES.md) - 详细示例
- [BUILD.md](./BUILD.md) - 开发指南
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - 项目总结

---

**祝您使用愉快！** 🎉

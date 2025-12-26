# Geonames 国家—省份 级联选择器

这是一个简单的静态网页示例，使用 Geonames 的接口实现“国家 → 省/州”二级级联选择器。

使用方法：

- 直接在浏览器中打开 [index.html](index.html)。如果浏览器阻止本地请求，可以用静态服务器启动：

```bash
# Python 3
python -m http.server 8000

# 或（Windows）
py -m http.server 8000
```

然后在浏览器打开 http://localhost:8000

注意：脚本中已使用用户名 `Misaka1008611`，如果要更换用户名，请编辑 `script.js` 顶部的 `GEONAMES_USERNAME` 常量。

可能的网络问题：Geonames 的接口有时会受到 CORS 或速率限制影响，如遇问题请尝试使用本地代理或检查用户名是否激活。

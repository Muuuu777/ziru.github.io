# Mars Ziru 个人作品集

包含个人首页，以及行之、SnowBar、Perfect Fit、暴打龙叔四个项目详情页。

这是静态网站，不需要安装依赖或构建。

## 在另一台电脑继续编辑

```sh
git clone https://github.com/Muuuu777/ziru.github.io.git
cd ziru.github.io
```

用 Codex 打开这个文件夹，即可继续修改。开始新一轮工作前运行 `git pull --ff-only`，获取另一台电脑上传的内容。

## 本地预览

直接打开 `index.html`，或者在项目目录运行：

```sh
python3 -m http.server 4173
```

然后打开 http://localhost:4173/ 。

## 文件位置

- `index.html`：首页文案与作品入口。
- `xingzhi.html`、`snowbar.html`、`perfect-fit.html`、`longshu.html`：项目详情。
- `style.css`、`refined.css`：页面样式。
- `site.js`：页面交互。
- `assets/`：网页使用的图片。

## 保存到 GitHub

```sh
git add .
git commit -m "Update portfolio"
git push origin main
```

也可以直接让 Codex 帮你提交和上传。两台电脑避免同时修改同一个文件。

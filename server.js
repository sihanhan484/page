const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// 设置静态文件夹
app.use(express.static('public'));

// 解析JSON和urlencoded格式的请求体
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 获取讨论板数据
app.get('/threads', (req, res) => {
    const filePath = path.join(__dirname, 'data.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('服务器错误');
            return;
        }
        res.json(JSON.parse(data));
    });
});

// 发表新留言
app.post('/threads', (req, res) => {
    const { username, content } = req.body;
    const newThread = {
        id: Date.now(),
        username,
        content,
        replies: []
    };

    const filePath = path.join(__dirname, 'data.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('服务器错误');
            return;
        }
        const threads = JSON.parse(data);
        threads.push(newThread);
        fs.writeFile(filePath, JSON.stringify(threads, null, 2), (err) => {
            if (err) {
                console.error(err);
                res.status(500).send('服务器错误');
                return;
            }
            res.status(201).send('留言成功');
        });
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/messages', (req, res) => {
    fs.readFile(path.join(__dirname, 'messages.json'), 'utf8', (err, data) => {
        if (err) throw err;
        res.json(JSON.parse(data));
    });
});

app.post('/addMessage', (req, res) => {
    const message = req.body;
    fs.readFile(path.join(__dirname, 'messages.json'), 'utf8', (err, data) => {
        if (err) throw err;
        const messages = JSON.parse(data);
        messages.push(message);
        fs.writeFile(path.join(__dirname, 'messages.json'), JSON.stringify(messages), (err) => {
            if (err) throw err;
            res.status(201).send('Message added successfully');
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
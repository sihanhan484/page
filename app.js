document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('messageForm');
    const messagesList = document.getElementById('messages');

    function loadMessages() {
        const serverPromise = fetch('/messages')
            .then(response => response.json())
            .then(messages => {
                messages.sort((a, b) => new Date(b.time) - new Date(a.time));
                return messages;
            })
            .catch(error => {
                console.error('Error fetching messages from server:', error);
                return [];
            });

        const indexedDBPromise = new Promise((resolve, reject) => {
            if (window.indexedDB) {
                const dbRequest = indexedDB.open("MessagesDB", 1);
                dbRequest.onupgradeneeded = function(event) {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains("messages")) {
                        db.createObjectStore("messages", { keyPath: "time" });
                    }
                };
                dbRequest.onsuccess = function(event) {
                    const db = event.target.result;
                    const transaction = db.transaction(["messages"], "readonly");
                    const store = transaction.objectStore("messages");
                    store.getAll().onsuccess = function(event) {
                        const localMessages = event.target.result;
                        resolve(localMessages.filter(msg => !msg.public));
                    };
                    transaction.onerror = function(event) {
                        reject(event.target.error);
                    };
                };
                dbRequest.onerror = function(event) {
                    reject(event.target.error);
                };
            } else {
                resolve([]);
            }
        });

        Promise.all([serverPromise, indexedDBPromise])
            .then(([serverMessages, localMessages]) => {
                const allMessages = [...serverMessages, ...localMessages];
                allMessages.sort((a, b) => new Date(b.time) - new Date(a.time));
                displayMessages(allMessages);
            })
            .catch(error => console.error('Error loading messages:', error));
    }

    function displayMessages(messages) {
        messagesList.innerHTML = '';
        messages.forEach(message => {
            const li = document.createElement('li');
            li.className = 'message';
            li.innerHTML = `
                <strong>${message.username}</strong> - ${message.title} - ${message.time}<br>
                ${message.content} - 公开: ${message.public ? '是' : '否'}
            `;
            messagesList.appendChild(li);
        });
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;
        const publicCheck = document.getElementById('public').checked;
        const time = new Date().toISOString();

        const message = { username, title, content, time, public: publicCheck };

        if (publicCheck) {
            try {
                await fetch('/addMessage', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(message)
                });
            } catch (error) {
                console.error('Error adding message to server:', error);
            }
        } else {
            if (window.indexedDB) {
                const dbRequest = indexedDB.open("MessagesDB", 1);
                dbRequest.onupgradeneeded = function(event) {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains("messages")) {
                        db.createObjectStore("messages", { keyPath: "time" });
                    }
                };
                dbRequest.onsuccess = function(event) {
                    const db = event.target.result;
                    const transaction = db.transaction(["messages"], "readwrite");
                    const store = transaction.objectStore("messages");
                    store.add(message).onsuccess = function(event) {
                        console.log('Message added to IndexedDB successfully');
                    };
                    transaction.oncomplete = function() {
                        db.close();
                    };
                    transaction.onerror = function(event) {
                        console.error('Error adding message to IndexedDB:', event.target.error);
                    };
                };
            }
        }

        location.reload();
    });

    loadMessages();
});const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 设置静态文件目录
app.use(express.static(path.join(__dirname, '../client')));
app.use(bodyParser.json());

// 读取消息数据
function readMessages() {
    const rawData = fs.readFileSync(path.join(__dirname, 'messages.json'));
    return JSON.parse(rawData);
}

// 写入消息数据
function writeMessages(messages) {
    fs.writeFileSync(path.join(__dirname, 'messages.json'), JSON.stringify(messages, null, 2));
}

// 获取所有消息
app.get('/api/messages', (req, res) => {
    const messages = readMessages();
    res.json(messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
});

// 添加新消息
app.post('/api/messages', (req, res) => {
    const { username, title, content, isPublic, timestamp } = req.body;
    const newMessage = { username, title, content, isPublic, timestamp };
    
    const messages = readMessages();
    messages.push(newMessage);
    writeMessages(messages);
    
    res.status(201).json(newMessage);
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
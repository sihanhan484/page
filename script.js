document.addEventListener('DOMContentLoaded', function() {
    const messageForm = document.getElementById('messageForm');
    const messagesList = document.getElementById('messages');

    // 初始化IndexedDB
    const dbRequest = indexedDB.open('MessageBoardDB', 1);

    dbRequest.onupgradeneeded = function(event) {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('messages')) {
            db.createObjectStore('messages', { keyPath: 'id', autoIncrement: true });
        }
    };

    dbRequest.onsuccess = function(event) {
        const db = event.target.result;
        window.messageDB = db;
        loadMessages();
    };

    dbRequest.onerror = function(event) {
        console.error('Error opening IndexedDB:', event.target.error);
    };

    // 提交留言
    messageForm.onsubmit = function(event) {
        event.preventDefault();
        const username = document.getElementById('username').value.trim();
        const title = document.getElementById('title').value.trim();
        const content = document.getElementById('content').value.trim();
        const isPublic = document.getElementById('public').checked;
        const timestamp = new Date().toISOString();

        if (username && title && content) {
            postMessage({ username, title, content, isPublic, timestamp })
                .then(() => {
                    // 清空输入框
                    document.getElementById('username').value = '';
                    document.getElementById('title').value = '';
                    document.getElementById('content').value = '';
                    // 重新加载留言
                    loadMessages();
                })
                .catch(error => {
                    console.error('Error posting message:', error);
                });
        }
    };

    // 加载留言
    function loadMessages() {
        const transaction = window.messageDB.transaction(['messages'], 'readonly');
        const store = transaction.objectStore('messages');
        const request = store.getAll();

        request.onsuccess = function(event) {
            const messages = event.target.result || [];
            messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            displayMessages(messages);
        };

        request.onerror = function(event) {
            console.error('Error fetching messages from IndexedDB:', event.target.error);
        };
    }

    // 显示留言
    function displayMessages(messages) {
        messagesList.innerHTML = ''; // 清空现有的留言
        messages.forEach(message => {
            const li = document.createElement('li');
            li.className = 'message';
            li.innerHTML = `
                <strong>${message.username}</strong> -${message.title} - ${message.timestamp}<br>
                ${message.content} - 公开:${message.isPublic ? '是' : '否'}
                <button class="delete-btn">删除</button>
            `;
            li.querySelector('.delete-btn').addEventListener('click', function() {
                deleteMessage(message.id);
            });
            messagesList.appendChild(li);
        });
    }

    // 发表留言
    function postMessage(msg) {
        return new Promise((resolve, reject) => {
            const transaction = window.messageDB.transaction(['messages'], 'readwrite');
            const store = transaction.objectStore('messages');
            const addRequest = store.add(msg);

            addRequest.onsuccess = function(event) {
                resolve(event.target.result);
            };

            addRequest.onerror = function(event) {
                reject(event.target.error);
            };
        });
    }

    // 删除留言
    function deleteMessage(id) {
        const transaction = window.messageDB.transaction(['messages'], 'readwrite');
        const store = transaction.objectStore('messages');
        const deleteRequest = store.delete(id);

        deleteRequest.onsuccess = function() {
            loadMessages(); // 重新加载留言
        };

        deleteRequest.onerror = function(event) {
            console.error('Error deleting message:', event.target.error);
        };
    }
});
document.addEventListener('DOMContentLoaded', function () {
    var slides = document.querySelectorAll('.slide');
    var sliderContainer = document.querySelector('.slider-container');
    var prevButton = document.querySelector('.prev');
    var nextButton = document.querySelector('.next');
    var dotsContainer = document.querySelector('.dots');
    var slideIndex = 0;
    var autoSlideInterval; // 用于存储自动轮播的定时器
    var intervalTime = 3000; // 设置自动轮播的时间间隔，这里是3秒

    function showSlide(index) {
        slides.forEach(function (slide) {
            slide.classList.remove('active');
        });
        slides[index].classList.add('active');
        updateDots(index);
    }

    function updateDots(index) {
        document.querySelectorAll('.dot').forEach(function (dot) {
            dot.classList.remove('active-dot');
        });
        document.querySelectorAll('.dot')[index].classList.add('active-dot');
    }

    function createDots() {
        slides.forEach(function (_, index) {
            var dot = document.createElement('span');
            dot.classList.add('dot');
            dot.addEventListener('click', function () {
                stopAutoSlide(); // 用户点击时停止自动轮播
                slideIndex = index;
                showSlide(slideIndex);
                startAutoSlide(); // 用户切换后重新开始自动轮播
            });
            dotsContainer.appendChild(dot);
        });
        document.querySelectorAll('.dot')[0].classList.add('active-dot');
    }

    function nextSlide() {
        slideIndex = (slideIndex + 1) % slides.length;
        showSlide(slideIndex);
    }

    function prevSlide() {
        slideIndex = (slideIndex - 1 + slides.length) % slides.length;
        showSlide(slideIndex);
    }

    function startAutoSlide() {
        autoSlideInterval = setInterval(nextSlide, intervalTime);
    }

    function stopAutoSlide() {
        clearInterval(autoSlideInterval);
    }

    nextButton.addEventListener('click', function () {
        stopAutoSlide(); // 停止自动轮播
        nextSlide();
        startAutoSlide(); // 重新开始自动轮播
    });

    prevButton.addEventListener('click', function () {
        stopAutoSlide(); // 停止自动轮播
        prevSlide();
        startAutoSlide(); // 重新开始自动轮播
    });

    createDots();
    showSlide(slideIndex);
    startAutoSlide(); // 初始化时开始自动轮播
});
const dbName = 'gameScreenshotDB';
const storeName = 'screenshots';
let db;

    
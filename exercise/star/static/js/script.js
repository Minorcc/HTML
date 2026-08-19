(function () {
    // 页面主脚本：管理星空、日期信息、生日状态、气球和音乐播放器。
    const starfield = document.getElementById('starfield');
    let lastMinuteKey = null;
    let countdownTimer = null;        // 倒计时自动恢复定时器
    let isCountdownActive = false;    // 倒计时是否激活

    // 创建一颗带随机位置、闪烁节奏和漂移轨迹的星星。
    function createStar(type) {
        const star = document.createElement('span');
        star.className = 'star ' + type;

        const left = Math.random() * window.innerWidth;
        const top = Math.random() * window.innerHeight;
        star.style.left = left + 'px';
        star.style.top = top + 'px';
        star.style.animationDelay = (Math.random() * 4).toFixed(2) + 's';
        star.style.animationDuration = (1.2 + Math.random() * 6).toFixed(2) + 's';
        star.style.opacity = (Math.random() * 0.9 + 0.1).toFixed(2);

        const dx = (Math.random() - 0.5) * 30;
        const dy = (Math.random() - 0.5) * 30;
        const duration = 5 + Math.random() * 12;
        star.animate(
            [
                { transform: 'translate(0, 0)' },
                { transform: `translate(${dx}px, ${dy}px)` },
                { transform: 'translate(0, 0)' }
            ],
            {
                duration: duration * 1000,
                iterations: Infinity,
                easing: 'ease-in-out'
            }
        );

        return star;
    }

    // 按三种尺寸批量初始化星空背景。
    function initStars() {
        starfield.innerHTML = '';

        const largeCount = 50;
        const mediumCount = 80;
        const smallCount = 120;

        for (let i = 0; i < largeCount; i++) {
            starfield.appendChild(createStar('large'));
        }

        for (let i = 0; i < mediumCount; i++) {
            starfield.appendChild(createStar('medium'));
        }

        for (let i = 0; i < smallCount; i++) {
            starfield.appendChild(createStar('small'));
        }
    }

    // 重新触发日期卡片翻页动画。
    function animateFlip(targetEl) {
        if (!targetEl) return;
        targetEl.classList.remove('flip');
        void targetEl.offsetWidth;
        targetEl.classList.add('flip');
        setTimeout(() => targetEl.classList.remove('flip'), 600);
    }

    // 获取指定月份的天数，用于日期翻页判断。
    function getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }

    function getLunarYearText(year) {
        const gan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
        const zhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
        const animals = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
        return `${gan[(year - 4) % 10]}${zhi[(year - 4) % 12]}${animals[(year - 4) % 12]}年`;
    }

    function getLunarDayText(day) {
        const lunarDays = [
            '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
            '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
            '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
        ];
        return lunarDays[Math.max(0, Math.min(day - 1, lunarDays.length - 1))];
    }

    function getLunarMonthText(month) {
        const monthNames = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
        return monthNames[Math.max(0, Math.min(month - 1, monthNames.length - 1))];
    }

    // 使用浏览器农历格式化器更新农历年月日文本。
    function updateLunarDate() {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('zh-CN-u-ca-chinese', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const parts = formatter.formatToParts(now);
        const lunarYear = Number(parts.find(part => part.type === 'relatedYear' || part.type === 'year')?.value || now.getFullYear());
        const lunarMonth = parts.find(part => part.type === 'month')?.value || getLunarMonthText(now.getMonth() + 1);
        const lunarDay = Number(parts.find(part => part.type === 'day')?.value || now.getDate());

        const lunarText = `${lunarYear} ${getLunarYearText(lunarYear)} ${lunarMonth}${getLunarDayText(lunarDay)}`;
        document.getElementById('lunar-date').textContent = lunarText;
    }

    // 首次加载时写入公历日期、时间和农历信息。
    function updateDateTime() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');

        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        document.getElementById('year').textContent = year;
        const monthEl = document.getElementById('month');
        const dayEl = document.getElementById('day');
        const dayValue = Number(day);
        const monthValue = Number(month);

        const prevDay = Number(dayEl.textContent || now.getDate());
        const prevMonth = Number(monthEl.textContent || now.getMonth() + 1);

        if (dayValue === getDaysInMonth(year, now.getMonth()) && dayValue === 1) {
            const monthBlock = monthEl.closest('.date-block');
            animateFlip(monthBlock);
        }

        if (dayValue !== prevDay) {
            const dayBlock = dayEl.closest('.date-block');
            animateFlip(dayBlock);
        }

        if (monthValue !== prevMonth && dayValue === getDaysInMonth(year, now.getMonth())) {
            const monthBlock = monthEl.closest('.date-block');
            animateFlip(monthBlock);
        }

        monthEl.textContent = month;
        dayEl.textContent = day;
        document.getElementById('time').textContent = `${hours}:${minutes}:${seconds}`;
        updateLunarDate();
    }

    initStars();
    updateDateTime();

    // 每秒刷新时钟，并在跨日或跨月时触发翻页效果。
    setInterval(() => {
        const now = new Date();
        const dayEl = document.getElementById('day');
        const monthEl = document.getElementById('month');
        const prevDay = Number(dayEl.textContent || now.getDate());
        const prevMonth = Number(monthEl.textContent || now.getMonth() + 1);
        const newDay = now.getDate();
        const newMonth = now.getMonth() + 1;
        const currentMinuteKey = now.getHours() * 60 + now.getMinutes();

        if (lastMinuteKey !== null && currentMinuteKey !== lastMinuteKey) {
            lastMinuteKey = currentMinuteKey;
        }
        lastMinuteKey = currentMinuteKey;

        if (newDay !== prevDay) {
            animateFlip(dayEl.closest('.date-block'));
        }

        if (newMonth !== prevMonth && newDay === getDaysInMonth(now.getFullYear(), now.getMonth())) {
            animateFlip(monthEl.closest('.date-block'));
        }

        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        document.getElementById('time').textContent = `${hours}:${minutes}:${seconds}`;

        document.getElementById('year').textContent = now.getFullYear();
        monthEl.textContent = String(newMonth).padStart(2, '0');
        dayEl.textContent = String(newDay).padStart(2, '0');
        updateLunarDate();
    }, 1000);

    // 窗口变化后重新布置星星，避免星空集中在旧视口范围。
    window.addEventListener('resize', function () {
        initStars();
    });

    // ===== 农历七月初八功能 =====

    // 获取七月初八的公历日期（2026-2030年示例数据）
    // 将指定年份的农历七月初八转换为公历日期。
    function getLunarJulyEighthDate(year) {
        const lunarMap = {
            2026: { month: 8, day: 20 },
            2027: { month: 8, day: 9 },
            2028: { month: 8, day: 27 },
            2029: { month: 8, day: 17 },
            2030: { month: 8, day: 6 }
        };
        return lunarMap[year] || null;
    }

    // 判断今天是否是七月初八
    // 判断当前日期是否为目标生日。
    function isTodayLunarJulyEighth() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const lunarDate = getLunarJulyEighthDate(year);
        if (!lunarDate) return false;
        return month === lunarDate.month && day === lunarDate.day;
    }

    // 计算距离七月初八还有多少天
    // 计算距离目标生日还有或已经过去多少天。
    function getDaysToLunarJulyEighth() {
        const now = new Date();
        const year = now.getFullYear();
        const lunarDate = getLunarJulyEighthDate(year);
        if (!lunarDate) return null;

        const target = new Date(year, lunarDate.month - 1, lunarDate.day);
        target.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffTime = target.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // ===== 控制生日标题显示 =====
    // 仅在生日当天显示顶部生日标题。
    function updateBirthdayTitle() {
        const pageTitle = document.querySelector('.page-title');
        if (!pageTitle) return;

        if (isTodayLunarJulyEighth()) {
            pageTitle.style.display = 'flex';
        } else {
            pageTitle.style.display = 'none';
        }
    }

    // ===== 气球动画（来自第二个文件） =====
    // 创建随机颜色、大小和位置的上升气球。
    function createBalloons() {
        // 移除已有气球
        document.querySelectorAll('.baloon').forEach(el => el.remove());

        const colors = [
            ['#E85D04', '#FFBA08'],
            ['#ff3da4', '#FB5607'],
            ['#f15156', '#3A86FF'],
            ['#FFBE0B', '#f15156'],
            ['#FF006E', '#00a1de'],
            ['#DC2F02', '#ff3da4'],
            ['#8338EC', '#00a1de'],
            ['#d177ff', '#00a1de'],
            ['#d177ff', '#FF006E'],
            ['#3A86FF', '#FF006E'],
            ['#00a1de', '#FFBE0B'],
            ['#ff3da4', '#FFBA08'],
            ['#DC2F02', '#d177ff'],
            ['#f15156', '#FB5607'],
            ['#3A86FF', '#FFBA08'],
            ['#8338EC', '#ff3da4'],
            ['#f15156', '#3A86FF'],
            ['#8338EC', '#00a1de'],
            ['#f15156', '#FFBA08'],
            ['#FFBE0B', '#00a1de'],
            ['#FF006E', '#ff3da4'],
            ['#FFBE0B', '#8338EC'],
            ['#FFBE0B', '#ff3da4'],
            ['#E85D04', '#FFBE0B'],
            ['#FB5607', '#FF006E'],
            ['#3A86FF', '#f15156'],
            ['#FF006E', '#FF006E'],
            ['#00a1de', '#FFBA08'],
            ['#FB5607', '#FF006E'],
            ['#FF006E', '#d177ff'],
            ['#FB5607', '#DC2F02'],
            ['#f15156', '#00a1de'],
            ['#f15156', '#DC2F02'],
            ['#d177ff', '#DC2F02'],
            ['#3A86FF', '#FFBE0B'],
            ['#d177ff', '#3A86FF'],
            ['#3A86FF', '#E85D04']
        ];

        // 生成30-40个气球
        const count = 30 + Math.floor(Math.random() * 10);
        const usedPositions = [];

        for (let i = 0; i < count; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            const width = 100 + Math.random() * 90; // 100-190px
            const delay = -1 - Math.random() * 95; // -1s 到 -96s
            const left = Math.random() * 98 + 1; // 1% - 99%

            // 避免气球重叠太多
            let attempts = 0;
            let newLeft = left;
            while (attempts < 20) {
                const overlapping = usedPositions.some(pos => Math.abs(pos - newLeft) < 5);
                if (!overlapping) break;
                newLeft = Math.random() * 98 + 1;
                attempts++;
            }
            usedPositions.push(newLeft);

            const baloon = document.createElement('div');
            baloon.className = 'baloon';
            baloon.style.setProperty('--width', width + 'px');
            baloon.style.setProperty('--animationDelay', delay + 's');
            baloon.style.left = newLeft + '%';
            baloon.style.backgroundImage = `linear-gradient(45deg, ${color[0]}, ${color[1]})`;
            baloon.style.position = 'fixed';
            baloon.style.top = '100%';
            baloon.style.zIndex = '100';
            baloon.style.animation = 'balloonRise 5s ease-in-out infinite';
            baloon.style.animationDelay = (Math.random() * 3) + 's';

            // 添加绳子
            const string = document.createElement('span');
            baloon.appendChild(string);

            document.body.appendChild(baloon);

            // 随机延迟出现
            baloon.style.opacity = '0';
            setTimeout(() => {
                baloon.style.opacity = '0.75';
            }, Math.random() * 2000);
        }
    }

    // 停止气球动画（移除所有气球）
    // 清理当前页面中的所有气球。
    function removeBalloons() {
        document.querySelectorAll('.baloon').forEach(el => el.remove());
    }

    // ===== 检查并更新显示 =====
    // 根据生日状态切换标题、祝福消息和倒计时显示。
    function checkLunarJulyEighth() {
        const isSpecial = isTodayLunarJulyEighth();

        // 1. 控制生日标题显示
        updateBirthdayTitle();

        // 2. 控制特殊消息和倒计时
        const message = document.getElementById('specialMessage');
        const countdown = document.getElementById('countdownMessage');
        const daysElement = document.getElementById('countdownDays');

        // 如果倒计时激活，自动检查不覆盖倒计时
        if (isCountdownActive) {
            return;
        }
        if (isSpecial) {
            // 今天是七月初八
            if (message) {
                message.style.display = 'block';
                // 重新触发动画
                const spans = message.querySelectorAll('.message-content span');
                spans.forEach((span, index) => {
                    span.style.animation = 'none';
                    setTimeout(() => {
                        span.style.animation = '';
                    }, 10 + index * 50);
                });
            }
            if (countdown) {
                countdown.style.display = 'none';
            }
            // ===== 新增：播放生日快乐歌 =====
            playBirthdaySong();
            // ===== 新增结束 =====
        } else {
            // 不是七月初八
            // if (message) {
            //     message.style.display = 'none';
            // }
            // const days = getDaysToLunarJulyEighth();
            // if (countdown && days !== null && daysElement) {
            //     countdown.style.display = 'block';
            //     const prefix = countdown.querySelector('span:first-child');
            //     const suffix = countdown.querySelector('span:last-child');
            //     if (days >= 0) {
            //         daysElement.textContent = days;
            //         if (prefix) prefix.textContent = '📅 距离七月初八还有 ';
            //         if (suffix) suffix.textContent = ' 天';
            //     } else {
            //         daysElement.textContent = Math.abs(days);
            //         if (prefix) prefix.textContent = '📅 七月初八已过 ';
            //         if (suffix) suffix.textContent = ' 天';
            //     }
            // }
            // 不是七月初八 - 显示"今天是"（不显示倒计时）
            if (message) {
                const messageContent = message.querySelector('.message-content');
                if (messageContent) {
                    messageContent.innerHTML = '<span>今</span><span>天</span><span>是</span>';
                    // 为"今天是"三个字设置颜色
                    const spans = messageContent.querySelectorAll('span');
                    spans.forEach(span => {
                        span.classList.add('today-text');
                    });
                }
                message.style.display = 'block';
                const spans = message.querySelectorAll('.message-content span');
                spans.forEach((span, index) => {
                    span.style.animation = 'none';
                    setTimeout(() => {
                        span.style.animation = '';
                    }, 10 + index * 50);
                });
            }
            if (countdown) {
                countdown.style.display = 'none';
            }
        }
    }
    // ===== 播放生日快乐歌 =====
    // 生日当天尝试自动切换并播放生日歌曲。
    function playBirthdaySong() {
        const audio = document.getElementById('musicAudio');
        if (!audio) {
            console.warn('⚠️ 未找到音乐播放器元素');
            return;
        }

        // 检查是否已经在播放生日歌
        const currentSrc = audio.src || '';
        if (currentSrc.includes('birthday.mp3') && !audio.paused) {
            console.log('🎵 生日快乐歌已在播放');
            return;
        }

        // 保存当前播放状态
        const wasPlaying = !audio.paused;
        const prevSrc = audio.src;

        // 切换到生日歌
        audio.src = 'music/birthday.mp3';
        audio.load();

        // 播放
        audio.play()
            .then(() => {
                console.log('🎵 播放生日快乐歌');
                // 更新界面显示
                const titleElement = document.getElementById('musicTitle');
                if (titleElement) {
                    titleElement.textContent = '🎉 生日快乐';
                }
                // 更新播放按钮状态
                const toggleButton = document.getElementById('musicToggle');
                if (toggleButton) {
                    toggleButton.textContent = '❚❚';
                }
            })
            .catch(err => {
                console.warn('⚠️ 自动播放被阻止，请手动点击播放:', err);
                // 即使播放失败，也更新标题显示
                const titleElement = document.getElementById('musicTitle');
                if (titleElement) {
                    titleElement.textContent = '🎉 生日快乐';
                }
            });
    }
    // ===== 日期按钮点击事件 =====
    function handleCheckDateClick() {
        const isSpecial = isTodayLunarJulyEighth();
        // 清除之前的定时器
        if (countdownTimer) {
            clearTimeout(countdownTimer);
            countdownTimer = null;
        }

        if (isSpecial) {
            // 今天是七月初八：显示生日标题 + 播放气球
            const pageTitle = document.querySelector('.page-title');
            if (pageTitle) {
                pageTitle.style.display = 'flex';
                // 重新触发动画
                const spans = pageTitle.querySelectorAll('span');
                spans.forEach((span, index) => {
                    span.style.animation = 'none';
                    setTimeout(() => {
                        span.style.animation = '';
                    }, 10 + index * 50);
                });
            }

            // 播放气球动画
            createBalloons();

            // 同时显示特殊消息
            const message = document.getElementById('specialMessage');
            if (message) {
                message.style.display = 'block';
                const spans = message.querySelectorAll('.message-content span');
                spans.forEach((span, index) => {
                    span.style.animation = 'none';
                    setTimeout(() => {
                        span.style.animation = '';
                    }, 10 + index * 50);
                });
            }

            // 隐藏倒计时
            const countdown = document.getElementById('countdownMessage');
            if (countdown) {
                countdown.style.display = 'none';
            }
            // 10秒后自动移除气球
            if (window.balloonTimeout) {
                clearTimeout(window.balloonTimeout);
            }
            window.balloonTimeout = setTimeout(removeBalloons, 10000);
            // 标记倒计时未激活
            isCountdownActive = false;


        } else {
            // 不是七月初八：显示倒计时
            const days = getDaysToLunarJulyEighth();
            const countdown = document.getElementById('countdownMessage');
            const daysElement = document.getElementById('countdownDays');
            const message = document.getElementById('specialMessage');

            if (message) message.style.display = 'none';

            if (countdown && days !== null && daysElement) {
                countdown.style.display = 'block';
                const prefix = countdown.querySelector('span:first-child');
                const suffix = countdown.querySelector('span:last-child');
                if (days >= 0) {
                    daysElement.textContent = days;
                    if (prefix) prefix.textContent = '📅 距离七月初八还有 ';
                    if (suffix) suffix.textContent = ' 天';
                } else {
                    daysElement.textContent = Math.abs(days);
                    if (prefix) prefix.textContent = '📅 七月初八已过 ';
                    if (suffix) suffix.textContent = ' 天';
                }
                // 触发倒计时进入动画
                countdown.style.animation = 'none';
                void countdown.offsetWidth;
                countdown.style.animation = 'fadeInUp 0.5s ease forwards';
            }


            // 隐藏生日标题
            const pageTitle = document.querySelector('.page-title');
            if (pageTitle) {
                pageTitle.style.display = 'none';
            }

            // 移除气球
            removeBalloons();
            if (window.balloonTimeout) {
                clearTimeout(window.balloonTimeout);
                window.balloonTimeout = null;
            }
            // 标记倒计时激活
            isCountdownActive = true;

            // 30秒后自动恢复显示"今天是"
            countdownTimer = setTimeout(function () {
                isCountdownActive = false;
                // 恢复显示"今天是"
                const msg = document.getElementById('specialMessage');
                if (msg) {
                    const messageContent = msg.querySelector('.message-content');
                    if (messageContent) {
                        messageContent.innerHTML = '<span>今</span><span>天</span><span>是</span>';
                        // 设置"薯条大王"颜色
                        const spans = messageContent.querySelectorAll('span');
                        spans.forEach(span => {
                            span.classList.add('today-text');
                        });
                    }
                    msg.style.display = 'block';
                    animateMessage(msg);
                }
                const cd = document.getElementById('countdownMessage');
                if (cd) {
                    cd.style.display = 'none';
                }
                countdownTimer = null;
            }, 10000); // 10秒
        }
    }
    // ===== 消息动画辅助函数 =====
    // 清除并重新触发消息中的逐字动画。
    function animateMessage(element) {
        if (!element) return;
        const spans = element.querySelectorAll('.message-content span');
        spans.forEach((span, index) => {
            span.style.animation = 'none';
            // 强制回流重新触发动画
            void span.offsetWidth;
            setTimeout(() => {
                span.style.animation = '';
            }, 10 + index * 50);
        });
    }

    // ===== 左下角音乐播放器 =====
    function initMusicPlayer() {
        const audio = document.getElementById('musicAudio');
        const toggleButton = document.getElementById('musicToggle');
        const playlistToggle = document.getElementById('musicPlaylistToggle');
        const playlistElement = document.getElementById('musicPlaylist');
        const titleElement = document.getElementById('musicTitle');
        const currentTimeElement = document.getElementById('musicCurrentTime');
        const durationElement = document.getElementById('musicDuration');
        const progressElement = document.getElementById('musicProgress');
        const previousButton = document.getElementById('musicPrev');
        const nextButton = document.getElementById('musicNext');
        const modeButton = document.getElementById('musicMode');

        if (!audio || !toggleButton || !playlistElement || !modeButton) return;

        // 歌曲清单：文件均相对于当前页面位于 music 文件夹。
        const songs = [
            { title: '生日快乐', file: 'birthday.mp3' },
            { title: '芊芊龍,董唧唧 - 一点点（为什么晚上总是有星星）', file: 'music1.mp3' },
            { title: 'E.lenient - 特别的人', file: 'music2.mp3' },
            { title: '第五人格 - 2025春节-预热活动', file: 'music3.mp3' }
        ];
        let currentIndex = 0;
        // 三种自动切歌模式：单曲循环、顺序播放、随机播放。
        const playModes = [
            { name: '单曲循环', icon: '↻', className: '' },
            { name: '顺序播放', icon: '≡', className: 'order-mode' },
            { name: '随机播放', icon: '🔀', className: 'random-mode' }
        ];
        let playModeIndex = 0;

        // 将音频秒数格式化为播放器显示的 mm:ss。
        function formatTime(seconds) {
            if (!Number.isFinite(seconds)) return '00:00';
            const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
            const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, '0');
            return `${minutes}:${remainingSeconds}`;
        }

        // 根据歌曲清单生成可点击的播放列表。
        function renderPlaylist() {
            playlistElement.innerHTML = '';
            songs.forEach((song, index) => {
                const button = document.createElement('button');
                button.className = 'music-song-btn';
                button.type = 'button';
                button.textContent = `${index + 1}. ${song.title}`;
                button.addEventListener('click', () => loadSong(index, true));
                playlistElement.appendChild(button);
            });
        }

        // 高亮当前播放歌曲。
        function updatePlaylistState() {
            playlistElement.querySelectorAll('.music-song-btn').forEach((button, index) => {
                button.classList.toggle('active', index === currentIndex);
            });
        }

        // 切换音频源并同步标题、进度和播放列表状态。
        function loadSong(index, shouldPlay) {
            currentIndex = (index + songs.length) % songs.length;
            const song = songs[currentIndex];
            audio.src = `music/${song.file}`;
            titleElement.textContent = song.title;
            currentTimeElement.textContent = '00:00';
            durationElement.textContent = '00:00';
            progressElement.value = '0';
            updatePlaylistState();
            if (shouldPlay) {
                audio.play().catch(() => {
                    toggleButton.textContent = '▶';
                    toggleButton.setAttribute('aria-label', '播放音乐');
                });
            }
        }

        // 根据 audio.paused 状态更新播放/暂停按钮。
        function updateToggleButton() {
            const isPlaying = !audio.paused;
            toggleButton.textContent = isPlaying ? '❚❚' : '▶';
            toggleButton.setAttribute('aria-label', isPlaying ? '暂停音乐' : '播放音乐');
            toggleButton.title = isPlaying ? '暂停音乐' : '播放音乐';
        }

        // 更新播放模式图标、颜色和无障碍提示。
        function updateModeButton() {
            const mode = playModes[playModeIndex];
            modeButton.textContent = mode.icon;
            modeButton.className = `music-control-btn music-mode-btn ${mode.className}`.trim();
            modeButton.setAttribute('aria-label', `播放模式：${mode.name}`);
            modeButton.title = `播放模式：${mode.name}`;
        }

        // 按当前模式计算歌曲结束后的下一首索引。
        function getNextIndex() {
            if (playModeIndex === 0) return currentIndex;
            if (playModeIndex === 2) {
                if (songs.length < 2) return currentIndex;
                let nextIndex = currentIndex;
                while (nextIndex === currentIndex) {
                    nextIndex = Math.floor(Math.random() * songs.length);
                }
                return nextIndex;
            }
            return currentIndex + 1;
        }

        // 初始化歌单、默认歌曲和播放模式。
        renderPlaylist();
        loadSong(0, false);
        updateModeButton();

        toggleButton.addEventListener('click', () => {
            if (audio.paused) {
                audio.play().catch(() => updateToggleButton());
            } else {
                audio.pause();
            }
        });
        playlistToggle.addEventListener('click', () => {
            playlistElement.hidden = !playlistElement.hidden;
            playlistToggle.setAttribute('aria-label', playlistElement.hidden ? '展开播放列表' : '收起播放列表');
        });
        previousButton.addEventListener('click', () => loadSong(currentIndex - 1, true));
        nextButton.addEventListener('click', () => loadSong(currentIndex + 1, true));
        modeButton.addEventListener('click', () => {
            playModeIndex = (playModeIndex + 1) % playModes.length;
            updateModeButton();
        });
        audio.addEventListener('play', updateToggleButton);
        audio.addEventListener('pause', updateToggleButton);
        // 歌曲结束后按当前模式自动续播或停止。
        audio.addEventListener('ended', () => {
            if (playModeIndex === 1 && currentIndex === songs.length - 1) {
                updateToggleButton();
                return;
            }
            loadSong(getNextIndex(), true);
        });
        // 音频元数据就绪后显示总时长。
        audio.addEventListener('loadedmetadata', () => {
            durationElement.textContent = formatTime(audio.duration);
        });
        // 播放过程中同步当前时间和进度条。
        audio.addEventListener('timeupdate', () => {
            currentTimeElement.textContent = formatTime(audio.currentTime);
            if (audio.duration) {
                progressElement.value = ((audio.currentTime / audio.duration) * 100).toString();
            }
        });
        progressElement.addEventListener('input', () => {
            if (audio.duration) {
                audio.currentTime = (Number(progressElement.value) / 100) * audio.duration;
            }
        });
    }

    // ===== 页面初始化与可见性恢复 =====
    document.addEventListener('DOMContentLoaded', function () {
        initMusicPlayer();
        // 先检查并更新显示
        checkLunarJulyEighth();


        // 如果今天是七月初八，自动显示生日标题和气球
        if (isTodayLunarJulyEighth()) {
            const pageTitle = document.querySelector('.page-title');
            if (pageTitle) {
                pageTitle.style.display = 'flex';
            }
            createBalloons();
            // 10秒后自动移除气球
            setTimeout(removeBalloons, 10000);
        }

        // ===== 新增：播放生日快乐歌 =====
        // 延迟一下确保音乐播放器已初始化
        setTimeout(playBirthdaySong, 500);
        // ===== 新增结束 =====
        // 绑定按钮事件
        const checkBtn = document.getElementById('checkDateBtn');
        if (checkBtn) {
            checkBtn.addEventListener('click', handleCheckDateClick);
        }

        // 每分钟检查一次（确保日期变化时更新）
        setInterval(checkLunarJulyEighth, 60000);
    });

    // 页面可见性变化时重新检查（用户切换标签页回来时）
    document.addEventListener('visibilitychange', function () {
        if (!document.hidden) {
            checkLunarJulyEighth();
        }
    });
})();
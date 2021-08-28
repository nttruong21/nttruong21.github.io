/**
 * To do list
 * Render songs to HTML -> OK
 * Scroll top -> OK
 * CD rotate -> OK
 * Load current song -> OK
 * Play/Pause -> OK
 * Back/Next song -> OK
 * Seek handle -> OK
 * Repeat -> OK
 * Random -> OK
 * Active song -> OK
 * Scroll active song into view -> OK
 * Play song when click -> OK
 * Keep status of random, repeat when reload the page
 */

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'MY_PLAYER';

const playlist = $('.playlist');
const cdThumb = $('.cd-thumb');
const cd = $('.cd');
const audio = $('#audio');
const togglePlayBtn = $('.btn.toggle-play-btn');
const backBtn = $('.btn.back-btn');
const nextBtn = $('.btn.next-btn');
const repeatBtn = $('.btn.repeat-btn');
const randomBtn = $('.btn.random-btn');
const progress = $('.progress');
const progressInput = $('input[type="range"]');
const leftTime = $('.time-left');
const rightTime = $('.time-right');


const app = {
    currentIndex: 0,
    isPlaying: false,
    isRepeat: false,
    isRandom: false,
    randomArray: [],
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    songs: [{
            name: 'CƯỚI THÔI',
            singer: 'MASEW',
            path: 'assets/src/song0.mp3',
            image: 'assets/imgs/img0.jpg'
        },
        {
            name: 'ĐỘ TỘC 2',
            singer: 'MIXI ft PHÚC DU PHÁO MASEW',
            path: 'assets/src/song1.mp3',
            image: 'assets/imgs/img1.jpg'
        },
        {
            name: 'NHẤT THÂN',
            singer: 'MASEW X KHOI VU',
            path: 'assets/src/song2.mp3',
            image: 'assets/imgs/img2.jpg'
        },
        {
            name: 'MỘNG MƠ',
            singer: 'MASEW FT REDT',
            path: 'assets/src/song3.mp3',
            image: 'assets/imgs/img3.jpg'
        },
        {
            name: '2 PHÚT HƠN',
            singer: 'PHÁO X MASEW',
            path: 'assets/src/song4.mp3',
            image: 'assets/imgs/img4.jpg'
        },
        {
            name: 'TÚY ÂM',
            singer: 'XESI X MASEW X NHATNGUYEN',
            path: 'assets/src/song5.mp3',
            image: 'assets/imgs/img5.jpg'
        },
        {
            name: 'LỬNG LƠ',
            singer: 'MASEW ft B-RAY REDT',
            path: 'assets/src/song6.mp3',
            image: 'assets/imgs/img6.jpg'
        },
        {
            name: '2 5',
            singer: 'TÁO X MASEW',
            path: 'assets/src/song7.mp3',
            image: 'assets/imgs/img7.jpg'
        },
        {
            name: 'NGẪU HỨNG',
            singer: 'HOAPROX',
            path: 'assets/src/song8.mp3',
            image: 'assets/imgs/img8.jpg'
        },
        {
            name: 'XA',
            singer: 'MASEW x APJ',
            path: 'assets/src/song9.mp3',
            image: 'assets/imgs/img9.jpg'
        },
        {
            name: 'BUỒN KHÔNG EM',
            singer: 'ĐẠT G ft MASEW',
            path: 'assets/src/song10.mp3',
            image: 'assets/imgs/img10.jpg'
        }
    ],
    render: function() {
        const html = this.songs.map((song, index) => {
            return `
                <div class="song" data-index=${index}>
                    <img src="${song.image}" alt="" class="song-img">
                    <div class="song-details">
                        <div class="song-infor">
                            <div class="name">${song.name}</div>
                            <div class="singer">${song.singer}</div>
                        </div>
                        <div class="option">
                            <i class="fas fa-ellipsis-h"></i>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        playlist.innerHTML = html;
    },
    handleEvents: function() {
        const _this = this;

        // Scroll top
        const cdWidth = cd.offsetWidth;
        document.onscroll = function(e) {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCDWidth = (cdWidth - scrollTop) > 0 ? (cdWidth - scrollTop) : 0;
            cd.style.width = newCDWidth + 'px';
            cd.style.opacity = newCDWidth / cdWidth;
        }

        // CD rotate 
        const cdAnimate = cd.animate({ transform: 'rotate(360deg)' }, {
            duration: 10000,
            iterations: Infinity
        });
        cdAnimate.pause();

        // Play/Pause song 
        togglePlayBtn.onclick = function() {
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        }

        // Play event
        audio.onplay = function() {
            _this.isPlaying = true;
            togglePlayBtn.classList.add('playing');
            cdAnimate.play();
        }

        // Pause event
        audio.onpause = function() {
            _this.isPlaying = false;
            togglePlayBtn.classList.remove('playing');
            cdAnimate.pause();
        }

        // Click next button
        nextBtn.onclick = function() {
            if (_this.isRandom) {
                _this.randomSong();
            } else {
                _this.nextSong();
            }
            _this.loadCurrentSong();
            audio.play();
            _this.scrollIntoView();
        }

        // Click back button
        backBtn.onclick = function() {
            if (_this.isRandom) {
                _this.randomSong();
            } else {
                _this.backSong();
            }
            _this.loadCurrentSong();
            audio.play();
            _this.scrollIntoView();
        }

        // Progress input
        audio.ontimeupdate = function() {
            if (audio.duration) {
                const progressPercent = audio.currentTime / audio.duration * 100;
                progressInput.value = progressPercent;

                // Display the current time and duration of song 
                leftTime.innerHTML = _this.convertToTimeFormat(audio.currentTime);
                rightTime.innerHTML = _this.convertToTimeFormat(audio.duration);
            }
        }

        // Seek song 
        progressInput.oninput = function(e) {
            const seekTime = audio.duration * e.target.value / 100;
            audio.currentTime = seekTime;
        }

        // Click repeat button
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat);
        }

        // Click random button 
        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom);
        }

        // When the song ended 
        audio.onended = function() {
            if (_this.isRepeat) {
                // _this.loadCurrentSong();
                audio.play();
            } else {
                nextBtn.onclick();
            }
        }

        // Play song when click 
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)');
            const optionBtn = e.target.closest('.option');
            if (optionBtn) {
                // to do 
            } else if (songNode) {
                _this.currentIndex = songNode.dataset.index;
                _this.loadCurrentSong();
                audio.play();
            } else {
                // to do
            }
        }
    },
    randomSong: function() {
        do {
            var randomIndex = Math.floor(Math.random() * this.songs.length);
        } while (randomIndex === this.currentIndex || this.randomArray.includes(randomIndex));
        this.randomArray.push(randomIndex);
        this.currentIndex = randomIndex;
        if (this.randomArray.length === this.songs.length) {
            this.randomArray.splice(0, this.randomArray.length);
        }
        // console.log(this.randomArray);
    },
    nextSong: function() {
        this.currentIndex++;
        if (this.currentIndex === this.songs.length) {
            this.currentIndex = 0;
        }
    },
    backSong: function() {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = _this.songs.length - 1;
        }
    },
    scrollIntoView: function() {
        setTimeout(function() {
            $('.song.active').scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }, 300);
    },
    loadCurrentSong: function() {
        $('header h2').innerHTML = this.songs[this.currentIndex].name;
        $('header h4').innerHTML = this.songs[this.currentIndex].singer;
        cdThumb.style.backgroundImage = `url(${this.songs[this.currentIndex].image})`;
        audio.src = this.songs[this.currentIndex].path;

        if ($('.song.active')) {
            $('.song.active').classList.remove('active');
        }
        $$('.song')[this.currentIndex].classList.add('active');
    },
    loadConfig: function() {
        this.isRepeat = this.config['isRepeat'];
        this.isRandom = this.config['isRandom'];
        repeatBtn.classList.toggle('active', this.isRepeat);
        randomBtn.classList.toggle('active', this.isRandom);
    },
    convertToTimeFormat: function(number) {
        var temp = number / 60;
        var minutes = Math.floor(temp);
        var seconds = temp - minutes;
        seconds = Math.floor(seconds * 60);
        if (seconds < 10) {
            return `${minutes}:0${seconds}`;
        } else {
            return `${minutes}:${seconds}`;
        }
    },
    start: function() {
        this.render();
        this.loadCurrentSong();
        this.handleEvents();
        this.loadConfig();
    }
};

app.start();
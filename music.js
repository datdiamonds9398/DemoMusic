const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'settingSave'
const PLAYER_STORAGE_SONG = 'savesong'


const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.cd')
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playList = $('.playlist')




// 1.Render song v
// 2.Scroll top v
// 3.play / pause / seek v
// 4.cd rolate v
// 5.next / prev v
// 6.Random v
// 7.Next / repeat when ended v
// 8.Active song 
// 9.scroll active song into viewer
// 10.play song when click

const app = {
    indexCurrSongs: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,

    // learn about JSON localStorage / getItem / setItem
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    savesongs: JSON.parse(localStorage.getItem(PLAYER_STORAGE_SONG)) || {},
    setConfig: function(key, value) {
      this.config[key] = value                                             
      localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    setNameSong: function(nameSong, songIndex) {
      this.savesongs[nameSong] = songIndex
      localStorage.setItem(PLAYER_STORAGE_SONG, JSON.stringify(this.savesongs))
    },

    songs: [
        {
          name: "Yêu như ngày yêu cuối",
          singer: " Mai Tien Dung",
          path: "./assets/music/YeuNhuNgayYeuCuoi-MaiTienDung.mp3",
          image: "./assets/img/song1.jpg"
        },
        {
          name: "Như Một Người Dưng",
          singer: " Nguyễn Thạc Bảo Ngọc",
          path: "./assets/music/NhuMotNguoiDung-NguyenThacBaoNgoc-5526016.mp3",
          image: "./assets/img/song2.jpg"
        },
        
        {
          name: " Mình Xa Mình Yêu",
          singer: " Juun D ",
          path: "./assets/music/MinhXaMinhYeu-JuunDangDung-5061958.mp3",
          image: "./assets/img/song3.jpg"
        },

        {
          name: "Sau Tất Cả",
          singer: " Erik",
          path: "/assets/music/SauTatCa-MONSTARERIKST319-4301357.mp3",
          image: "./assets/img/song4.jpg"
        },

        {
          name: "Người Lạ Thoáng Qua",
          singer: "Đinh Tùng Huy",
          path: "./assets/music/NguoiLaThoangQua-DinhTungHuy-7079855 (1).mp3",
          image: "./assets/img/song5.jpg"
        },

        {
          name: "Hoa Nở Không Màu",
          singer: "Hoài Lâm",
          path: "./assets/music/HoaNoKhongMau1-HoaiLam-6281704.mp3",
          image: "./assets/img/song6.jpg"
        },

        {
          name: "Nỗi Nhớ Vô Hình",
          singer: "Bùi Anh Tuấn, Tiến Minh",
          path: "./assets/music/NoiNhoVoHinh-BuiAnhTuanTienMinh-3518731.mp3",
          image: "./assets/img/song7.jpg"
        },

        {
          name: "Nơi Tình Yêu Bắt Đầu",
          singer: "Bùi Anh Tuấn",
          path: "./assets/music/NoiTinhYeuBatDau-BuiAnhTuan-1915267.mp3",
          image: "./assets/img/song8.jpg"
        },

        {
          name: "Nơi Tình Yêu Kết Thúc",
          singer: "Bùi Anh Tuấn",
          path: "./assets/music/NoiTinhYeuKetThuc-BuiAnhTuan-2540574.mp3",
          image: "./assets/img/song9.jpg"
        },

        {
          name: "Sau Bao Năm",
          singer: "Khắc Việt",
          path: "./assets/music/SauBaoNam-KhacViet-5090386.mp3",
          image: "./assets/img/song10.jpg"
        },
      ],

    //   Hàm đưa ra màn hình 
      render: function() {
        const html = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.indexCurrSongs ? 'active' : ''}" data-index="${index}">
                    <div class="thumb" style="background-image: url('${song.image}')">       
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
              <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
              </div>
            </div>  
            `
        })
        playList.innerHTML = html.join('')
      },
      // Định nghĩa ra 1 Object
      defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
          get: function() {
            return this.songs[this.indexCurrSongs]
          }
        })
      },

      // Hàm sừa lỗi DevChrome
       // Moreover since Chrome 50, a play() call on an a <video> or <audio> element returns a Promise,
       toFixedDevChromeAudioPlay: function() {
        const playAudioPromise =  audio.play()
        if(playAudioPromise !== undefined) {
          playAudioPromise.then(function() {
            audio.play()
          })
          .catch(function(err) {
            // xóa lỗi
          })
        }   
       },

      // hàm xử lý các sự kiện
      handlerEvents: function() {
        const _this = this
        const cdwidth = cd.offsetWidth 

        // xử lý cd rotation
        const cdthumbAnimate  = cdThumb.animate([
          // Keyframe animations
          { transform: 'rotate(360deg)' }
        ], {
          // options animations
          duration: 10000, // khoảng tg chạy hêt 1 vòng
          iterations: Infinity // lặp lại vô hạn
        })
        cdthumbAnimate.pause()

        // Xử lý phóng to thu nhỏ
        document.onscroll = function() {
          const scrollTop = document.scrollTop || window.scrollY 
          const newCdWidth = cdwidth - scrollTop

          /* Cách 1:*/ 
          cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
          // Cách 2:
          // if(newCdWidth > 0) {
          //   cd.style.width =  newCdWidth + 'px'
          // } else {
          //   cd.style.width = 0
          // }
          cd.style.opacity = newCdWidth / cdwidth
        }
          // xử lý click play
        playBtn.onclick = function() {
          if(_this.isPlaying) {
            audio.pause()
          } else {
            audio.play()
          }
        }

        // xử lý click chuyển bài
        nextBtn.onclick = function() {
          // xử lý random khi chuyển bài hát
          if(_this.isRandom) {
            _this.randomSong()
          } else {
            _this.nextSong()
          }
          _this.toFixedDevChromeAudioPlay()
          _this.render()
        }
        // xử lý lùi bài hát
        prevBtn.onclick = function() {
          // xử lý random lùi bài hát
          if(_this.isRandom) {
            _this.randomSong()
          } else {
            _this.prevSong()
          }
          _this.toFixedDevChromeAudioPlay()
          _this.render()
        },

        // Hàm xử lý chuyển bài hát
        // và lặp lại bài hát
        audio.onended = function() {
          if(_this.isRepeat) {
            audio.play()
          } else {
            nextBtn.click()
          }
        }

        // xử lý bài hát dc play
        audio.onplay = function() {
          _this.isPlaying = true
          player.classList.add('playing')
          cdthumbAnimate.play()
        }

        // xử lý bài hát bị pause
        audio.onpause = function() {
          _this.isPlaying = false
          player.classList.remove('playing')
          cdthumbAnimate.pause()
        }

        // xử lý chuyển ngẫu nhiên bài hát
        randomBtn.onclick = function() {
          // ko dùng dc target vì nó cick vào đâu thì ăn vào đó 
          _this.isRandom = !_this.isRandom
          _this.setConfig('isRandom', _this.isRandom)
          this.classList.toggle('active', _this.isRandom)
        }

        repeatBtn.onclick = function() {
          _this.isRepeat = !_this.isRepeat
          _this.setConfig('isRepeat', _this.isRepeat)
          this.classList.toggle('active', _this.isRepeat)
        }

        // xử lý Tiến độ bài hát
        audio.ontimeupdate = function() {
          if(audio.duration) {
            const progressPercent = audio.currentTime / audio.duration * 100
            progress.value = progressPercent
          }
        }

        // xử lý kick vị trí của bài hát 
        progress.onclick = function() {
          const seek = (audio.duration * this.value) / 100 
          audio.currentTime = seek
        }

        //! add me
        // xử lý click song active
        playList.onclick = function(e) {
          const songIdActive = e.target.closest('.song:not(.active)')
          const songIdNumber = Number(songIdActive.dataset.index)

          if(songIdActive || e.target.closest('.option')) {
            if(songIdActive) {
              _this.setNameSong('nameSong',  songIdNumber)
              _this.indexCurrSongs = songIdNumber
              _this.loadCurrentSongs()
              _this.render()
              audio.play()
            }
          }
        }
      },

      loadConfig: function() {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat

        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)
      },

      loadNameSong: function() {
        playList.songIdNumber = this.savesongs.indexCurrSongs
        
      },

      // Hàm chạy cd
      loadCurrentSongs: function() {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url(${this.currentSong.image})`
        audio.src = this.currentSong.path
      },

      nextSong: function() {
        this.indexCurrSongs++
        if(this.indexCurrSongs >= this.songs.length) {
          this.indexCurrSongs = 0
        }
        this.loadCurrentSongs()
      },

      prevSong: function() {
        this.indexCurrSongs--
        if(this.indexCurrSongs < 0) {
          this.indexCurrSongs = this.songs.length - 1
        }
        this.loadCurrentSongs()
      },

      // Hàm xử lý randomSong
      randomSong: function() {
        let newSongRandom
        do {
          newSongRandom = Math.floor(Math.random() * this.songs.length)
        } while(newSongRandom ===  this.indexCurrSongs)
        this.indexCurrSongs = newSongRandom
        this.loadCurrentSongs()
      },
      
    //   Hàm khởi tạo 
      start: function() {

        // hàm lưu 
        this.loadConfig()
        // this.loadNameSong()

        // Hàm định nghĩa ra các thuộc tính
        this.defineProperties()    

        // Hàm xử lý các sự kiện
        this.handlerEvents()

        // Hàm chạy cd
        this.loadCurrentSongs()

        // Hàm render ra các ds bài hát
        this.render()
      }

}
app.start()

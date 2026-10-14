/*
 * 寒假國語特攻隊：教材內容
 * ------------------------------------------------------------
 * 所有教學文字都集中在這個檔案，方便老師修改，不需要動到程式。
 *
 * 文字標記方式：
 *   {字|注音}  目標生字（會加上注音並標示顏色，可點開生字卡）
 *   [字|注音]  一般難字（只加上注音）
 *
 * 朗讀音檔：短文、故事、例句、生字讀音（say）都會由 tools/audio/build-audio.mjs
 * 用 Gemini TTS 預先產生。修改這些文字後，請重新執行該程式；
 * 尚未重新產生前，網頁會暫時改用瀏覽器內建語音。
 */
window.COURSE = {
  title: '小朋友的寒假國語特攻隊',
  grade: '國小三年級',
  version: 'POC 示範版',

  team: [
    {
      name: '小宇',
      role: '生字偵探',
      look: '深棕色短髮、頭頂翹著一撮呆毛，穿藍色連帽外套、深色長褲、紅色球鞋，背著棕色書包。',
    },
    {
      name: '小晴',
      role: '成語故事迷',
      look: '棕色長髮綁成側邊馬尾，戴紅色髮圈，穿粉紅色連帽外套、深藍色百褶裙。',
    },
    {
      name: '墨墨',
      role: '帶路小隊長',
      look: '白底、橘色和咖啡色花紋的三花貓，額頭綁著有白色星星的紅色頭巾。',
    },
  ],

  styleGuide:
    '日系 Q 版卡通風格，人物約 2 頭身：大圓臉、大眼睛（有白色反光）、粉紅色腮紅，深咖啡色粗外框線，色彩鮮明明亮、陰影簡單，背景柔和不搶戲。三位特攻隊員在每一張圖裡都維持相同的髮型、服裝與配色。',

  // ================================================================
  // 第一課：說文解字
  // ================================================================
  lesson1: {
    id: 'lesson1',
    no: '第一課',
    title: '說文解字',
    theme: '文字寶藏大探險',
    badge: { name: '生字小偵探', icon: '🔍' },

    mission: {
      title: '任務一：找回森林裡的文字寶藏',
      intro:
        '寒假第一天，墨墨帶來一張神祕的藏寶圖。聽說大樹林裡藏著五個會發光的國字，只要認識它們，就能打開寶箱！特攻隊，出發吧！',
      goals: [
        '看情境圖，找出寶箱飛出的五個生字',
        '讀一讀短文，認識生字的讀音和意思',
        '用「說文解字」的方法，看懂字的部首和組成',
        '通過兩道守門關卡，拿到「生字小偵探」徽章',
      ],
    },

    scene: {
      img: 'images/lesson1-scene.svg',
      alt: '森林裡，小宇拿著藏寶圖、小晴張開雙手保持平衡、三花貓墨墨帶路，三人正走過溪上的獨木橋；右邊的大樹洞裡有發光的寶箱，飛出五個發光的國字；左邊有一個畫滿問號的路標。',
      caption: '文字寶藏大探險：特攻隊正走過獨木橋，前往大樹洞裡的寶箱。',
      findTask: '找一找：寶箱飛出了哪五個字？點一點發光的字，把它們都找出來！',
      // 熱點位置（以圖片寬高的百分比表示），對應圖中的發光字
      hotspots: [
        { char: '探', x: 78.8, y: 58.8 },
        { char: '險', x: 81.7, y: 47.5 },
        { char: '迷', x: 86.7, y: 42.5 },
        { char: '寶', x: 91.7, y: 47.5 },
        { char: '藏', x: 94.2, y: 58.8 },
      ],
      promptZh:
        '日系 Q 版卡通風格，色彩鮮明明亮。冬天的陽光灑進一片綠意盎然的大樹林，一條清澈的小溪從畫面中間流過，溪上架著一根細長的獨木橋。三位主角排成一列過橋：最前面是額頭綁紅色頭巾、白底橘咖啡色花紋的三花貓「墨墨」，正抬起鼻子聞路；中間是綁側邊馬尾、穿粉紅色連帽外套的女孩「小晴」，張開雙手保持平衡；後面是穿藍色連帽外套、背棕色書包的男孩「小宇」，雙手拿著一張畫著紅色叉叉的藏寶圖。畫面右側有一棵巨大的老樹，樹洞裡有一個打開的寶箱，金光閃閃，飛出「探、險、迷、寶、藏」五個發光的國字。畫面左側有一個畫滿問號、指向不同方向的木頭路標，表示大家剛剛迷路了。視覺焦點：獨木橋上的三位主角與發光的寶箱。人物 2 頭身，大眼睛、圓臉、粉紅腮紅，線條乾淨，背景柔和。',
      promptEn:
        'Japanese chibi (super-deformed) cartoon illustration, bright saturated colors, clean thick brown outlines, soft simple shading. A sunny green forest in winter with a clear stream crossing the middle and a thin log bridge over it. Three characters cross the bridge in a line: in front, a white calico cat with orange and brown patches wearing a red headband, sniffing the air; in the middle, a girl with a brown side ponytail and a pink hoodie, arms stretched out to keep balance; at the back, a boy with messy dark-brown hair, blue hoodie and brown backpack, holding a treasure map with a red X. On the right, a giant old tree with a hollow containing an open, glowing treasure chest; five glowing Traditional Chinese characters 探 險 迷 寶 藏 float out of it. On the left, a wooden signpost with question marks pointing in different directions. Focus on the three characters on the bridge and the glowing chest. 2-head-tall chibi proportions, big shiny eyes, pink cheeks. No other text.',
    },

    story: {
      title: '文字寶藏大探險',
      text:
        '寒假第一天，小宇、小晴和小貓墨墨撿到一張舊地圖，上面寫著：「大樹林裡有文字{寶|ㄅㄠˇ}{藏|ㄗㄤˋ}！」三個好朋友馬上出發去{探|ㄊㄢˋ}{險|ㄒㄧㄢˇ}。樹林裡的小路彎彎曲曲，他們一下子就{迷|ㄇㄧˊ}路了。墨墨{探|ㄊㄢˋ}出頭聞一聞，帶大家走過一座危{險|ㄒㄧㄢˇ}的獨木橋。最後，他們發現{寶|ㄅㄠˇ}箱就{藏|ㄘㄤˊ}在大樹洞裡，打開一看，裡面全是閃閃發亮的國字！',
      note: '短文共 116 個字，五個目標生字都出現在文中；「藏」字同時出現兩種讀音。',
    },

    chars: [
      {
        char: '探',
        say: '探，探險的探。',
        zhuyin: 'ㄊㄢˋ',
        radical: '手（扌）',
        strokes: 11,
        parts: '左右結構：扌＋罙',
        origin:
          '左邊的「扌」就是「手」。古書《說文解字》說「探」是「遠取之也」，意思是把手伸到遠遠的、深深的地方去拿東西，所以「探」和手的動作有關。',
        meanings: ['伸手去摸、去找', '尋找、打聽還不清楚的事', '把頭或身體往外伸'],
        words: ['探險', '探頭', '探望'],
        sentence: '小狗從門後探出頭來，看看是誰來了。',
      },
      {
        char: '險',
        say: '險，危險的險。',
        zhuyin: 'ㄒㄧㄢˇ',
        radical: '阜（阝）',
        strokes: 16,
        parts: '左右結構：阝＋僉',
        origin:
          '左邊的「阝」是由「阜」字變成的部首，「阜」的意思是高高的土山。《說文解字》說「險」是「阻難也」，就是山路高低不平、很難通過。右邊的「僉」表示讀音。',
        meanings: ['地勢高低不平、不容易通過', '可能會發生危害、不安全'],
        words: ['危險', '冒險', '探險'],
        sentence: '馬路上車子很多，在路邊追逐玩耍非常危險。',
      },
      {
        char: '迷',
        say: '迷，迷路的迷。',
        zhuyin: 'ㄇㄧˊ',
        radical: '辵（辶）',
        strokes: 10,
        parts: '半包圍結構：辶＋米',
        origin:
          '「辶」和走路有關，「米」表示讀音（米、迷念起來很像）。古書《說文解字》把「迷」解釋成「疑惑、分不清楚」：走著走著分不清方向、心裡糊里糊塗，就是「迷」。',
        meanings: ['分辨不清楚、弄不明白', '對一件事非常喜歡、著迷'],
        words: ['迷路', '迷宮', '入迷'],
        sentence: '弟弟看故事書看得入迷，連媽媽叫他吃飯都沒聽見。',
      },
      {
        char: '寶',
        say: '寶，寶貝的寶。',
        zhuyin: 'ㄅㄠˇ',
        radical: '宀',
        strokes: 20,
        parts: '上下結構：宀＋王（玉）＋缶＋貝',
        origin:
          '「宀」像房子的屋頂；屋子裡收著「玉」（寫成「王」的樣子）和「貝」（古時候拿貝殼當錢），都是很珍貴的東西。中間的「缶」表示讀音。《說文解字》說「寶，珍也」，就是珍貴的意思。',
        meanings: ['珍貴的東西', '珍貴的、很重要的'],
        words: ['寶物', '寶貝', '寶貴'],
        sentence: '時間很寶貴，我們要好好把握。',
      },
      {
        char: '藏',
        say: '藏有兩種念法：躲藏的藏，和寶藏的藏。',
        zhuyin: 'ㄘㄤˊ',
        zhuyin2: 'ㄗㄤˋ',
        radical: '艸（艹）',
        strokes: 18,
        parts: '上下結構：艹＋臧',
        origin:
          '上面是草字頭，下面的「臧」表示讀音。記憶小撇步：把東西躲進草叢裡，別人就找不到了，這就是「藏」。',
        polyphone: [
          { zhuyin: 'ㄘㄤˊ', meaning: '躲起來、把東西收起來', words: ['躲藏', '收藏', '捉迷藏'] },
          { zhuyin: 'ㄗㄤˋ', meaning: '收藏起來的寶物、存放東西的地方', words: ['寶藏'] },
        ],
        meanings: ['（ㄘㄤˊ）躲起來、把東西收起來', '（ㄗㄤˋ）收藏起來的寶物'],
        words: ['躲藏', '收藏', '寶藏'],
        sentence: '玩捉迷藏時，小晴藏在窗簾後面；圖書館裡的書，就像一座知識的寶藏。',
      },
    ],

    quiz: [
      {
        id: 'l1q1',
        kind: '部首大考驗',
        question: '「寶」字裡藏著好幾個小部件：宀、王（玉）、缶、貝。查字典的時候，「寶」要查哪一個部首？',
        bigChar: '寶',
        options: ['王', '宀', '貝', '缶'],
        answer: 1,
        hint: '想一想：哪一個部件像屋頂，把珍貴的東西收在屋子裡？',
        explain:
          '「寶」的部首是「宀」。宀像房子的屋頂，屋子裡收著玉和貝這些珍貴的東西，所以「寶」的意思是珍貴的東西；中間的「缶」是表示讀音的部件。',
      },
      {
        id: 'l1q2',
        kind: '破音字大考驗',
        question: '讀一讀這兩句話：①大樹林裡有文字「寶藏」。②寶箱就「藏」在大樹洞裡。兩個「藏」字分別念什麼？',
        bigChar: '藏',
        options: ['①ㄘㄤˊ　②ㄘㄤˊ', '①ㄘㄤˊ　②ㄗㄤˋ', '①ㄗㄤˋ　②ㄘㄤˊ', '①ㄗㄤˋ　②ㄗㄤˋ'],
        answer: 2,
        hint: '「寶藏」說的是一樣東西（寶物）；「藏在樹洞裡」說的是一個動作（躲起來）。',
        explain:
          '「寶藏」是指收藏起來的寶物，「藏」念ㄗㄤˋ；「藏在樹洞裡」是躲起來、收起來的意思，「藏」念ㄘㄤˊ。一個字有兩種以上的讀音，意思也跟著不同，這種字叫做「破音字」。',
      },
    ],
  },

  // ================================================================
  // 第二課：成語猜謎
  // ================================================================
  lesson2: {
    id: 'lesson2',
    no: '第二課',
    title: '成語猜謎',
    theme: '成語時光機',
    badge: { name: '成語小達人', icon: '🐉' },

    mission: {
      title: '任務二：搭上時光機，破解成語謎題',
      intro:
        '墨墨在寶箱底下發現一台「成語時光機」！按下按鈕，特攻隊就會回到古代，親眼看見成語故事。看清楚圖裡的線索，猜猜是哪一個成語吧！',
      goals: [
        '仔細觀察情境圖裡的人物、動物和東西',
        '從四個成語裡，猜出圖片說的是哪一個',
        '讀成語故事，知道成語從哪本書來',
        '學會成語的意思和用法，拿到「成語小達人」徽章',
      ],
    },

    idioms: [
      {
        id: 'idiom1',
        answer: '守株待兔',
        zhuyin: ['ㄕㄡˇ', 'ㄓㄨ', 'ㄉㄞˋ', 'ㄊㄨˋ'],
        riddle: {
          img: 'images/idiom1-riddle.svg',
          alt: '古代農田裡，一位戴斗笠的農夫坐在樹樁旁邊，托著下巴盯著樹樁；斗笠邊結了蜘蛛網，鋤頭丟在一旁，上面爬著蝸牛，田裡長滿野草。農夫的想像泡泡裡，一隻兔子正衝向樹樁。遠方山坡上還有一隻兔子跳走了。',
          clues: [
            '樹樁旁邊坐著一位農夫，眼睛一直盯著樹樁。',
            '農夫的想像泡泡裡，有一隻兔子衝向樹樁。',
            '鋤頭被丟在一旁，田裡長滿了野草。',
            '斗笠上結了蜘蛛網，表示他已經等了好久好久。',
          ],
          hint: '墨墨提示：農夫在「守」著什麼東西？他又在「等待」哪一種動物？',
          choices: ['對牛彈琴', '狐假虎威', '守株待兔', '亡羊補牢'],
          answerIndex: 2,
          wrongFeedback: {
            對牛彈琴: '圖裡沒有牛，也沒有人在彈琴喔！再看看農夫在等什麼。',
            狐假虎威: '圖裡沒有狐狸和老虎喔！再看看想像泡泡裡的動物。',
            亡羊補牢: '圖裡沒有羊，也沒有人在修羊圈喔！再看看農夫身旁的東西。',
          },
          promptZh:
            '日系 Q 版卡通風格，色彩鮮明溫暖，傍晚的天空帶點橘黃色。古代中國的鄉下農田，遠方有一間茅草屋。畫面中間有一個粗大的樹樁，樹樁右邊盤腿坐著一位戴斗笠、穿麻布短衣的古代農夫，一手托著下巴，眼睛期待地盯著樹樁，嘴角流著口水；斗笠邊緣結了蜘蛛網，還垂著一隻小蜘蛛。農夫頭上有一個想像泡泡，泡泡裡一隻白色兔子正飛快地衝向樹樁、撞出一顆星星。地上丟著一把鋤頭，上面爬著一隻蝸牛，田裡的野草長得又高又亂。遠方山坡上還有一隻兔子跳走了。畫面右下角，小宇、小晴和三花貓墨墨躲在草叢後面偷看，頭上冒出問號。視覺焦點：樹樁、農夫和想像泡泡裡的兔子。畫面中不可出現任何文字或成語答案。',
          promptEn:
            'Japanese chibi cartoon illustration, warm bright colors, late-afternoon sky. Ancient Chinese countryside farmland with a small thatched hut in the distance. In the center, a big tree stump; to its right sits a chibi ancient farmer in a conical straw hat and simple hemp clothes, cross-legged, chin in hand, staring hopefully at the stump and drooling a little; a cobweb with a tiny spider hangs from his hat brim. A thought bubble above him shows a white rabbit dashing into the stump with an impact star. A hoe lies abandoned on the ground with a snail crawling on it; tall messy weeds fill the field. Far away, another rabbit hops off over a hill. In the bottom-right corner, a boy in a blue hoodie, a girl in a pink hoodie with a side ponytail, and a calico cat with a red headband peek from behind a bush with a question mark. Focus on the stump, the farmer and the rabbit in the thought bubble. Absolutely no text or captions.',
        },
        story: {
          title: '守株待兔的故事',
          source: '《韓非子．五[蠹|ㄉㄨˋ]》',
          sourcePlain: '《韓非子．五蠹》',
          text:
            '很久很久以前，宋國有一個農夫，每天都在田裡辛苦[耕|ㄍㄥ]作。他的田中間有一根樹[樁|ㄓㄨㄤ]。有一天，一隻兔子跑得飛快，一頭撞上樹樁，折斷脖子死了。農夫白白撿到一隻兔子，高興極了！從此以後，他放下農具，不再耕田，每天坐在樹樁旁邊，等著再撿到兔子。可是，兔子再也沒有出現，田裡長滿了野草，農夫也成了宋國人的笑話。',
          original: '宋人有耕者，田中有株，兔走觸株，折頸而死，因釋其耒而守株，冀復得兔。兔不可復得，而身為宋國笑。',
          glossary: [
            ['株', '露出地面的樹根，也就是樹樁'],
            ['走', '跑'],
            ['釋', '放下'],
            ['耒', '古代用來翻土的農具'],
            ['冀', '希望'],
          ],
        },
        literal: [
          ['守', '守著'],
          ['株', '樹樁'],
          ['待', '等待'],
          ['兔', '兔子'],
        ],
        literalSentence: '字面意思：守在樹樁旁邊，等待兔子再撞上來。',
        meaning: '比喻死守著偶然得到的好運，不知道變通；也用來比喻想不努力就得到收穫。',
        examples: [
          '想要球技進步，就要天天練習，不能守株待兔，等著好運從天上掉下來。',
          '哥哥上次在公園撿到一枚十元硬幣，之後天天去同一個地方守株待兔，結果再也沒撿到。',
        ],
        similar: ['刻舟求劍'],
        opposite: ['隨機應變'],
        quiz: [
          {
            id: 'i1q1',
            kind: '成語意思',
            question: '「守株待兔」用來比喻什麼樣的人？',
            options: ['死守著偶然的好運，不知道變通的人', '很有耐心照顧小動物的人', '做事以前會仔細計畫的人', '跑得像兔子一樣快的人'],
            answer: 0,
            hint: '想一想：農夫撿到一次兔子以後，做了什麼？結果呢？',
            explain:
              '故事裡的農夫只因為撿到一次兔子，就不再耕田、每天守著樹樁，結果什麼也沒得到。所以「守株待兔」比喻死守著偶然的好運，不知道變通，或是想不努力就有收穫。',
          },
          {
            id: 'i1q2',
            kind: '生活應用',
            question: '下面哪一個情況，最像「守株待兔」？',
            options: [
              '小美每天練習跳繩，終於在比賽中得到冠軍',
              '哥哥考試前，把不會的題目一題一題問清楚',
              '妹妹看到受傷的小鳥，請爸爸帶牠去看獸醫',
              '阿明上次在公園撿到十元，之後每天放學都蹲在同一個地方，等著再撿到錢',
            ],
            answer: 3,
            hint: '找一找：哪一個人和故事裡的農夫一樣，什麼都不做，只是在原地等好運？',
            explain:
              '阿明和故事裡的農夫一樣，把一次偶然的好運當成會一直發生，什麼也不做地等待，所以 D 最像「守株待兔」。A、B、C 都是靠自己努力或主動幫忙的好例子。',
          },
        ],
      },
      {
        id: 'idiom2',
        answer: '畫龍點睛',
        zhuyin: ['ㄏㄨㄚˋ', 'ㄌㄨㄥˊ', 'ㄉㄧㄢˇ', 'ㄐㄧㄥ'],
        riddle: {
          img: 'images/idiom2-riddle.svg',
          alt: '古代寺廟的白牆上畫著白龍。左邊兩條龍沒有畫眼睛；一位畫家站在梯子上，用毛筆替中間那條龍點上眼睛，眼睛閃閃發光；右上方的牆壁破了一個洞，一條白龍駕著雲飛向打雷閃電的天空，圍觀的人都嚇了一跳。',
          clues: [
            '寺廟的牆上，畫著好幾條白龍。',
            '左邊的兩條龍，眼睛都是空白的。',
            '畫家拿著毛筆，正替一條龍點上眼睛，眼睛閃閃發亮。',
            '另一條龍打破牆壁，駕著雲飛上打雷閃電的天空。',
          ],
          hint: '墨墨提示：畫家的毛筆正點在龍身上的哪一個地方？',
          choices: ['畫蛇添足', '畫龍點睛', '葉公好龍', '一鳴驚人'],
          answerIndex: 1,
          wrongFeedback: {
            畫蛇添足: '圖裡畫的不是蛇，畫家也沒有替牠加上腳喔！再看看毛筆點在哪裡。',
            葉公好龍: '圖裡沒有一位說自己很愛龍、看到真龍卻嚇跑的人喔！再看看畫家在做什麼。',
            一鳴驚人: '圖裡沒有一隻突然大叫的鳥喔！再看看畫家手上的毛筆。',
          },
          promptZh:
            '日系 Q 版卡通風格，色彩鮮明。古代中國寺廟的庭院，一道長長的米白色牆壁，上方有綠色瓦片屋簷。牆上畫著白色的中國龍：左邊兩條龍的眼睛是空白的；中間一位戴黑色帽子、穿青綠色長袍、留著小鬍子的畫家站在木梯上，右手拿著毛筆，正替一條龍點上眼睛，眼睛周圍閃閃發光。畫面右上方的牆壁破了一個大洞，一條已經點上眼睛的白龍駕著白雲衝出牆壁，飛向烏雲密布、打雷閃電的天空。左下角有一位綁髮髻的婦人和一位和尚，張大嘴巴、指著天空，非常驚訝。右下角，小宇、小晴和三花貓墨墨躲在石台後面偷看。視覺焦點：毛筆點在龍眼上的那一刻，以及破牆飛走的龍。畫面中不可出現任何文字或成語答案。',
          promptEn:
            'Japanese chibi cartoon illustration, bright colors. An ancient Chinese temple courtyard with a long cream-colored wall topped with green roof tiles. White Chinese dragons are painted on the wall: the two dragons on the left have blank, empty eyes; in the middle, a chibi painter with a black scholar cap, teal robe and small mustache stands on a wooden ladder, touching a dragon\'s eye with a calligraphy brush, the eye sparkling with light. At the upper right, the wall is broken open and a white dragon whose eyes are already painted bursts out riding a white cloud into a dark stormy sky with lightning. In the lower left, a woman with a hair bun and a monk point at the sky with wide-open mouths. In the lower right, a boy in a blue hoodie, a girl in a pink hoodie and a calico cat with a red headband peek from behind a stone ledge. Focus on the brush touching the dragon\'s eye and the dragon flying away. Absolutely no text or captions.',
        },
        story: {
          title: '畫龍點睛的故事',
          source: '唐．張彥遠《歷代名畫記．卷七》',
          sourcePlain: '唐．張彥遠《歷代名畫記．卷七》',
          text:
            '南北朝的時候，梁朝有一位很會畫畫的畫家，名叫張[僧|ㄙㄥ][繇|ㄧㄠˊ]。有一次，他在金[陵|ㄌㄧㄥˊ]安樂寺的牆上畫了四條白龍，每一條都畫得像真的一樣，可是都沒有畫上眼睛。有人問他為什麼，他說：「點上眼睛，龍就會飛走。」大家都覺得他在說大話，一直請他點上去。張僧繇只好拿起筆，替其中兩條龍點上眼睛。沒多久，天空打雷閃電，牆壁破開，那兩條龍駕著雲飛上天去了；沒有點上眼睛的兩條龍，還留在牆上。',
          original: '金陵安樂寺四白龍不點眼睛，每云：「點睛即飛去。」人以為妄誕，固請點之。須臾，雷電破壁，兩龍乘雲騰去上天，二龍未點眼者見在。',
          glossary: [
            ['金陵', '地名，就是現在的南京'],
            ['睛', '眼珠'],
            ['妄誕', '荒唐、不可相信'],
            ['固請', '一再請求'],
            ['須臾', '一會兒'],
            ['見在', '現在還在'],
          ],
        },
        literal: [
          ['畫', '畫好'],
          ['龍', '龍'],
          ['點', '點上'],
          ['睛', '眼珠'],
        ],
        literalSentence: '字面意思：畫好一條龍以後，替牠點上眼珠。',
        meaning: '比喻寫文章、說話或做事時，在最重要的地方加上關鍵的一筆，讓整體變得更生動、更精彩。',
        examples: [
          '小晴在作文最後加了一句「原來，最好的寶藏就是好朋友」，真是畫龍點睛，讓整篇文章更感人。',
          '媽媽在蛋糕上放了一顆紅通通的草莓，有畫龍點睛的效果，蛋糕看起來更可口了。',
        ],
        similar: [],
        opposite: ['畫蛇添足'],
        quiz: [
          {
            id: 'i2q1',
            kind: '故事理解',
            question: '故事裡，畫家張僧繇一開始為什麼不替龍畫上眼睛？',
            options: ['他忘了帶毛筆', '寺廟的人不准他畫', '他說點上眼睛，龍就會飛走', '他覺得龍沒有眼睛比較好看'],
            answer: 2,
            hint: '回到故事裡找一找，張僧繇自己是怎麼說的？',
            explain:
              '張僧繇說：「點睛即飛去。」意思是點上眼睛，龍就會飛走。大家不相信，一再請他點上，結果被點上眼睛的兩條龍，真的打破牆壁飛走了。',
          },
          {
            id: 'i2q2',
            kind: '成語用法',
            question: '下面哪一句的「畫龍點睛」用得最恰當？',
            options: [
              '弟弟在牆上亂畫了一條龍，真是畫龍點睛。',
              '作文結尾加上一句好句子，有畫龍點睛的效果，讓文章更精彩。',
              '他畫圖時加了很多不需要的東西，真是畫龍點睛。',
              '小明上課不專心，一直在課本上畫龍點睛。',
            ],
            answer: 1,
            hint: '「畫龍點睛」是比喻：在最重要的地方加上一筆，讓整體變得更好。',
            explain:
              '「畫龍點睛」比喻在最重要的地方加上關鍵的一筆，讓整體更出色，所以用來形容精彩的作文結尾最恰當，答案是 B。C 是多加了不需要的東西，應該用「畫蛇添足」；A 和 D 只是真的在畫龍，並不是比喻。',
          },
        ],
      },
    ],
  },

  references: [
    { name: '教育部 小學生字詞彙表（國語）', url: 'https://pedia.cloud.edu.tw/Bookmark/Textword?category=%E5%9C%8B%E8%AA%9E&year=115_1' },
    { name: '教育部 語文成果網（各類辭典入口）', url: 'https://language.moe.gov.tw/001/Upload/Files/site_content/M0001/respub/index.html' },
    { name: '教育部《國語小字典》', url: 'https://dict.mini.moe.edu.tw/' },
    { name: '教育部《成語典》', url: 'https://dict.idioms.moe.edu.tw/' },
    { name: '教育部《重編國語辭典修訂本》', url: 'https://dict.revised.moe.edu.tw/' },
  ],
};

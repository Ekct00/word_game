// ls | perl -pi -e 's/^(.*)\.jpg/"$1",/g'

words = [
];

function speak(str) {
    
    var msg = new SpeechSynthesisUtterance(str);
    
    // 设置语音参数
    msg.voice = speechSynthesis.getVoices().find(voice => voice.lang === 'en-US' && voice.name.includes('Samantha')); // 使用更自然的声音
    msg.rate = 0.7;  // 语速稍微放慢一点
    msg.pitch = 1.1; // 稍微提高音调
    msg.volume = 1.0; // 最大音量
    
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(msg);
}


// 将原来的 words 数组改为按单元组织的对象
const wordsByUnit = {
    unit1: ["cake",
"cane",
"lace",
"crane",
"plane",
"take",
"bake",
"game",
"Dave",
"make",
"Jake",
"date",
"lake",
"mate",
"cave",
"gave",
"skate",
"late",
"cat",
"hat",
"nap",
"dad",
"cab",
"ant",
"apple",
"bag",
"can",
],
    unit2: ["he",
"she",
"we",
"be",
"me",
"bed",
"red",
"ten",
"pen",
"net",
"pet",
"wet",
"legs",
"nest",
"desk",
"best",
"help",
"elephant",
"seven",],
    unit3: ["Jones",
"Coke",
"note",
"nose",
"phone",
"hole",
"hope",
"code",
"rope",
"home",
"bone",
"pome",
"rose",
"pole",
"pose",
"Rome",
"dose",
"hose",
"pig",
"pink",
"big",
"kid",
"fish",
"six",
"ink",
"swim",
"bit",],
    unit4: ["Jones",
"home",
"cone",
"hope",
"note",
"bone",
"code",
"nose",
"rose",
"tone",
"hole",
"pole",
"phone",
"smoke",
"box",
"dog",
"lost",
"frog",
"hot",
"mop",
"nod",
"top",],
    unit5: ["cute",
"lute",
"mute",
"mule",
"cube",
"tube",
"tune",
"pure",
"dune",
"fume",
"flute",
"perfume",
"confuse",
"fuse",
"volume",
"duck",
"truck",
"sun",
"under",
"umbrella",
"bus",
"mud",
"nut",
"cup",
],
    unit6: ["cat",
"face",
"girl",
"age",
"leg",
"cool",
"yes",
"my",
"long",
"orange",
"yellow",
"can",
"cab",
"cave",
"gave",
"lave",
"late",
"game",
"lace",
"cake",
"crayon",
"dog",
"bag",
"green",
"gift",
"beg",
"yo-yo",
]
};

let currentWords = []; // 当前单元的单词

function preloadUnitImages(unitNumber) {
    const words = wordsByUnit['unit' + unitNumber];
    words.forEach(word => {
        const img = new Image();
        img.src = `./img/unit_${unitNumber}/${word}.jpg`;
    });
}

function GameCntl($scope, $timeout) {
    $scope.clue = "_ar";
    $scope.word = "car";
    $scope.letter = "c";
    $scope.index = 0;
    $scope.right_indicator = false;
    $scope.wrong_indicator = false;
    $scope.number_right = 0;
    $scope.timeout = 0;
    $scope.mode = "any";
    $scope.currentUnit = null;
    
    // 添加单元选择函数
    $scope.selectUnit = function(unitNumber) {
        $scope.currentUnit = unitNumber;
        currentWords = wordsByUnit['unit' + unitNumber];
        preloadUnitImages(unitNumber); // 预加载该单元的所有图片
        $scope.next();
    }
    
    $scope.next = function() {
        if (!$scope.currentUnit) {
            return; // 如果未选择单元，不继续
        }
        
        $scope.timeout = 0;
        
        // 从当前单元的单词中随机选择
        $scope.word = currentWords[Math.floor(Math.random() * currentWords.length)];
        
        // Select a letter
        if($scope.mode == "any") {
            $scope.index = Math.floor(Math.random()*$scope.word.length);
        } else {
            $scope.index = 0;
        }
        
        $scope.letter = $scope.word[$scope.index];
        
        $scope.resetclue();
    };
    $scope.setmode = function(m) {
        $scope.mode = m;
        if ($scope.currentUnit) {  // 只有在已选择单元的情况下才重新开始
            $scope.next();
        }
    }
    $scope.resetclue = function() {
        $scope.timeout = 0;
        $scope.right_indicator = false;
        $scope.wrong_indicator = false;
        
        $scope.clue = $scope.word.substr(0, $scope.index) + '_'
        + $scope.word.substr($scope.index + 1);
        
        speak($scope.word);
    };
    
    $scope.keyup = function(e) {
        // If they already got it right, ignore input
        if($scope.right_indicator) {
            return;
        }
        
        c = String.fromCharCode(e.keyCode);
        
        // Ignore key presses outside of A-Z
        if(c < 'A' || c > 'Z') {
            return;
        }
        
        if(c == $scope.letter.toUpperCase()) {
            $scope.correct();
        } else if(c == ' ') {
            $scope.next();
        } else {
            $scope.incorrect(c);
        }
    };
    
    $scope.streak = 0; // 连续答对次数
    
    $scope.correct = function() {
        $scope.streak += 1;
        $scope.number_right += 1;
        
        // 显示鼓励文字
        if ($scope.streak >= 3) {
            showEncouragement();
        }
        
        $scope.right_indicator = true;
        $scope.wrong_indicator = false;
        
        $scope.clue = $scope.word.substr(0, $scope.index) + $scope.letter
        + $scope.word.substr($scope.index + 1);
        
        if($scope.timeout != 0) {
            $timeout.cancel($scope.timeout);
        }
        $scope.timeout = $timeout($scope.next, 2000);
        
        $('#jpId').jPlayer("play");
    };
    
    $scope.incorrect = function(c) {
        $scope.streak = 0; // 重置连续答对次数
        $scope.right_indicator = false;
        $scope.wrong_indicator = true;
        
        $scope.clue = $scope.word.substr(0, $scope.index) + c.toLowerCase()
        + $scope.word.substr($scope.index + 1);
        
        if($scope.timeout != 0) {
            $timeout.cancel($scope.timeout);
        }
        $scope.timeout = $timeout($scope.resetclue, 2000);
        
        speak($scope.clue + "?");
    };
    
    $scope.focusInput = function() {
        document.querySelector('.mobile-input').focus();
    };
    
    $scope.mobileKeyup = function(e) {
        $scope.keyup(e);
        $scope.mobileInput = ''; // 清空输入，为下一次输入做准备
    };
    
    $scope.next();
}

function showEncouragement() {
    const messages = [
        "太棒了！👏",
        "继续加油！💪",
        "你真厉害！⭐",
        "完美！🌟"
    ];
    const msg = messages[Math.floor(Math.random() * messages.length)];
    
    const div = document.createElement('div');
    div.className = 'encouragement';
    div.textContent = msg;
    document.body.appendChild(div);
    
    setTimeout(() => div.classList.add('show'), 100);
    setTimeout(() => {
        div.classList.remove('show');
        setTimeout(() => div.remove(), 300);
    }, 1500);
}
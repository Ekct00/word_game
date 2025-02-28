// ls | perl -pi -e 's/^(.*)\.jpg/"$1",/g'

words = [
         "acorn",
         "apple",
         "backpack",
         "ball",
         "barn",
         "basket",
         "basketball",
         "bear",
         "bed",
         "bee",
         "black",
         "blue",
         "boat",
         "book",
         "brown",
         "bus",
         "cake",
         "california",
         "camera",
         "candy",
         "car",
         "cat",
         "chair",
         "cloud",
         "cow",
         "dog",
         "doll",
         "donkey",
         "duck",
         "elephant",
         "extinguisher",
         "fire",
         "firefighter",
         "fish",
         "four",
         "fox",
         "giraffe",
         "globe",
         "goat",
         "green",
         "hat",
         "horse",
         "hose",
         "house",
         "hydrant",
         "ladder",
         "leaf",
         "leaves",
         "markers",
         "monkey",
         "moose",
         "one",
         "orange",
         "orchard",
         "oregon",
         "panda",
         "people",
         "pie",
         "pig",
         "pink",
         "plane",
         "pumpkin",
         "purple",
         "rain",
         "rake",
         "red",
         "road",
         "rollercoaster",
         "room",
         "ruler",
         "saw",
         "scarecrow",
         "school",
         "seed",
         "shell",
         "snow",
         "soccerball",
         "stars",
         "sun",
         "taxi",
         "teacher",
         "three",
         "train",
         "tree",
         "truck",
         "two",
         "white",
         "yellow"
];

function speak(str) {
    
    var msg = new SpeechSynthesisUtterance(str);
    
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
    unit2: ["basketball", "bear", "bed", "bee", "black", "blue"],
    unit3: ["boat", "book", "brown", "bus", "cake", "california"],
    unit4: ["camera", "candy", "car", "cat", "chair", "cloud"],
    unit5: ["cow", "dog", "doll", "donkey", "duck", "elephant"],
    unit6: ["extinguisher", "fire", "firefighter", "fish", "fox", "giraffe"]
};

let currentWords = []; // 当前单元的单词

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
    
    $scope.correct = function() {
        
        $scope.number_right += 1;
        
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
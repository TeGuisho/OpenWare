const buttons = document.querySelectorAll('.btn');
const textarea = document.querySelector('textarea');
const delete_btn = document.querySelector('.delete');
const shift_btn = document.querySelector('.shift');
const space_btn = document.querySelector('.space');
const bomb = document.querySelector('#bomb');
var button = document.querySelector("button");
button.addEventListener("click", changePosition);

function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

function changePosition() {
    var x = Math.floor(Math.random() * window.innerWidth) - button.clientWidth;
    var y = Math.floor(Math.random() * window.innerHeight) - button.clientHeight;
    buttons.forEach(btn => {
        btn.style.position = 'absolute';
        btn.style.left = `${x}px`;
        btn.style.top = `${y}px`;
    });
}

let chars = [];

buttons.forEach(btn => {
    btn.addEventListener('click', () => {
        if (!(btn.classList.contains('space') || btn.classList.contains('delete') || btn.classList.contains('shift'))) {
            textarea.value += btn.innerText;
            chars = textarea.value.split('');
        }
        randomizeButtonPositions();
    });
});

delete_btn.addEventListener('click', () => {
    chars.pop();
    textarea.value = chars.join('');
});

space_btn.addEventListener('click', () => {
    chars.push(' ');
    textarea.value = chars.join('');
});

shift_btn.addEventListener('click', () => {
    buttons.forEach(btn => {
        btn.classList.toggle('upper');
    });
});

window.addEventListener("load", function randomize() {
    randomizeButtonPositions();
});

function randomizeButtonPositions() {
    var list = document.getElementsByClassName("btn");
    for (let i = 0; i < list.length; i++) {
        list[i].style.position = "absolute";
        var r = Math.floor(Math.random() * document.documentElement.scrollWidth);
        list[i].style.top = `${r}px`;
        var t = Math.floor(Math.random() * document.documentElement.scrollHeight);
        list[i].style.left = `${t}px`;

        list[i].style.color = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;
        list[i].style.transform = `rotate(${Math.random() * 360}deg)`;

        var width = Math.floor(Math.random() * 50) + 30;
        var height = Math.floor(Math.random() * 50) + 30;
        list[i].style.width = `${width}px`;
        list[i].style.height = `${height}px`;
        list[i].style.fontSize = `${width / 2}px`;
    }
}

bomb.addEventListener('click', () => {
    textarea.value = "";
    alert("RATTTEEEEEEEEEEE")
})

function bombPop() {
    bomb.style.backgroundColor = getRandomHexColor();
    bomb.style.zIndex = 99999;
    bomb.style.position = "fixed";

    const min = 1;
    const max = 3;

    setTimeout(() => {
        bomb.style.backgroundColor = "white"
        bomb.style.zIndex = -1;
    }, Math.floor(Math.random() * (max - min + 1) + min) * 1000);
}

function randomIntervalTask() {
    const min = 5;
    const max = 10;
    const delay = Math.floor(Math.random() * (max - min + 1) + min) * 1000;

    setTimeout(randomIntervalTask, delay);
    setTimeout(bombPop, delay)
}

function getRandomHexColor() {
    return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
}
randomIntervalTask()

function validateForm() {
    var x = document.forms["myForm"]["pseudo"].value;

    if (x === "") {
        alert("REMPLIE UN PSEUDO GROS FLEMMARD \n alleeez recommence tout");
        randomizeButtonPositions()
        return false;
    }
}

function validateFormWinKey() {
    var x = document.forms["myForm"]["pseudo"].value;
    if (x === "") {alert("REMPLIE UNE CLE  GROS FLEMMARD");
        randomizeButtonPositions()
        return false;
    }else if(x.length < 29&& verifyFormat(x)){
        alert("REMPLIE UNE VRAI CLE WINDOWS \n alleeez recommence tout");
        return false;
    }
}

function verifyFormat(text){
    return !(text[6] !== '-' && text[12] !== '-' && text[18] !== '-' && text[24] !== '-');

}

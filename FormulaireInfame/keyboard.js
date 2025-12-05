
const buttons = document.querySelectorAll('.btn')
const textarea = document.querySelector('textarea')

const delete_btn = document.querySelector('.delete')
const shift_btn = document.querySelector('.shift')
const space_btn = document.querySelector('.space')


var button = document.querySelector("button");
button.addEventListener("click",changePosition);


function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}
function changePosition(){
    var x = Math.floor(Math.random() * window.innerWidth) - button.clientWidth;
    var y = Math.floor(Math.random() * window.innerHeight) - button.clientHeight;

    buttons.style.left = x + "px";
    buttons.style.top = y + "px";
}

let chars = []

buttons.forEach(btn => {
    btn.addEventListener('click', () => {
        textarea.value += btn.innerText
        chars = textarea.value.split('')
        var r;
        var list = document.getElementsByClassName("btn")
        var row = document.getElementsByClassName('row')
        shuffleArray(row)
        console.log(row)
        for(var i=0;i<5;i++){
            r = Math.floor(Math.random()*200);
            row[i].style.marginTop = "500px";
            row[i].style.marginLeft = r + "px";
        }

        shuffleArray(list)
        for(var i=0;i<36;i++){
            r = Math.floor(Math.random()*200);
            list[i].style.marginTop = r + "px";
            list[i].style.marginLeft = r + "px";
        }
    })
})

delete_btn.addEventListener('click', () => {
    chars.pop()
    textarea.value = chars.join('')
})

space_btn.addEventListener('click', () => {
    chars.push(' ')
    textarea.value = chars.join('')
})

shift_btn.addEventListener('click', () => {
    buttons.forEach(btn => {
        btn.classList.toggle('upper')
    })
})

window.addEventListener("load", function randomize(){
    var r;
    var list = document.getElementsByClassName("btn")
    for(var i=0;i<36;i++){
        r = Math.floor(Math.random()*200);
        list[i].style.marginTop = r + "px";
        list[i].style.marginLeft = r + "px";    }
});

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
// Generate a random index between 0 and i
        let j = Math.floor(Math.random() * (i + 1));

// Swap elements at indices i and j
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}



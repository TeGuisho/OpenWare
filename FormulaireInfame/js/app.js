const b = document.querySelector('button.button--yes')
const maxChangeButtonLocation = 10
let nbChangesButtonLocation = 0
b.addEventListener("mouseover", () =>{
    if (nbChangesButtonLocation < maxChangeButtonLocation) {
        let i = Math.floor(Math.random()*500)+1;
        let j = Math.floor(Math.random()*500)+1;
        if(nbChangesButtonLocation===2){
            alert("essaie encore un peu")
        }

        b.style.left = `${i}px`;
        b.style.top = `${j}px`;
        nbChangesButtonLocation += 1;
    }
})


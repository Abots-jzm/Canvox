// TODO
const toggleButton = document.querySelector(".theme-toggle");
const transcriptButton = document.querySelector(".transcript");
const hotkeyButton = document.querySelector(".hotkeys");

function themetoggle(){
    document.body.classList.toggle("light-mode");
    toggleButton.classList.toggle("button-light-mode");
    transcriptButton.classList.toggle("button-light-mode");
    hotkeyButton.classList.toggle("button-light-mode");

    if (document.body.classList.contains("light-mode")){
        localStorage.setItem("theme", "light");
    }
    else{
        localStorage.setItem("theme", "dark");
    }

}

toggleButton.addEventListener("click", themetoggle);


if(localStorage.getItem("theme")==="light"){
    document.body.classList.add("light-mode");
    toggleButton.classList.add("button-light-mode");
    transcriptButton.classList.add('button-light-mode');
    hotkeyButton.classList.add("button-light-mode");
}

// TODO
const toggleButton = document.querySelector(".theme-toggle");

function themetoggle(){
    document.body.classList.toggle("light-mode");
    toggleButton.classList.toggle("button-light-mode");

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
    toggleButton.classList.add("button-light-mode")
}


// function myFunction() {
//     var element = document.body;
//     element.classList.toggle("light-mode");
//  }

//  const toggleButton = document.querySelector(".theme-toggle");

//  toggleButton.addEventListener("click", myFunction);
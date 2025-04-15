function copy(id){
    const element = document.getElementById(id);
    if(element)
        navigator.clipboard.writeText(element.value);
}
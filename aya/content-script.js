function getDataset() {
    url = "https://datasets-server.huggingface.co/rows?dataset=HeshamHaroon%2FQA_Arabic&config=HeshamHaroon--QA_Arabic&split=train&offset=0&limit=100"
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", url, false);
    xmlHttp.send(null);
    return JSON.parse(xmlHttp.responseText);
}
window.onload = function () {
    var dataset = getDataset()["rows"];

    function checkEelementIsLoaded() {
        var textAreaList = document.getElementsByTagName('textarea');
        console.log(textAreaList);
        if (textAreaList[0] != null && textAreaList[1] != null) {
            var promptTextArea = textAreaList[0];
            var completionTextArea = textAreaList[1];
            var elementDict = dataset[Math.floor(Math.random() * dataset.length)].row;
            console.log(elementDict);
            promptTextArea.value = elementDict['question'];
            completionTextArea.value = elementDict['answer'];
            clearInterval(myInterval)
        }
    }

    var myInterval = setInterval(checkEelementIsLoaded, 1000);
}


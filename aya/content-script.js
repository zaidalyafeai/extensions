function getDataset(dataset_name, config_name = null) {
    const data_name = dataset_name.replace("/", "%2F")
    if (config_name == null)
        config_name = dataset_name.replace("/", "--")

    url = `https://datasets-server.huggingface.co/rows?dataset=${data_name}&config=${config_name}&split=train&offset=0&limit=100`
    console.log(url)
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", url, false);
    xmlHttp.send(null);
    return JSON.parse(xmlHttp.responseText);
}
var elementDict;
var input_key;
var target_key;
var dataset;
var reload_dataset = true;

window.onload = function () {
    function applyTemplate(template, value) {
        if (template == "")
            return value
        return template.replace("###", value)
    }
    function getNext() {
        const dataset_name = document.getElementById("dataset_name").value
        if (reload_dataset) {
            dataset = getDataset(dataset_name)["rows"];
            console.log(dataset)
            if (dataset == null) {
                dataset = getDataset(dataset_name, config_name = "default")["rows"];
            }
            reload_dataset = false;
        }
        const input_name = document.getElementById("input_column_name").value.trim();
        const target_name = document.getElementById("target_column_name").value.trim();

        elementDict = dataset[Math.floor(Math.random() * dataset.length)].row;

        var textAreaList = document.getElementsByTagName('textarea');
        const input_template = document.getElementById('prompt_input_template').value.trim()
        const target_template = document.getElementById('prompt_target_template').value.trim()

        promptTextArea = textAreaList[2];
        completionTextArea = textAreaList[3];
        promptTextArea.value = applyTemplate(input_template, elementDict[input_name]);
        var event = new Event('input', { bubbles: true });
        promptTextArea.dispatchEvent(event);
        completionTextArea.value = applyTemplate(target_template, elementDict[target_name]);
        var event = new Event('input', { bubbles: true });
        completionTextArea.dispatchEvent(event);
    }
    function createTextAreaField(mainDiv, label = "", value = "") {
        mainDiv.insertAdjacentHTML('afterbegin', `<textarea id=${label.toLowerCase().replaceAll(" ", "_")} dir = "rtl" >${value}</textarea> <br><br>`);
        mainDiv.insertAdjacentHTML('afterbegin', `<label><b>${label}:</b> </label>`);
    }

    function createInputField(mainDiv, label = "", value = "", br = "") {
        mainDiv.insertAdjacentHTML('afterbegin', `<input id=${label.toLowerCase().replaceAll(" ", "_")} value = ${value} /> ${br}`);
        mainDiv.insertAdjacentHTML('afterbegin', `<label><b>${label}:</b> </label>`);
    }
    function checkEelementIsLoaded() {
        var divs = document.getElementsByClassName("base:mx-auto mt-2 md:ml-auto css-1n2mv2k");
        if (divs[0] != null) {
            divs[0].insertAdjacentHTML('afterbegin', '<button type="button" id = "next" class="chakra-button css-ku7ac0" style = "background-color:green;">New Prompt</button>');
            var btn = document.getElementById("next");
            btn.addEventListener("click", getNext);

            var mainDiv = document.getElementsByClassName('css-7sd70x')[0]

            createTextAreaField(mainDiv, label = "Prompt Target Template", value = 'الإجابة الصحيحة هي "###"')
            createInputField(mainDiv, label = "Target Column Name", value = "answer")

            createTextAreaField(mainDiv, label = "Prompt Input Template", value = 'أجب على السؤال التالي "###"')
            createInputField(mainDiv, label = "Input Column Name", value = "question")

            createInputField(mainDiv, label = "Dataset Name", value = "HeshamHaroon/QA_Arabic", br = "<br>")

            $('input').on('input', function (e) {
                reload_dataset = true;
            });

            clearInterval(myInterval)
        }

    }


    var myInterval = setInterval(checkEelementIsLoaded, 1000);
}


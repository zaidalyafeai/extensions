function getDataset(dataset_name, config_name = null) {
    const data_name = dataset_name.replace("/", "%2F")
    if (config_name == null)
        config_name = dataset_name.replace("/", "--")

    url = `https://datasets-server.huggingface.co/rows?dataset=${data_name}&config=${config_name}&split=train&offset=0&limit=5000`
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
var counter = 0;

window.onload = function () {
    console.log(prompts)
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

        var input = elementDict[input_name]
        var target = elementDict[target_name]

        var regex = document.getElementById('replace_regex').value.trim()

        if (regex != "") {
            input = input.replace(new RegExp(regex, "g"), "")
            target = target.replace(new RegExp(regex, "g"), "")

            input = input.trim()
            target = target.trim()
        }

        promptTextArea = textAreaList[2];
        completionTextArea = textAreaList[3];
        promptTextArea.value = applyTemplate(input_template, input);
        var event = new Event('input', { bubbles: true });
        promptTextArea.dispatchEvent(event);
        completionTextArea.value = applyTemplate(target_template, target);
        var event = new Event('input', { bubbles: true });
        completionTextArea.dispatchEvent(event);
    }
    function createMenuField(mainDiv, tasks) {

        $('.css-7sd70x').prepend(
            $(document.createElement('select')).prop({
                id: 'tasks',
                name: 'tasks'
            })
        )

        $('#tasks').append($(document.createElement('option')).prop({
            value: "",
            text: "Select Element"
        }))

        for (const val of tasks) {
            $('#tasks').append($(document.createElement('option')).prop({
                id: val.toLowerCase().replaceAll(" ", "_"),
                value: val,
                text: val.charAt(0).toUpperCase() + val.slice(1)
            }))
        }

        $('select').on('change', function () {
            if (tasks.includes(this.value)) {
                document.getElementById('prompt_input_template').value = prompts[this.value][0]['inputs'];
                document.getElementById('prompt_target_template').value = prompts[this.value][0]['targets'];
            }
        });
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
            createMenuField(mainDiv, Object.keys(prompts))
            createInputField(mainDiv, label = "Replace Regex", value = "[س|ج]" + "[0-9]* - - ")

            createTextAreaField(mainDiv, label = "Prompt Target Template", value = 'الإجابة الصحيحة هي "###"')
            createInputField(mainDiv, label = "Target Column Name", value = "answer")

            createTextAreaField(mainDiv, label = "Prompt Input Template", value = 'أجب على السؤال التالي "###"')
            createInputField(mainDiv, label = "Input Column Name", value = "question")
            createInputField(mainDiv, label = "Submissions", value = "0", br = "<br>")

            createInputField(mainDiv, label = "Dataset Name", value = "HeshamHaroon/QA_Arabic")
            $('input').on('input', function (e) {
                reload_dataset = true;
            });

            $('#submitButton').on('click', function (e) {
                console.log('submitted!');
                document.getElementById("submissions").value = parseInt(document.getElementById("submissions").value) + 1

            });

            clearInterval(myInterval)
        }

    }


    var myInterval = setInterval(checkEelementIsLoaded, 1000);
}


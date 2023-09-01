function getDataset(dataset_name, config_name = null, idx = 0) {
    dataset_name = dataset_name.replace("/", "%2F")
    config_name = config_name.replace("/", "--")
    url = `https://datasets-server.huggingface.co/rows?dataset=${dataset_name}&config=${config_name}&split=train&offset=${idx * 100}&limit=${(idx + 1) * 100}`
    console.log(url)
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", url, false);
    xmlHttp.setRequestHeader("Authorization", "Bearer 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");
    xmlHttp.send(null);
    return JSON.parse(xmlHttp.responseText);
}
var elementDict;
var input_key;
var target_key;
var dataset;
var reload_dataset = true;
var counter = 0;
var currTask = "Select Element";
var labels = []
var full_data;
var labels_ar;
var idx = 0;
var next_100 = 6;

window.onload = function () {
    function applyTemplate(template, first_input, second_input) {
        if (template == "")
            return first_input + second_input

        const matches = template.split("###");
        console.log(matches)
        if (matches.length == 2) {
            return template.replace("###", first_input);
        } else if (matches.length == 3) {
            return matches[0] + first_input + matches[1] + second_input + matches[2]
        }
    }
    function getRandomIndex(length) {
        return Math.floor(Math.random() * length)
    }

    function processTarget(target) {
        if (labels.length > 0) {
            return labels_ar[target]
        }
        else {
            return target.join("\n")
        }
    }
    function getNext() {
        const dataset_name = document.getElementById("dataset_name").value
        labels_ar = document.getElementById("labels").value.split(",")
        console.log(idx)
        if (idx == 100) {
            next_100 += 1;
            idx = 0;
            reload_dataset = true;
        }
        if (reload_dataset) {
            config = document.getElementById("config").value
            full_data = getDataset(dataset_name, config = config, idx = next_100);
            dataset = full_data['rows']
            labels = []
            for (const feature of full_data['features']) {
                if (feature['name'] == "label") {
                    for (const label in feature['type']['names']) {
                        labels.push(label)
                    }
                    break
                }
            }
            reload_dataset = false;
        }
        const input_name_1 = document.getElementById("input_column_name_1").value.trim();
        const input_name_2 = document.getElementById("input_column_name_2").value.trim();
        const target_name = document.getElementById("target_column_name").value.trim();

        elementDict = dataset[idx].row;

        var textAreaList = document.getElementsByTagName('textarea');

        if (currTask != "Select Element") {
            console.log(currTask);
            const idx = getRandomIndex(prompts[currTask].length);
            document.getElementById('prompt_input_template').value = prompts[currTask][idx]['inputs'];
            document.getElementById('prompt_target_template').value = prompts[currTask][idx]['targets'];
        }
        const input_template = document.getElementById('prompt_input_template').value.trim()
        const target_template = document.getElementById('prompt_target_template').value.trim()

        var first_input = "";
        if (input_name_1 != "") {
            first_input = elementDict[input_name_1]
        }
        var second_input = "";
        if (input_name_2 != "") {
            second_input = elementDict[input_name_2];
        }
        var target = processTarget(elementDict[target_name])

        var regex = document.getElementById('replace_regex').value.trim()

        if (regex != "/") {
            first_input = first_input.replace(new RegExp(regex, "g"), "")
            target = target.replace(new RegExp(regex, "g"), "")

            first_input = first_input.trim()
            target = target.trim()
        }

        promptTextArea = textAreaList[2];
        completionTextArea = textAreaList[3];
        console.log(first_input);
        console.log(second_input);
        console.log(elementDict[target_name])
        console.log(input_template)
        console.log(target_template)
        promptTextArea.value = applyTemplate(input_template, first_input, second_input);
        var event = new Event('input', { bubbles: true });
        promptTextArea.dispatchEvent(event);
        completionTextArea.value = applyTemplate(target_template, target, "");
        var event = new Event('input', { bubbles: true });
        completionTextArea.dispatchEvent(event);
        idx += 1;
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
            currTask = this.value;
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
            createInputField(mainDiv, label = "Labels", value = "")
            createInputField(mainDiv, label = "Replace Regex", value = "")

            createTextAreaField(mainDiv, label = "Prompt Target Template", value = '')
            createInputField(mainDiv, label = "Target Column Name", value = "poem verses")

            createTextAreaField(mainDiv, label = "Prompt Input Template", value = '')
            createInputField(mainDiv, label = "Input Column Name 2", value = "poem theme")
            createInputField(mainDiv, label = "Input Column Name 1", value = "poem meter")
            createInputField(mainDiv, label = "Submissions", value = "0", br = "<br>")

            createInputField(mainDiv, label = "config", value = "default")
            createInputField(mainDiv, label = "Dataset Name", value = "arbml/ashaar")
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


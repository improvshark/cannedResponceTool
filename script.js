function show(obj) {
    if (obj.not)
        obj.output.hide();
    else
        obj.output.show();
}

function hide(obj) {
    if (obj.not)
        obj.output.show();
    else
        obj.output.hide();
}

function addReplace(obj, form) {
    obj.output = $('<span style="font-weight: bold;"></span>');
    var name = obj.open.name;
    if (form.replace && form.replace[name]) { // if a replace already exists bind its form.
        form.replace[name].field.children('[name="' + name + '"]').keyup(function() {
            obj.output.text($(this).val());
        });
    } else { // make the input for the replace.
        var input = '<input type="text" name="' + name + '" >';
        if (obj.open.long)
            input = '<textarea rows="4" name="' + name + '"></textarea>';

        obj.field = $(
            '<div class="field">' +
            '<label>' + name + '</label>' + input + '</div>'
        );
        obj.field.children('[name="' + name + '"]').keyup(function() {
            obj.output.text($(this).val());
        });
        form.append(obj.field);
        form.replace[name] = obj;
    }
    return obj.output;
}

function addToggle(obj, form) {
    var name = obj.open.name;
    obj.not = obj.open.name.charAt(0) == '!';

    if (obj.not) {
        name = name.slice(1);
    }

    obj.output = $('<span class="' + name + '" style="font-weight: bold;"></span>');


    if (form.toggle[name] && name != 'notes') { // if a togle already exists bind to it.
        form.toggle[name].push(obj);
        hide(obj);
    } else if (name != 'notes') { // make the radio for the radio group.
        obj.field = $(
            '<div class="inline field">' +
            '<div class="ui toggle checkbox">' +
            '<input type="checkbox" tabindex="0" class="hidden">' +
            '<label>' + name + '</label>' +
            '</div>' +
            '</div>'
        );
        form.toggle[name] = [];
        form.toggle[name].push(obj);
        hide(obj);
        form.append(obj.field);
        obj.field.find('.checkbox').checkbox({
            onChecked: function() {
                form.toggle[name].forEach(function(elm) {
                    show(elm);
                });
            },
            onUnchecked: function() {
                form.toggle[name].forEach(function(elm) {
                    hide(elm);
                });
            }
        });

    }

    if (name != "notes") { // turn off toggle if its for a note

    }

    if (typeof obj.string[0] == "string" && obj.string.length == 1) {
        obj.output.text(obj.string[0]);
    } else {
        obj.output.append(evaluate(obj.string, form, obj.output)); // yeah recursion
    }

    return obj.output;
}

function toggleRadio(checked, radios) {

    for (var key in radios) {
        if (!radios.hasOwnProperty(key)) continue; // skip loop if the property is from prototype
        radios[key].forEach(function(radioObj, index) {
            hide(radioObj);
        });
    }

    checked.forEach(function(radioObj, index) {
        show(radioObj)
    });
}

function addRadio(obj, form) {
    var name = obj.open.name;
    var group = obj.open.group;
    obj.output = $('<span style="font-weight: bold;" ></span>');

    obj.not = obj.open.name.charAt(0) == '!';

    if (obj.not) {
        name = name.slice(1);
    }

    if (!form.group[group]) { // create the group of radios if it doesnt exist.
        form.group[group] = $(
            '<div class="inline fields">' +
            '<label for="' + group + '">' + group + ':</label>' +
            '</div>'
        );
        form.group[group].radio = {};
        form.append(form.group[group]);
    }

    if (form.group[group].radio[name]) { // if a radio already exists bind to it.
        form.group[group].radio[name].push(obj);
        hide(obj);
    } else { // make the radio for the radio group.
        obj.field = $(
            '<div class="field">' +
            '<div class="ui radio checkbox">' +
            '<input type="radio" name="' + group + '" tabindex="0" class="hidden">' +
            '<label>' + name + '</label>' +
            '</div>' +
            '</div>'
        );
        form.group[group].append(obj.field);
        form.group[group].radio[name] = [];
        form.group[group].radio[name].push(obj);


        hide(obj);
        obj.field.find('.checkbox').checkbox({
            onChange: function(one, two, three, four) {
                toggleRadio(form.group[group].radio[name], form.group[group].radio);
            }
        });


    }
    // if its a string add to output  if not recursion.
    if (typeof obj.string[0] == "string" && obj.string.length == 1) {
        obj.output.text(obj.string[0]);
    } else {
        obj.output.append(evaluate(obj.string, form, obj.output));
    }

    return obj.output;
}

function evaluate(results, form, output) {
    output.text("");
    results.forEach(function(obj) {
        if (obj !== null && typeof obj === 'object') {

            if (obj.type == "replace") {
                output.append(addReplace(obj, form));
            } else if (obj.type == "option" && obj.open.group && obj.open.group == obj.close.group) {
                output.append(addRadio(obj, form));
            } else if (obj.type == "option") {
                output.append(addToggle(obj, form));
            }

        } else {
            output.append($('<span>' + obj + '</span>'));
        }
    });
}

function clipBoard(str) {
    var temp = $('<textarea></textarea>');
    temp.text(str);
    $('body').append(temp);
    temp.select();
    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Copying text command was ' + msg);
    } catch (err) {
        console.log('Oops, unable to copy');
    }
    temp.remove();
}

function createCopyButton(responce, color, text) {
    copyBtn = $(
        '<div class="field">' +
        '<div id="copyToClipBoard"class="ui ' + color + ' button">' + text + '</div>' +
        '</div>'
    );
    copyBtn.click(function(){
        var clone = responce.clone();
        clone.appendTo('body').find(':hidden').remove();
        var text = clone.text();
        clone.remove();
        clipBoard(text);
    });
    return copyBtn;
}

$(document).ready(function() {
    var canned = $("canned");
    try {
        canned.each(function(elm) {
            var can = $(this);
            var text = can.text();
            can.text("");

            // TODO parse defaults from toParse attributes
            var content = $(
                '<div class="ui segment">' +
                '<form id="myform" class="ui tiny form"></form>' +
                '</div>' +
                '<div class="ui segment">' +
                '<div id="responce" style="white-space: pre-wrap;"></div>' +
                '</div>'
            );
            var buttons = $('<div class="fields"></div>');
            var responce = content.find('#responce');
            var form = content.find("#myform");
            form.replace = {};
            form.toggle = {};
            form.group = {};

            console.log(parser.parse(text));
            evaluate(parser.parse(text), form, responce);

            buttons.append(createCopyButton(responce, "green", "Copy"));

            // exlude notes tag from canned.
            var notes = content.find('.notes');
            if (notes.length > 0) {
                var note = $('<div class="ui stacked red segment" style="white-space: pre-wrap;"></div>');
                notes.appendTo(note);
                note.appendTo(content[1]);
                buttons.append(createCopyButton(notes, "red", " Notes"));
            }

            // append copy buttons

            // append finished canned
            form.append(buttons);
            can.append(content);
        });

    } catch (error) {
        console.log(error);
        if (error.stack)
            console.log(error.stack);

        errorOutput = $(
            '<div class="ui negative message">' +
            '<div class="header">' +
            'There was an error generating the canned message form' +
            '</div>' +
            '<p>' + error.message + '</p>' +
            '<p>Error was found at location:  ' + JSON.stringify(error.location) + '</p>' +

            '</div>'
        );


        canned.append(errorOutput);

    }
});

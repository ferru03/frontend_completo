$(window).on("load", function () {
    loadFirstPage();
  });
  
  var firstPage = "http://localhost:8080/employees";
  var pageData;
  var data;
  var totPages;
  
  function defaultInstructions(values) {
    data = values._embedded.employees;
    pageData = values;
    totPages = values.page.totalPages;
    updatePageNumber(values.page.number + 1);
    displayEmployees();
    checkPageButtons(values.page.number);
  }
  
  function loadFirstPage() {
    $.get(firstPage, function (values, status) {
        defaultInstructions(values);
    });
  }
  function loadPreviousPage() {
    $.get(pageData._links.prev.href, function (values, status) {
        defaultInstructions(values);
    });
  }
  function loadNextPage() {
    $.get(pageData._links.next.href, function (values, status) {
        defaultInstructions(values);
    });
  }
  function loadLastPage() {
    $.get(pageData._links.last.href, function (values, status) {
        defaultInstructions(values);
    });
  }
  
  var attributes = ["id",
    "firstName",
    "lastName",
    "birthDate",
    "hireDate",
    "gender"];
  function displayEmployees() {
    var rows = "";
    showLess();
  
    $.each(data, function (key, value) {
        rows += "<tr>";
        let extraClass = "d-none extra-info";
        let cls = "";
  
        for (let i = 0; i < attributes.length; i++) {
            if (i > 2) cls = extraClass;
            rows += "<td class='" + cls + "' id='" + attributes[i] + "-" + value.id + "'>";
            rows += "<span id='text-" + attributes[i] + "-" + value.id + "' class=''>" + value[attributes[i]] + "</span>";
  
            switch (i) {
                case 1: case 2: case 5:
                    rows += "<input type='text' id='input-" + attributes[i] + "-" + value.id + "' placeholder='" + value[attributes[i]] + "' class='d-none'>";
                    break;
                case 3: case 4:
                    rows += "<input type='date' id='input-" + attributes[i] + "-" + value.id + "' value='" + value[attributes[i]] + "' class='d-none'>";
                    break;
                default:
                    break;
            }
  
            rows += "</td>";
        }
        rows += "<td>";
        rows += "<button class='m-1 btn btn-primary' onclick='modifyEmployee(" + value.id + ")' id='change-" + value.id + "'>Modifica</button>";
        rows += "<button class='m-1 btn btn-danger btn-delete' onclick='deleteEmployee(" + value.id + ")'>Elimina</button>";
        rows += "</td>";
        rows += "</tr>";
    });
  
    $("#to-fill").html(rows);
  }
  
  
  var open = 0;
  function modifyEmployee(id) {
    showMore();
    open++;

    $("#change-" + id).removeClass("btn-primary");
    $("#change-" + id).addClass("btn-success");
    $("#change-" + id).text("Salva");
    $("#change-" + id).attr("onclick", "saveChanges(" + id + ")");

    for (let i = 1; i < attributes.length; i++) {
        $("#input-" + attributes[i] + "-" + id).removeClass("d-none");
        $("#text-" + attributes[i] + "-" + id).addClass("d-none");
    }
  
  }
  
  function saveChanges(id) {
    open--;
    if (open === 0) showLess();

    $("#change-" + id).removeClass("btn-success");
    $("#change-" + id).addClass("btn-primary");
    $("#change-" + id).text("Modifica");
    $("#change-" + id).attr("onclick", "modifyEmployee(" + id + ")");
  
    let newAttributes = [];
  
    for (let i = 1; i < attributes.length; i++) {
        $("#input-" + attributes[i] + "-" + id).addClass("d-none");
        $("#text-" + attributes[i] + "-" + id).removeClass("d-none");
  
        switch (i) {
            case 1: case 2: case 5:
                if ($("#input-" + attributes[i] + "-" + id).val().trim() == "") {
                    newAttributes.push($("#text-" + attributes[i] + "-" + id).text());
                }
                else {
                    newAttributes.push($("#input-" + attributes[i] + "-" + id).val());
                }
                break;
            case 3: case 4:
                newAttributes.push($("#input-" + attributes[i] + "-" + id).val());
                break;
        }
    }
    let payload = {
        "firstName": newAttributes[0],
        "lastName": newAttributes[1],
        "birthDate": newAttributes[2],
        "hireDate": newAttributes[3],
        "gender": newAttributes[4]
    };
  
    changeEmployeeData(payload, id);
  }
  
  function changeEmployeeData(payload, id) {
  
    $.ajax({
        method: "PUT",
        url: firstPage + "/" + id,
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(payload),
        success: function () {
            for (let i = 1; i < attributes.length; i++) {
                switch (i) {
                    case 1: case 2: case 5:
                        if ($("#input-" + attributes[i] + "-" + id).val().trim() != "") {
                            $("#text-" + attributes[i] + "-" + id).text($("#input-" + attributes[i] + "-" + id).val());
                            $("#input-" + attributes[i] + "-" + id).prop("placeholder", $("#input-" + attributes[i] + "-" + id).val());
                        }
                        $("#input-" + attributes[i] + "-" + id).val("");
                        break;
                    case 3: case 4:
                        $("#text-" + attributes[i] + "-" + id).text($("#input-" + attributes[i] + "-" + id).val());
                        break;
                }
            }
  
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("Errore, le modifiche non sono state applicate");
            console.log("Operazione fallita", jqXHR, textStatus, errorThrown);
        }
    });
  }
  
  function saveEmployee() {
  
    let gender = "M";
    if ($("#radio-female").prop("checked")) {
        gender = "F";
    }
  
    addEmployee(
        $("#input-name").val().trim(),
        $("#input-lastname").val().trim(),
        $("#input-birthdate").val(),
        $("#input-hiredate").val(),
        gender);
  
    resetModalInputs();
  }
  
  function resetModalInputs() {
    $("#input-name").val("");
    $("#input-lastname").val("");
    $("#input-birthdate").val("");
    $("#input-hiredate").val("");
    $("#radio-male").prop("checked", true);
    $("#radio-female").prop("checked", false);
  }
  
  function addEmployee(name, lastname, birthdate, hiredate, gender) {
    let payload = {
        "firstName": name,
        "lastName": lastname,
        "birthDate": birthdate,
        "hireDate": hiredate,
        "gender": gender
    }
    $.ajax({
        method: "POST",
        url: "http://localhost:8080/employees",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(payload),
        success: reloadCurrentPage()
    });
  }
  
  function reloadCurrentPage() {
    setTimeout(function () {
        $.get("http://localhost:8080/employees?page=" + pageData.page.number + "&size=20", function (values, status) {
            defaultInstructions(values);
        });
    }, 50);
  }
  
  function deleteEmployee(id) {
    $.ajax({
        url: firstPage + "/" + id,
        type: 'DELETE',
        success: function (result) {
            $("#id-" + id).closest("tr").remove();
            reloadCurrentPage();
        }
    });
  }
  
  function showMore() {
    $("#show-more").addClass("d-none");
    $("#show-less").removeClass("d-none");
  
    $(".extra-info").each(function () {
        $(this).removeClass("d-none");
    });
  }
  
  function showLess() {
    $("#show-more").removeClass("d-none");
    $("#show-less").addClass("d-none");
  
    $(".extra-info").each(function () {
        $(this).addClass("d-none");
    });
  }
  
  function updatePageNumber(num) {
    $("#previous-page").text(num - 1);
    $("#current-page").text(num);
    $("#next-page").text(num + 1);
    $("#last-page").text(totPages);
  }
  
  function checkPageButtons(pageNum) {
    noDisplay = "d-none";
  
    switch (pageNum) {
        case 0:
            $("#first-page").removeClass(noDisplay);
            $("#previous-page").addClass(noDisplay);
            $("#previous-page-arrow").addClass(noDisplay);
  
            $("#next-page").removeClass(noDisplay);
            $("#last-page").removeClass(noDisplay);
  
            break;
        case totPages-1:
            $("#next-page").addClass(noDisplay);
            $("#last-page").addClass(noDisplay);
            $("#next-page-arrow").addClass(noDisplay);
  
            $("#previous-page-arrow").removeClass(noDisplay);
            $("#first-page").removeClass(noDisplay);
            $("#previous-page").removeClass(noDisplay);
            break;
        default:
            $("#next-page-arrow").removeClass(noDisplay);
            $("#previous-page-arrow").removeClass(noDisplay);
            $("#first-page").removeClass(noDisplay);
            $("#previous-page").removeClass(noDisplay);
            $("#next-page").removeClass(noDisplay);
            $("#last-page").removeClass(noDisplay);
    }
  }

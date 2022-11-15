async function fetchApi(url, token) {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-type": "application/json",
      Authorization: "Bearer " + token,
    },
  });

  const resData = await response.json();
  return resData;
}

function showTable(data, title) {
  // Extract value for html header
  let col = [];
  for (let i = 0; i < data.length; i++) {
    for (let key in data[i]) {
      if (col.indexOf(key) === -1) {
        col.push(key);
      }
    }
  }
  // Create dynamic table
  let table = document.createElement("table");
  table.className = "table table-striped table-hover table-bordered mt-4";
  table.setAttribute("id", "dataTable");
  table.setAttribute("width", "100%");
  table.setAttribute("cellspacing", "0");

  // Create html table header row using the extracted headers above
  let header = table.createTHead();
  header.className = "bg-secondary text-white text-center";
  let row = header.insertRow(-1);

  for (let j = 0; j < col.length; j++) {
    let th = document.createElement("th");
    th.innerHTML = col[j].split("_").join(" ");
    row.appendChild(th);
  }
  let totalRecord = 0;
  // Add JSON data to the tables as rows
  let body = table.createTBody();
  for (let k = 0; k < data.length; k++) {
    tr = body.insertRow(-1);
    for (let l = 0; l < col.length; l++) {
      let tabCell = tr.insertCell(-1);
      tabCell.innerHTML = data[k][col[l]];
    }
    totalRecord += 1;
  }
  // Finally add the newlu created table
  let divContainer = document.getElementById("showTable");
  divContainer.innerHTML = "";
  // add download excel button before title
  let button = document.createElement("button");
  button.className = "btn btn-primary btn-sm";
  button.setAttribute("id", "downloadExcel");
  button.innerHTML = "Download Excel";
  button.addEventListener("click", function () {
    downloadExcel(title);
  });
  divContainer.appendChild(button);

  // add title before table
  let p = document.createElement("p");
  p.className = "text-center";
  p.innerHTML = "<strong>" + title + "</strong>";
  divContainer.appendChild(p);
  // append table

  // add total records
  //   let pContainer = document.getElementById("totalRecord");
  //   pContainer.innerHTML = "Total Record: <b>" + totalRecord + " records</b>";
  divContainer.appendChild(table);
}

// Add download excel function using XLSX library
function downloadExcel(filename) {
  let table = document.getElementById("dataTable");
  let file = XLSX.utils.table_to_book(table, { sheet: "data" });
  XLSX.write(file, { bookType: "xlsx", bookSST: true, type: "base64" });
  XLSX.writeFile(file, `${filename}.xlsx`);
}

function sortingData(data) {
  return data.sort((a, b) => {
    return a.idsubsls - b.idsubsls;
  });
}

async function fetchApi(url, token) {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-type": "application/json",
      Authorization: "Bearer " + token,
    },
  });

  return response;
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
  let divContainer = document.getElementById("showDashboard");
  divContainer.innerHTML = "";
  // add download excel button before title
  let button = document.createElement("button");
  button.className = "btn btn-success";
  button.setAttribute("id", "downloadExcel");
  button.innerHTML = "<span>Download Excel</span>";
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

function familyCategory(data) {
  // Jumlah keluraga sangat miskin, miskin, dan tidak miskin
  data.reduce((prev, curr) => {
    return {
      sangat_miskin: prev.sangat_miskin + curr.sangat_miskin,
      miskin: prev.miskin + curr.miskin,
      tidak_miskin: prev.tidak_miskin + curr.tidak_miskin,
    }
  })
}

function slsRecap(data) {
  // Sls Total, Sls berubah
  const idsubsls_baru = data.filter((d) => d.idsubsls_baru !== null);
  const idsubsls_lama = data.filter((d) => d.idsubsls_baru === null);
  return {
    idsubsls_baru: idsubsls_baru.length,
    idsubsls_lama: idsubsls_lama.length,
  }
}

function showDashboardDiv(dashboardDiv, data, nmKabkota) {
  let summaryDiv = document.createElement("div");
  summaryDiv.id = "summaryDiv";
  summaryDiv.className = "row gx-4";

  let hTitle = document.createElement("h3");
  hTitle.textContent = `Ringkasan Rekap VK ${nmKabkota}`;
  hTitle.className = "text-center text-uppercase font-weight-bold mb-3";
  summaryDiv.appendChild(hTitle);

  let childLeftSummaryDiv = document.createElement("div");
  childLeftSummaryDiv.id = "childLeftSummaryDiv";
  childLeftSummaryDiv.className = "col p-2 rounded-3";
  const getSlsRecap = slsRecap(data);
  childLeftSummaryDiv.innerHTML = `<p>Total SLS: ${getSlsRecap.idsubsls_baru + getSlsRecap.idsubsls_lama}</p><p>Total SLS Baru: ${getSlsRecap.idsubsls_baru}</p>`;

  let childRightSummaryDiv = document.createElement("div");
  childRightSummaryDiv.id = "childRightSummaryDiv";
  childRightSummaryDiv.className = "col p-2 bg-warning rounded-3";

  let chartRightSummary = echarts.init(childRightSummaryDiv);

  let childRightOption = {
    title: {
      text: "Jumlah Keluarga Berdasarkan Status Kesejahteraan",
    },
    tooltip: {
      trigger: "item",
    },
    emphasis: {
      itemStyle: {
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowColor: "rgba(0, 0, 0, 0.5)",
      },
    },
    series: [
      {
        name: "Status Kesejahteraan",
        type: "pie",
        radius: "50%",
        data: [
          { value: 1048, name: "Search Engine" },
          { value: 735, name: "Direct" },
          { value: 580, name: "Email" },
        ],
      },
    ],
  };

  if (childRightOption && typeof childRightOption === "object") {
    chartRightSummary.setOption(childRightOption);
  }

  summaryDiv.appendChild(childLeftSummaryDiv);
  summaryDiv.appendChild(childRightSummaryDiv);
  dashboardDiv.appendChild(summaryDiv);
}

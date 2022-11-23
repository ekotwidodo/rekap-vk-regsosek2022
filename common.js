async function fetchApi(url, token) {
  const headers = {
    Accept: "application/json",
  };

  if (token) {
    headers["Authorization"] = "Bearer " + token;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: headers,
  });

  return response;
}

function formatNumber(val) {
  // remove sign if negative
  var sign = 1;
  if (val < 0) {
    sign = -1;
    val = -val;
  }
  // trim the number decimal point if it exists
  let num = val.toString().includes(",")
    ? val.toString().split(",")[0]
    : val.toString();
  let len = num.toString().length;
  let result = "";
  let count = 1;

  for (let i = len - 1; i >= 0; i--) {
    result = num.toString()[i] + result;
    if (count % 3 === 0 && count !== 0 && i !== 0) {
      result = "." + result;
    }
    count++;
  }

  // add number after decimal point
  if (val.toString().includes(",")) {
    result = result + "," + val.toString().split(",")[1];
  }
  // return result with - sign if negative
  return sign < 0 ? "-" + result : result;
}

function toCSV(data) {
  const sortedData = sortingData(data);
  const replacer = (key, value) => (value === null ? "" : value);
  const header = Object.keys(sortedData[0]);
  let csv = sortedData.map((row) =>
    header
      .map((fieldName) => JSON.stringify(row[fieldName], replacer))
      .join(";")
  );
  csv.unshift(header.join(";"));
  csv = csv.join("\r\n");
  return csv;
}

function loadProvinsi(url) {
  const response = fetchApi(url + "provinsi.php", null);
  response.then((resp) => {
    resp.json().then((data) => {
      loadProvinsiDiv(data);
    });
  });
}

function loadProvinsiDiv(data) {
  let idProvinsi = document.getElementById("idProvinsi");
  idProvinsi.innerHTML = "";
  idProvinsi.innerHTML = "<option value='00'>- Pilih Provinsi -</option>";
  data.forEach((d) => {
    let option = document.createElement("option");
    option.value = d.kode;
    option.textContent = `[${d.kode}] ${d.nama}`;
    idProvinsi.appendChild(option);
  });
}

function loadKabkota(url, idProv) {
  const response = fetchApi(`${url}kabupatenkota.php?prov=${idProv}`, null);
  response.then((resp) => {
    resp.json().then((data) => {
      loadKabkotaDiv(data);
    });
  });
}

function loadKabkotaDiv(data) {
  let idKabkota = document.getElementById("idKabkota");
  idKabkota.innerHTML = "";
  // idKabkota.innerHTML =
  //   "<option value='0000'>- Pilih Kabupaten/Kota -</option>";
  data.forEach((d) => {
    let option = document.createElement("option");
    option.value = d.kode;
    option.textContent = `[${d.kode}] ${d.nama}`;
    idKabkota.appendChild(option);
  });
}

function loadKecamatan(url, idKabkota) {
  const response = fetchApi(`${url}kecamatan.php?kabkota=${idKabkota}`, null);
  response.then((resp) => {
    resp.json().then((data) => {
      loadKecamatanDiv(data);
    });
  });
}

function loadKecamatanDiv(data) {
  let idKecamatan = document.getElementById("idKecamatan");
  idKecamatan.innerHTML = "";
  idKecamatan.innerHTML = `<option value="000">- SEMUA KECAMATAN -</option>`;
  data.forEach((d) => {
    let option = document.createElement("option");
    option.value = d.kode;
    option.textContent = `[${d.kode}] ${d.nama}`;
    idKecamatan.appendChild(option);
  });
}

function loadDesaKelurahan(url, idKecamatan) {
  const response = fetchApi(`${url}desakelurahan.php?kec=${idKecamatan}`, null);
  response.then((resp) => {
    resp.json().then((data) => {
      loadDesaKelurahanDiv(data);
    });
  });
}

function loadDesaKelurahanDiv(data) {
  let idDesaKelurahan = document.getElementById("idDesaKelurahan");
  idDesaKelurahan.innerHTML = "";
  idDesaKelurahan.innerHTML = `<option value="000">- SEMUA DESA/KELURAHAN -</option>`;
  data.forEach((d) => {
    let option = document.createElement("option");
    option.value = d.kode;
    option.textContent = `[${d.kode}] ${d.nama}`;
    idDesaKelurahan.appendChild(option);
  });
}

function getWilayah(idKabkota, idKecamatan, idDesaKelurahan) {
  if (idDesaKelurahan.value !== "000") {
    return {
      idWilayah: idDesaKelurahan.value,
      nmWilayah: idDesaKelurahan.options[idDesaKelurahan.selectedIndex].text,
    };
  } else if (idKecamatan.value !== "000" && idDesaKelurahan.value === "000") {
    return {
      idWilayah: idKecamatan.value,
      nmWilayah: idKecamatan.options[idKecamatan.selectedIndex].text,
    };
  } else if (
    idKabkota.value !== "0000" &&
    idKecamatan.value === "000" &&
    idDesaKelurahan.value === "000"
  ) {
    return {
      idWilayah: idKabkota.value,
      nmWilayah: idKabkota.options[idKabkota.selectedIndex].text,
    };
  }
}

function getToday() {
  return new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    month: "long",
    year: "numeric",
    day: "numeric",
  });
}

function sortingData(data) {
  return data.sort((a, b) => {
    return a.idsubsls - b.idsubsls;
  });
}

function familyCategoryRecap(data) {
  // Jumlah keluraga sangat miskin, miskin, dan tidak miskin
  return data.reduce(
    (prev, curr) => {
      return {
        sangat_miskin: prev.sangat_miskin + curr.sangat_miskin,
        miskin: prev.miskin + curr.miskin,
        tidak_miskin: prev.tidak_miskin + curr.tidak_miskin,
      };
    },
    {
      sangat_miskin: 0,
      miskin: 0,
      tidak_miskin: 0,
    }
  );
}

function slsCategoryRecap(data) {
  // Jumlah SLS yang mengalami perubahan status kode 1, 2, dan 3
  return {
    mekar: data.filter((d) => d.status !== null && d.status === "1").length,
    gabung: data.filter((d) => d.status !== null && d.status === "2").length,
    ganti_nama: data.filter((d) => d.status !== null && d.status === "3")
      .length,
  };
}

function familyRecap(data) {
  const count_belum_entri = data.filter(
    (d) => d.jumlah_keluarga_verifikasi === null && d.flag_tidak_ditemukan === 0
  );
  const count_sudah_entri = data.filter(
    (d) => d.jumlah_keluarga_verifikasi !== null
  );
  const sum_recap = data.reduce(
    (prev, curr) => {
      return {
        jumlah_keluarga_verifikasi:
          prev.jumlah_keluarga_verifikasi + curr.jumlah_keluarga_verifikasi,
        nonrespon: prev.nonrespon + curr.nonrespon,
      };
    },
    {
      jumlah_keluarga_verifikasi: 0,
      nonrespon: 0,
    }
  );

  return {
    jumlah_keluarga_verifikasi: sum_recap.jumlah_keluarga_verifikasi,
    nonrespon: sum_recap.nonrespon,
    belum_entri: count_belum_entri.length,
    sudah_entri: count_sudah_entri.length,
  };
}

function slsRecap(data) {
  // Sls Total, Sls berubah
  const idsubsls_baru = data.filter((d) => d.idsubsls_baru !== null);
  const idsubsls_lama = data.filter((d) => d.idsubsls_baru === null);
  const sls_ditemukan = data.filter((d) => d.flag_tidak_ditemukan === 0);
  const sls_tidak_ditemukan = data.filter((d) => d.flag_tidak_ditemukan === 1);
  const sls_setelah_berubah =
    [
      ...new Set(
        data.filter((d) => d.idsubsls_baru !== null).map((d) => d.nmsls_baru)
      ),
    ].length + idsubsls_lama.length;
  return {
    idsubsls_baru: idsubsls_baru.length,
    idsubsls_lama: idsubsls_lama.length,
    sls_ditemukan: sls_ditemukan.length,
    sls_tidak_ditemukan: sls_tidak_ditemukan.length,
    sls_setelah_berubah: sls_setelah_berubah,
  };
}

function slsTable(data) {
  const sortedData = sortingData(data);
  const columns = Object.keys(sortedData[0]).map((key) =>
    key.toUpperCase().split("_").join(" ")
  );
  const rows = sortedData.map((row) => Object.values(row));
  return {
    columns,
    rows,
  };
}

function showDashboardDiv(dashDiv, nmWilayah) {
  let summaryDiv = document.createElement("div");
  summaryDiv.id = "summaryDiv";

  let hTitle = document.createElement("h3");
  hTitle.textContent = `Ringkasan Rekap VK ${nmWilayah.split("]")[1].trim()}`;
  hTitle.className = "text-center text-uppercase font-weight-bold";
  summaryDiv.appendChild(hTitle);

  let hSubtitle = document.createElement("p");
  hSubtitle.textContent = `${getToday()}`;
  hSubtitle.className = "text-center mb-4";
  summaryDiv.appendChild(hSubtitle);

  let firstSummaryDiv = document.createElement("div");
  firstSummaryDiv.className = "row g-2 bg-light p-4 rounded-3";
  let secondSummaryDiv = document.createElement("div");
  secondSummaryDiv.className = "row g-2 bg-light p-4 rounded-3";

  let firstLeftSummaryDiv = document.createElement("div");
  firstLeftSummaryDiv.id = "firstLeftSummaryDiv";
  firstLeftSummaryDiv.className = "col-4 py-4 rounded-3 text-center";
  firstLeftSummaryDiv.style = "height: 350px";
  // Inside firstLeftSummaryDiv
  let firstRightSummaryDiv = document.createElement("div");
  firstRightSummaryDiv.id = "firstRightSummaryDiv";
  firstRightSummaryDiv.className = "col-8 py-4 rounded-3";
  firstRightSummaryDiv.style = "height: 350px";
  firstSummaryDiv.appendChild(firstLeftSummaryDiv);
  firstSummaryDiv.appendChild(firstRightSummaryDiv);

  let secondLeftSummaryDiv = document.createElement("div");
  secondLeftSummaryDiv.id = "secondLeftSummaryDiv";
  secondLeftSummaryDiv.className = "col-4 py-4 rounded-3 text-center";
  secondLeftSummaryDiv.style = "height: 350px";
  // Inside firstLeftSummaryDiv
  let secondRightSummaryDiv = document.createElement("div");
  secondRightSummaryDiv.id = "secondRightSummaryDiv";
  secondRightSummaryDiv.className = "col-8 py-4 rounded-3";
  secondRightSummaryDiv.style = "height: 350px";
  secondSummaryDiv.appendChild(secondLeftSummaryDiv);
  secondSummaryDiv.appendChild(secondRightSummaryDiv);

  let bottomSummaryDiv = document.createElement("div");
  bottomSummaryDiv.id = "bottomSummaryDiv";
  bottomSummaryDiv.className = "row mx-3 mt-3 mb-4";
  bottomSummaryDiv.innerHTML =
    "<p><strong>Keterangan:</strong><ol><li>Belum Entri VK = jumlah keluarga verifikasi belum terisi padahal SLS ditemukan</li><li>SLS Total (Setelah Berubah) = sls baru dan unik (tidak sama)</li></ol></p>";

  let subTableDiv = document.createElement("div");
  subTableDiv.id = "tableDiv";
  subTableDiv.className = "row mt-4";

  let tTitle = document.createElement("h3");
  tTitle.textContent = `Tabel Rekap VK ${nmWilayah.split("]")[1].trim()}`;
  tTitle.className = "text-center text-uppercase font-weight-bold";
  subTableDiv.appendChild(tTitle);

  let tSubtitle = document.createElement("p");
  tSubtitle.textContent = `${getToday()}`;
  tSubtitle.className = "text-center mb-4";
  subTableDiv.appendChild(tSubtitle);

  let showTableDiv = document.createElement("div");
  showTableDiv.id = "showTableDiv";
  showTableDiv.className = "bg-light p-4 rounded-3";
  subTableDiv.appendChild(showTableDiv);

  summaryDiv.appendChild(firstSummaryDiv);
  summaryDiv.appendChild(secondSummaryDiv);
  summaryDiv.appendChild(bottomSummaryDiv);
  summaryDiv.appendChild(subTableDiv);
  dashDiv.appendChild(summaryDiv);
}

function showFistSummaryDiv(familyRecaps, familyCharts) {
  let firstLeftSummaryDiv = document.getElementById("firstLeftSummaryDiv");
  firstLeftSummaryDiv.innerHTML = "";

  let hTitle = document.createElement("h4");
  hTitle.textContent = "Keluarga";
  hTitle.className =
    "text-center text-white text-uppercase font-weight-bold bg-danger bg-opacity-75 mx-3 py-2 rounded-3";
  firstLeftSummaryDiv.appendChild(hTitle);

  let pContent = document.createElement("p");
  pContent.className = "text-center mt-3";
  pContent.innerHTML = `Terverifikasi<h3>${formatNumber(
    familyRecaps.jumlah_keluarga_verifikasi
  )}</h3>Non-Respon<h3>${formatNumber(
    familyRecaps.nonrespon
  )}</h3>Sudah Entri VK<h3>${formatNumber(
    familyRecaps.sudah_entri
  )}</h3></h3>Belum Entri VK *<h3>${formatNumber(
    familyRecaps.belum_entri
  )}</h3>`;
  firstLeftSummaryDiv.appendChild(pContent);

  // Show chart
  let firstRightSummaryDiv = document.getElementById("firstRightSummaryDiv");
  let chartRightSummary = echarts.init(firstRightSummaryDiv);

  let chartRightSummaryOption = {
    title: {
      text: "Jumlah Keluarga Berdasarkan Status Kesejahteraan",
      left: "center",
    },
    height: "300px",
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
          { value: familyCharts.sangat_miskin, name: "Sangat Miskin" },
          { value: familyCharts.miskin, name: "Miskin" },
          { value: familyCharts.tidak_miskin, name: "Tidak Miskin" },
        ],
      },
    ],
    color: ["#EE6666", "#FAC858", "#73C0DE"],
  };

  if (chartRightSummaryOption && typeof chartRightSummaryOption === "object") {
    chartRightSummary.setOption(chartRightSummaryOption);
  }
}

function showSecondSummaryDiv(slsRecaps, slsCharts) {
  let secondLeftSummaryDiv = document.getElementById("secondLeftSummaryDiv");
  secondLeftSummaryDiv.innerHTML = "";

  let hTitle = document.createElement("h4");
  hTitle.textContent = "SLS";
  hTitle.className =
    "text-center text-white text-uppercase font-weight-bold bg-success bg-opacity-75 mx-3 py-2 rounded-3";
    secondLeftSummaryDiv.appendChild(hTitle);

  let pContent = document.createElement("p");
  pContent.className = "text-center mt-3";
  pContent.innerHTML = `SLS Total (Sebelum Berubah)<h3>${formatNumber(
    slsRecaps.idsubsls_baru + slsRecaps.idsubsls_lama
  )}</h3>SLS Berubah<h3>${formatNumber(
    slsRecaps.idsubsls_baru
  )}</h3>SLS Tidak Ditemukan<h3>${formatNumber(
    slsRecaps.sls_tidak_ditemukan
  )}</h3>
  </h3>SLS Total (Setelah Berubah) **<h3>${formatNumber(
    slsRecaps.sls_setelah_berubah
  )}</h3>`;
  secondLeftSummaryDiv.appendChild(pContent);

  // Show chart
  let secondRightSummaryDiv = document.getElementById("secondRightSummaryDiv");
  let chartRightSummary = echarts.init(secondRightSummaryDiv);

  let chartRightSummaryOption = {
    title: {
      text: "Jumlah SLS Berdasarkan Status Perubahan",
      left: "center",
    },
    height: "300px",
    tooltip: {
      trigger: "item",
    },
    legend: {
      bottom: "3%",
      left: "center",
    },

    series: [
      {
        name: "Status Perubahan",
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: "center",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: "40",
            fontWeight: "bold",
          },
        },
        labelLine: {
          show: false,
        },
        data: [
          { value: slsCharts.mekar, name: "Pemekaran" },
          { value: slsCharts.gabung, name: "Penggabungan" },
          { value: slsCharts.ganti_nama, name: "Perubahan Nama" },
        ],
        color: ["#E062AE", "#91CC75", "#FAC858"],
      },
    ],
  };

  if (chartRightSummaryOption && typeof chartRightSummaryOption === "object") {
    chartRightSummary.setOption(chartRightSummaryOption);
  }
}

function showTableDiv(tables, data, nmWilayah) {
  let idShowTableDiv = document.getElementById("showTableDiv");
  idShowTableDiv.innerHTML = "";

  let downloadButton = document.createElement("a");
  downloadButton.className = "btn btn-primary w-10 mt-4";
  downloadButton.id = "downloadCSV";
  downloadButton.innerHTML = `${feather.icons.download.toSvg()}<span>Download CSV</span>`;

  let csvContent = "data:text/csv;charset=utf-8," + toCSV(data);
  downloadButton.setAttribute("href", encodeURI(csvContent));

  let timestamp = new Date().toISOString().slice(0, 10);
  let wilayah = nmWilayah.split("]")[0].substring(1);
  downloadButton.setAttribute(
    "download",
    `${timestamp}_rekapvk_${wilayah}.csv`
  );
  downloadButton.setAttribute("target", "_blank");

  new gridjs.Grid({
    search: true,
    pagination: {
      enabled: true,
      limit: 5,
      summary: true,
      nextButton: true,
      previousButton: true,
    },
    sort: true,
    resizable: true,
    fixedHeader: true,
    language: {
      search: {
        placeholder: "🔍 Cari...",
      },
    },
    columns: tables.columns,
    data: tables.rows,
  }).render(idShowTableDiv);

  idShowTableDiv.appendChild(downloadButton);
}

document.onreadystatechange = function () {
  // Define Base API
  const BASE_API = "<your-api-url>";
  const API_REGION = "<your-api-region>";

  // Define Variables
  let btnSearch = document.getElementById("btnSearch");
  let resultContainer = document.getElementById("resultContainer");
  let progressBar = document.getElementsByClassName("progress-bar")[0];
  let dropDownProvinsi = document.querySelector("#idProvinsi");
  let dropDownKabkota = document.querySelector("#idKabkota");
  let inputToken = document.querySelector("#accessToken");

  dropDownKabkota.disabled = true;
  inputToken.disabled = true;

  function stateSelect() {
    if (dropDownProvinsi.value !== "00") {
      dropDownKabkota.disabled = false;
      inputToken.disabled = false;
    } else {
      dropDownKabkota.disabled = true;
      inputToken.disabled = true;
    }
  }

  // Load Provinsi
  loadProvinsi(API_REGION);
  dropDownProvinsi.addEventListener("change", function (e) {
    stateSelect();
    let idProvinsi = e.target.value;
    // Load Kabupaten/Kota
    loadKabkota(API_REGION, idProvinsi);
  });

  // Action when button View Rekap VK is clicked
  btnSearch.addEventListener("click", function (e) {
    e.preventDefault();
    // resultContainer.style.display = "block";
    resultContainer.innerHTML = "";
    let dashboardDiv = document.createElement("div");
    dashboardDiv.id = "showDashboard";
    dashboardDiv.className =
      "container border border-black bg-white p-5 rounded-3 mb-3";
    resultContainer.appendChild(dashboardDiv);

    progressBar.setAttribute("style", `width: 0}%`);
    // Define local variables
    let accessToken = document.getElementById("accessToken");
    let idKabkota = document.getElementById("idKabkota");
    let idProvinsi = document.getElementById("idProvinsi");
    let errors = [];

    // Check if errors exist
    if (idProvinsi.value === "00") {
      errors.push("Provinsi belum dipilih.");
    }
    if (idKabkota.value === "0000") {
      errors.push("Kabupaten/Kota belum dipilih.");
    }
    if (accessToken.value === "") {
      errors.push("Akses Token belum diisi.");
    }

    if (errors.length > 0) {
      Swal.fire({
        icon: "error",
        title: "Ada Kesalahan...",
        html: `<p><b>Isian berikut belum diisi/dipilih:</b></p> ${errors.join(
          ", "
        )}`,
        confirmButtonColor: "#e3342f",
        confirmButtonText: "Tutup",
      });
    } else {
      // If there is no childs inside dashboardDiv
      let showDashboard = document.getElementById("showDashboard");
      let width = 0;
      let identity = setInterval(scene, 30);
      function scene() {
        if (width >= 100) {
          clearInterval(identity);
          width = 0;
          showDashboard.innerHTML = "";

          Swal.fire({
            icon: "success",
            title: "Sukses memuat data",
            html: "<p>Silahkan tunggu sampai berhasil memuat tampilan</p>",
            showConfirmButton: false,
          });

          showRecap(
            idKabkota.value,
            idKabkota.options[idKabkota.selectedIndex].text,
            accessToken.value,
            showDashboard
          );
        } else {
          width++;
          progressBar.setAttribute("style", `width: ${width}%`);
          progressBar.innerHTML = `${width * 1}%`;
        }
      }
    }
  });

  function showRecap(idKabkota, nmKabkota, accessToken, showDashboard) {
    // Fetch API
    fetchApi(`${BASE_API}${idKabkota}`, accessToken).then(function (resp) {
      // If data doesn't exist
      if (!resp.ok) {
        Swal.fire({
          icon: "error",
          title: "Ada Kesalahan...",
          html: `<p><b>[${resp.status}] ${resp.statusText}</b><br/>Tidak dapat melakukan request ke server.</p>`,
          confirmButtonColor: "#e3342f",
          confirmButtonText: "Tutup",
        });
      }

      // If data exists
      resp
        .json()
        .then(({ data }) => {
          showDashboardDiv(showDashboard, nmKabkota);

          setTimeout(() => {
            // Show the data
            let familyCategoryRecaps = familyCategoryRecap(data);
            let familiesRecaps = familyRecap(data);
            let slsRecaps = slsRecap(data);
            let slsTableRecaps = slsTable(data);

            showLeftSummaryDiv(familiesRecaps);
            showCenterSummaryDiv(slsRecaps);
            showRightSummaryDiv(familyCategoryRecaps);
            showTableDiv(slsTableRecaps, data, nmKabkota);
          }, 3000);
        })
        .catch((error) => {
          console.log(error);
          Swal.fire({
            icon: "error",
            title: "Ada Kesalahan...",
            html: `<p><b>Sistem mengalami masalah:</b></p> ${error.message}`,
            confirmButtonColor: "#e3342f",
            confirmButtonText: "Tutup",
          });
        });
    });
  }
};

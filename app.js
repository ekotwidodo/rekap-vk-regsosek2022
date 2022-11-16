document.onreadystatechange = function () {
  // Define Base API
  const BASE_API = "<your-api-url>";
  const regencies = [
    {
      id: "1801",
      name: "KABUPATEN LAMPUNG BARAT",
    },
    {
      id: "1802",
      name: "KABUPATEN TANGGAMUS",
    },
    {
      id: "1803",
      name: "KABUPATEN LAMPUNG SELATAN",
    },
    {
      id: "1804",
      name: "KABUPATEN LAMPUNG TIMUR",
    },
    {
      id: "1805",
      name: "KABUPATEN LAMPUNG TENGAH",
    },
    {
      id: "1806",
      name: "KABUPATEN LAMPUNG UTARA",
    },
    {
      id: "1807",
      name: "KABUPATEN WAY KANAN",
    },
    {
      id: "1808",
      name: "KABUPATEN TULANG BAWANG",
    },
    {
      id: "1809",
      name: "KABUPATEN PESAWARAN",
    },
    {
      id: "1810",
      name: "KABUPATEN PRINGSEWU",
    },
    {
      id: "1811",
      name: "KABUPATEN MESUJI",
    },
    {
      id: "1812",
      name: "KABUPATEN TULANG BAWANG BARAT",
    },
    {
      id: "1813",
      name: "KABUPATEN PESISIR BARAT",
    },
    {
      id: "1871",
      name: "KOTA BANDAR LAMPUNG",
    },
    {
      id: "1872",
      name: "KOTA METRO",
    },
  ];

  // Define Variables
  let btnSearch = document.getElementById("btnSearch");
  let resultContainer = document.getElementById("resultContainer");
  let progressBar = document.getElementsByClassName("progress-bar")[0];

  // Load Kabupaten/Kota
  loadKabkota(regencies);

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
    let errors = [];

    // Check if errors exist
    if (accessToken.value === "") {
      errors.push("Akses Token belum diisi.");
    }
    if (idKabkota.value === "0000") {
      errors.push("Kabupaten/Kota belum dipilih.");
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
            title: "Data berhasil dimuat!",
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
            showTableDiv(slsTableRecaps, data);
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

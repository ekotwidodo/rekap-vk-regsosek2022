document.onreadystatechange = function () {
  // Define Base API
  const BASE_API = "https://regsosek-repo.cloud.bps.go.id/api/rekap-vk/";

  // Define Variables
  let btnSearch = document.getElementById("btnSearch");
  let resultContainer = document.getElementById("resultContainer");
  let progressBar = document.getElementsByClassName("progress-bar")[0];

  // Action when button View Rekap VK is clicked
  btnSearch.addEventListener("click", function (e) {
    e.preventDefault();
    // resultContainer.style.display = "block";
    resultContainer.innerHTML = "";
    let dashboardDiv = document.createElement("div");
    dashboardDiv.id = "showDashboard";
    dashboardDiv.className = "container bg-white p-5 rounded-3 mb-3";
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
      // If there is no childs inside showTable div
      showDashboard.innerHTML = "";
      let width = 0;
      let identity = setInterval(scene, 30);
      function scene() {
        if (width >= 100) {
          clearInterval(identity);
          width = 0;
          showRecap(idKabkota.value, idKabkota.options[idKabkota.selectedIndex].text, accessToken.value, dashboardDiv);
        } else {
          width++;
          progressBar.setAttribute("style", `width: ${width}%`);
          progressBar.innerHTML = `${width * 1}%`;
        }
      }
    }
  });

  function showRecap(idKabkota, nmKabkota, accessToken, dashboardDiv) {
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
          let today = new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            month: "long",
            year: "numeric",
            day: "numeric",
          });

          showDashboardDiv(dashboardDiv, data, nmKabkota);

          // showTable(
          //   sortingData(data),
          //   `Rekapitulasi VK-${idKabkota} Kondisi ${today}`
          // );
        })
        .catch((error) => {
          Swal.fire({
            icon: "error",
            title: "Ada Kesalahan...",
            html: `<p><b>Isian berikut belum diisi/dipilih:</b></p> ${error.message}`,
            confirmButtonColor: "#e3342f",
            confirmButtonText: "Tutup",
          });
        });
    });
  }
};

const BASE_API = "<your-api-url>";

let formSearch = document.getElementById("formSearch");
formSearch.addEventListener("change", function (e) {
  e.preventDefault();
  let accessToken = document.getElementById("accessToken").value;
  let idKabkota = document.getElementById("idKabkota").value;
  let errors = [];

  if (accessToken === "") {
    errors.push("Akses Token belum diisi.");
  }
  if (idKabkota === "0000") {
    errors.push("Kabupaten/Kota belum dipilih.");
  }
  if (errors.length > 0) {
    alert(`${errors.join(",")}`);
  } else {
    let urlApi = `${BASE_API}${idKabkota}`;
    fetchApi(urlApi, accessToken)
      .then(function (resp) {
        let today = new Date().toLocaleDateString("id-ID", {
          weekday: "long",
          month: "long",
          year: "numeric",
          day: "numeric",
        });

        showTable(sortingData(resp.data), `Rekapitulasi VK-${idKabkota} Kondisi ${today}`);
      })
      .catch(function (error) {
        console.log(error);
      });
  }
});

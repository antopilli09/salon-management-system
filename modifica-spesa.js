document.addEventListener(
  "DOMContentLoaded",
  function () {

    const parametriUrl =
      new URLSearchParams(
        window.location.search
      );

    const idSpesa =
      parametriUrl.get("id");

    const form =
      document.getElementById(
        "form-modifica-spesa"
      );

    const campoData =
      document.getElementById(
        "data-spesa"
      );

    const campoImporto =
      document.getElementById(
        "importo-spesa"
      );

    const campoDescrizione =
      document.getElementById(
        "descrizione-spesa"
      );

    const campoCategoria =
      document.getElementById(
        "categoria-spesa"
      );

    const campoNote =
      document.getElementById(
        "note-spesa"
      );

    const pulsanteSalva =
      document.getElementById(
        "salva-modifica-spesa"
      );

    if (!idSpesa) {
      alert("Spesa non trovata.");
      return;
    }

    const riferimentoSpesa =
      db.collection("spese")
        .doc(idSpesa);

    async function caricaSpesa() {

      try {

        const documento =
          await riferimentoSpesa.get();

        if (!documento.exists) {
          alert("Spesa non trovata.");
          return;
        }

        const spesa =
          documento.data();

        campoData.value =
          spesa.data || "";

        campoImporto.value =
          spesa.importo || "";

        campoDescrizione.value =
          spesa.descrizione || "";

        campoCategoria.value =
          spesa.categoria || "";

        campoNote.value =
          spesa.note || "";

      } catch (errore) {

        console.error(errore);

        alert(
          "Errore nel caricamento della spesa."
        );
      }
    }

    form.addEventListener(
      "submit",
      async function (evento) {

        evento.preventDefault();

        try {

          pulsanteSalva.disabled =
            true;

          await riferimentoSpesa.update({

            data:
              campoData.value,

            importo:
              Number(
                campoImporto.value
              ),

            descrizione:
              campoDescrizione.value.trim(),

            categoria:
              campoCategoria.value,

            note:
              campoNote.value.trim(),

            ultimaModifica:
              firebase.firestore.FieldValue.serverTimestamp()

          });

          alert(
            "Spesa modificata correttamente."
          );

          window.location.href =
            "spese.html";

        } catch (errore) {

          console.error(errore);

          alert(
            "Errore durante il salvataggio."
          );

          pulsanteSalva.disabled =
            false;
        }
      }
    );

    caricaSpesa();

  }
);
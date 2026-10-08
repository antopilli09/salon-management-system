document.addEventListener(
  "DOMContentLoaded",
  function () {

    const parametriUrl =
      new URLSearchParams(
        window.location.search
      );

    const idCartella =
      parametriUrl.get("id");

    const form =
      document.getElementById(
        "form-modifica-cartella-colore"
      );

    const campoNome =
      document.getElementById("nome");

    const campoCognome =
      document.getElementById("cognome");

    const campoTelefono =
      document.getElementById("telefono");

    const campoData =
      document.getElementById("data");

    const campoColore =
      document.getElementById("colore");

    const campoNote =
      document.getElementById("note");

    const pulsanteSalva =
      document.getElementById(
        "salva-modifica-cartella"
      );

    const messaggio =
      document.getElementById(
        "messaggio-modifica"
      );

    const tornaScheda =
      document.getElementById(
        "torna-scheda"
      );

    const annulla =
      document.getElementById(
        "annulla-modifica"
      );

    if (!idCartella) {
      alert(
        "Identificativo cartella non valido."
      );
      return;
    }

    const riferimentoCartella = db
      .collection("cartelle_colore")
      .doc(idCartella);

    const linkScheda =
      "scheda-colore.html?id=" +
      idCartella;

    if (tornaScheda) {
      tornaScheda.href = linkScheda;
    }

    if (annulla) {
      annulla.href = linkScheda;
    }

    async function caricaCartella() {
      try {

        const documento =
          await riferimentoCartella.get();

        if (!documento.exists) {
          alert(
            "Cartella colore non trovata."
          );
          return;
        }

        const cartella =
          documento.data();

        campoNome.value =
          cartella.nome || "";

        campoCognome.value =
          cartella.cognome || "";

        campoTelefono.value =
          cartella.telefono || "";

        campoData.value =
          cartella.data || "";

        campoColore.value =
          cartella.colore || "";

        campoNote.value =
          cartella.note || "";

      } catch (errore) {

        console.error(errore);

        alert(
          "Errore nel caricamento della cartella colore."
        );
      }
    }

    form.addEventListener(
      "submit",
      async function (evento) {

        evento.preventDefault();

        const nome =
          campoNome.value.trim();

        const cognome =
          campoCognome.value.trim();

        const telefono =
          campoTelefono.value.trim();

        const data =
          campoData.value;

        const colore =
          campoColore.value.trim();

        const note =
          campoNote.value.trim();

        if (!nome) {
          alert(
            "Inserisci il nome."
          );
          return;
        }

        if (!colore) {
          alert(
            "Inserisci il colore."
          );
          return;
        }

        try {

          pulsanteSalva.disabled =
            true;

          pulsanteSalva.textContent =
            "Salvataggio...";

          await riferimentoCartella.update({
            nome: nome,
            cognome: cognome,
            telefono: telefono,
            data: data,
            colore: colore,
            note: note,

            ultimaModifica:
              firebase.firestore.FieldValue.serverTimestamp()
          });

          if (messaggio) {
            messaggio.textContent =
              "Salvataggio completato.";
          }

          window.location.href =
            linkScheda;

        } catch (errore) {

          console.error(errore);

          alert(
            "Impossibile salvare le modifiche."
          );

          pulsanteSalva.disabled =
            false;

          pulsanteSalva.textContent =
            "Salva modifiche";
        }
      }
    );

    caricaCartella();
  }
);
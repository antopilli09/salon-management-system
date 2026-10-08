document.addEventListener(
  "DOMContentLoaded",
  function () {

    const parametri =
      new URLSearchParams(
        window.location.search
      );

    const idCliente =
      parametri.get("id");

    const form =
      document.getElementById(
        "form-aggiungi-appuntamento"
      );

    const campoData =
      document.getElementById(
        "data-appuntamento"
      );

    const campoPrezzo =
      document.getElementById(
        "prezzo-appuntamento"
      );

    const campoDescrizione =
      document.getElementById(
        "descrizione-appuntamento"
      );

    const campoProssimo =
      document.getElementById(
        "prossimo-appuntamento"
      );

    const campoNote =
      document.getElementById(
        "note-appuntamento"
      );

    const tornaScheda =
      document.getElementById(
        "torna-scheda"
      );

    const annulla =
      document.getElementById(
        "annulla-modifica"
      );

    if (!idCliente) {
      alert("Cliente non trovato.");
      return;
    }

    const urlScheda =
      "scheda-cliente.html?id=" +
      encodeURIComponent(idCliente);

    if (tornaScheda) {
      tornaScheda.href = urlScheda;
    }

    if (annulla) {
      annulla.href = urlScheda;
    }

    const riferimentoCliente =
      db.collection("clienti")
        .doc(idCliente);

    form.addEventListener(
      "submit",
      async function (evento) {

        evento.preventDefault();

        try {

          const documento =
            await riferimentoCliente.get();

          if (!documento.exists) {
            alert(
              "Cliente non trovato."
            );
            return;
          }

          const cliente =
            documento.data();

          const appuntamenti =
            Array.isArray(
              cliente.appuntamenti
            )
              ? [...cliente.appuntamenti]
              : [];

          appuntamenti.push({
            id: Date.now().toString(),

            data:
              campoData.value,

            descrizione:
              campoDescrizione.value.trim(),

            prezzo:
              Number(
                campoPrezzo.value
              ),

            note:
              campoNote.value.trim()
          });

          await riferimentoCliente.update({

            appuntamenti:
              appuntamenti,

            ultimoAppuntamento:
              campoData.value,

            prossimoAppuntamento:
              campoProssimo.value,

            prezzo:
              Number(
                campoPrezzo.value
              ),

            ultimaModifica:
              firebase.firestore.FieldValue.serverTimestamp()

          });

          alert(
            "Appuntamento aggiunto correttamente."
          );

          window.location.href =
            urlScheda;

        } catch (errore) {

          console.error(
            errore
          );

          alert(
            "Impossibile salvare l'appuntamento."
          );
        }

      }
    );

  }
);
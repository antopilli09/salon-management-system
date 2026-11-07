document.addEventListener(
  "DOMContentLoaded",
  async function () {

    const parametri =
      new URLSearchParams(
        window.location.search
      );

    const idCliente =
      parametri.get(
        "idCliente"
      );

    const idAppuntamento =
      parametri.get(
        "idAppuntamento"
      );

    const riferimentoCliente =
      db.collection("clienti")
        .doc(idCliente);

    const campoData =
      document.getElementById(
        "data-appuntamento"
      );

    const campoPrezzo =
      document.getElementById(
        "prezzo-appuntamento"
      );

      const campoPagamento =
  document.getElementById(
    "metodo-pagamento"
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

    const form =
      document.getElementById(
        "form-modifica-appuntamento"
      );

    const documento =
      await riferimentoCliente.get();

    const cliente =
      documento.data();

    const appuntamento =
      (
        cliente.appuntamenti || []
      ).find(function (a) {

        return (
          a.id ===
          idAppuntamento
        );

      });

    if (!appuntamento) {
      alert(
        "Appuntamento non trovato."
      );
      return;
    }

    campoData.value =
      appuntamento.data || "";

    campoDescrizione.value =
      appuntamento.descrizione ||
      "";

    campoPrezzo.value =
      appuntamento.prezzo || "";

      campoPagamento.value =
  appuntamento.metodoPagamento ||
  "contanti";

    campoNote.value =
      appuntamento.note || "";

    form.addEventListener(
      "submit",
      async function (evento) {

        evento.preventDefault();

        const appuntamenti =
          [
            ...(cliente.appuntamenti || [])
          ];

        const indice =
          appuntamenti.findIndex(
            function (a) {

              return (
                a.id ===
                idAppuntamento
              );

            }
          );

        appuntamenti[indice] = {
          ...appuntamenti[indice],

          data:
            campoData.value,

          descrizione:
            campoDescrizione.value.trim(),

          prezzo:
            Number(
              campoPrezzo.value
            ),

metodoPagamento:
  campoPagamento.value,

          note:
            campoNote.value.trim()
        };

        await riferimentoCliente.update({

          appuntamenti:
            appuntamenti,

          ultimaModifica:
            firebase.firestore.FieldValue.serverTimestamp()

        });

        window.location.href =
          "scheda-cliente.html?id=" +
          encodeURIComponent(
            idCliente
          );

      }
    );

  }
);
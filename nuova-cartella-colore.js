document.addEventListener("DOMContentLoaded", function () {
  const formCartella = document.getElementById(
    "form-nuova-cartella-colore"
  );

  if (!formCartella) {
    console.error(
      "Errore: il modulo Cartella Colore non è stato trovato."
    );
    return;
  }

  const pulsanteSalva = formCartella.querySelector(
    'button[type="submit"]'
  );

  formCartella.addEventListener(
    "submit",
    async function (evento) {
      evento.preventDefault();

      const nome = document
        .getElementById("nome")
        .value
        .trim();

      const cognome = document
        .getElementById("cognome")
        .value
        .trim();

      const telefono = document
        .getElementById("telefono")
        .value
        .trim();

      const data = document
        .getElementById("data")
        .value;

      const colore = document
        .getElementById("colore")
        .value
        .trim();

      const note = document
        .getElementById("note")
        .value
        .trim();

      if (!nome || !cognome) {
        alert(
          "Inserisci nome e cognome."
        );
        return;
      }

      if (!colore) {
        alert(
          "Inserisci il colore."
        );
        return;
      }

      if (
        typeof firebase === "undefined" ||
        typeof db === "undefined"
      ) {
        alert(
          "Firebase non è disponibile."
        );

        return;
      }

      pulsanteSalva.disabled = true;
      pulsanteSalva.textContent =
        "Salvataggio in corso...";

      try {
        const cartellaColore = {
          nome: nome,
          cognome: cognome,
          telefono: telefono,

          data: data,

          colore: colore,

          note: note,

          dataCreazione:
            firebase.firestore.FieldValue
              .serverTimestamp(),

          ultimaModifica:
            firebase.firestore.FieldValue
              .serverTimestamp()
        };

        await db
          .collection("cartelle_colore")
          .add(cartellaColore);

        alert(
          "Cartella colore salvata correttamente."
        );

        window.location.href =
          "cartella-colori.html";
      } catch (errore) {
        console.error(
          "Errore durante il salvataggio:",
          errore
        );

        alert(
          "Non è stato possibile salvare la cartella colore."
        );

        pulsanteSalva.disabled = false;

        pulsanteSalva.textContent =
          "Salva cartella colore";
      }
    }
  );
});
const firebaseConfig = {
  apiKey: "AIzaSyDJG_SyLEOFJLQVWaKbOKy-on3axEiRwZo",
  authDomain: "utopian-spring-378808.firebaseapp.com",
  databaseURL: "https://utopian-spring-378808-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "utopian-spring-378808",
  storageBucket: "utopian-spring-378808.appspot.com",
  messagingSenderId: "8495813117",
  appId: "1:8495813117:web:9dc5b7c89fd23996128994"
};
firebase.initializeApp(firebaseConfig);

// Référence à la base de données
const database = firebase.database();
const serversRef = database.ref('servers');

// Gestionnaire d'événements pour la soumission du formulaire
const serverForm = document.getElementById('server-form');
const discordLinkInput = document.getElementById('discord-link');
const discordAvatarInput = document.getElementById('discord-avatar');
const discordNameInput = document.getElementById('discord-name');
const discordDescriptionInput = document.getElementById('discord-description');

serverForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const discordLink = discordLinkInput.value;
    const discordAvatar = discordAvatarInput.value;
    const discordName = discordNameInput.value;
    const discordDescription = discordDescriptionInput.value;

    // Validation des champs obligatoires et de la longueur de la description
    if (!discordLink || !discordAvatar || !discordName || !discordDescription) {
        alert('Veuillez remplir tous les champs.');
        return;
    }

    if (discordDescription.length < 50) {
        alert('La description doit contenir au moins 50 caractères.');
        return;
    }

    // Vérification du lien d'invitation Discord
    if (!discordLink.startsWith('https://discord.gg/')) {
        alert('Le lien du serveur Discord doit commencer par "https://discord.gg/".');
        return;
    }

    // Vérification si un serveur avec le même nom et lien existe déjà
    const serverExists = await checkServerExistence(discordName, discordLink);
    
    if (serverExists) {
        alert('Un serveur avec le même nom et le même lien d\'invitation existe déjà.');
        return;
    }

    // Ajout du serveur à la base de données
    serversRef.push({
        discordLink,
        discordAvatar,
        discordName,
        discordDescription,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    });

    // Réinitialisation des champs du formulaire
    discordLinkInput.value = '';
    discordAvatarInput.value = '';
    discordNameInput.value = '';
    discordDescriptionInput.value = '';
});

// Fonction pour vérifier l'existence d'un serveur avec le même nom et lien
async function checkServerExistence(name, link) {
    const snapshot = await serversRef.orderByChild('discordName').equalTo(name).once('value');
    const servers = snapshot.val();

    if (!servers) {
        return false;
    }

    for (const key in servers) {
        if (servers[key].discordLink === link) {
            return true;
        }
    }

    return false;
}
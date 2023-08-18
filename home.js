// Configurez Firebase avec les informations de configuration
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

// Fonction pour formater la description en plusieurs lignes
function formatDescription(description) {
    const maxLengthPerLine = 45;
    const words = description.split(' ');
    let lines = [];
    let currentLine = '';

    words.forEach(word => {
        if (currentLine.length + word.length <= maxLengthPerLine) {
            currentLine += word + ' ';
        } else {
            lines.push(currentLine);
            currentLine = word + ' ';
        }
    });

    if (currentLine.length > 0) {
        lines.push(currentLine);
    }

    return lines.join('<br>'); // Utilise <br> pour les retours à la ligne
}

// Fonction pour créer un élément de carte de serveur
function createServerItem(serverData) {
    const serverItem = document.createElement('div');
    serverItem.classList.add('server-card');
    serverItem.innerHTML = `
        <div class="server-avatar">
            <img src="${serverData.discordAvatar}" alt="Server Avatar">
        </div>
        <div class="server-details">
            <h2>${serverData.discordName}</h2>
            <p class="description">${formatDescription(serverData.discordDescription)}</p>
            <button class="join-button" data-link="${serverData.discordLink}">Rejoindre</button>
        </div>
        <button class="expand-button">Agrandir</button>
    `;

    // Gestionnaire d'événements pour rejoindre le serveur
    const joinButton = serverItem.querySelector('.join-button');
    joinButton.addEventListener('click', () => {
        const link = joinButton.getAttribute('data-link');
        if (link) {
            window.open(link, '_blank'); // Ouvre le lien dans un nouvel onglet
        }
    });

    // Gestionnaire d'événements pour le bouton "Agrandir"
    const expandButton = serverItem.querySelector('.expand-button');
    const description = serverItem.querySelector('.description');

    expandButton.addEventListener('click', () => {
        serverItem.classList.toggle('expanded');
        if (serverItem.classList.contains('expanded')) {
            description.style.maxHeight = 'none';
            expandButton.textContent = 'Réduire';
        } else {
            description.style.maxHeight = '60px';
            expandButton.textContent = 'Agrandir';
        }
    });

    return serverItem;
}

// Affichage de la liste de serveurs depuis Firebase
const serverList = document.getElementById('server-list');
serversRef.orderByChild('timestamp').on('child_added', (snapshot) => {
    const serverData = snapshot.val();
    const serverItem = createServerItem(serverData);
    serverList.insertBefore(serverItem, serverList.firstChild);
});
document.addEventListener('DOMContentLoaded', () => {
    const expandedCards = document.querySelectorAll('.server-card.expanded');
    expandedCards.forEach(card => {
        const expandButton = card.querySelector('.expand-button');
        const description = card.querySelector('.description');
        description.style.maxHeight = '60px';
        expandButton.textContent = 'Agrandir';
        card.classList.remove('expanded');
    });
});
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

function formatText(text, charsPerLine) {
    const words = text.split(' ');
    let lines = [];
    let currentLine = '';
    
    for (const word of words) {
        if ((currentLine + word).length <= charsPerLine) {
            currentLine += word + ' ';
        } else {
            lines.push(currentLine);
            currentLine = word + ' ';
        }
    }
    
    if (currentLine.trim() !== '') {
        lines.push(currentLine);
    }
    
    return lines.join('\n');
}
// Affichage de la liste de serveurs depuis Firebase
const serverList = document.getElementById('server-list');
serversRef.orderByChild('timestamp').on('child_added', (snapshot) => {
    const serverData = snapshot.val();
    const serverItem = document.createElement('div');
    serverItem.classList.add('server-card');
    serverItem.innerHTML = `
        <div class="server-avatar">
            <img src="${serverData.discordAvatar}" alt="Server Avatar">
        </div>
        <div class="server-details">
            <h2>${serverData.discordName}</h2>
            <p class="description">${formatText(serverData.discordDescription, 45)}</p>
            <button class="join-button" data-link="${serverData.discordLink}">Rejoindre</button>
        </div>
        <button class="expand-button">Agrandir</button>
    `;
    serverList.prepend(serverItem);

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
    const originalDescription = serverData.discordDescription; // Stocke la description originale

    expandButton.addEventListener('click', () => {
        if (description.style.maxHeight === 'none') {
            description.style.maxHeight = '60px';
            expandButton.textContent = 'Agrandir';
        } else {
            description.style.maxHeight = 'none';
            expandButton.textContent = 'Réduire';
        }
    });
});


// Gestion de la description et du nombre de caractères
const descriptionField = document.getElementById('discord-description');
const descriptionLengthSpan = document.getElementById('description-length');

descriptionField.addEventListener('input', () => {
    const maxLength = parseInt(descriptionField.getAttribute('maxlength'));
    const currentLength = descriptionField.value.length;

    if (currentLength > maxLength) {
        descriptionField.value = descriptionField.value.substring(0, maxLength);
    }

    descriptionLengthSpan.textContent = `${currentLength} / ${maxLength} characters`;
});

// Fonction pour tronquer la description
function truncateDescription(description) {
    const maxLength = 913;
    if (description.length > maxLength) {
        return description.substring(0, maxLength) + "...";
    }
    return description;
}

// Gestion de la soumission du formulaire
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
        alert('Please fill in all the fields.');
        return;
    }

    if (discordDescription.length < 50) {
        alert('Description must be at least 50 characters.');
        return;
    }

    // Vérification du lien d'invitation Discord
    if (!discordLink.startsWith('https://discord.gg/')) {
        alert('Discord Server Link must start with "https://discord.gg/".');
        return;
    }

    // Vérification si un serveur avec le même nom et lien existe déjà
    const serverExists = await checkServerExistence(discordName, discordLink);
    
    if (serverExists) {
        alert('A server with the same name and invitation link already exists.');
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

serversRef.orderByChild('timestamp').on('child_added', (snapshot) => {
    const serverData = snapshot.val();
    const serverItem = createServerItem(serverData);
    serverList.insertBefore(serverItem, serverList.firstChild);
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
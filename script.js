
    const postBtn = document.getElementById('postBtn');
    const messageInput = document.getElementById('message');
    const moodsList = document.getElementById('moodsList');
    const charCount = document.getElementById('charCount');
    const emojiPicker = document.querySelector('.emoji-picker');
    
    // Charger les moods depuis localStorage ou initialiser un tableau vide
    let moods = JSON.parse(localStorage.getItem('moods')) || [];

    // Sauvegarder les moods dans localStorage
    function saveMoods() {
      localStorage.setItem('moods', JSON.stringify(moods));
    }

    // Afficher tous les moods
    function renderMoods() {
      moodsList.innerHTML = ''; // Vider la liste
      
      // Nouveau: Gérer l'état vide
      if (moods.length === 0) {
        moodsList.innerHTML = `<p class="empty-state">Aucun mood pour le moment. Sois le premier !</p>`;
        return;
      }

      // Afficher les moods du plus récent au plus ancien
      moods.slice().reverse().forEach((mood) => {
        const card = document.createElement('div');
        card.classList.add('mood-card');
        
        // Nouveau: Formater l'horodatage
        const date = new Date(mood.timestamp);
        const formattedDate = date.toLocaleString('fr-FR', { 
          day: '2-digit', 
          month: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit' 
        });

        // Nouvelle structure de carte
        card.innerHTML = `
          <div class="mood-header">
            <p>${mood.emoji} ${mood.message}</p>
            <button class="delete-btn" data-id="${mood.id}">🗑️</button>
          </div>
          <div class="mood-footer">
            <div class="reactions">
              <span data-id="${mood.id}" data-type="force">💪 ${mood.reactions.force}</span>
              <span data-id="${mood.id}" data-type="lol">😂 ${mood.reactions.lol}</span>
              <span data-id="${mood.id}" data-type="deep">🧠 ${mood.reactions.deep}</span>
              <span data-id="${mood.id}" data-type="hug">🫂 ${mood.reactions.hug}</span>
            </div>
            <small class="timestamp">${formattedDate}</small>
          </div>
        `;
        moodsList.appendChild(card);
      });
      
      // Attacher les écouteurs d'événements après avoir créé les cartes
      attachEventListeners();
    }
    
    // Fonction pour attacher les écouteurs (réactions et suppression)
    function attachEventListeners() {
      // Écouteurs pour les réactions
      moodsList.querySelectorAll('.reactions span').forEach(span => {
        span.addEventListener('click', () => {
          const id = span.getAttribute('data-id');
          const type = span.getAttribute('data-type');
          
          // Trouver le mood correspondant par son ID
          const mood = moods.find(m => m.id == id);
          if (mood) {
            mood.reactions[type]++;
            saveMoods();
            renderMoods(); // Re-afficher pour mettre à jour les comptes
          }
        });
      });
      
      // Nouveau: Écouteurs pour la suppression
      moodsList.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          deleteMood(id);
        });
      });
    }

    // Nouveau: Fonction de suppression
    function deleteMood(id) {
      // Confirmer la suppression
      if (confirm("Es-tu sûr de vouloir supprimer ce mood ?")) {
        // Recréer le tableau sans le mood supprimé
        moods = moods.filter(m => m.id != id);
        saveMoods();
        renderMoods();
      }
    }

    // Événement pour la publication
    postBtn.addEventListener('click', () => {
      // Nouveau: Récupérer l'emoji depuis le sélecteur visuel
      const selectedEmojiEl = emojiPicker.querySelector('.emoji-option.selected');
      const emoji = selectedEmojiEl.getAttribute('data-value');
      const message = messageInput.value.trim();

      if (!message) {
        alert("N'oublie pas d'écrire ton mood !");
        return;
      }
      
      // Nouveau: Feedback sur le bouton
      postBtn.disabled = true;
      postBtn.textContent = 'Publication...';

      // Créer le nouvel objet mood avec ID et timestamp
      const newMood = {
        id: Date.now(), // ID unique basé sur le timestamp
        emoji,
        message,
        timestamp: new Date().toISOString(), // Date actuelle au format ISO
        reactions: { force: 0, lol: 0, deep: 0, hug: 0 }
      };
      
      moods.push(newMood);

      messageInput.value = ''; // Vider le champ
      charCount.textContent = '0'; // Réinitialiser le compteur
      
      // Simuler un léger délai pour le feedback (optionnel, mais sympa)
      setTimeout(() => {
        saveMoods();
        renderMoods();
        
        // Réactiver le bouton
        postBtn.disabled = false;
        postBtn.textContent = 'Publier';
      }, 200); // 200ms
    });

    // Nouveau: Événement pour le compteur de caractères
    messageInput.addEventListener('input', () => {
      const count = messageInput.value.length;
      charCount.textContent = count;
      // Changer la couleur si on approche de la limite
      if (count > 100) {
        charCount.style.color = '#e74c3c';
      } else {
        charCount.style.color = 'var(--text-muted)';
      }
    });
    
    // Nouveau: Événement pour le sélecteur d'emoji
    emojiPicker.querySelectorAll('.emoji-option').forEach(option => {
      option.addEventListener('click', () => {
        // Retirer 'selected' de l'ancien
        emojiPicker.querySelector('.emoji-option.selected').classList.remove('selected');
        // Ajouter 'selected' au nouveau
        option.classList.add('selected');
      });
    });

    // Afficher les moods au chargement de la page
    renderMoods();
 

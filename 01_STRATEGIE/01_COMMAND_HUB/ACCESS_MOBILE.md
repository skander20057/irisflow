# 📱 ACCÈS MOBILE : CLOUDFLARE BRIDGE (V80.9)

Ce guide t'explique comment obtenir une URL sécurisée (type `https://ton-cockpit.trycloudflare.com`) pour piloter IRIS OS depuis ton téléphone, sans rien installer de complexe sur ton Mac.

---

## ⚡ ÉTAPE 1 : Préparation du Pont
Puisque tu n'as pas Homebrew, nous allons utiliser un script "Zero-Install" qui télécharge l'outil Cloudflare uniquement dans ton dossier de travail.

1.  Ouvre ton terminal.
2.  Exécute cette commande pour préparer le pont :
    ```bash
    chmod +x "01_STRATEGIE/01_COMMAND_HUB/bridge.sh"
    ```

---

## 🚀 ÉTAPE 2 : Lancement du Tunnel
Pour ouvrir ton cockpit sur le web, lance simplement le script :
```bash
./"01_STRATEGIE/01_COMMAND_HUB/bridge.sh"
```

**Une fois lancé, surveille ton terminal :**
- Une ligne apparaîtra avec une adresse finissant par `.trycloudflare.com`.
- **Copie cette adresse** et ouvre-la sur ton smartphone.

---

## 📲 ÉTAPE 3 : Mode "App" sur ton Téléphone
Une fois l'URL ouverte sur ton mobile :

### Sur iPhone (Safari) :
- Clique sur l'icône **Partager** (le carré avec une flèche vers le haut).
- Sélectionne **"Sur l'écran d'accueil"**.

### Sur Android (Chrome) :
- Clique sur les **3 petits points**.
- Sélectionne **"Installer l'application"**.

---

## 🛡️ SÉCURITÉ SOUVERAINE
- **Confidentialité** : Ton PC reste le seul détenteur des fichiers. Cloudflare ne fait que passer les images et les commandes.
- **Auto-Fermeture** : Dès que tu fermes le script dans ton terminal, l'accès mobile est instantanément coupé.

---
*Digital Flux — Liberté Totale V80.9*

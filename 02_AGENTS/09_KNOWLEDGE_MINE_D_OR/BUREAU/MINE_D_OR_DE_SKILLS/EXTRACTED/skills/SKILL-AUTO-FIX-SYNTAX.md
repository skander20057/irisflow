# 💎 SKILL ÉLITE : AUTO-FIX-SYNTAX
- **ID** : SKILL-AUTO-FIX-SYNTAX
- **Agent** : AGENT_CYBER_DEBUG
- **Domaine** : Stabilité & Infrastructure
- **Version** : 1.5

## 🎯 PROTOCOLE DE RÉPARATION
1.  **Analyse de l'Erreur** : Lire le briefing de REPAIR_MISSION pour identifier la ligne et le type d'erreur (ex: missing bracket, syntax error).
2.  **Consultation du Backup** : Comparer le fichier corrompu avec son `.bak` généré par Cyber-Guard.
3.  **Localisation Chirurgicale** : Utiliser `grep` ou une lecture directe pour trouver la ligne exacte.
4.  **Correction Automatisée** :
    -   Pour une parenthèse/accolade manquante : Ajouter le caractère manquant à la fin du bloc logique.
    -   Pour une déclaration manquante : Restaurer depuis le backup ou déduire du contexte.
5.  **Validation Post-Op** : Exécuter `node --check` sur le fichier réparé.
6.  **Signature** : Marquer la mission comme `# STATUS: DONE` une fois validé.

## 📝 NOTES TACTIQUES
- Toujours vérifier que le fichier corrompu est plus récent que le backup avant d'écraser.
- Si l'erreur persiste après 2 tentatives, escalader en créant une alerte système critique pour le COO.
- **NE JAMAIS** supprimer de code métier lors de la réparation.

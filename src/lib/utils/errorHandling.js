export default class AppError extends Error {
  // Initialise le paramètre 'message' avec une valeur par défaut
  constructor(message = "An error has occured") {
    // Appelle le constructeur de la classe parente (Error)
    // ET définit la propriété 'message' de l'instance
    super(message);

    // Définit le nom de l'erreur personnalisée
    // Utile pour identifier le type d'erreur dans les logs
    this.name = "AppError";
  }
}

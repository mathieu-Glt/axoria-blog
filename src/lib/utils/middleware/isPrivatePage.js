// Fonction asynchrone qui vérifie si un chemin (URL) est une page privée
export async function isPrivatePage(pathname) {
  // Tableau contenant tous les chemins des pages privées
  const privateSegments = [
    "/dashboard", // Page dashboard principale
    "/dashboard/edit", // Page d'édition
    "/dashboard/create", // Page de création
    "settings/profile", // Page profil (⚠️ manque "/" au début)
  ];

  // Vérifie si le pathname correspond à une page privée
  return privateSegments.some(
    // Pour chaque segment, vérifie si :
    (segment) =>
      pathname === segment || // Le chemin est exactement égal AU segment
      pathname.startsWith(segment + "/"), // OU le chemin commence par le segment + "/"
  );
}

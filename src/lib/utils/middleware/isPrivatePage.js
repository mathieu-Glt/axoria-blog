// Fonction asynchrone qui vérifie si un chemin (URL) est une page privée
export async function isPrivatePage(pathname) {
  // Tableau contenant tous les chemins des pages privées
  const privateSegments = [
    "/dashboard", 
    "/dashboard/edit", 
    "/dashboard/create", 
    "settings/profile", 
  ];

  // Vérifie si le pathname correspond à une page privée
  return privateSegments.some(
    // Pour chaque segment, vérifie si :
    (segment) =>
      pathname === segment || // Le chemin est exactement égal AU segment
      pathname.startsWith(segment + "/"), // OU le chemin commence par le segment + "/"
  );
}

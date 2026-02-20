"use server";

/**
 * Ce fichier est déjà un Server-side module
Ce fichier contient des Server Actions / fonctions serveur, mais il y a une nuance importante :
"use server" vs module serveur implicite
Ce fichier n'a pas besoin de "use server" car :

"use server" est réservé aux Server Actions (fonctions appelées depuis le client via des formulaires ou fetch implicite)
Tes fonctions sont des utilitaires serveur classiques appelés directement depuis des Server Components
 */

import { Session } from "@/lib/models/Session";
import { User } from "@/lib/models/User";
import { connectToDB } from "@/lib/utils/db/connectToDB";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import slugify from "slugify";
import AppError from "@/lib/utils/errorHandling";
import { revalidateTag } from "next/cache";

export async function register(formData) {
  const { userName, email, password, passwordRepeat } =
    Object.fromEntries(formData);

  if (typeof userName !== "string" || userName.trim().length < 3) {
    //throw new AppError("Username must be at least 3 characters long.");
    return {
      success: false,
      message: "Username must be at least 3 characters long.",
    };
  }

  if (typeof password !== "string" || password.trim().length < 6) {
    //throw new AppError("Password must be at least 6 characters long.");
    return {
      success: false,
      message: "Password must be at least 6 characters long.",
    };
  }

  if (password !== passwordRepeat) {
    //throw new AppError("Passwords do not match");
    return {
      success: false,
      message: "Passwords do not match",
    };
  }
  // entre chaque crochet il faut tout caractères sauf un espace et un @ [^\s@]
  /**
   * La Regex : /^[^\s@]+@[^\s@]+\.[^\s@]+$/
Décortiquons cette expression régulière partie par partie :

^ : Début de la chaîne
[^\s@]+ :

[^\s@] = n'importe quel caractère SAUF (^) un espace blanc (\s) ou un @
+ = une ou plusieurs fois
→ Cette partie capture la partie avant le @ (le nom d'utilisateur)


@ : Le symbole @ littéral (obligatoire)
[^\s@]+ :

Même logique que précédemment
→ Capture le nom de domaine (avant le point)


\. :

Le point littéral (échappé avec \ car . a une signification spéciale en regex)


[^\s@]+ :

Encore la même logique
→ Capture l'extension (com, fr, org, etc.)


$ : Fin de la chaîne

Le Code de Validation
javascriptif (typeof email !== "string" || !emailRegex.test(email.trim())) {
  throw new AppError("Invalid email format");
}
Deux vérifications successives :

typeof email !== "string" : Vérifie que la variable email est bien une chaîne de caractères
!emailRegex.test(email.trim()) :

email.trim() enlève les espaces au début et à la fin
emailRegex.test() teste si l'email correspond au pattern
Le ! inverse le résultat (on veut détecter les emails invalides)



Si l'une de ces conditions est vraie → une erreur est levée
Exemples
✅ Valides :

user@example.com
jean.dupont@domaine.fr
test123@site.org

❌ Invalides :

user@example (pas de point après le domaine)
@example.com (pas de nom d'utilisateur)
user @example.com (espace dans l'email)
user@@example.com (double @)

Note : Cette regex est basique et acceptera des emails qui ne sont pas techniquement valides selon la RFC 5322, mais elle convient pour la plupart des cas d'usage courants.
   */
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (typeof email !== "string" || !emailRegex.test(email.trim())) {
    throw new AppError("Invalid email format");
  }

  try {
    await connectToDB();

    /**
     * findOne() : Méthode qui cherche un seul document dans la base de données qui correspond aux critères
$or : Opérateur MongoDB qui fonctionne comme un OU logique
[{ userName }, { email }] : Tableau de conditions à tester
Signification
Cette requête cherche un utilisateur qui correspond à AU MOINS UNE de ces conditions :

Le champ userName correspond à la valeur de la variable userName
OU le champ email correspond à la valeur de la variable email

Équivalent en SQL
sqlSELECT * FROM users 
WHERE userName = 'valeur' OR email = 'valeur@email.com' 
LIMIT 1;
     */
    const user = await User.findOne({
      $or: [{ userName }, { email }],
    });

    if (user) {
      throw new AppError(
        user.userName === userName
          ? "Username already exists"
          : "Email already exists",
      );
    }

    const normalizedUserName = slugify(userName, { lower: true, strict: true });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      userName,
      normalizedUserName,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    return {
      success: true,
      message: `The user ${userName} has been registered`,
    };
  } catch (error) {
    /*if (error instanceof AppError) {
      throw error;
    }*/
    //throw new Error("An error occured while registering the user");
    return {
      success: false,
      message: "An error occurred while registering the user",
    };
  }
}
export async function login(formData) {
  const { email, password } = Object.fromEntries(formData);

  try {
    await connectToDB();
    const user = await User.findOne({ email: email });

    if (!user) {
      return { success: false, message: "Invalid credentials" }; // ⚠️ RETURN, pas throw
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return { success: false, message: "Invalid credentials" }; // ⚠️ RETURN, pas throw
    }

    let session;
    const existingSession = await Session.findOne({
      userId: user._id,
      expiresAt: { $gt: new Date() },
    });

    if (existingSession) {
      session = existingSession;
      session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await session.save();
    } else {
      session = new Session({
        userId: user._id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      await session.save();
    }

    const cookieStore = await cookies();
    cookieStore.set("sessionId", session._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
      sameSite: "lax",
    });
    revalidateTag("auth-session");
    return {
      success: true,
      message: "User has been connected",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "An error occurred while login the user",
    };
  }
}

export async function logOut() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionId")?.value;

  try {
    await Session.findByIdAndDelete(sessionId);

    cookieStore.set("sessionId", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0, //supprime immédiatement le cookie
      sameSite: "strict",
    });
    revalidateTag("auth-session");
    return { success: true };
  } catch (error) {
  }
}

export async function SAsessionInfo() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionId")?.value;

  if (!sessionId) {
    return { success: false, userId: null };
  }

  await connectToDB();

  const session = await Session.findById(sessionId);

  if (!session || session.expiresAt < new Date()) {
    return { success: false, userId: null };
  }

  const user = await User.findById(session.userId);

  if (!user) {
    return { success: false, userId: null };
  }

  return {
    success: true,
    userId: user._id.toString(),
    userEmail: user.email.toString(),
  };
}

"use server";

/**
 * Utilisation de use server zeulment depuis un composant client qui fait une requete fetch ou un form
 * Ce fichier est déjà un Server-side module
Ce fichier contient des Server Actions / fonctions serveur, mais il y a une nuance importante :
"use server" vs module serveur implicite
Ce fichier n'a pas besoin de "use server" car :

"use server" est réservé aux Server Actions (fonctions appelées depuis le client via des formulaires ou fetch implicite)
Tes fonctions sont des utilitaires serveur classiques appelés directement depuis des Server Components
 */

import { connectToDB } from "@/lib/utils/db/connectToDB";
import { Post } from "@/lib/models/Post";
import { Tag } from "@/lib/models/Tag";
import slugify from "slugify";
import { marked } from "marked";
import { JSDOM } from "jsdom";
import createDOMPurify from "dompurify";
import Prism from "prismjs";
import { markedHighlight } from "marked-highlight";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-css";
import "prismjs/components/prism-javascript";
import AppError from "@/lib/utils/errorHandling";
import { sessionInfo } from "@/lib/serverMethods/session/sessionMethods";
import sharp from "sharp";
import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { getPostForEdit } from "@/lib/serverMethods/blog/postMethods";
import areTagSimilar, { generateUniqueSlug } from "@/lib/utils/general/utils";
import { findOrCreateTag } from "@/lib/serverMethods/tag/tagMethods";
import { uploadToCloudinary } from "@/lib/utils/upload/uploadToCloudinary";

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

export async function addPost(formData) {
  const { title, markdownArticle, tags, coverImage } =
    Object.fromEntries(formData);

  try {
    if (typeof title !== "string" || title.trim().length < 3) {
      throw new AppError("Invalid data");
    }

    if (
      typeof markdownArticle !== "string" ||
      markdownArticle.trim().length < 3
    ) {
      throw new AppError("Invalid data");
    }

    await connectToDB();

    const session = await sessionInfo();
    if (!session.success) {
      throw new AppError("Authentication required");
    }

    // VALIDATION DU FICHIER
    if (!coverImage || !(coverImage instanceof File)) {
      throw new AppError("Invalid data");
    }

    const validImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];
    const validPdfType = "application/pdf";
    const allValidTypes = [...validImageTypes, validPdfType];

    if (!allValidTypes.includes(coverImage.type)) {
      throw new AppError("Invalid file type");
    }

    const maxSize = 5 * 1024 * 1024;
    if (coverImage.size > maxSize) {
      throw new AppError("File too large. Maximum size is 5MB");
    }

    const fileBuffer = Buffer.from(await coverImage.arrayBuffer());

    // VALIDATION DES DIMENSIONS (IMAGES UNIQUEMENT)
    if (validImageTypes.includes(coverImage.type)) {
      const { width, height } = await sharp(fileBuffer).metadata();
      if (width > 1280 || height > 720) {
        throw new AppError("Image exceeds 1280x720 dimensions");
      }
    }

    // UPLOAD CLOUDINARY
    const uniqueFileName = `${crypto.randomUUID()}_${coverImage.name.trim()}`;
    const publicImageUrl = await uploadToCloudinary(fileBuffer, uniqueFileName);

    if (typeof tags !== "string") {
      throw new AppError("Invalid data");
    }
    const tagNamesArray = JSON.parse(tags);
    if (!Array.isArray(tagNamesArray)) {
      throw new AppError("Tags must be a valid array");
    }

    const tagIds = await Promise.all(
      tagNamesArray.map(async (tagName) => {
        const normalizedTagName = tagName.trim().toLowerCase();
        let tag = await Tag.findOne({ name: normalizedTagName });
        if (!tag) {
          tag = await Tag.create({
            name: normalizedTagName,
            slug: slugify(normalizedTagName, { strict: true }),
          });
        }
        return tag._id;
      }),
    );

    // GESTION DU MARKDOWN
    marked.use(
      markedHighlight({
        highlight: (code, language) => {
          const validLanguage = Prism.languages[language]
            ? language
            : "plaintext";
          return Prism.highlight(
            code,
            Prism.languages[validLanguage],
            validLanguage,
          );
        },
      }),
    );

    let markdownHTMLResult = marked(markdownArticle);
    markdownHTMLResult = DOMPurify.sanitize(markdownHTMLResult);

    const newPost = new Post({
      title,
      markdownArticle,
      markdownHTMLResult,
      tags: tagIds,
      coverImageUrl: publicImageUrl,
      author: session.userId,
    });

    const savePost = await newPost.save();

    return { success: true, message: "Post saved", slug: savePost.slug };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new Error("An error occured while creating the post");
  }
}

export async function editPost(formData) {
  const { id, slug, title, markdownArticle, coverImage, tags } =
    Object.fromEntries(formData);

  try {
    await connectToDB();

    const session = await sessionInfo();
    if (!session.success) {
      throw new AppError("Authentication required");
    }

    const post = await getPostForEdit(id);
    if (!post) {
      throw new AppError("Post not found");
    }

    const updatedPost = {};

    if (typeof title !== "string" || title.trim().length < 3) {
      throw new AppError("Invalid title");
    }

    if (title.trim() !== post.title) {
      updatedPost.title = title.trim();
    }

    if (
      typeof markdownArticle !== "string" ||
      markdownArticle.trim().length < 3
    ) {
      throw new AppError("Invalid content");
    }

    if (markdownArticle.trim() !== post.markdownArticle) {
      updatedPost.markdownArticle = markdownArticle;

      marked.use(
        markedHighlight({
          highlight: (code, language) => {
            const validLanguage = Prism.languages[language]
              ? language
              : "plaintext";
            return Prism.highlight(
              code,
              Prism.languages[validLanguage],
              validLanguage,
            );
          },
        }),
      );

      updatedPost.markdownHTMLResult = DOMPurify.sanitize(
        marked(markdownArticle),
      );
    }

    if (coverImage && coverImage instanceof File && coverImage.size > 0) {
      const validImageTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      const validPdfType = "application/pdf";
      const allValidTypes = [...validImageTypes, validPdfType];

      if (!allValidTypes.includes(coverImage.type)) {
        throw new AppError("Invalid file type");
      }

      const maxSize = 5 * 1024 * 1024;
      if (coverImage.size > maxSize) {
        throw new AppError("File too large. Maximum size is 5MB");
      }

      const fileBuffer = Buffer.from(await coverImage.arrayBuffer());

      if (validImageTypes.includes(coverImage.type)) {
        const { width, height } = await sharp(fileBuffer).metadata();
        if (width > 1280 || height > 720) {
          throw new AppError("Image exceeds 1280x720 dimensions");
        }
      }

      // UPLOAD CLOUDINARY
      const uniqueFileName = `${crypto.randomUUID()}_${coverImage.name.trim()}`;
      updatedPost.coverImageUrl = await uploadToCloudinary(
        fileBuffer,
        uniqueFileName,
      );
    }

    if (typeof tags === "string") {
      const tagNamesArray = JSON.parse(tags);

      if (!Array.isArray(tagNamesArray)) {
        throw new AppError("Tags must be an array");
      }

      if (!areTagSimilar(tagNamesArray, post.tags)) {
        const tagIds = await Promise.all(
          tagNamesArray.map((tag) => findOrCreateTag(tag)),
        );
        updatedPost.tags = tagIds;
      }
    }

    if (Object.keys(updatedPost).length === 0) {
      throw new AppError("No changes detected");
    }

    // SAVE
    const savedPost = await Post.findByIdAndUpdate(post._id, updatedPost, {
      new: true,
    });

    revalidatePath(`/articles/${post.slug}`);
    if (updatedPost.slug) {
      revalidatePath(`/articles/${updatedPost.slug}`);
    }

    return {
      success: true,
      message: "Post updated successfully",
      slug: savedPost.slug,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new Error("An error occurred while editing the post");
  }
}

export async function deletePost(id) {
  try {
    await connectToDB();

    const user = await sessionInfo();
    if (!user) {
      throw new AppError("Authentication required");
    }

    const post = await Post.findById(id);

    if (!post) {
      throw new AppError("Post not found");
    }

    await Post.findByIdAndDelete(id);

    // if (post.coverImageUrl) {
    //   const fileName = post.coverImageUrl.split("/").pop();
    //   const deleteUrl = `${process.env.BUNNY_STORAGE_HOST}/${process.env.BUNNY_STORAGE_ZONE}/${fileName}`;
    //   const response = fetch(deleteUrl, {
    //     method: "DELETE",
    //     headers: { AccessKey: process.env.BUNNY_STORAGE_API_KEY },
    //   });

    //   if (!response.ok) {
    //     throw new AppError(
    //       `Failed to delete image : ${(await response).statusText}`,
    //     );
    //   }
    // }
    revalidatePath(`/article/${post.slug}`);
  } catch (error) {
    throw new Error("An error occured while deleting the post");
  }
}

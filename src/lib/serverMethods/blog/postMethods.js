import { Post } from "@/lib/models/Post";
import { Tag } from "@/lib/models/Tag";
import { User } from "@/lib/models/User";
import { connectToDB } from "@/lib/utils/db/connectToDB";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import AppError from "@/lib/utils/errorHandling";

export const dynamic = "force-static";
export async function getPost(slug) {
  await connectToDB();

  let post;
  try {
    post = await Post.findOne({ slug })
      .populate({
        path: "author",
        select: "userName normalizedUserName",
      })
      .populate({
        path: "tags",
        select: "name slug",
      });
  } catch (error) {
    console.log("Error while fetching a post:", error);
    throw new Error("Failed to fetch post");
  }

  console.log("postMethod - getPost - post:", post);

  if (!post) null;

  return post;
}
export async function getPosts() {
  try {
    await connectToDB();

    const posts = await Post.find({})
      .populate({
        path: "author",
        select: "userName normalizedUserName",
      })
      .populate({
        path: "tags",
        select: "name slug",
      })
      .sort({ createdAt: -1 })
      .lean(); // ✅ Ajoutez .lean();
    // ✅ Convertir tous les ObjectId en strings
    return posts.map((post) => ({
      ...post,
      _id: post._id.toString(),
      author: {
        ...post.author,
        _id: post.author._id.toString(),
      },
      tags: post.tags.map((tag) => ({
        ...tag,
        _id: tag._id.toString(),
      })),
    }));
  } catch (error) {
    console.log("Error while fetch posts : ", error);
    throw new Error("Failed to fetch posts");
  }
}

export async function getUserPostsFromUserID(userId) {
  try {
    await connectToDB();
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new AppError("Invalid user ID");
    }
    const posts = await Post.find({ author: userId })
      .populate({
        path: "author",
        select: "userName normalizedUserName",
      })
      .populate({
        path: "tags",
        select: "name slug",
      })
      .sort({ createdAt: -1 })
      .lean(); // ✅ Convertit en objets plain JavaScript

    // ✅ Convertir les ObjectId en strings
    return posts.map((post) => ({
      ...post,
      _id: post._id.toString(),
      author: {
        ...post.author,
        _id: post.author._id.toString(),
      },
      tags: post.tags.map((tag) => ({
        ...tag,
        _id: tag._id.toString(),
      })),
    }));
  } catch (error) {
    console.log("Error while fetch posts from user id:", error);
    throw new Error("Failed to fetch posts");
  }
}

export async function getPostsByTag(tagSlug) {
  await connectToDB();

  try {
    const tag = await Tag.findOne({ slug: tagSlug });
    if (!tag) {
      notFound();
    }

    const posts = await Post.find({ tags: tag._id })
      .populate({
        path: "author",
        select: "userName",
      })
      .select("title coverImageUrl slug createdAt")
      .sort({ createdAt: -1 });

    return posts;
  } catch (error) {
    console.log("Error while fetch posts by tag:", error);
    throw new Error("Failed to fetch posts by tag");
  }
}

export async function getPostsByAuthor(normalizedUserName) {
  await connectToDB();

  let author;
  let posts;

  try {
    author = await User.findOne({ normalizedUserName }).lean(); // ✅ .lean()

    posts = await Post.find({ author: author?._id })
      .populate({
        path: "author",
        select: "userName normalizedUserName",
      })
      .select("title coverImageUrl slug createdAt")
      .sort({ createdAt: -1 })
      .lean(); // ✅ .lean()
  } catch (error) {
    console.log("Error while fetch posts by author:", error);
    throw new Error("Failed to fetch posts by author");
  }

  if (!author) notFound();

  // ✅ Convertir les ObjectId en strings
  return {
    author: {
      ...author,
      _id: author._id.toString(),
    },
    posts: posts.map((post) => ({
      ...post,
      _id: post._id.toString(),
      author: {
        ...post.author,
        _id: post.author._id.toString(),
      },
    })),
  };
}

export async function getPostForEdit(id) {
  await connectToDB();

  let post;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid post ID");
  }
  try {
    post = await Post.findOne({ _id: id })
      .populate({
        path: "author",
        select: "userName normalizedUserName",
      })
      .populate({
        path: "tags",
        select: "name slug",
      })
      .lean();
    console.log("getPostForEdit : ", post);
  } catch (error) {
    console.log("Error while fetching post for edit:", error);
    throw new Error("Failed to fetch post for edit");
  }

  if (!post) notFound();

  return {
    ...post,
    _id: post._id.toString(),
    author: {
      ...post.author,
      _id: post.author._id.toString(),
    },
    tags: post.tags.map((tag) => ({
      ...tag,
      _id: tag._id.toString(),
    })),
  };
}

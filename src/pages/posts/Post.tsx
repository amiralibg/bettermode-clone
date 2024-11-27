import React from "react";
import { gql, useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import ReactionButton from "@/components/Buttons/ReactionButtons";

// HTML decoding utility function
const decodeHTML = (html: string) => {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  const decodedOnce = txt.value;
  // Second decode to handle double encoding
  txt.innerHTML = decodedOnce;
  return txt.value;
};

const PostSkeleton = () => {
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        {/* Cover image skeleton */}
        <div className="w-full h-[476px] bg-gray-700 rounded-lg mb-6 animate-pulse" />

        {/* Title skeleton */}
        <div className="h-8 bg-gray-700 rounded w-3/4 mb-4 animate-pulse" />

        {/* Meta info skeleton */}
        <div className="flex items-center text-sm gap-4">
          <div className="h-4 bg-gray-700 rounded w-24 animate-pulse" />
          <div className="h-4 bg-gray-700 rounded w-32 animate-pulse" />
        </div>
      </CardHeader>
      <CardContent>
        {/* Content skeleton */}
        <div className="space-y-4">
          <div className="h-4 bg-gray-700 rounded w-full animate-pulse" />
          <div className="h-4 bg-gray-700 rounded w-5/6 animate-pulse" />
          <div className="h-4 bg-gray-700 rounded w-4/6 animate-pulse" />
          <div className="h-4 bg-gray-700 rounded w-full animate-pulse" />
          <div className="h-4 bg-gray-700 rounded w-3/4 animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
};

// Content renderer component
const ContentRenderer = ({ content }: { content: string }) => {
  const decodedContent = React.useMemo(() => {
    try {
      const trimmedContent = content.replace(/^"|"$/g, "");
      const decoded = decodeHTML(trimmedContent);
      return decoded.replace(/\\"/g, '"');
    } catch (error) {
      console.error("Error decoding content:", error);
      return "";
    }
  }, [content]);

  return (
    <div
      className="prose dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: decodedContent }}
    />
  );
};

const GET_POST = gql`
  query GetPost($id: ID!) {
    post(id: $id) {
      id
      slug
      title
      description
      shortContent
      createdAt
      publishedAt
      status
      reactionsCount
      fields {
        key
        value
        relationEntities {
          medias {
            ... on Image {
              url
              urls {
                medium
              }
            }
          }
        }
      }
      thumbnail {
        ... on Image {
          url
          urls {
            medium
          }
        }
      }
      space {
        name
        image {
          ... on Image {
            url
          }
        }
      }
    }
  }
`;

interface PostImage {
  url?: string;
  urls?: {
    medium?: string;
  };
}

interface PostField {
  key: string;
  value: string;
  relationEntities?: {
    medias?: Array<{
      url?: string;
      urls?: {
        medium?: string;
      };
    }>;
  };
}

interface Post {
  id: string;
  slug: string;
  title: string;
  description?: string;
  shortContent?: string;
  createdAt: string;
  publishedAt?: string;
  status: string;
  reactionsCount: number;
  fields: PostField[];
  thumbnail?: PostImage;
  space?: {
    name: string;
    image?: PostImage;
  };
}

interface PostData {
  post: Post;
}

function Post() {
  const { postId } = useParams<{ postId: string }>();

  const { loading, error, data } = useQuery<PostData>(GET_POST, {
    variables: { id: postId },
    fetchPolicy: "cache-first",
  });

  if (loading) {
    return <PostSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-red-500">Error: {error.message}</p>
      </div>
    );
  }

  const post = data?.post;

  if (!post) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Post not found</p>
      </div>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        {post.fields.map(
          (field: PostField, index: number) =>
            field.key === "coverImage" &&
            field?.relationEntities?.medias?.[0]?.urls?.medium && (
              <img
                key={`cover-${index}`}
                src={field.relationEntities.medias[0].urls.medium}
                alt={post.title}
                className="rounded-lg w-full h-[476px] mb-6 bg-gray-700 object-cover"
              />
            ),
        )}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">{post.title}</h1>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          {post.space?.name && <span className="mr-4">{post.space.name}</span>}
          <span>
            {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
          </span>
        </div>
        <ReactionButton
          postId={post.id}
          initialReactionCount={post.reactionsCount}
        />
      </CardHeader>
      <CardContent>
        {post.fields?.length > 0 && (
          <div className="mt-4">
            {post.fields.map(
              (field: PostField, index: number) =>
                field.key === "content" && (
                  <div key={`${field.key}-${index}`}>
                    {field.key === "content" && (
                      <ContentRenderer content={field.value} />
                    )}
                  </div>
                ),
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default Post;

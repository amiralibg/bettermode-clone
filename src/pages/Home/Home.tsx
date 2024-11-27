import { gql, useQuery } from "@apollo/client";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import ReactionButton from "@/components/Buttons/ReactionButtons";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const GET_POSTS = gql`
  query GetPosts($limit: Int!, $after: String) {
    posts(limit: $limit, after: $after) {
      totalCount
      pageInfo {
        endCursor
        hasNextPage
      }
      nodes {
        id
        title
        slug
        description
        shortContent
        createdAt
        publishedAt
        reactionsCount
        owner {
          member {
            name
            profilePicture {
              ... on Image {
                url
                urls {
                  medium
                }
              }
            }
          }
        }
        relativeUrl
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
  }
`;

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
  title: string;
  slug: string;
  description: string;
  shortContent: string;
  createdAt: string;
  publishedAt: string;
  reactionsCount: number;
  owner: {
    member: {
      name: string;
      profilePicture?: {
        url?: string;
        urls?: {
          medium?: string;
        };
      };
    };
  };
  relativeUrl: string;
  fields: PostField[];
  space: {
    name: string;
    image?: {
      url?: string;
    };
  };
}

interface PostsData {
  posts: {
    totalCount: number;
    pageInfo: {
      endCursor: string;
      hasNextPage: boolean;
    };
    nodes: Post[];
  };
}

const PostSkeleton = () => {
  return (
    <Card className="h-full">
      <CardContent className="p-4 h-full flex flex-col justify-between">
        <div className="w-full">
          {/* Image skeleton */}
          <div className="w-full h-[200px] bg-gray-700 rounded-lg mb-6 animate-pulse" />

          <div className="flex items-center justify-between mb-4">
            {/* Author info skeleton */}
            <div className="flex items-center ">
              <div className="w-6 h-6 rounded-full bg-gray-700 animate-pulse mr-3" />
              <div className="space-y-2">
                <div className="h-4 w-24 bg-gray-700 rounded animate-pulse" />
                <div className="h-3 w-20 bg-gray-700 rounded animate-pulse" />
              </div>
            </div>

            {/* Reaction button skeleton */}
            <div className="flex items-center gap-2 mt-4">
              <div className="w-5 h-5 bg-gray-700 rounded animate-pulse" />
              <div className="w-8 h-4 bg-gray-700 rounded animate-pulse" />
            </div>
          </div>

          {/* Title skeleton */}
          <div className="h-6 bg-gray-700 rounded w-3/4 mb-2 animate-pulse" />

          {/* Description skeleton */}
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-gray-700 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-700 rounded w-5/6 animate-pulse" />
            <div className="h-4 bg-gray-700 rounded w-4/6 animate-pulse" />
          </div>
        </div>

        {/* Date skeleton */}
        <div className="h-4 bg-gray-700 rounded w-24 animate-pulse" />
      </CardContent>
    </Card>
  );
};

const SkeletonGrid = () => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, index) => (
        <div key={`skeleton-${index}`} className="h-full">
          <PostSkeleton />
        </div>
      ))}
    </div>
  );
};

const PostCard = ({ post, isHovered }: { post: Post; isHovered: boolean }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        filter: isHovered ? "blur(2px)" : "blur(0px)",
        scale: isHovered ? 0.98 : 1,
      }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className="h-full hover:scale-[1.01] hover:shadow-xl transition-all duration-200 ease-in-out">
        <CardContent className="p-4 h-full flex flex-col justify-between gap-4">
          <div className="w-full">
            {post.fields.map(
              (field, index) =>
                field.key === "coverImage" &&
                field?.relationEntities?.medias?.[0]?.urls?.medium && (
                  <img
                    key={`cover-${index}`}
                    src={field.relationEntities.medias[0].urls.medium}
                    alt={post.title}
                    className="rounded-lg mb-6 h-[200px] bg-gray-700 object-cover w-full"
                  />
                ),
            )}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center ">
                {post.owner.member.profilePicture?.urls?.medium && (
                  <img
                    src={post.owner.member.profilePicture.urls.medium}
                    alt={post.owner.member.name}
                    className="w-6 h-6 object-cover rounded-full mr-3"
                  />
                )}
                <div>
                  <p className="font-semibold">{post.owner.member.name}</p>
                  <p className="text-sm text-gray-900 dark:text-gray-200">
                    {post.space.name}
                  </p>
                </div>
              </div>
              <ReactionButton
                postId={post.id}
                initialReactionCount={post.reactionsCount}
              />
            </div>
            <h2 className="text-lg font-semibold mb-2">{post.title}</h2>
            <p className="text-gray-800 dark:text-gray-300 mb-4 line-clamp-3">
              {post.description || post.shortContent}
            </p>
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-400">
            {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

function Home() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const POSTS_PER_PAGE = 6;

  const { loading, error, data, fetchMore } = useQuery<PostsData>(GET_POSTS, {
    variables: {
      limit: POSTS_PER_PAGE,
      after: null,
    },
    fetchPolicy: "cache-first",
    notifyOnNetworkStatusChange: true,
  });

  const loadMore = () => {
    const currentEndCursor = data?.posts.pageInfo.endCursor;

    fetchMore({
      variables: {
        limit: POSTS_PER_PAGE,
        after: currentEndCursor,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;

        return {
          posts: {
            ...prev.posts,
            nodes: fetchMoreResult.posts.nodes,
            pageInfo: fetchMoreResult.posts.pageInfo,
            totalCount: fetchMoreResult.posts.totalCount,
          },
        };
      },
    });
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-red-500">Error: {error.message}</p>
      </div>
    );
  }

  const posts = data?.posts.nodes || [];
  const hasMorePosts = data?.posts.pageInfo.hasNextPage;

  return (
    <div className="container mx-auto px-8 pb-8">
      <h1 className="text-3xl font-bold mb-6">Posts</h1>

      {loading && posts.length === 0 ? (
        <SkeletonGrid />
      ) : (
        <motion.div layout className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {posts.map((post: Post) => (
              <Link
                to={`/posts/${post.id}`}
                key={post.id}
                className="h-full"
                onMouseEnter={() => setHoveredId(post.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <PostCard
                  post={post}
                  isHovered={hoveredId !== null && hoveredId !== post.id}
                />
              </Link>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {loading && posts.length > 0 && (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {hasMorePosts && !loading && (
        <div className="mt-8 flex justify-center">
          <Button
            onClick={loadMore}
            variant="outline"
            size="lg"
            className="min-w-[200px]"
          >
            Show More Posts
          </Button>
        </div>
      )}

      {data && (
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Showing {posts.length} of {data.posts.totalCount} posts
          </p>
        </div>
      )}
    </div>
  );
}

export default Home;

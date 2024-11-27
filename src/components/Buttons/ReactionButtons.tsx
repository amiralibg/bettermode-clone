import React, { useState } from "react";
import { Heart } from "lucide-react";
import { gql, useMutation } from "@apollo/client";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const ADD_REACTION = gql`
  mutation addReaction($input: AddReactionInput!, $postId: ID!) {
    addReaction(input: $input, postId: $postId) {
      status
    }
  }
`;

const REMOVE_REACTION = gql`
  mutation removeReaction($reaction: String!, $postId: ID!) {
    removeReaction(reaction: $reaction, postId: $postId) {
      status
    }
  }
`;

interface ReactionButtonProps {
  postId: string;
  initialReactionCount: number;
}

const ReactionButton: React.FC<ReactionButtonProps> = ({
  postId,
  initialReactionCount,
}) => {
  const [reactionCount, setReactionCount] =
    useState<number>(initialReactionCount);
  const [isLiked, setIsLiked] = useState<boolean>(initialReactionCount > 0);
  const isLoggedIn = localStorage.getItem("authToken");
  const navigate = useNavigate();

  const [addReaction, { loading: addLoading }] = useMutation(ADD_REACTION, {
    refetchQueries: ["GetPost", "GetPosts"],
    optimisticResponse: {
      addReaction: {
        status: "SUCCESS",
        __typename: "ReactionResponse",
      },
    },
    onError: (error: Error) => {
      // Revert optimistic update on error
      console.error("Error adding reaction:", error);
      setReactionCount((prev) => prev - 1);
      setIsLiked(false);
    },
  });

  const [removeReaction, { loading: removeLoading }] = useMutation(
    REMOVE_REACTION,
    {
      refetchQueries: ["GetPost", "GetPosts"],
      optimisticResponse: {
        removeReaction: {
          status: "SUCCESS",
          __typename: "ReactionResponse",
        },
      },
      onError: (error: Error) => {
        // Revert optimistic update on error
        console.error("Error removing reaction:", error);
        setReactionCount((prev) => prev + 1);
        setIsLiked(true);
      },
    },
  );

  const handleAddReaction = () => {
    if (addLoading || isLiked) return;

    // Optimistically update UI
    setReactionCount((prev) => prev + 1);
    setIsLiked(true);

    addReaction({
      variables: {
        postId,
        input: {
          reaction: "heart",
          overrideSingleChoiceReactions: true,
        },
      },
    });
  };

  const handleRemoveReaction = () => {
    if (removeLoading || !isLiked) return;

    // Optimistically update UI
    setReactionCount((prev) => prev - 1);
    setIsLiked(false);

    removeReaction({
      variables: {
        postId,
        reaction: "heart",
      },
    });
  };

  const handleOnClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isLoggedIn) {
      if (isLiked) {
        handleRemoveReaction();
      } else {
        handleAddReaction();
      }
    } else {
      navigate("/auth/login");
    }
  };

  return (
    <Button
      onClick={handleOnClick}
      disabled={addLoading || removeLoading}
      className="w-fit flex items-center gap-2 text-sm text-gray-900 dark:text-gray-300 hover:text-red-500 transition-colors disabled:opacity-100"
      type="button"
      variant="ghost"
    >
      <Heart
        size={24}
        className={cn("fill-none", {
          "fill-red-500 text-red-500": isLiked,
          "opacity-100": addLoading || removeLoading,
        })}
      />
      <span>{reactionCount}</span>
    </Button>
  );
};

export default ReactionButton;

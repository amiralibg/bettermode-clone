import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  ApolloLink,
  from,
  gql,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";

// Use relative URL for the GraphQL endpoint to work with Vite proxy
const GRAPHQL_ENDPOINT = "/graphql";
export const NETWORK_DOMAIN = "basic-c5hx2lyj.bettermode.io";

// Error handling link with detailed logging
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${JSON.stringify(
          locations,
        )}, Path: ${path}, Operation: ${operation.operationName}`,
      );
    });
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError.message}`);
    console.error("Stack:", networkError.stack);
    console.error("Name:", networkError.name);
  }
});

// HTTP link with credentials and proper configuration
const httpLink = createHttpLink({
  uri: GRAPHQL_ENDPOINT,
  credentials: "include",
  fetchOptions: {
    mode: "cors",
  },
});

// Authentication link with all required headers
const authLink = setContext(async (_, { headers }) => {
  // First, try to get the auth token
  const authToken = localStorage.getItem("authToken");

  // If auth token not exit, try to get or generate a guest token
  if (!authToken) {
    let guestToken = localStorage.getItem("guestToken");

    if (!guestToken) {
      try {
        // Create a temporary client just for getting the guest token
        const tempClient = new ApolloClient({
          link: from([errorLink, httpLink]),
          cache: new InMemoryCache(),
        });

        const { data } = await tempClient.query({
          query: GUEST_TOKEN_QUERY,
          variables: { networkDomain: NETWORK_DOMAIN },
          context: {
            headers: {
              "X-Network-Domain": NETWORK_DOMAIN,
            },
          },
        });

        if (data?.tokens?.accessToken) {
          guestToken = data.tokens.accessToken;
          if (guestToken) {
            localStorage.setItem("guestToken", guestToken);
          }
        }
      } catch (error) {
        console.error("Error getting guest token:", error);
      }
    }

    return {
      headers: {
        ...headers,
        authorization: guestToken ? `Bearer ${guestToken}` : "",
        "X-Network-Domain": NETWORK_DOMAIN,
        "Content-Type": "application/json",
      },
    };
  }

  // If we have an auth token, use it
  return {
    headers: {
      ...headers,
      authorization: `Bearer ${authToken}`,
      "X-Network-Domain": NETWORK_DOMAIN,
      "Content-Type": "application/json",
    },
  };
});

// Custom middleware for logging and debugging
const loggingLink = new ApolloLink((operation, forward) => {
  console.log(`[GraphQL Request] ${operation.operationName}:`, {
    variables: operation.variables,
    headers: operation.getContext().headers,
  });

  return forward(operation).map((response) => {
    console.log(`[GraphQL Response] ${operation.operationName}:`, response);
    return response;
  });
});

// Guest token query
const GUEST_TOKEN_QUERY = gql`
  query GetGuestToken($networkDomain: String!) {
    tokens(networkDomain: $networkDomain) {
      accessToken
      role {
        name
        scopes
      }
      member {
        id
        name
      }
    }
  }
`;

// Create and configure Apollo Client
export const createApolloClient = () => {
  return new ApolloClient({
    link: from([errorLink, authLink, loggingLink, httpLink]),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            posts: {
              merge(existing = { nodes: [] }, incoming) {
                return {
                  ...incoming,
                  nodes: [...existing.nodes, ...incoming.nodes],
                };
              },
            },
          },
        },
      },
    }),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "network-only",
      },
      query: {
        fetchPolicy: "network-only",
        errorPolicy: "all",
      },
      mutate: {
        errorPolicy: "all",
      },
    },
  });
};

// Token management utilities with additional error handling
export const setAuthToken = (token: string) => {
  try {
    localStorage.setItem("authToken", token);
    localStorage.removeItem("guestToken"); // Clear guest token when setting auth token
  } catch (error) {
    console.error("Error setting auth token:", error);
  }
};

export const clearAuthTokens = () => {
  try {
    localStorage.removeItem("authToken");
    localStorage.removeItem("guestToken");
  } catch (error) {
    console.error("Error clearing auth tokens:", error);
  }
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("authToken");
};

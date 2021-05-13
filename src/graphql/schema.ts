import { makeExecutableSchema } from 'graphql-tools';
import { resolvers } from './resolvers';

const typeDefs = `#graphql
    type Friend {
        id: ID
        firstName: String
        lastName: String
        email: String
        role: String
    }
    type FriendWithPosition {
        email: String
        name: String
        longitude: Float
        latitude: Float
    }
    """
    Queries available for Friends
    """
     type Query {
        """
        Returns all details for all Friends
        (Should probably require 'admin' rights if your are using authentication)
        """
        getAllFriends : [Friend]!
        """
        Only required if you ALSO wan't to try a version where the result is fetched from the existing endpoint
        """
        getAllFriendsProxy: [Friend]!

        getFriendFromEmail(input: FriendEmailInput): Friend! 
        
    }
    input FriendInput {
        firstName: String!
        lastName: String!
        password: String!
        email: String!
    }
    input FriendEditInput {
        firstName: String
        lastName: String
        password: String
        email: String!
    }
    input FriendEmailInput {
        email: String!
    }
    input PositionInput {
        email: String!
        longitude: Float!
        latitude: Float!
    }
    input NearbyFriendsInput {
        email: String!
        longitude: Float!
        latitude: Float!
        distance: Float!
        password: String!
    }
    type Mutation {
        """
        Allows anyone (non authenticated users) to create a new friend
        """
        createFriend(input: FriendInput): Friend

        editFriend(input: FriendEditInput): Friend

        deleteFriend(input: FriendEmailInput): Boolean

        addPosition(input: PositionInput): Boolean

        findNearbyFriends(input: NearbyFriendsInput): FriendWithPosition
       
    }
`;

const schema = makeExecutableSchema({ typeDefs, resolvers });

export { schema };
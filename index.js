const { ApolloServer, gql, makeExecutableSchema } = require("apollo-server");
const ObjectAuthDirective = require("./ObjectAuthDirective");
const FieldAuthDirective = require("./FieldAuthDirective");
const { mutationResolvers, queryResolvers } = require("./resolvers");

const typeDefs = gql`
  directive @objectAuth(requires: Role = ADMIN) on OBJECT
  directive @fieldAuth(requires: Role = ADMIN) on FIELD_DEFINITION

  enum Role {
    ADMIN
    USER
  }

  type User @objectAuth(requires: USER) {
    name: String
    username: String
    banned: Boolean @fieldAuth(requires: ADMIN)
  }

  type Query {
    user: User
    users: [User] @fieldAuth(requires: ADMIN)
  }

  type Mutation {
    signUp(username: String, name: String): User!
    editUser(username: String, name: String): User! @fieldAuth(requires: USER)
  }
`;

const resolvers = {
  Query: queryResolvers,
  Mutation: mutationResolvers
};

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  schemaDirectives: {
    objectAuth: ObjectAuthDirective,
    fieldAuth: FieldAuthDirective
  }
});

const server = new ApolloServer({
  context: ({ req }) => ({ headers: req.headers }),
  schema,
  introspection: true,
  playground: true
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});

const { ApolloServer, gql, makeExecutableSchema } = require('apollo-server');
const AuthDirective = require('./AuthDirective');

const typeDefs = gql`
  directive @auth(requires: Role = ADMIN) on OBJECT | FIELD_DEFINITION

  enum Role {
    ADMIN
    USER
  }

  type User @auth(requires: USER) {
    name: String
    banned: Boolean @auth(requires: ADMIN)
  }

  type Query {
    users: [User]
  }
`;

const resolvers = {
  Query: {
    users: () => [{ name: 'Dummy user', banned: false }],
  },
};

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  schemaDirectives: {
    auth: AuthDirective,
  },
});

const server = new ApolloServer({
  context: ({ req }) => ({ headers: req.headers }),
  schema,
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});

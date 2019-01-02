// ------ Queries ------
const dummyUser = { username: "dummyUser", name: "Dummy user", banned: false };

const users = () => [dummyUser, dummyUser];

const user = () => dummyUser;

const queryResolvers = { user, users };

// ------ Mutations ------
const signUp = () => ({ username: "SignUp" });

const editUser = (parent, args, context, info) => ({
  username: "editUser",
  name: args.name
});

const mutationResolvers = { editUser, signUp };

module.exports = {
  queryResolvers,
  mutationResolvers
};

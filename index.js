import { ApolloServer, UserInputError, gql } from "apollo-server";
// import { PubSub } from "graphql-subscriptions";
import axios from "axios";
// import { createServer } from "http";
// import { SubscriptionServer } from "subscriptions-transport-ws";

// const pubsub = new PubSub();

const personas = [
  {
    name: "Juan",
    age: 25,
    address: {
      street: "",
      city: "",
    },
  },
  {
    name: "Pedro",
    age: 30,
    address: {
      street: "",
      city: "",
    },
  },
  {
    name: "Ana",
    // age: 20,
    address: {
      street: "",
      city: "",
    },
  },
  {
    name: "Luis",
    age: 70,
    address: {
      street: "",
      city: "",
    },
  },
];

// Define types for the data, if use ! the field is required
const typeDefs = gql`
  enum YesNo {
    YES
    NO
  }

  type Pokemon {
    name: String!
    url: String!
  }

  type Address {
    street: String!
    city: String!
  }

  type Persona {
    name: String!
    age: Int
    address: Address!
    resume: String
  }

  type Query {
    personCount: Int!
    allPersons(age: YesNo): [Persona]!
    findPerson(name: String!): Persona
    allPokemons: [Pokemon]!
  }

  type Mutation {
    addPerson(name: String!, age: Int!, street: String, city: String): Persona
  }
`;

// Define resolvers for the data
const resolvers = {
  Query: {
    personCount: () => personas.length,
    allPersons: (root, args) => {
      if (!args.age) {
        return personas;
      }

      const byAge = (person) => (args.age === "YES" ? person.age : !person.age);
      return personas.filter(byAge);
    },
    findPerson: (root, args) => personas.find((p) => p.name === args.name),
    allPokemons: async () => {
      const response = await axios("https://pokeapi.co/api/v2/pokemon");
      return response.data.results;
    },
  },
  Mutation: {
    addPerson: (root, args) => {
      if (personas.find((p) => p.name === args.name)) {
        throw new UserInputError("Person already exists", {
          invalidArgs: args.name,
        });
      }
      const { name, age, street, city } = args;
      const person = { name, age, address: { street, city } };
      personas.push(person);

      // pubsub.publish("PERSON_ADDED", { personAdded: person });

      return person;
    },
  },
  // Subscription: {
  //   personAdded: {
  //     subscribe: () => pubsub.asyncIterator(["PERSON_ADDED"]),
  //   },
  // },
  Persona: {
    resume: (root) => `${root.name} is ${root.age} years old`,
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// const httpServer = createServer(server.getMiddleware());
// const subscriptionServer = SubscriptionServer.create(
//   {
//     execute,
//     subscribe,
//     schema: server.schema,
//   },
//   { server: httpServer, path: server.graphqlPath }
// );

// httpServer.listen({ port: 4000 }, () => {
//   console.log(`Server ready at http://localhost:4000${server.graphqlPath}`);
//   console.log(
//     `Subscriptions ready at ws://localhost:4000${server.subscriptionsPath}`
//   );
// });

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});

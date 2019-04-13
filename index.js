const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const Event = require('./models/event')

const app = express();

app.use("/graphql", graphqlHttp({
    
    schema: buildSchema(`

        type Event {
            _id: ID
            title: String!
            description: String!
            date: String!
            price: Float!
        }

        input EventInput {
            title: String!
            description: String!
            date: String!
            price: Float!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {        
            createEvent(eventInput: EventInput): Event
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }

    `),
    
    rootValue: {

        events: () => {
            return Event.find().then(result => {
                
                console.log(result);
                
                return result.map(event => {
                    return {...event._doc, id: event._doc._id.toString()};
                });
                
            })
            .catch(error => {
                console.error(error);
                throw error;
            });
        },

        createEvent: (args) => {

            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                date: new Date(args.eventInput.date),
                price: +args.eventInput.price
            });

            event.save()
            .then(result => {
                console.log(result);
                return {...result._doc, id: result._doc._id.toString()};
            })
            .catch(error => {
                console.error(error);
                throw error;
            });

            return event;
        }

    },

    graphiql: true

}));

app.use(bodyParser.json());

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@mongodb-4bpy2.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`)

.then(() => {
    app.listen(3000);
})

.catch(error => {
    console.error(error);
});



import { Db, MongoClient, ServerApiVersion } from "mongodb";

// This will hold the database, which we will use to create collections. Notice, a database is of type 'Db'.
let taskDatabase: Db;

const connectToMongo = async () => {
  try {
    // Create a MongoClient with a MongoClientOptions object to set the Stable API version
    const mongoClient = new MongoClient(process.env.MONGODB_URI as string, {
      serverApi: {
        version: ServerApiVersion.v1,
        // Set this to false, if not, we will get an error that says 'text indexes cannot be created with apiStrict: true'
        strict: false,
        deprecationErrors: true,
      },
    });

    // Connect to the server
    await mongoClient.connect();

    // Select the database. If it does not exist, one will be created
    taskDatabase = mongoClient.db("taskDB");

    console.log("Successfully connected to MongoDB");

    return taskDatabase;
  } catch (e) {
    console.log("Could not connect to MongoDB", e);
  }
};

export { taskDatabase, connectToMongo };

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

//Middleware
app.use(cors());
app.use(express.json());

//Mongodb config
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.je1xv.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

// API Endpoints
async function run() {
    try {
        await client.connect();
        const taskCollections = client.db("todo_DB").collection("tasks");

        //Insert A task
        app.post("/tasks", async (req, res) => {
            const task = req.body;
            const doc = {
                ...task,
            };
            const result = await taskCollections.insertOne(doc);
            res.send(result);
        });

        //Find all tasks or all tasks of user
        app.get("/tasks", async (req, res) => {
            let query = {};
            if (req.query.addedBy) {
                const addedBy = req.query.addedBy;
                query = { addedBy };
            }
            const cursor = taskCollections.find(query);
            const tasks = await cursor.toArray();
            res.send(tasks);
        });

        //Deleting a task
        app.delete("/tasks/:id", async (req, res) => {
            const taskId = req.params.id;
            console.log(taskId);
            try {
                const filter = { _id: ObjectId(taskId) };
                console.log("filter",filter)
                const result = await taskCollections.deleteOne(filter);
                res.send(result);
            } catch {
                res.status(400).send({ message: "invalid task id" });
            }
        });
        //end
    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);

//ROOT API  Endpoint
app.get("/", (req, res) => {
    res.send({
        success: true,
        message: "hello from todo app server",
        developedBy: "Muhammad Touhiduzzaman",
    });
});

//Listening to port
app.listen(port, () => {
    console.log("listening to port:", port);
});

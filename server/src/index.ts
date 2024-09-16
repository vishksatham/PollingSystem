import express, { Express } from "express";
import { dummy, savePoll, loadPoll, listPoll, voteInPoll } from './routes';
import bodyParser from 'body-parser';


// Configure and start the HTTP server.
const port: number = 8088;
const app: Express = express();
app.use(bodyParser.json());
app.get("/api/dummy", dummy);  // TODO: REMOVE
app.post("/api/savePoll", savePoll);
app.post("/api/loadPoll", loadPoll);
app.get("/api/listPoll", listPoll);
app.post("/api/voteInPoll", voteInPoll)

app.listen(port, () => console.log(`Server listening on ${port}`));

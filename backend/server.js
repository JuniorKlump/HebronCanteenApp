import express from 'express';
import cors from 'cors';
import {fileURLToPath } from 'url';
import path from 'path';
import { initDB } from "./dbprocessor.js"

const pHash = hash("Neetnac")
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log(__dirname)
var readonly = "TRUE"

function hash(t) {
    //Simple hashing algorithm written by chatgpt
    let hash = 0;

    for (let i = 0; i < t.length; i++) {
        const charCode = t.charCodeAt(i);
        hash = (hash * 42 + charCode) & 0xffffffff;
    }

    return hash.toString(16);
}

//database stuff
const db = await initDB()

async function insert(t, c) {
    console.log(`Adding name '${t}'`)
    await db.query(
  "INSERT INTO data (name, balance) VALUES ($1, $2)",
  [t, c]
);
}
async function getall() {
    const { rows } = await db.query("SELECT * FROM data");
    return rows

}
async function remove(t) {
    if (t != 1) {
        console.log(`Removing id: ${t}`)
        await db.query("DELETE FROM data WHERE id = $1", [t])
    }
}
async function modify(id, a) {
    if (id != 1) {
        console.log(`Modifying id: ${id} by ${a}`)
        const { rows } = await db.query("SELECT balance FROM data WHERE id=$1", [id])
        const origbalance = parseInt(rows[0].balance)
        console.log(origbalance)
        const updatedbalance = await origbalance + a;
        await db.query("UPDATE data SET balance = $1 WHERE id=$2", [updatedbalance, id])
    }
}
//testing things out.
// modify(4,-108)
// console.log(await getall())
// remove(7)


//server stuff
const backend = express()
backend.use(cors())

//Error handling by Claude Sonnet 3.5
backend.use(express.json());
backend.use(express.urlencoded({ extended: true }));

const usingport = process.env.PORT || 5500;
console.log(usingport)
backend.use(express.static(path.join(__dirname,"../frontend")))

backend.get("/get", async (req, res) => {
    if (req.query.p == pHash) {
        const content = await getall();
        res.json(content);
        readonly = "FALSE";
    } else if (req.query.p == hash("password")) {
        const content = await getall();
        res.status(418)
        res.json(content);
        readonly = "TRUE"
    } else {
        res.sendStatus(401)
    }
})

backend.post("/add", async (req, res) => {
    const { text } = req.body || {};
    if (!text) {
        return res.status(400).json({ error: 'name and amount required' });
    }
    try {
        await insert(text, 0);
        return res.sendStatus(200);
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});

backend.post("/modify", async (req, res) => {
    const { id, change } = req.body || {};
    if (typeof id === 'undefined' || typeof change === 'undefined') {
        return res.status(400).json({ error: 'id and change required' });
    }
    try {
        if (readonly == "FALSE") {
            await modify(id, change);
            return res.sendStatus(200);
        }
        else { return res.sendStatus(401) }
    } catch (err) {
        console.error(err);
        res.status(404);
        res.statusMessage = "That id was not found in the database";
        return res.end();
    }
});

backend.delete("/delete", async (req, res) => {
    const { id } = req.body || {};
    if (typeof id === 'undefined') {
        return res.status(400).json({ error: 'id required' });
    }
    try {
        await remove(id);
        return res.sendStatus(200);
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});

backend.listen(usingport, () => { console.log("Backend running successfully") })

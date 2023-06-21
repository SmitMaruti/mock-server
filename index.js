const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors({ origin: "http://localhost:5050", credentials: true }));
app.use(express.json());

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const { randomUUID } = require("crypto");
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5050",
    },
});

let socketConnection = null;
io.on("connection", (socket) => {
    console.log("a user connected");
    socketConnection = socket;
});

const port = 3001;

const data = {
    ok: true,
    id: 1234,
    status: "Draft",
    type: "website",
    trained_at: "2020-09-23 05:13:17",
    configurations: {
        max_urls: 10,
        crawl_timeout_mins: 15,
        max_train_limit: 10,
        max_openai_training_tokens: 8100,
        max_openai_completion_tokens: 256,
    },
    saved_at: "2020-09-23 05:13:17",
    source: {
        domains: [],
        links: [],
    },
};

app.get(
    "/v1/accounts/:account_id/knowledge_bases/:type/:knowledge_base_id",
    (req, res) => {
        res.send(data);
    }
);

const crawlWebsite = (website) => {
    setTimeout(() => {
        data.status = "Crawled";
        // const list = [];
        // for (var i = 0; i < 1000; i++) {
        //     list.push(`${i}-${randomUUID()}`);
        // }
        // data.source.links = data.source.links.concat(list);
        data.source.links.push(website);
        console.log("Crawled", data.source.links);
        if (socketConnection) {
            socketConnection.emit("knowledge_base_status", {
                knowledge_base_id: 1234,
                status: "Crawled",
            });
        }
    }, 10000);
};

const trainUrls = (urls) => {
    setTimeout(() => {
        data.status = "Trained";
        console.log("Trained");
        if (socketConnection) {
            socketConnection.emit("knowledge_base_status", {
                knowledge_base_id: 1234,
                status: "Trained",
            });
        }
    }, 10000);
};

app.post(
    "/v1/accounts/:account_id/knowledge_bases/:knowledge_base_id/crawling",
    (req, res) => {
        data.source.domains.push(req.body.website);
        crawlWebsite(req.body.website);
        console.log("Crawling");
        data.status = "Crawling";
        res.send({
            website: req.body.website,
            ok: true,
        });
    }
);

app.put(
    "/v1/accounts/:account_id/knowledge_bases/:type/:knowledge_base_id",
    (req, res) => {
        console.log("List updated");
        data.source.links = req.body.metadata.links;
        res.send({
            ok: true,
            message: "List Updated Successfully",
            status: 200,
        });
    }
);

app.post(
    "/v1/accounts/:account_id/faq/:type/knowledge_bases/:knowledge_base_id/train",
    (req, res) => {
        trainUrls();
        console.log("Training");
        data.status = "Training";
        res.send({
            ok: true,
            status: "Training",
        });
    }
);

server.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

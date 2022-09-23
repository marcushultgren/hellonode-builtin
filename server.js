const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const client = new MongoClient(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

app.get('/', (req, res) => {
  res.send('Yo');
})

app.get(["/fetch/:time"], (req, res) => {
  client.connect(async err => {
    if (err) {
      console.log('error', err);
    }
    try {
      const db = client.db(process.env.DB_NAME);
      const collection = db.collection(process.env.DB_COLLECTION);
      const options = {
        filter: {date: {$gte: req['params'].time ?? Date.now() - (1000 * 60 * 60 * 24)}}
      };
      const row = await collection.findOne({
        date: { $gte: +req['params'].time ?? new Date().getTime() },
      });
      await client.close();
      if (row) {
        const jsonResponse = JSON.parse(row.response);
        const elements = jsonResponse.elements.map((element) => ({
          id: element.id,
          name: element.web_name,
          cost: element.now_cost,
          sel: +element.selected_by_percent,
          tr_in: element.transfers_in,
          tr_in_e: element.transfers_in_event,
          tr_out: element.transfers_out,
          tr_out_e: element.transfers_out_event,
          status: element.status,
        }));
        res.send({ date: row.date, elements });
      }
      res.send();
    } catch (e) {
      console.error('Error', e);
    } finally {
      await client.close();
    }
  });
});

app.listen(port, () => console.log(`HelloNode app listening on port ${port}!`))


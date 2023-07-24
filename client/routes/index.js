var express = require('express');
var router = express.Router();
const rabbitMQService = require('../services/rabbitmq');
var { v4: uuidv4 } = require('uuid');

/* GET home page. */

let count = 1;
router.post("/send-msg", async (req, res) => {
  const { name } = req.body;
    const data = {
        title: `test ${count}`,
        name
    }
    const response = await rabbitMQService.sendData(data);
    count++;
    console.log("A message is sent to queue", response)
    res.send(response);
});


router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


module.exports = router;

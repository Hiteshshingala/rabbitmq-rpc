// const uuidv4 = require('uuid/v4');

const RABBITMQ = 'amqp://guest:guest@localhost:5672';

const open = require('amqplib').connect(RABBITMQ);
const q = 'order';

// Consumer

module.exports = {
    connectQueue:  async function(){
        open
          .then(function(conn) {
            console.log(`[ ${new Date()} ] Server started`);
            return conn.createChannel();
          })
          .then(function(ch) {
            return ch.assertQueue(q).then(function(ok) {
              return ch.consume(q, function(msg) {
                console.log(
                  `[ ${new Date()} ] Message received: ${JSON.stringify(
                    JSON.parse(msg.content.toString('utf8')),
                  )}`,
                );
                if (msg !== null) {
                  console.log(
                    `[ ${new Date()} ] Message sent: ${JSON.stringify(msg.content)} - ${msg.properties.replyTo}`,
                  );
        
                  ch.sendToQueue(
                    msg.properties.replyTo,
                    msg.content,
                    {
                      correlationId: msg.properties.correlationId,
                    },
                  );
        
                  ch.ack(msg);
                }
              });
            });
          })
          .catch(console.warn);
    }
}
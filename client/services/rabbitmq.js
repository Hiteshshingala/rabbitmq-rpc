const amqp = require("amqplib");
const EventEmitter = require('events');
var { v4: uuidv4 } = require('uuid');
const RABBITMQ = 'amqp://guest:guest@localhost:5672';
// const REPLY_QUEUE = 'amq.rabbitmq.reply-to';
let REPLY_QUEUE = 'amq.rabbitmq.reply-to';
const q = 'order';

module.exports = {
  
    sendData: async function (data) {

        const createClient = rabbitmqconn =>
            amqp
                .connect(rabbitmqconn)
                .then(conn => conn.createChannel())
                .then(async (channel) => {
                    // const relpyQueue = await channel.assertQueue('order-reply');
                    // REPLY_QUEUE = relpyQueue.queue;
                    channel.responseEmitter = new EventEmitter();
                    channel.responseEmitter.setMaxListeners(100);
                    channel.consume(
                        REPLY_QUEUE,
                        msg => {
                            channel.responseEmitter.emit(
                                msg.properties.correlationId,
                                msg.content.toString('utf8'),
                            );
                        },
                        { noAck: true },
                    );
                    return channel;
                });

        const sendRPCMessage = (channel, message, rpcQueue) =>
            new Promise(resolve => {
                const correlationId = uuidv4();
                channel.responseEmitter.once(correlationId, function (response) {
                    resolve(response);
                });
                channel.sendToQueue(rpcQueue, Buffer.from(message), {
                    correlationId,
                    replyTo: REPLY_QUEUE,
                });
            });

        const init = async () => {
            const channel = await createClient(RABBITMQ);
            const message = { uuid: uuidv4(), ...data };

            console.log(`[ ${new Date()} ] Message sent: ${JSON.stringify(message)}`);

            const respone = await sendRPCMessage(channel, JSON.stringify(message), q);



            console.log(`[ ${new Date()} ] Message received: ${respone}`);
            return respone;
        };

        try {
           return init();
        } catch (e) {
            console.log(e);
        }
    }
}
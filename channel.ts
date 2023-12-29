import { connect } from "amqplib"
import delay from "delay"
export async function startServer() {
  let conn
  for (let i = 0; i < 10; i++) {
    try {
      conn = await connect("amqp://localhost:5672")
      break
    } catch (e: any) {
      console.log("at connect to Rabbitmq ", e?.message)
      console.log(`retrying in ${i} second...`)
      await delay(i * 1000)
    }
  }
  if (!conn) {
    throw new Error("Failed to connect to RabbitMQ")
  }
  let channel = await conn.createChannel()
  await channel.assertQueue("requestQueue")
  await channel.assertQueue("responseQueue")
  return channel
}

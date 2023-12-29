import express from "express"
import { startServer } from "./channel.js"
import delay from "delay"

const app = express()
app.use(express.json())

console.log("connecting to RabbitMQ...")

const channel = await startServer()

// m1

app.post("/", async (req, res) => {
  const randid = Math.random().toString(36).substring(7)
  const { number } = req.body
  if (!number) return res.status(400).send({ message: "number is required" })
  await channel.sendToQueue("requestQueue", Buffer.from(`PING ${randid}`))
  console.log(`PING ${randid}`)
  channel.consume("responseQueue", async (msg) => {
    if (msg) {
      const [, randidResponded] = msg.content.toString().split(" ")
      if (randidResponded === randid) {
        return res.send({ number: number * 2 })
      }
    }
  })
})

// m2

channel.consume("requestQueue", async (msg) => {
  if (msg) {
    const [, randid] = msg.content.toString().split(" ")
    console.log(`PONG ${randid}`)
    await delay(5000)
    await channel.sendToQueue("responseQueue", Buffer.from(`PONG ${randid}`))
  }
})

app.listen(3000, () => console.log("Server is running on port 3000"))

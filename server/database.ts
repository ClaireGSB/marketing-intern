import pg from 'pg'
const { Client } = pg

const dbclient = new Client({
  user: 'mkti',
  host: 'localhost',
  database: 'mkti_development',
  password: 'mkti',
  port: 6543, 
})

dbclient.connect()

export default dbclient
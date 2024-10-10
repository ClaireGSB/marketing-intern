import pg from 'pg'


export default defineNuxtPlugin({
  name: 'database',
  enforce: 'pre', // or 'post'
  async setup (nuxtApp) {
    const { Client } = pg
    const client = new Client({
      user: 'mkti',
      host: 'localhost',
      database: 'mkti_development',
      password: 'mkti',
      port: 6543,
    })

    try {
      await client.connect()
      console.log('Database connected successfully')

      // Provide the client to the rest of the application
      nuxtApp.provide('db', client)

    } catch (error) {
      console.error('Failed to connect to the database:', error)
      throw error // This will prevent Nuxt from starting if the DB connection fails
    }
  }


})
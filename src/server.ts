import express from 'express'
import { gql, request } from 'graphql-request'
import helmet from 'helmet'
import * as jose from 'jose'

const signingKey = process.env['JWT_SIGNING_SECRET'] || ''
const adminSecret = process.env['HASURA_GRAPHQL_ADMIN_SECRET'] || ''
const domain = process.env['NEXT_PUBLIC_HASURA_DOMAIN'] || ''
const useFirebase = process.env['NEXT_PUBLIC_USE_FIREBASE']
const isProduction = process.env.NODE_ENV === 'production'

if (!signingKey) {
  throw Error('Your JWT_SIGNING_SECRET is invalid')
}
if (!adminSecret) {
  throw Error('Your HASURA_GRAPHQL_ADMIN_SECRET is invalid')
}
if (!domain) {
  throw Error('Your NEXT_PUBLIC_HASURA_DOMAIN is invalid')
}

const app = express()
app.use(express.json())
isProduction && app.use(helmet())
const port = 3001

app.get('/auth', (req, res) => {
  res.send('The server is healthy!')
})

app.post('/auth/login', async (req, res) => {
  if (useFirebase) {
    return res.sendStatus(403)
  }

  const token = req.body.token
  if (!req.body.token) {
    return res.sendStatus(422)
  }

  const document = gql`
    query GET_PROFILES($token: String!) {
      profiles(where: { authId: { _eq: $token } }) {
        authId
        id
      }
    }
  `
  const response: { profiles: [{ authId: string; id: string }] } =
    await request(
      isProduction
        ? `https://${domain}/v1/graphql`
        : `https://localhost/v1/graphql`,
      document,
      {
        token,
      },
      { 'X-Hasura-Admin-Secret': adminSecret }
    )
  if (response.profiles.length === 1) {
    const customClaims = {
      'https://hasura.io/jwt/claims': {
        'x-hasura-allowed-roles': ['user', 'admin'],
        'x-hasura-default-role': 'user',
        'x-hasura-user-id': token,
        'x-hasura-username': token,
      },
    }
    const secret = new TextEncoder().encode(signingKey)
    const alg = 'HS256'
    const JWT = await new jose.SignJWT(customClaims)
      .setProtectedHeader({ alg })
      .sign(secret)
    return res.send(JWT)
  } else {
    return res.sendStatus(403)
  }
})

app.listen(port, () => {
  console.log(`Authentication server listening on http://localhost:${port}`)
})

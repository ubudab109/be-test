import { OAuth2Client } from 'google-auth-library';

const GoogleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export default GoogleClient;

import admin from 'firebase-admin';

let serviceAccount: admin.ServiceAccount | undefined;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
        const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf-8');
        serviceAccount = JSON.parse(decoded);
    } catch (e) {
        console.error("Failed to parse Firebase service account:", e);
    }
}

if (!admin.apps.length) {
    if (!serviceAccount) {
        admin.initializeApp();
    } else {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    }
}

export const firestore = admin.firestore();
export const FieldValue = admin.firestore.FieldValue;
export default admin;
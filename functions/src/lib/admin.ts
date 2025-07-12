import * as admin from "firebase-admin";

// Initialize Firebase
admin.initializeApp();

// Export Firestore database instance
export const db = admin.firestore();
export default admin;

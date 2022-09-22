import firebase from 'firebase/compat/app';
export default interface IClip {
    docID?: string;
    uid: string;
    displayName: string;
    title: string;
    clipFileName: string;
    clipURL: string;
    screenshotFileName: string;
    screenshotURL: string;
    timestamp: firebase.firestore.FieldValue;
}
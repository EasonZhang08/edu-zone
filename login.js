import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore"; 
import { auth, db } from "./firebase";

// Get elements from html
const signUpContainer = document.getElementById('sign-up-container');
const signInContainer = document.getElementById('sign-in-container');
const linkToSignIn = document.getElementById('link-to-sign-in');
const linkToSignUp = document.getElementById('link-to-sign-up');
const signUpForm = document.getElementById('sign-up-form');
const signInForm = document.getElementById('sign-in-form');
const errorMessage = document.getElementById('error-message');
const forgotPasswordLink = document.getElementById('forgot-password-link');
const authMessage = document.getElementById('auth-message');
const continueButton = document.getElementById('continue-button');
const signOutButton = document.getElementById('sign-out-button');

// Toggle between sign-up and sign-in forms
linkToSignIn.addEventListener('click', (e) => {
  //prevent default for submission behaviour
  e.preventDefault(); 
  //hidden sign up form
  signUpContainer.style.display = 'none';
  //show sign in form
  signInContainer.style.display = 'block';
  errorMessage.textContent = '';
});

linkToSignUp.addEventListener('click', (e) => {
  //same as the other one
  e.preventDefault();
  signInContainer.style.display = 'none';
  signUpContainer.style.display = 'block';
  errorMessage.textContent = '';
});

// Password validation function
function isValidPassword(password) {
  // At least 6 characters (Firebase's minimum)
  return password.length >= 6;
}

// Handle Sign-Up
signUpForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  //get input from the text field
  const name = document.getElementById('sign-up-name').value;
  const email = document.getElementById('sign-up-email').value;
  const password = document.getElementById('sign-up-password').value;
  // Password validation
  //must be at least 6 characters
  if (!isValidPassword(password)) {
    errorMessage.textContent = 'Password must be at least 6 characters.';
    return;
  }

  let userCredential;

  //use the firebase function to create a new user
  try {
    userCredential = await createUserWithEmailAndPassword(auth, email, password);

  } catch (error) {
    console.error('Error signing up:', error.message);
    errorMessage.textContent = error.message;
  }

  const uid = userCredential.user.uid
  // Add a new document with a generated id.
  const docRef = await addDoc(collection(db, "users"), {
    name: name,
    email: email,
    uid: uid
  });

  console.log("Document written with ID: ", docRef.id);

  localStorage.setItem("username", email);
  console.log("Username stored in localStorage:", localStorage.getItem("username"));
  

  
  errorMessage.textContent = "";


    
});

// Handle Sign-In
signInForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  //same thing as the other one
  const email = document.getElementById('sign-in-email').value;
  const password = document.getElementById('sign-in-password').value;
  localStorage.setItem("username", email);

  try{
    await signInWithEmailAndPassword(auth, email, password);
  } catch(error){
    console.error('Error signing in:', error.message);
    if (error.code === 'auth/user-not-found') {
      errorMessage.textContent = 'No account found with this email.';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage.textContent = 'Incorrect password.';
    } else {
      errorMessage.textContent = error.message;
    }
  }


  console.log('User signed in:', userCredential.user);
  window.location.href = 'index.html'; 

});

// Handle Forgot Password
forgotPasswordLink.addEventListener('click', async (e) => {
  e.preventDefault();
  //TODO use an actual html page instead of a prompt
  const email = prompt('Please enter your email address:');
  if (email) {
    try {
      //send the automatic password reset email
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      console.error('Error sending password reset email:', error.message);
        errorMessage.textContent = error.message;
    }
    
    alert('Password reset email sent!');
    
  }
});

//this runs when the user is logged in
onAuthStateChanged(auth, (user) => {
  if (user) {

    //close the sign in and sign up page
    signInContainer.style.display = 'none';
    signUpContainer.style.display = 'none';
    //show the auth message
    authMessage.style.display = 'block';
  } else {
    // No user is signed in.
    console.log('No user is signed in.');  
    authMessage.style.display = 'none';
    signInContainer.style.display = 'block';
    signUpContainer.style.display = 'none';
  }
});




// Continue Button
continueButton.addEventListener('click', () => {
  window.location.href = 'index.html'; 
});

// Sign-Out Button
signOutButton.addEventListener('click', async () => {

  try {
    await auth.signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
  }
  console.log('User signed out.');

    // Show the sign-in form
    authMessage.style.display = 'none';
    signInContainer.style.display = 'block';


});

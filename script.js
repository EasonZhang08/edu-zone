// Import the functions you need from the SDKs you need
import { signOut } from "firebase/auth";
import { collection, getDocs, getFirestore, limit, query, where } from "firebase/firestore";
import { auth, db } from "./firebase";
const username = localStorage.getItem("username");
console.log("Current local user:", username);


document.addEventListener("DOMContentLoaded", async () => {
    console.log(collection(db, "users"))
    const a = await getDocs(collection(db, "users"));
    console.log(a);
    const displayNameOnScreen = document.getElementById('display-name');
    console.log(username)
    const name = await getNameByEmail(username);
    console.log(name)
    if (name) {
        displayNameOnScreen.textContent = name; // Set name only if it was found
    } else {
        displayNameOnScreen.textContent = "User not found"; // Fallback text
    }
})


const signOutButton = document.getElementById('sign-out-button');


document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
   
    function sendMessage() {
        //get the input box
        const messageInput = document.getElementById('messageInput');
        //get the chat window
        const chatWindow = document.getElementById('chatWindow');
        
        //make sure it's not empty
        if (messageInput.value.trim() !== "") {
            //create the message div
            const message = document.createElement('div');
            message.classList.add('message', 'user');
            //add the message content
            message.textContent = messageInput.value;

            const placeholders = document.querySelectorAll('.placeholder');
            placeholders.forEach(placeholder => placeholder.remove());

            chatWindow.appendChild(message);
            // Clear the input
            messageInput.value = "";  
            // Scroll to the bottom
            chatWindow.scrollTop = chatWindow.scrollHeight;  
        }
    }

    sendButton.addEventListener('click', sendMessage);

    //triggers sendMessage when the user enters
    messageInput.addEventListener('keypress', function (event) {
        if (event.key === "Enter") {
            sendMessage();
        }
    });

});

function selectSection(section) {
    const sectionContent = document.getElementById('sectionContent');
    if (section === 'dm') {
        sectionContent.innerHTML = `
            <div class="item friends">Friend 1</div>
            <div class="item friends">Friend 2</div>
            <div class="item friends">Friend 3</div>
        `;
    } else {
        sectionContent.innerHTML = `
            <div class="item">Channel 1 in ${section}</div>
            <div class="item">Channel 2 in ${section}</div>
            <div class="item">Channel 3 in ${section}</div>
        `;
    }

}

signOutButton.addEventListener('click', async () => {
    try {
        await signOut(auth)
    } catch (e) {
        console.error('Error signing out:', error);
    }

    console.log('User signed out.');

    window.location.href = 'login.html'; 
});

//send message when the sendButton is clicked
sendButton.addEventListener('click', () => {
    sendMessage();
});

//send message when enter is pressed
messageInput.addEventListener('keypress', function (event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});

async function getNameByEmail(email) {
    // Define the collection
    const usersRef = collection(db, "users");

    // Create a query based on the `username` field
    const q = query(usersRef, where("email", "==", email), limit(1));

    // Execute the query
    const querySnapshot = await getDocs(q);

    // Check if a document was found
    if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data().name;
    } else {
        console.log("No user found with the given username.");
    }
}
console.log(await getNameByEmail(username));

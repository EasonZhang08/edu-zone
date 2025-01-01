// Import the functions you need from the SDKs you need
import { signOut } from "firebase/auth";
import { collection, getDocs, getFirestore, limit, query, where, setDoc, doc, onSnapshot, addDoc, serverTimestamp} from "firebase/firestore";
import { auth, db } from "./firebase";
const email = localStorage.getItem("username");
console.log("Current local user:", email);
const addChatButton = document.getElementById('add-chat-button');
const addChatInput = document.getElementById('add-chat-input');
const sectionContent = document.getElementById('sectionContent');
const chatWindow = document.getElementById('chatWindow');
//get the input box
const messageInput = document.getElementById('messageInput');
let chatId = null;


document.addEventListener("DOMContentLoaded", async () => {
    
    console.log(collection(db, "users"))
    const a = await getDocs(collection(db, "users"));
    console.log(a);
    const displayNameOnScreen = document.getElementById('display-name');
    const name = await getNameByEmail(email);
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const chatCollectionRef = collection(db, "chats");

    const chatId = await findChatId(auth.currentUser.uid);
    if (!chatId) {
        console.error("Chat ID is null or undefined. Cannot proceed.");
        return; // Exit the function early if no chat ID is found
    }

    const chatDocRef = doc(chatCollectionRef);
    //const chatDocRef = doc(chatCollectionRef, await findChatId(auth.currentUser.uid));
    const messagesSubcollectionRef = collection(chatDocRef, "messages");
    //const messageDocRef = doc(messagesSubcollectionRef);

    if (name) {
        displayNameOnScreen.textContent = name; // Set name only if it was found
    } else {
        displayNameOnScreen.textContent = "User not found"; // Fallback text
    }
    updateFriendDisplay();

    //this button is to add a new chat
    addChatButton.addEventListener('click', async function(){
        const targetEmail = addChatInput.value.trim();
        const UserSubcollectionRef = collection(chatDocRef, "users");
        await setDoc(chatDocRef, { name: "Chat Name" });
        const firstUserRef = doc(UserSubcollectionRef, auth.currentUser.uid);
        const secondUserUid = await getUidByEmail(targetEmail);
        if (!secondUserUid) {
            console.error("No user found with the provided email.");
            return;
        }
        const secondUserRef = doc(UserSubcollectionRef, secondUserUid);

        // Add current user to users subcollection
        await setDoc(firstUserRef, { uid: auth.currentUser.uid });

        // Add the other user to users subcollection
        await setDoc(secondUserRef, { uid: secondUserUid });

        updateFriendDisplay();

    });

    async function sendMessage() {
 
        //make sure it's not empty
        if (messageInput.value.trim() !== "") {
            //const messagesRef = collection(db, "chats", auth.currentUser.id, "messages")

            //messagesSubcollectionRef
            //messageDocRef
            const docRef = await addDoc(messagesSubcollectionRef, {
                content: messageInput.value,
                timestamp: serverTimestamp(),
                uid: auth.currentUser.uid,
            });

            console.log("Document written with ID: ", docRef.id);

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


const signOutButton = document.getElementById('sign-out-button');


function selectSection(section) {
    const sectionContent = document.getElementById('sectionContent');
    if (section === 'dm') {
        updateFriendDisplay();
    } else {
        sectionContent.innerHTML = `
            <div class="item">Channel 1 in ${section}</div>
            <div class="item">Channel 2 in ${section}</div>
            <div class="item">Channel 3 in ${section}</div>
        `;
    }

}

window.selectSection = selectSection;

signOutButton.addEventListener('click', async () => {
    try {
        await signOut(auth)
    } catch (e) {
        console.error('Error signing out:', error);
    }

    console.log('User signed out.');

    window.location.href = 'login.html'; 
});


async function updateFriendDisplay(chatId) {
    // Real-time listener for the "chats" collection
    const chatsRef = collection(db, "chats");
    const unsubscribe = onSnapshot(chatsRef, async (snapshot) => {
        // Clear the existing display
        sectionContent.innerHTML = "";

        snapshot.forEach(async (doc) => {
            const chatData = doc.data();
            const usersRef = collection(doc.ref, "users");
            const usersSnapshot = await getDocs(usersRef);

            let otherUserUid = null;

            // Check for current user and find the other user's UID
            usersSnapshot.forEach((userDoc) => {
                const userData = userDoc.data();
                if (userData.uid !== auth.currentUser.uid) {
                    otherUserUid = userData.uid;
                }
            });

            if (otherUserUid) {
                // Retrieve the name of the other user
                const otherUserName = await getNameByUid(otherUserUid);

                // Add the user's name to the UI
                const button = document.createElement("button");
                button.innerHTML = otherUserName;
                button.setAttribute("data-chat-id", chatId);
                button.classList.add("item", "friends");
                sectionContent.appendChild(button);
            }
        });
    });

    return unsubscribe; // Call this to stop listening if needed
}

async function updateMessages(chatId){
    const messagesCollection = collection(db, `chats/${chatId}/messages`);
    try {
        const querySnapshot = await getDocs(messagesCollection);
        querySnapshot.forEach((doc) => {
          console.log("Message Content:", doc.content);
          
        });
    } catch (error) {
        console.error("Error fetching messages:", error);
    }

    // //create the message div
    // const message = document.createElement('div');
    // message.classList.add('message', 'user');
    // //add the message content
    // message.textContent = messageInput.value;

    // const placeholders = document.querySelectorAll('.placeholder');
    // placeholders.forEach(placeholder => placeholder.remove());
    // chatWindow.appendChild(message);

    // // Scroll to the bottom
    // chatWindow.scrollTop = chatWindow.scrollHeight
}

async function findChatId(currentUserId, targetUserId = null){
    const chatCollectionRef = collection(db, "chats");
    const querySnapshot = await getDocs(chatCollectionRef);
    await console.log("Target user UID:", targetUserId);
    for (const chatDoc of querySnapshot.docs) {
        const chatId = chatDoc.id;
        const usersSubcollectionRef = collection(chatDoc.ref, "users");

        // Fetch all user documents within the users subcollection
        const usersSnapshot = await getDocs(usersSubcollectionRef);

        const userUids = [];
        usersSnapshot.forEach((userDoc) => {
            userUids.push(userDoc.data().uid);
        });
        console.log(userUids);
        console.log(currentUserId + "" + targetUserId);
        // Check if both users exist in this chat's users subcollection
        if (userUids.includes(currentUserId) && (targetUserId == null || userUids.includes(targetUserId))){
            return chatId;
        }
        
    }

    console.error("No matching chat found for user:", currentUserId);
    return null;
}


async function getNameByEmail(email) {
    // Define the collection
    const usersRef = collection(db, "users");

    // Create a query based on the `email` field
    const q = query(usersRef, where("email", "==", email), limit(1));

    // Execute the query
    const querySnapshot = await getDocs(q);

    // Check if a document was found
    if (!querySnapshot.empty) {
        // return the name field
        return querySnapshot.docs[0].data().name;
    } else {
        console.log("No user found with the given username.");
    }
}


async function getUidByEmail(email) {
    // Define the collection
    const usersRef = collection(db, "users");

    // Create a query based on the `email` field
    const q = query(usersRef, where("email", "==", email), limit(1));

    // Execute the query
    const querySnapshot = await getDocs(q);

    // Check if a document was found
    if (!querySnapshot.empty) {
        // return the name field
        return querySnapshot.docs[0].data().uid;
    } else {
        console.log("No user found with the given username.");
    }
}

async function getNameByUid(uid) {
    // Define the collection
    const usersRef = collection(db, "users");

    // Create a query based on the `email` field
    const q = query(usersRef, where("uid", "==", uid), limit(1));

    // Execute the query
    const querySnapshot = await getDocs(q);

    // Check if a document was found
    if (!querySnapshot.empty) {
        // return the name field
        return querySnapshot.docs[0].data().name;
    } else {
        console.log("No user found with the given uid.");
    }
}
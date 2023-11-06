(function () {
    let chatUser;
    let socket;
    let stompClient;

    const isValidMessage = (message) => message.trim() !== "";

    const isValidUsername = (username) => username.trim().length >= 2 && username.trim().length <= 50;

    const createSenderElement = (sender) => {
        const senderElement = document.createElement("p");
        senderElement.classList.add("sender", "mb-0", "fw-bold");
        senderElement.innerText = sender;
        return senderElement;
    };

    const createDateElement = (date) => {
        const dateElement = document.createElement("p");
        dateElement.classList.add("date", "mb-0", "text-muted");
        dateElement.innerText = new Date(date).toLocaleString("en-US", {
            year: "numeric", month: "short", day: "numeric",
            hour: "2-digit", minute: "2-digit", hour12: true
        });
        return dateElement;
    };

    const createMessageContainerHeaderElement = (sender, date) => {
        const headerElement = document.createElement("div");
        headerElement.classList.add("message-header", "d-flex", "justify-content-between", "mb-2");

        const senderElement = createSenderElement(sender);
        const dateElement = createDateElement(date);

        headerElement.appendChild(senderElement);
        headerElement.appendChild(dateElement);

        return headerElement;
    };

    const createMessageElement = (text) => {
        const messageElement = document.createElement("p");
        messageElement.classList.add("message", "mb-0");
        messageElement.innerText = text;
        return messageElement;
    };

    const createMessageContainerElement = (message) => {
        const messageContainerElement = document.createElement("li");
        messageContainerElement.classList.add("list-group-item", "message-container", "d-flex", "flex-column", "p-3");

        const headerElement = createMessageContainerHeaderElement(message.sender, message.date);
        const messageElement = createMessageElement(message.message);

        messageContainerElement.appendChild(headerElement);
        messageContainerElement.appendChild(messageElement);

        return messageContainerElement;
    };

    const createUserElement = (user) => {
        const userElement = document.createElement("li");
        userElement.classList.add("list-group-item", "user");
        userElement.innerText = user.username;
        return userElement;
    }

    const attachMessageToChat = (message) => {
        const messageList = document.getElementById("messages");
        const messageElement = createMessageContainerElement(message);
        messageList.appendChild(messageElement);
        messageElement.scrollIntoView({behavior: "smooth"});
    };

    const attachUserToUserList = (users) => {
        const userList = document.getElementById("users");
        userList.innerHTML = '';
        users.forEach(user => {
            const userElement = createUserElement(user);
            userList.appendChild(userElement);
        });
    }

    const saveMessage = (message) => {
        fetch("/message", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                message: message,
                sender: chatUser.username,
                date: new Date()
            })
        })
            .then(response => {
                return response.json();
            })
            .catch(error => {
                console.error("Error", error);
                throw error;
            });
    }

    const sendMessage = () => {
        const textarea = document.getElementById("input-msg");
        const message = textarea.value;

        if (!isValidMessage(message) || !chatUser) {
            return;
        }

        if (stompClient) {
            const chatMessage = {message: message, sender: chatUser.username, date: new Date()};
            stompClient.send("/app/messages", {}, JSON.stringify(chatMessage));
        }

        saveMessage(message);
        textarea.value = "";
    };

    const displayUsernameError = (reason) => {
        const usernameError = document.getElementById("username-error");

        usernameError.style.display = "block";

        switch (reason) {
            case "already-taken":
                usernameError.innerText = "Username already taken.";
                break;
            case "length":
                usernameError.innerText = "Username must be between 2 and 50 characters long.";
                break;
            default:
                usernameError.innerText = "An error occurred.";
        }
    }

    const saveUsername = (username) => {
        return fetch("/user", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({username: username, joined: new Date()})
        })
            .then(response => {
                if (response.status === 409) {
                    displayUsernameError("already-taken");
                    throw new Error("Username already taken.");
                }
                return response.json();
            })
            .catch(error => {
                console.error("Error:", error);
                throw error;
            });
    };

    const subscribeToTopics = (stompClient) => {
        stompClient.subscribe("/topic/messages", function (messageOutput) {
            const updatedMessage = JSON.parse(messageOutput.body);
            attachMessageToChat(updatedMessage);
        });

        stompClient.subscribe("/topic/connected-users", function (usersOutput) {
            const updatedUsers = JSON.parse(usersOutput.body);
            const updatedUsersWithoutCurrentUser = updatedUsers.filter(user => user.username !== chatUser.username);
            attachUserToUserList(updatedUsersWithoutCurrentUser);
        });
    }

    const connectToChat = (user) => {
        socket = new SockJS("/ws");
        stompClient = Stomp.over(socket);
        stompClient.connect(user, function () {
            subscribeToTopics(stompClient);
        });
    }

    const getPreviousMessages = () => {
        fetch("/messages")
            .then(response => response.json())
            .then(messages => {
                const messageList = document.getElementById("messages");
                for (const message of messages) {
                    const messageElement = createMessageContainerElement(message);
                    messageList.appendChild(messageElement);
                }
            })
            .catch(error => console.log(error));
    }

    const getConnectedUsers = () => {
        fetch("/connected-users")
            .then(response => response.json())
            .then(connectedUsers => {
                const userList = document.getElementById("users");
                const usersWithoutCurrentUser = connectedUsers.filter(user => user.username !== chatUser.username);
                for (const user of usersWithoutCurrentUser) {
                    const userElement = createUserElement(user);
                    userList.appendChild(userElement);
                }
            })
            .catch(error => console.log(error));
    }

    const getPreviousMessagesAndConnectedUsers = () => {
        setTimeout(getPreviousMessages, 100);
        setTimeout(getConnectedUsers, 100);
    }

    const hideUsernameSelection = () => {
        const chooseUsernameArea = document.getElementById("choose-username-area");
        chooseUsernameArea.style.display = "none";
    }

    const displayChatAndOnlineUsers = () => {
        const chatBox = document.getElementById("chat-box");
        const usersOnline = document.getElementById("users-online-sidebar");
        chatBox.style.display = "flex";
        usersOnline.style.display = "block";
    }

    const chooseUsername = () => {
        const inputUsername = document.getElementById("input-username").value;

        if (!isValidUsername(inputUsername)) {
            displayUsernameError("length");
            return;
        }

        saveUsername(inputUsername)
            .then(response => {
                chatUser = response;
                connectToChat(chatUser);
                getPreviousMessagesAndConnectedUsers();
                hideUsernameSelection();
                displayChatAndOnlineUsers();
            })
            .catch(error => {
                console.error("Failed to save the username:", error);
            });
    };

    const setupEventListeners = () => {
        const sendMessageButton = document.getElementById("send-msg-btn");
        sendMessageButton.addEventListener("click", sendMessage);

        const messageTextarea = document.getElementById("input-msg");
        messageTextarea.addEventListener("keyup", (event) => {
            if (event.key === "Enter" && !event.shiftKey) {
                sendMessage();
                event.preventDefault();
            }
        });

        const sendUsernameButton = document.getElementById("send-username-btn");
        sendUsernameButton.addEventListener("click", chooseUsername);
    };

    setupEventListeners();
})();

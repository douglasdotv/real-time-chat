(function () {
    let user;

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
        dateElement.innerText = new Date(date).toLocaleString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
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

    const attachMessageToChat = (message) => {
        const messageList = document.getElementById("messages");
        const messageElement = createMessageContainerElement(message);

        messageList.appendChild(messageElement);
        messageElement.scrollIntoView({behavior: "smooth"});
    };

    const saveMessage = (message) => {
        fetch("/message", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({message: message, sender: user, date: new Date()})
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

        if (!isValidMessage(message) || !user) {
            return;
        }

        if (stompClient) {
            const chatMessage = {message: message, sender: user, date: new Date()};
            stompClient.send("/app/chat", {}, JSON.stringify(chatMessage));
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
            body: JSON.stringify({username: username})
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

    const hideUsernameBox = () => {
        const chooseUsernameArea = document.getElementById("choose-username-area");
        chooseUsernameArea.style.display = "none";
    }

    const displayChatBox = () => {
        const chatBox = document.getElementById("chat-box");
        chatBox.style.display = "flex";
    }

    const chooseUsername = () => {
        const inputUsername = document.getElementById("input-username").value;

        if (!isValidUsername(inputUsername)) {
            displayUsernameError("length");
            return;
        }

        saveUsername(inputUsername)
            .then(response => {
                user = response.username;
                hideUsernameBox();
                displayChatBox();
            })
            .catch(error => {
                console.error('Failed to save the username:', error);
            });
    };

    const socket = new SockJS("/ws");
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, function () {
        stompClient.subscribe("/topic/messages", function (messageOutput) {
            attachMessageToChat(JSON.parse(messageOutput.body));
        });
    });

    const getPreviousMessages = () => {
        fetch("/messages")
            .then(response => response.json())
            .then(data => {
                const messageList = document.getElementById("messages");
                for (const message of data) {
                    const messageElement = createMessageContainerElement(message);
                    messageList.appendChild(messageElement);
                }
            })
            .catch(error => console.log(error));
    }

    getPreviousMessages();

    const setupEventListeners = () => {
        const sendMessageButton = document.getElementById("send-msg-btn");
        sendMessageButton.addEventListener("click", sendMessage);

        const textarea = document.getElementById("input-msg");
        textarea.addEventListener("keyup", (event) => {
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

(function () {
    const isValidMessage = (message) => {
        return message.trim() !== "";
    };

    const createMessageElement = (message) => {
        const messageElement = document.createElement("li");

        messageElement.classList.add("list-group-item", "message");
        messageElement.innerText = message;

        return messageElement;
    };

    const attachMessageToChat = (message) => {
        const messageList = document.getElementById("messages");
        const messageElement = createMessageElement(message);

        messageList.appendChild(messageElement);
        messageElement.scrollIntoView({behavior: "smooth"});
    };

    const sendMessage = () => {
        const message = document.getElementById("input-msg").value;

        if (!isValidMessage(message)) {
            return;
        }

        attachMessageToChat(message);
        document.getElementById("input-msg").value = "";
    };

    const setupEventListeners = () => {
        const sendMessageButton = document.getElementById("send-msg-btn");
        sendMessageButton.addEventListener("click", sendMessage);

        const textArea = document.getElementById("input-msg");
        textArea.addEventListener("keyup", (event) => {
            if (event.key === "Enter" && !event.shiftKey) {
                sendMessage();
                event.preventDefault();
            }
        });
    };

    setupEventListeners();
})();

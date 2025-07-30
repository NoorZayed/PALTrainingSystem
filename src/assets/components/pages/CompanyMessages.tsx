import React, { useState, ChangeEvent, useEffect } from "react";
import styles from "../css/Messages.module.css";
import CompanyAside from "../Navbar/CompanyAside";
import { API_BASE_URL } from '../utils/apiUtils';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  orderBy,
  addDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import db from "../../../firebase";

interface FirebaseMessage {
  id?: string;
  sender: string;
  message: string;
  time: string;
  isUser: boolean;
}

interface Message {
  sender: string;
  messages: FirebaseMessage[];
  hasUnread?: boolean;
}

const currentUser =
  JSON.parse(localStorage.getItem("user") || "{}").id || "company1";

const CompanyMessages: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentChat, setCurrentChat] = useState<Message | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"students" | "supervisors">(
    "students"
  );
  const [userOptions, setUserOptions] = useState<
    { id: string; email: string; name?: string }[]
  >([]);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [newMessageSearch, setNewMessageSearch] = useState("");

  useEffect(() => {
    const fetchOrCreateConversation = async () => {
      const conversationsRef = collection(db, "conversations");
      const q = query(conversationsRef);
      const snapshot = await getDocs(q);
      const existing = snapshot.docs.find(
        (doc) =>
          doc.data().participants.includes(currentUser) &&
          doc.data().participants.includes("student1")
      );

      if (existing) {
        setConversationId(existing.id);
      } else {
        const newConv = await addDoc(conversationsRef, {
          participants: [currentUser, "student1"],
          createdAt: serverTimestamp(),
        });
        setConversationId(newConv.id);
      }
    };

    fetchOrCreateConversation();
  }, []);

  useEffect(() => {
    if (!conversationId) return;
    const messagesRef = collection(
      db,
      "conversations",
      conversationId,
      "messages"
    );
    const q = query(messagesRef, orderBy("timestamp"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatMessages: FirebaseMessage[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          sender: data.sender,
          message: data.message,
          time: data.timestamp?.toDate().toLocaleTimeString() || "...",
          isUser: data.sender === currentUser,
        };
      });

      const chat: Message = {
        sender: "Student",
        messages: chatMessages,
      };

      setMessages([chat]);
      setCurrentChat(chat);
    });

    return () => unsubscribe();
  }, [conversationId]);

  // Fetch users for tabs
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (activeTab === "students") {
          const res = await fetch(`${API_BASE_URL}/api/students`);
          const data = await res.json();
          setUserOptions(data);
        } else {
          // Fetch all supervisors
          const res = await fetch(`${API_BASE_URL}/api/supervisors`);
          const data = await res.json();
          setUserOptions(data);
        }
      } catch (err) {
        setUserOptions([]);
      }
    };
    fetchUsers();
  }, [activeTab]);

  const handleChatClick = (message: Message) => {
    setCurrentChat(message);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversationId) return;

    const messagesRef = collection(
      db,
      "conversations",
      conversationId,
      "messages"
    );
    await addDoc(messagesRef, {
      sender: currentUser,
      message: newMessage,
      timestamp: serverTimestamp(),
      isRead: false,
    });
    setNewMessage("");
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredMessages = messages.filter((message) =>
    message.sender.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = userOptions.filter((user) => {
    const search = searchQuery.toLowerCase();
    return (
      user.email.toLowerCase().includes(search) ||
      (user.name && user.name.toLowerCase().includes(search))
    );
  });

  const allUsers = userOptions;
  const filteredNewMessageUsers = allUsers.filter((user) => {
    const search = newMessageSearch.toLowerCase();
    return (
      user.email.toLowerCase().includes(search) ||
      (user.name && user.name.toLowerCase().includes(search))
    );
  });

  const handleStartNewMessage = (user: {
    id: string;
    email: string;
    name?: string;
  }) => {
    setShowNewMessageModal(false);
    setNewMessageSearch("");
    // Start chat with selected user
    // ...existing logic to set conversationId, etc.
  };

  return (
    <div className={styles.container}>
      <CompanyAside />
      <main className={styles.mainContent}>
        <div className={styles.tabs}>
          <button
            className={activeTab === "students" ? styles.activeTab : ""}
            onClick={() => setActiveTab("students")}
          >
            Students
          </button>
          <button
            className={activeTab === "supervisors" ? styles.activeTab : ""}
            onClick={() => setActiveTab("supervisors")}
          >
            Supervisors
          </button>
        </div>
        <div className={styles.messagesContainer}>
          <aside className={styles.chatList}>
            <div className={styles.chatListHeader}>
              Messages
              <button
                className={styles.newChatButton}
                title="New Message"
                onClick={() => setShowNewMessageModal(true)}
              >
                +
              </button>
            </div>
            <div className={styles.searchSection}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder={`Search ${
                  activeTab === "students" ? "students" : "supervisors"
                }...`}
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <div className={styles.userList}>
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className={styles.chatListItemContent}
                    onClick={() => {
                      setCurrentChat({
                        sender: user.name || user.email,
                        messages: [],
                      });
                    }}
                  >
                    <div className={styles.userAvatar}>
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                          user.name || user.email
                        )}&background=2e7d32&color=fff&size=32`}
                        alt="avatar"
                      />
                    </div>
                    <div className={styles.userInfo}>
                      <span className={styles.userName}>
                        {user.name || user.email}
                      </span>
                      {user.name && (
                        <span className={styles.userEmail}>({user.email})</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
          <div className={styles.chatArea}>
            {currentChat ? (
              <>
                <div className={styles.chatHeader}>
                  <div className={styles.chatHeaderAvatar}>
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                        currentChat.sender
                      )}&background=2e7d32&color=fff&size=40`}
                      alt="avatar"
                    />
                  </div>
                  <div className={styles.chatHeaderInfo}>
                    <div className={styles.chatHeaderTitle}>
                      Chat with:{" "}
                      <span className={styles.userName}>
                        {currentChat.sender}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={styles.chatMessages}>
                  {currentChat.messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`${styles.message} ${
                        msg.isUser ? styles.userMessage : styles.otherMessage
                      }`}
                    >
                      <div className={styles.messageContent}>
                        <span>{msg.message}</span>
                        <span className={styles.messageTime}>{msg.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className={styles.chatInputSection}>
                  <input
                    type="text"
                    placeholder="Type your message"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    className={styles.chatInput}
                  />
                  <button
                    onClick={handleSendMessage}
                    className={styles.sendButton}
                  >
                    Send
                  </button>
                </div>
              </>
            ) : (
              <div className={styles.emptyChatPrompt}>
                Select a user to start chatting.
              </div>
            )}
          </div>
        </div>
        {showNewMessageModal && (
          <div
            className={styles.modalOverlay}
            onClick={() => setShowNewMessageModal(false)}
          >
            <div
              className={styles.newMessageModal}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>Start New Message</div>
              <input
                type="text"
                className={styles.searchInput}
                placeholder={`Search ${
                  activeTab === "students" ? "students" : "supervisors"
                }...`}
                value={newMessageSearch}
                onChange={(e) => setNewMessageSearch(e.target.value)}
                autoFocus
              />
              <div className={`${styles.userList} ${styles.modalUserList}`}>
                {filteredNewMessageUsers.length === 0 && (
                  <div className={styles.modalEmptyPrompt}>No users found.</div>
                )}
                {filteredNewMessageUsers.map((user) => (
                  <div
                    key={user.id}
                    className={styles.chatListItemContent}
                    onClick={() => handleStartNewMessage(user)}
                  >
                    <div className={styles.userAvatar}>
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                          user.name || user.email
                        )}&background=2e7d32&color=fff&size=32`}
                        alt="avatar"
                      />
                    </div>
                    <div className={styles.userInfo}>
                      <span className={styles.userName}>
                        {user.name || user.email}
                      </span>
                      {user.name && (
                        <span className={styles.userEmail}>({user.email})</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button
                className={styles.closeModalButton}
                onClick={() => setShowNewMessageModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CompanyMessages;

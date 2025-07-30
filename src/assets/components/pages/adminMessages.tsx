import React, { useState, useEffect, ChangeEvent } from "react";
import styles from "../css/Messages.module.css";
import AdminAside from "../Navbar/AdminAside";
import { API_BASE_URL } from '../utils/apiUtils';
import {
  collection,
  query,
  orderBy,
  addDoc,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import db from "../../../firebase";

interface FirebaseMessage {
  id?: string;
  sender: string;
  message: string;
  time: string;
  isUser: boolean;
}

interface UserOption {
  id: string;
  name: string;
}

function getConversationId(userA: string, userB: string): string {
  return [userA, userB].sort().join("_");
}

const currentUser =
  JSON.parse(localStorage.getItem("user") || "{}").id || "admin1";

const AdminMessages: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"students" | "supervisors">(
    "students"
  );
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<FirebaseMessage[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [newMessageSearch, setNewMessageSearch] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const endpoint =
          activeTab === "students" ? "/api/students" : "/api/supervisors";
        const res = await fetch(`${API_BASE_URL}${endpoint}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setUserOptions(data);
        } else {
          console.error("Data is not an array:", data);
          setUserOptions([]);
        }
      } catch (err) {
        console.error("Failed to load users:", err);
        setUserOptions([]);
      }
    };
    fetchUsers();
    setSelectedUser(null);
    setChatMessages([]);
    setConversationId(null);
  }, [activeTab]);

  useEffect(() => {
    if (!conversationId) return;
    const q = query(
      collection(db, "conversations", conversationId, "messages"),
      orderBy("timestamp")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          sender: data.sender,
          message: data.message,
          time: data.timestamp?.toDate().toLocaleTimeString() || "...",
          isUser: data.sender === currentUser,
        };
      });
      setChatMessages(msgs);
    });
    return () => unsubscribe();
  }, [conversationId]);

  const handleUserSelect = async (user: UserOption) => {
    setSelectedUser(user);
    const convId = getConversationId(currentUser, user.id);
    setConversationId(convId);
    const convRef = doc(db, "conversations", convId);
    const snapshot = await getDoc(convRef);
    if (!snapshot.exists()) {
      await setDoc(convRef, {
        participants: [currentUser, user.id],
        createdAt: serverTimestamp(),
      });
    }
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

  const getFullName = (user: UserOption) => `${user.name || ""}`.trim();

  const filteredUsers = userOptions.filter((user) =>
    getFullName(user).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredNewMessageUsers = userOptions.filter((user) =>
    getFullName(user).toLowerCase().includes(newMessageSearch.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <AdminAside />
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
            <div className={styles.chatListHeader}>Messages</div>
            <div className={styles.searchSection}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
              />
              <div className={styles.userList}>
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className={styles.chatListItemContent}
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className={styles.userAvatar}>
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                          getFullName(user)
                        )}&background=2e7d32&color=fff&size=32`}
                        alt="avatar"
                      />
                    </div>
                    <div className={styles.userInfo}>
                      <span className={styles.userName}>
                        {getFullName(user)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <div className={styles.chatArea}>
            {selectedUser ? (
              <>
                <div className={styles.chatHeader}>
                  <div className={styles.chatHeaderAvatar}>
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                        getFullName(selectedUser)
                      )}&background=2e7d32&color=fff&size=40`}
                      alt="avatar"
                    />
                  </div>
                  <div className={styles.chatHeaderInfo}>
                    <div className={styles.chatHeaderTitle}>
                      Chat with:{" "}
                      <span className={styles.userName}>
                        {getFullName(selectedUser)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={styles.chatMessages}>
                  {chatMessages.map((msg, index) => (
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
                placeholder="Search by name..."
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
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className={styles.userAvatar}>
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                          getFullName(user)
                        )}&background=2e7d32&color=fff&size=32`}
                        alt="avatar"
                      />
                    </div>
                    <div className={styles.userInfo}>
                      <span className={styles.userName}>
                        {getFullName(user)}
                      </span>
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

export default AdminMessages;

import React, { useState, useRef, useEffect } from 'react';
import Signin from '../components/SignIn-coms';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_API_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const icon = ` Exploring the uncharted regions"
                        .   *        .       .
         *      -0-
            .                .  *       - )-
         .      *       o       .       *
   o                |
             .     -O-
  .                 |        *      .     -0-
         *  o     .    '       *      .        o
                .         .        |      *
     *             *              -O-          .
           .             *         |     ,
       *  o     .    '       *      .        o
                .         .              *
     *             *              -          .
           .             *              ,
                   .                        *         .
                   .                        *
         *               - ) -       *
                .               .
`;

const MissionControlCRM = () => {
  const [contacts, setContacts] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const isLoggedInRef = useRef(false);
  const [currentContact, setCurrentContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'cadet'
  });

  // Fetch contacts + messages from Supabase on mount
  useEffect(() => {
    if (!isLoggedIn) return; // Do nothing if not logged in
  
    async function fetchContacts() {
      const { data, error } = await supabase
        .from('ICChat')
        .select(`
          *,
          ICMessage (
            idText,
            time,
            text,
            sent
          )
        `)
        .order('name', { ascending: true });
  
      if (error) {
        console.error('Error fetching contacts:', error);
        return;
      }
  
      const contactsWithMessages = data.map(contact => ({
        ...contact,
        messages: contact.ICMessage || [],
      }));
  
      setContacts(contactsWithMessages);
    }
  
    fetchContacts();
  }, [isLoggedIn]);
  

  // Tampering detection for Signin modal
  useEffect(() => {
    if (isLoggedIn) {
      isLoggedInRef.current = true;
      return;
    }

    const observer = new MutationObserver(() => {
      setTimeout(() => {
        const stillExists = document.getElementById("signin-overlay");
        if (!stillExists && !isLoggedInRef.current) {
          console.warn("Overlay tampered with. Reloading...");
          window.location.reload();
        }
      }, 100);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [isLoggedIn]);

  // Scroll messages to bottom when they change
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [currentContact?.messages]);

  // Filter contacts by search term
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectContact = (contact) => {
    setCurrentContact(contact);
  };

  // Send a message (client-side only for now)
  const sendMessage = () => {
    if (!messageInput.trim() || !currentContact) return;

    const now = new Date();
    const timeString = now.toTimeString().split(' ')[0];

    const newMessage = {
      text: messageInput,
      sent: true,
      time: timeString
    };

    // Update contacts list with new message
    const updatedContacts = contacts.map(contact => {
      if (contact.id === currentContact.id) {
        return {
          ...contact,
          messages: [...contact.messages, newMessage],
          lastMessage: messageInput
        };
      }
      return contact;
    });

    setContacts(updatedContacts);

    // Update current contact messages
    setCurrentContact(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
      lastMessage: messageInput
    }));

    setMessageInput('');

    // Simulated auto-reply after 2 seconds
    setTimeout(() => {
      const autoReply = {
        text: "Signal received. Processing transmission... Stand by.",
        sent: false,
        time: new Date().toTimeString().split(' ')[0]
      };

      const autoUpdatedContacts = updatedContacts.map(contact => {
        if (contact.id === currentContact.id) {
          return {
            ...contact,
            messages: [...contact.messages, newMessage, autoReply],
            lastMessage: autoReply.text
          };
        }
        return contact;
      });

      setContacts(autoUpdatedContacts);
      setCurrentContact(prev => ({
        ...prev,
        messages: [...prev.messages, autoReply],
        lastMessage: autoReply.text
      }));
    }, 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const addNewContact = (e) => {
    e.preventDefault();
    const contact = {
      id: contacts.length + 1,
      name: newContact.name.toUpperCase().replace(/\s+/g, '_'),
      email: newContact.email || 'NO_COMMS_ESTABLISHED',
      phone: newContact.phone || 'COMM_LINK_PENDING',
      status: newContact.status,
      online: true,
      lastMessage: '*** NEW CREW MEMBER REGISTERED ***',
      messages: []
    };

    setContacts([contact, ...contacts]);
    setShowModal(false);
    setNewContact({ name: '', email: '', phone: '', status: 'cadet' });
  };

  const viewContactDetails = () => {
    if (!currentContact) return;

    const details = `
╔════════════════════════════════╗
║ CREW MEMBER PROFILE ║
╠════════════════════════════════╣
║ CALLSIGN: ${currentContact.name.padEnd(19)} ║
║ EMAIL: ${currentContact.email.padEnd(22)} ║
║ COMM: ${currentContact.phone.padEnd(23)} ║
║ RANK: ${currentContact.status.toUpperCase().padEnd(24)} ║
║ STATUS: ${(currentContact.online ? 'ACTIVE' : 'OFFLINE').padEnd(21)} ║
╚════════════════════════════════╝`;

    alert(details);
  };

  const editContact = () => {
    alert('╔═══════════════════════════════╗\n║ CREW EDIT PROTOCOL ACTIVE ║\n║ FEATURE UNDER DEVELOPMENT ║\n╚═══════════════════════════════╝');
  };

  const archiveContact = () => {
    if (!currentContact) return;

    if (window.confirm('╔═══════════════════════════════╗\n║ REMOVE FROM MISSION? ║\n║ CONFIRM CREW REMOVAL [Y/N] ║\n╚═══════════════════════════════╝')) {
      setContacts(contacts.filter(c => c.id !== currentContact.id));
      setCurrentContact(null);
    }
  };

  const getStatusSymbol = (status) => {
    switch(status) {
      case 'emergency': return '⚠';
      case 'engineer': return '⚙';
      case 'cadet': return '★';
      default: return '○';
    }
  };

  return (
    <div className="h-screen flex bg-zinc-900 text-amber-100 font-mono overflow-hidden">
      {!isLoggedIn && (
        <div id="signin-overlay" className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-70 flex items-center justify-center z-[9999]">
          <Signin onLoginSuccess={() => {
            setIsLoggedIn(true);
            isLoggedInRef.current = true;
          }} />
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');
        .font-mono {
          font-family: 'JetBrains Mono', 'Courier New', monospace;
        }
        .glow {
          text-shadow: 0 0 10px #fef3c7;
          animation: glow 2s ease-in-out infinite alternate;
        }
        .urgent-glow {
          text-shadow: 0 0 10px #ef4444;
          animation: urgent-glow 1s ease-in-out infinite alternate;
        }
        @keyframes glow {
          from { text-shadow: 0 0 5px #fef3c7; }
          to { text-shadow: 0 0 20px #fef3c7, 0 0 30px #fef3c7; }
        }
        @keyframes urgent-glow {
          from { text-shadow: 0 0 5px #ef4444; }
          to { text-shadow: 0 0 20px #ef4444, 0 0 30px #ef4444; }
        }
        .blink {
          animation: blink 1s infinite;
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .scanlines {
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(254, 243, 199, 0.03) 2px,
            rgba(254, 243, 199, 0.03) 4px
          );
        }
        .scanlines-vertical {
          background: repeating-linear-gradient(
            90deg,
            transparent,
            transparent 2px,
            rgba(254, 243, 199, 0.02) 2px,
            rgba(254, 243, 199, 0.02) 4px
          );
        }
        .terminal-border {
          border: 2px solid #71797E;
        }
        .terminal-border-thin {
          border: 1px solid #fef3c7;
        }
        .terminal-input:focus {
          outline: none;
          box-shadow: 0 0 10px rgba(254, 243, 199, 0.5);
        }
        .terminal-button:hover {
          background: #1f1f1f;
          box-shadow: 0 0 15px rgba(254, 243, 199, 0.5);
        }
        .scrollbar-terminal::-webkit-scrollbar {
          width: 8px;
        }
        .scrollbar-terminal::-webkit-scrollbar-track {
          background: #000;
        }
        .scrollbar-terminal::-webkit-scrollbar-thumb {
          background: #fef3c7;
          border-radius: 0;
        }
      `}</style>

      {/* Mission Control Sidebar */}
      <div className="w-80 bg-zinc-900 terminal-border border-r-0 flex flex-col h-screen relative scanlines">
        {/* Mission Header */}
        <div className="p-4 border-b-2 border-white border-opacity-30 bg-zinc-900 text-center relative z-10">
          <div className="text-xs mb-2">
            ╔════════════════════════════════╗
          </div>
          <h2 className="text-sm mb-1"> MISSION CONTROL </h2>
          <div className="text-xs mb-2">Internal Communications</div>
          <div className="text-xs mb-3">
            ╚════════════════════════════════╝
          </div>
          <label className="block text-xs mb-1">► SEARCH CREW:</label>
          <input
            type="text"
            placeholder="enter callsign..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 terminal-border-thin bg-zinc-900 text-amber-100 text-xs terminal-input placeholder-amber-100 placeholder-opacity-50"
          />
        </div>

        {/* Crew List */}
        <div className="flex-1 overflow-y-auto p-0 relative z-10 scrollbar-terminal">
          {filteredContacts.map(contact => (
            <div
              key={contact.id}
              className={`p-3 cursor-pointer border-b border-white border-opacity-30 text-xs leading-tight transition-all duration-200 hover:bg-white hover:bg-opacity-20 hover:border-l-4 hover:border-l-amber-100 ${
                currentContact?.id === contact.id ? 'bg-white bg-opacity-20 border-l-4 border-l-amber-100 shadow-inner' : ''
              }`}
              onClick={() => selectContact(contact)}
            >
              <div className="flex justify-between items-center mb-1">
                <div className="text-amber-100 font-bold text-xs">{contact.name}</div>
                <div className={`text-xs ${contact.online ? 'text-amber-100' : 'text-white text-opacity-50'}`}>
                  {contact.online ? '*' : '*'}
                </div>
              </div>
              <div className="text-white text-opacity-50 text-xs mb-1 truncate">
                &gt; {contact.lastMessage}
              </div>
              <div className="flex justify-between text-white text-opacity-30 text-xs">
                <span className="">
                  {getStatusSymbol(contact.status)} {contact.status.toUpperCase()}
                </span>
                <span>{contact.online ? 'ACTIVE' : 'OFFLINE'}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Add Crew Member Button */}
        <button
          onClick={() => setShowModal(true)}
          className="m-4 p-3 bg-zinc-900 text-amber-100 terminal-border cursor-pointer font-bold text-xs uppercase transition-all duration-200 terminal-button"
        >
          ┌─ REGISTER NEW CREW ─┐<br />
          └─────────────────────────┘
        </button>
      </div>

      {/* Communication Panel */}
      <div className="flex-1 flex flex-col bg-zinc-900 terminal-border border-l-0 relative scanlines-vertical">
        {!currentContact ? (
          <div className="flex-1 flex flex-col items-center justify-center text-white text-opacity-50 text-xs relative z-10">
            <pre className="text-xs leading-none text-white text-opacity-30 text-center mb-5">
              {icon}
            </pre>
            <p>AWAITING TRANSMISSION <span className="blink ">*</span></p>
          </div>
        ) : (
          <>
            {/* Communication Header */}
            <div className="p-4 border-b-2 border-amber-100 bg-zinc-900 flex items-center justify-between relative z-10">
              <div className="flex items-center">
                <div>
                  <h3 className="text-amber-100 mb-1 text-sm">{currentContact.name}</h3>
                  <p className="text-white text-opacity-90 text-xs">
                    COMM STATUS: <span className={currentContact.online ? 'text-amber-100' : 'text-white text-opacity-90'}>
                      {currentContact.online ? 'ACTIVE LINK' : 'SIGNAL LOST'}
                    </span> | RANK: <span>{currentContact.status.toUpperCase()}</span>
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={viewContactDetails}
                  className="px-2 py-1 terminal-border-thin bg-zinc-900 text-amber-100 cursor-pointer text-xs uppercase transition-all duration-200 terminal-button"
                >
                  [PROFILE]
                </button>
                <button
                  onClick={editContact}
                  className="px-2 py-1 terminal-border-thin bg-zinc-900 text-amber-100 cursor-pointer text-xs uppercase transition-all duration-200 terminal-button"
                >
                  [EDIT]
                </button>
                <button
                  onClick={archiveContact}
                  className="px-2 py-1 terminal-border-thin bg-zinc-900 text-amber-100 cursor-pointer text-xs uppercase transition-all duration-200 terminal-button"
                >
                  [REMOVE]
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-zinc-900 relative z-10 scrollbar-terminal">
              {currentContact.messages.map((message, index) => (
                <div key={index} className={`mb-4 text-xs leading-relaxed ${message.sent ? 'text-right' : 'text-left'}`}>
                  <div className="text-white text-opacity-90 text-xs mb-1">
                    [{message.time}] {message.sent ? 'MISSION CONTROL' : currentContact.name}:
                  </div>
                  <div className={`p-2 terminal-border-thin bg-zinc-900 inline-block max-w-xs ${
                    message.sent
                      ? 'border-r-4 border-r-white text-white ml-24'
                      : 'border-l-4 border-l-amber-100 text-amber-100'
                  }`}>
                    {message.sent ? '>> ' : '<< '}{message.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t-2 border-amber-100 bg-zinc-900 relative z-10">
              <label className="block text-amber-100 text-xs mb-1">► TRANSMIT MESSAGE:</label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="type transmission here..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 p-2 terminal-border-thin bg-zinc-900 text-amber-100 text-xs terminal-input placeholder-amber-100 placeholder-opacity-50"
                />
                <button
                  onClick={sendMessage}
                  className="px-4 py-2 terminal-border bg-zinc-900 text-amber-100 cursor-pointer text-xs font-bold uppercase transition-all duration-200 terminal-button"
                  >
                  SEND
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* New Crew Member Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[10000]"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-zinc-900 p-6 rounded-md w-96 terminal-border relative"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-amber-100 mb-4 font-bold text-sm uppercase">
              REGISTER NEW CREW MEMBER
            </h3>
            <form onSubmit={addNewContact} className="flex flex-col gap-3 text-xs text-amber-100">
              <label>
                Callsign:
                <input
                  type="text"
                  value={newContact.name}
                  onChange={e => setNewContact({...newContact, name: e.target.value})}
                  className="w-full mt-1 p-2 bg-zinc-800 text-amber-100 terminal-input terminal-border-thin"
                  required
                />
              </label>
              <label>
                Email (optional):
                <input
                  type="email"
                  value={newContact.email}
                  onChange={e => setNewContact({...newContact, email: e.target.value})}
                  className="w-full mt-1 p-2 bg-zinc-800 text-amber-100 terminal-input terminal-border-thin"
                />
              </label>
              <label>
                Phone (optional):
                <input
                  type="text"
                  value={newContact.phone}
                  onChange={e => setNewContact({...newContact, phone: e.target.value})}
                  className="w-full mt-1 p-2 bg-zinc-800 text-amber-100 terminal-input terminal-border-thin"
                />
              </label>
              <label>
                Rank:
                <select
                  value={newContact.status}
                  onChange={e => setNewContact({...newContact, status: e.target.value})}
                  className="w-full mt-1 p-2 bg-zinc-800 text-amber-100 terminal-input terminal-border-thin"
                >
                  <option value="cadet">Cadet</option>
                  <option value="engineer">Engineer</option>
                  <option value="emergency">Emergency</option>
                </select>
              </label>

              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 terminal-border-thin bg-zinc-800 text-amber-100 cursor-pointer text-xs uppercase terminal-button"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 terminal-border bg-amber-600 text-black font-bold text-xs uppercase cursor-pointer terminal-button"
                >
                  REGISTER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MissionControlCRM;

import React, { useState, useRef, useEffect } from 'react';
import Signin from '../components/SignIn-coms';

import { supabase } from '../singletonSupabase';
import { useSearchParams } from 'react-router-dom';
import { SpeedInsights } from "@vercel/speed-insights/next";




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
  const [searchParams] = useSearchParams();  // <-- already present

  const [user, setUser] = useState(null);
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
    status: 'cadet',
    online: true,
    lastMessage: 'New crew member registered'
  });
  
  // Get logged-in user info from Supabase auth
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setIsLoggedIn(!!data.user);
      if (data.user) isLoggedInRef.current = true;
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoggedIn(!!session?.user);
      isLoggedInRef.current = !!session?.user;
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);


  useEffect(() => {
    if (!isLoggedIn) return; // Do nothing if not logged in
  
    const idFromUrl = searchParams.get('id');
    const id = idFromUrl || '1'; 
  
    if (!idFromUrl) {
      console.warn('ADD HINT HERE !');
    }
  
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
        .eq('id', id) 
        .single();
  
      if (error) {
        console.error('Error fetching contacts:', error);
        return;
      }
  
      setContacts([{
        ...data,
        messages: data.ICMessage || [],
      }]);
    }
  
    fetchContacts();
  }, [isLoggedIn, searchParams]);
  

  // ... rest of your component code



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

  // Filter contacts by logged-in user and search term
  const filteredContacts = contacts
    .filter(contact => contact.user_id === user?.id) // filter by logged-in user ID
    .filter(contact =>
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

  const addNewContact = async (e) => {
    e.preventDefault();
    
    if (!newContact.name.trim()) return;

    try {
      const { data, error } = await supabase
        .from('ICChat')
        .insert([
          {
            ...newContact,
            user_id: user.id,
            messages: []
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error adding contact:', error);
        alert('Error adding crew member. Please try again.');
        return;
      }

      // Add to local state
      const newContactWithMessages = {
        ...data,
        messages: []
      };

      setContacts(prev => [...prev, newContactWithMessages]);
      
      // Reset form and close modal
      setNewContact({
        name: '',
        email: '',
        phone: '',
        status: 'cadet',
        online: true,
        lastMessage: 'New crew member registered'
      });
      setShowModal(false);

    } catch (error) {
      console.error('Error adding contact:', error);
      alert('Error adding crew member. Please try again.');
    }
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
      <SpeedInsights />
      {!isLoggedIn && (
        <div id="signin-overlay" className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-70 flex items-center justify-center z-[9999]">
          <Signin onLoginSuccess={() => {
            setIsLoggedIn(true);
            isLoggedInRef.current = true;
          }} />
        </div>
      )}

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

    
    </div>
  );
};

export default MissionControlCRM
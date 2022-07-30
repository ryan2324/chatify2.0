//Web socket configuration

const socket = io('http://localhost:3000/');
socket.emit('verify-token', {user: document.cookie})
const messageBox = document.querySelector('[name="message-box"]');
const sendBtn = document.getElementById('sendBtn');
let contacts = document.querySelectorAll('.contacts .contact');
const contactsContainer = document.querySelector('.contacts');
const searchBox = document.getElementById('search-box');
const searchResultContainer = document.querySelector('.search-result-container');
const messages = document.querySelector('.messages');
const messageForm = document.getElementById('message-form');
const sideProfile = document.querySelector('.chat-with-info');
const sideProfileName = document.querySelector('.chat-with-info .name');
const sideProfileAvatar = document.querySelector('.chat-with-info .profile span');
let addContact = document.querySelectorAll('.search-result-container .add-contact');
const deleteContactBtn = document.getElementById('delete');
const contactSideBar = document.querySelector('.contact-list');
const burgerMenuBtn = document.getElementById('burger-menu');
const logoutBtn = document.getElementById('logout');


let receiver = {
    user_id: '',
    email: ''
};


sendBtn.addEventListener('click', async(e) =>{
    e.preventDefault();
    if(messageBox.value == " " || messageBox.value == "" || messageBox.value.trim().length == 0){
        return
    }
    const sendRes =  await axios.post('/send', {
        sender: `${document.cookie}`,
        receiver: receiver,
        message: messageBox.value,
    })
    socket.emit('send',{
        sender: `${document.cookie}`,
        receiver: receiver,
        message: messageBox.value,
    })
    const msg = document.createElement('span');
    msg.setAttribute('class', 'sent');
    msg.innerHTML = messageBox.value;
    messages.append(msg);
    pushToTopRecentContact(receiver.user_id, receiver.email, receiver.name, messageBox.value, true);
    messageBox.value = '';
    
})

const pushToTopRecentContact = (id, email, name, recentMessage, sent=true) =>{
    document.querySelector(`.contacts  [data-id="${id}"]`).remove();
    const div = document.createElement('div');
    div.setAttribute('class', 'contact')
    div.setAttribute('data-id', id);
    div.setAttribute('data-email', email);
    div.innerHTML = `
    <div class="profile-container">
        <span>${name[0]}</span>
    </div>
    <div class="info">
        <p class="name">${name}</p>
        <p class="recent-message" style="${!sent ? "color: rgb(0, 0, 0); font-weight: 600;": "color: rgb(113, 113, 113); font-weight: 500; " }">${recentMessage}</p>
    </div>
    `
    contactsContainer.prepend(div);
    contacts = document.querySelectorAll('.contacts .contact');
    contactsHandler();
    messages.scrollTop = messages.scrollHeight;
}

let contactsList = [];

const fetchContacts = async () =>{
    const res = await axios.get('/contact/my-contacts');
    contactsList = [...res.data];
    contactsContainer.innerHTML = '';
    if(contactsList.length < 1){
        const notice = document.createElement('div');
        notice.setAttribute('class', 'notice');
        notice.innerHTML = '<i class="fa-solid fa-plus"></i><p> No contacts to show. Add someone to start conversation </p>'
        contactsContainer.append(notice);
    }else{
        contactsList.map((contact) =>{
            const contactEl = document.createElement('div');
            contactEl.setAttribute('class', 'contact');
            contactEl.setAttribute('data-email', `${contact.email}`);
            contactEl.setAttribute('data-id', `${contact.contact_user_id}`);
            let recentMsg = contact.recent_message;
            let recentMsgStyle = "color: rgb(0, 0, 0); font-weight: 600;";
            if(!recentMsg){
                recentMsg = "New Contact"
            }else if(recentMsg.split(':')[0] === "sent" ){
                recentMsg = recentMsg.split(':')[1]
                recentMsgStyle = "color: rgb(113, 113, 113); font-weight: 500;";
            }else{
                recentMsg = recentMsg.split(':')[1]
            }
            contactEl.innerHTML = `
                <div class="profile-container">
                    <span>${contact.name[0]}</span>
                </div>
                <div class="info">
                    <p class="name">${contact.name}</p>
                    <p class="recent-message" style="${recentMsgStyle}">${recentMsg}</p>
                </div>
            `
            contactsContainer.append(contactEl);
        })
        contacts = document.querySelectorAll('.contacts .contact');
        contactsHandler();
    }
}
fetchContacts();

socket.on('receive', async (data) =>{
    const checkContact = contactsList.find((con) =>{
        return con.contact_user_id === data.sender.user_id
    })
    if(!checkContact){
        const newContact = document.createElement('div');
        newContact.setAttribute('class', 'contact');
        newContact.setAttribute('data-email', `${ data.sender.email}`);
        newContact.setAttribute('data-id', `${data.sender.user_id}`);
        newContact.innerHTML = 
        `
            <div class="profile-container">
                <span>R</span>
            </div>
            <div class="info">
                <p class="name">${data.sender.name}</p>
                <p class="recent-message" style="color:#000; font-weight: 500;">${data.message}</p>
            </div>
        `;
        const res = await axios.post(`/contact/add/${data.sender.user_id}`, {
        })
        contactsContainer.prepend(newContact);
        contacts = document.querySelectorAll('.contacts .contact');
        fetchContacts();
        return
    }
    const recentMessage = document.querySelector(`.contacts  [data-id="${data.sender.user_id}"] .recent-message`);
    recentMessage.innerHTML = data.message;
    recentMessage.style.color = 'rgb(0, 0, 0)'

    const msg = document.createElement('span');
    msg.setAttribute('class', 'received');
    if(receiver.email.length > 1 && receiver.user_id.toString() === data.sender.user_id.toString()){
        msg.innerHTML = data.message;
        messages.append(msg);
    }
    pushToTopRecentContact(data.sender.user_id, data.sender.email, data.sender.name, data.message, false);
})

const contactsHandler = () =>{
    contacts.forEach((e) =>{
        e.addEventListener('click', (e) =>{
            if(e.target.nodeName !== 'DIV'){
                receiver.email = e.target.parentElement.parentElement.getAttribute('data-email');
                receiver.user_id = e.target.parentElement.parentElement.getAttribute('data-id');
                receiver.name = document.querySelector(`.contacts [data-id='${e.target.parentElement.parentElement.getAttribute('data-id')}'] .info .name`).textContent;
                setReceiver();
                return
            }else if(e.target.className === 'profile-container' || e.target.className === 'info'){
                receiver.email = e.target.parentElement.getAttribute('data-email');
                receiver.user_id = e.target.parentElement.getAttribute('data-id');
                receiver.name = document.querySelector(`.contacts [data-id='${e.target.parentElement.getAttribute('data-id')}'] .info .name`).textContent;
                setReceiver();
                return
            }
            receiver.email = e.target.getAttribute('data-email');
            receiver.user_id = e.target.getAttribute('data-id');
            receiver.name = document.querySelector(`.contacts [data-id='${e.target.getAttribute('data-id')}'] .info .name`).textContent;
            setReceiver();
            
        })
    })
    deleteContactHandler();
}
searchBox.addEventListener('keyup', async() =>{
    if(searchBox.value.trim() < 1){
        searchResultContainer.innerHTML = "";
        return
    }

    const res = await axios.post('/search', {text: searchBox.value});
    const p = document.createElement('p');
    searchResultContainer.innerHTML = "";
    res.data.map((result) =>{
        const contact = document.createElement('div');
        contact.setAttribute('class', 'result');
        contact.setAttribute('data-id', `${result.user_id}`);
        contact.setAttribute('data-email', `${result.email}`);
        const existingContact = contactsList.find((contact) =>{
            return result.email === contact.email;
        })
        contact.innerHTML = `
                <div class="profile-container">
                    <span>${result.name[0]}</span>
                </div>
                <div class="result-info">
                    <p class="email">${result.email}</p>
                    <p class="name">${result.name}</p>
                </div>
                <button class='add-contact'>${existingContact ? '<i class="fa-solid fa-xmark"></i>' :'<i class="fa-solid fa-plus"></i>'}</button>
        `
        searchResultContainer.append(contact);
        addContact = document.querySelectorAll('.search-result-container .add-contact');
    })
    addContactHandler();
})
const addContactHandler = () =>{
    addContact.forEach((e) =>{
        e.addEventListener('click', async(e) =>{
            e.preventDefault();
            const existingContact = contactsList.find((contact) =>{
                if(e.target.parentElement.parentElement.getAttribute('data-email') === contact.email|| e.target.parentElement === contact.email){
                    return true
                }else{
                    return false
                }
            })
            if(!existingContact){
                const newContact = document.createElement('div');
                newContact.setAttribute('class', 'contact');
                newContact.setAttribute('data-email', `${ e.target.nodeName !== 'BUTTON' ? e.target.parentElement.parentElement.getAttribute('data-email') :  e.target.parentElement.getAttribute('data-email')}`);
                newContact.setAttribute('data-id', `${ e.target.nodeName !== 'BUTTON' ? e.target.parentElement.parentElement.getAttribute('data-id') :e.target.parentElement.getAttribute('data-id')}`);
                newContact.innerHTML = 
                `
                    <div class="profile-container">
                        <span>R</span>
                    </div>
                    <div class="info">
                        <p class="name">${e.target.nodeName !== 'BUTTON'? e.target.parentElement.previousElementSibling.lastElementChild.textContent: e.target.previousElementSibling.lastElementChild.textContent }</p>
                        <p class="recent-message" style="color:#000; font-weight: 500;">${"New Contact"}</p>
                    </div>
                `;
                const res = await axios.post(`/contact/add/${e.target.nodeName !== 'BUTTON'? e.target.parentElement.parentElement.getAttribute('data-id'): e.target.parentElement.getAttribute('data-id')}`, {
    
                })
                contactsContainer.prepend(newContact);
                contacts = document.querySelectorAll('.contacts .contact');
                fetchContacts();
                if(e.target.nodeName !== "BUTTON"){
                    e.target.parentElement.innerHTML = e.target.innerHTML = '<i class="fa-solid fa-xmark"></i>';
                }else{
                    e.target.innerHTML = e.target.innerHTML = '<i class="fa-solid fa-xmark"></i>';
                }
                
            }else{
                deleteContact(e.target.nodeName !== 'BUTTON' ? e.target.parentElement.parentElement.getAttribute('data-id') :e.target.parentElement.getAttribute('data-id'));
                fetchContacts();
                if(e.target.nodeName !== "BUTTON"){
                    e.target.parentElement.innerHTML = e.target.innerHTML = '<i class="fa-solid fa-plus"></i>';
                }else{
                    e.target.innerHTML = e.target.innerHTML = '<i class="fa-solid fa-plus"></i>';
                }
            }
            contactsHandler();
        })
    })
}
const setReceiver = async () =>{
    const res = await axios.get(`/contact/to/${receiver.user_id}`);
    messages.innerHTML = '';
    messageForm.style.visibility = 'visible';
    if(res.data){
        res.data.result.map((msg) =>{
            const received = document.createElement('span');
            received.setAttribute('class', 'received');
            const sent = document.createElement('span');
            sent.setAttribute('class', 'sent');
            if(msg.sender === res.data.user){
                sent.innerHTML = msg.content;
                messages.prepend(sent)
            }else{
                received.innerHTML = msg.content;
                messages.prepend(received)
            }
        })

    }
    messages.scrollTop = messages.scrollHeight;
    sideProfileName.innerHTML = receiver.name
    sideProfileAvatar.innerHTML = receiver.name[0];
    sideProfile.style.display = "flex";
}

const deleteContactHandler = () =>{
    deleteContactBtn.addEventListener('click', () =>{
        deleteContact(receiver.user_id);
        
    })
}

const deleteContact = async (id) =>{
    const res = await axios.get(`/contact/delete/${id}`);
    window.location.reload();
}

let sidebarOpen = false;
burgerMenuBtn.addEventListener('click', () =>{
    if(!sidebarOpen){
        contactSideBar.style.transform = `translateX(0)`;
        sidebarOpen = true;
        return
    }
    contactSideBar.style.transform = `translateX(-100%)`;
    sidebarOpen = false;

})

logoutBtn.addEventListener('click', () =>{
    document.cookie = 'chatify_token='
    window.location.href = '/login'
})

document.addEventListener('click', (e) =>{
    if(e.target.id !== 'search-box'){
        searchResultContainer.innerHTML = "";
    }
})
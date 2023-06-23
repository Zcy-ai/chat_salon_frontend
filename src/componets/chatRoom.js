import { useLocation } from 'react-router-dom';
import axios from 'axios';
import {useEffect, useState} from "react";

import { Avatar, Button, Container, Grid, IconButton, List, ListItem, ListSubheader, ListItemIcon, ListItemText, Paper, TextField, Typography, Box} from '@mui/material';
import { Send as SendIcon, Add as AddIcon , Delete as DeleteIcon} from '@mui/icons-material';
import SpeakerNotesIcon from '@mui/icons-material/SpeakerNotes';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';


class Invitation {
    constructor(inviter, receiver, chatRoomID, chatRoomName, messageType) {
        this.inviter = inviter;
        this.receiver = receiver;
        this.chatRoomID = chatRoomID;
        this.chatRoomName = chatRoomName;
        this.messageType = messageType;
    }
}
class Message {
    constructor(chatRoom, sender, firstName, lastName, content, timestamp) {
        this.chatRoom = chatRoom;
        this.sender = sender;
        this.firstName = firstName;
        this.lastName = lastName;
        this.content = content;
        this.timestamp = timestamp;
    }
}

function ChatRoom() {
    const location = useLocation();
    const state = location.state;
    let currentLogin = state.login; // email de l'utilisateur
    let currentFirstName = state.firstName; // Prénom de l'utilisateur
    let currentLastName = state.lastName; // Nom de famille de l'utilisateur
    const [currentChatRoomIndex, setCurrentChatRoomIndex] = useState(null); // index actuel de la salle dans chatRoom
    const [currentChatRoomId, setCurrentChatRoomId] = useState(null); // identifiant actuel du chatRoom dans le backend
    const [newChatName, setNewChatName] = useState('');
    const [isChatNameValid, setIsChatNameValid] = useState(true);
    const [message, setMessage] = useState(''); // Boîte de saisie pour l'envoi de messages
    const [socket, setSocket] = useState(null); // Websocket pour l'envoi de messages de chat au serveur
    const [socketServ, setSocketServ] = useState(null); // Websocket pour le transfert d'autres informations vers et depuis le serveur
    const [chatRoom, setChatRoom] = useState(state.chatRoomList); // liste de chatRoom
    const [messageList,setMessageList] = useState([]); // Collection de tous les messages du salon de discussion actuel
    const [isAddingUser, setIsAddingUser] = useState(false);
    const [newUserLogin, setNewUserLogin] = useState('');
    const [myInvitation, setMyInvitation] = useState(null);
    const [invitationErr, setInvitationErr] = useState(null);
    const [token, setToken] = useState(state.token);
    const [height, setHeight] = useState('60px'); // Hauteur initiale de 60px

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1045) {
                setHeight(window.innerWidth < 700 ? '150px' : '105px');
            } else {
                setHeight('60px');
            }
        };
        handleResize(); // Appeler la fonction handleResize une fois
        // Ajout d'un récepteur d'événements pour le changement de taille de la fenêtre
        window.addEventListener('resize', handleResize);

        // Supprime l'écouteur d'événements lorsque le composant est déchargé
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []); // Un tableau de dépendances vide signifie qu'il n'est exécuté qu'une seule fois lorsque le composant est monté et démonté.
    const logout = () => {
        localStorage.removeItem('token');
        if (socket) {
            socket.close();
        }
        if (socketServ) {
            socketServ.close();
        }
        window.location.replace('/login');
    }
    const handleAddUserClick = () => {
        if (isAddingUser){
            setIsAddingUser(false);
            return;
        }
        setIsAddingUser(true);
    };

    const handleAddUserCancel = () => {
        setIsAddingUser(false);
        setNewUserLogin('');
    };

    const handleAddUserConfirm = () => {
        const trimmedLogin = newUserLogin.trim(); // Supprimer les espaces de part et d'autre de l'entrée
        if (trimmedLogin === currentLogin ) {
            setInvitationErr("Cannot invite yourself")
        }else if(trimmedLogin === ''){
            setInvitationErr("Empity field")
        }else{
            setInvitationErr(null)
            // Exécuter la logique d'ajout d'utilisateurs
            const newInvitation = new Invitation(
                currentLogin,
                trimmedLogin,
                currentChatRoomId,
                chatRoom[currentChatRoomIndex].name,
                "INVITE"
            )
            socketServ.send(JSON.stringify(newInvitation));
            setIsAddingUser(false);
            setNewUserLogin('');
        }
    };
    const handleResponseInvite = (value) => {
        const newInvitation = new Invitation(
            myInvitation.receiver,
            myInvitation.inviter,
            myInvitation.chatRoomID,
            myInvitation.chatRoomName,
            value
        )
        setMyInvitation(null);
        if (value === "CONFIRM"){
            socketServ.send(JSON.stringify(newInvitation));
            const newChat = {
                id: myInvitation.chatRoomID,
                name: myInvitation.chatRoomName,
            };
            setChatRoom((prevChats) => [...prevChats, newChat]);
        }
    };

    // Nous mettons à jour l'index et l'identifiant de la salle de chat actuelle lorsque l'utilisateur clique pour changer de salle de chat.
    const handleChatClick = (roomIndex, roomId) => {
        setIsAddingUser(false);
        if (currentChatRoomIndex === roomIndex){
            setCurrentChatRoomIndex(null);
            setCurrentChatRoomId(null);
            setMessageList([]);
            return;
        }
        axios.get(`http://localhost:8080/chat_history/${currentLogin}/${roomId}/${token}`)
            .then((response) => {
                // const messageHistory = response.data;
                const messageHistory = response.data.map(JSON.parse);
                console.log(messageHistory);
                setMessageList(messageHistory);
                setCurrentChatRoomIndex(roomIndex);
                setCurrentChatRoomId(roomId);
            })
            .catch(error => {
                setMessageList([]);
                setCurrentChatRoomIndex(roomIndex);
                setCurrentChatRoomId(roomId);
            // Si la demande échoue, l'erreur peut être traitée ici
                console.error('There has been a problem with your axios operation:', error);
            });
        // console.log(currentChatRoomId);
        // console.log(currentChatRoomIndex);
    };
    const handleDeleteChat = (roomId) => {
        // axios envoie une requête au backend pour supprimer le chat
        axios.post(`http://localhost:8080/delete_chatroom/${currentLogin}/${roomId}/${token}`)
            .then((response) => {
                if (response.status === 200) {
                    // Suppression du front-end après une suppression réussie du back-end
                    setChatRoom((prevChats) => {
                        const updatedChats = prevChats.filter((chat) => chat.id !== roomId);
                        return updatedChats;
                    });
                    // Mises à jour currentChatRoomIndex et currentChatRoomId
                    setCurrentChatRoomIndex(null);
                    setCurrentChatRoomId(null);
                    setMessageList([]);
                }
            }).catch((error) => {
            console.log(error);
        });
    };
    const handleCreateChat = () => {
        if (newChatName.trim() === '') {
            setIsChatNameValid(false);
            return;
        }
        axios.post(`http://localhost:8080/create_chatroom/${currentLogin}/${newChatName}/${token}`)
            .then((response) => {
                if (response.status === 200) {
                    console.log(response.data);
                    const newChat = {
                        ...response.data,
                    };
                    setChatRoom((prevChats) => [...prevChats, newChat]);
                }
            }).catch((error) => {
            console.log(error);
        });
        setNewChatName('');
    };
    // Envoi de messages au back-end
    const sendMessage = () => {
        if (message.trim() !== '') {
            const currentDate = new Date().toLocaleString(); // Ajouter une date
            const formattedMessage = `${currentFirstName} ${currentLastName}: ${message}`
            // Envoyer un message
            const newMessage = new Message (
                currentChatRoomId,
                currentLogin,
                currentFirstName,
                currentLastName,
                formattedMessage,
                currentDate,
            );
            socket.send(JSON.stringify(newMessage));
            setMessage(''); // Effacer le champ de saisie du message après l'avoir envoyé
        }
    };
    function stringToColor(string) {
        let hash = 0;
        let i;

        /* eslint-disable no-bitwise */
        for (i = 0; i < string.length; i += 1) {
            hash = string.charCodeAt(i) + ((hash << 5) - hash);
        }

        let color = '#';

        for (i = 0; i < 3; i += 1) {
            const value = (hash >> (i * 8)) & 0xff;
            color += `00${value.toString(16)}`.slice(-2);
        }
        /* eslint-enable no-bitwise */

        return color;
    }

    function stringAvatar(name) {
        return {
            sx: {
                bgcolor: stringToColor(name),
            },
            children: `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`,
        };
    }
    // Surveiller currentChatRoomId et currentLogin, et mettre à jour les connexions websocket en cas de changement.
    useEffect(() => {
        if (currentChatRoomId === null){
            setSocket(null);
        } else {
            // Créer une nouvelle connexion WebSocket
            const newSocket = new WebSocket(`ws://localhost:8080/chat/${currentLogin}/${currentChatRoomId}/${token}`);
            console.log(chatRoom);
            // Mise en place de gestionnaires d'événements WebSocket
            newSocket.onopen = (event) => {
                console.log(newSocket);
            };
            newSocket.onmessage = (event) => {
                const receivedMessage = JSON.parse(event.data);
                const {sender, firstName, lastName, content, timestamp} = receivedMessage;
                // const currentDate = new Date().toLocaleString(); // Ajouter une date
                // const formattedMessage = `${firstName} ${lastName}: ${content}`
                const newMessage = new Message(
                    currentChatRoomId,
                    sender,
                    firstName,
                    lastName,
                    content,
                    timestamp,
                );
                setMessageList(prevState => {
                    const updatedList = [...prevState, newMessage];
                    return updatedList;
                });
            };
            newSocket.onclose = function (event) {
                console.log("Socket closed");
            };
            newSocket.onerror = function (err) {
                console.log('Socket encountered error: ', err.message, 'Closing socket');
                // setWebSocketReady(false);
                socket.close();
            };
            // Mise à jour des sockets dans State
            setSocket(newSocket);
            // Utiliser currentLogin et currentChat comme dépendances, tout changement aura un effet de ré-exécution.
        }
    }, [currentChatRoomId,currentLogin]);
    useEffect(()=>{
        const ws2Server = new WebSocket(`ws://localhost:8080/contact/${currentLogin}/${token}`);
        ws2Server.onopen = (event) => {
            console.log(ws2Server);
        };
        ws2Server.onmessage = (event) => {
            const receivedMessage = JSON.parse(event.data);
            const { inviter, receiver, chatRoomID, chatRoomName, messageType } = receivedMessage;
            console.log("Message form server");
            console.log(receivedMessage);
            const newInvitation = new Invitation(
                inviter,
                receiver,
                chatRoomID,
                chatRoomName,
                messageType
            )
            if (messageType === "INVITE") {
                setMyInvitation(newInvitation);
            }else if (messageType === "DELETEROOM") {
                setCurrentChatRoomIndex(null);
                setCurrentChatRoomId(null);
                setMessageList([]);
                setChatRoom((prevChats) => {
                    const updatedChats = prevChats.filter((chat) => chat.id !== chatRoomID);
                    return updatedChats;
                });
            }else if(messageType === "Inviter is already in the chatRoom" || messageType ==="Inviter doesn't exist"){
                setIsAddingUser(true);
                setInvitationErr(messageType);
            }
        };
        ws2Server.onclose = function (event) {
            console.log("Socket closed");
        };
        ws2Server.onerror = function (err) {
            console.log('Socket encountered error: ', err.message, 'Closing socket');
            // setWebSocketReady(false);
            ws2Server.close();
        };
        setSocketServ(ws2Server);
    },[currentLogin]);
    return (
        <Container maxWidth="lg" sx={{ marginTop: 4, height: 'calc(100vh - 64px)' }}>
            <Grid container spacing={2} sx={{ height: '100%' }}>
                <Grid item xs={4} sx={{ height: '100%'}}>
                    <Paper elevation={3} sx={{ height: '100%'}}>
                        <Grid container direction="column" justifyContent="space-between" sx={{ height: '100%', padding: 2, position: 'relative' }}>
                            <Grid item sx={{ position: 'absolute', top: 0, left: 0, right: 0, margin: '10px' }}>
                                <Grid container alignItems="center" spacing={2}>
                                    <Grid item>
                                        <Avatar {...stringAvatar(currentFirstName+' '+currentLastName)} />
                                    </Grid>
                                    <Grid item>
                                        <Typography variant="h6">{currentFirstName} {currentLastName}</Typography>
                                    </Grid>
                                    <Grid item>
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            startIcon={<ExitToAppIcon />}
                                            onClick={logout}
                                        >
                                        logout
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item sx={{ flexGrow: 1 }}>
                                <div style={{ height }}></div>
                                <List component="nav" sx={{ flexGrow: 1, maxHeight: 'calc(100% - 160px)', overflowY: 'auto' }}>
                                    <ListSubheader sx={{ backgroundColor: '#f3e5f5', borderBottom: '1px solid #000' }}>Chef</ListSubheader>
                                    {chatRoom?.map((chat, index) => {
                                        const isChef = chat.chef && chat.chef.login === currentLogin;

                                        if (isChef) {
                                            return (
                                                <ListItem
                                                    key={chat.id}
                                                    button
                                                    selected={chat.id === currentChatRoomId}
                                                    onClick={() => handleChatClick(index, chat.id)}
                                                    sx={{
                                                        borderRadius: 1,
                                                        marginBottom: 1,
                                                        backgroundColor: '#f3e5f5'
                                                    }}
                                                >
                                                    <ListItemIcon sx={{ minWidth: 32 }}>{<SpeakerNotesIcon />}</ListItemIcon>
                                                    <ListItemText primary={chat.name} />
                                                    <IconButton edge="end" onClick={() => handleDeleteChat(chat.id)}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </ListItem>
                                            );
                                        }

                                        return null; // Les éléments du salon de discussion qui ne font pas partie de la catégorie "Chef" ne seront pas affichés.
                                    })}
                                    <ListSubheader sx={{ backgroundColor: '#e1f5fe', borderBottom: '1px solid #000'}}>Member</ListSubheader>
                                    {chatRoom?.map((chat, index) => {
                                        const isChef = chat.chef && chat.chef.login === currentLogin;

                                        if (!isChef) {
                                            return (
                                                <ListItem
                                                    key={chat.id}
                                                    button
                                                    selected={chat.id === currentChatRoomId}
                                                    onClick={() => handleChatClick(index, chat.id)}
                                                    sx={{
                                                        borderRadius: 1,
                                                        marginBottom: 1,
                                                        backgroundColor: '#e1f5fe'
                                                    }}
                                                >
                                                    <ListItemIcon sx={{ minWidth: 32 }}>{<SpeakerNotesIcon />}</ListItemIcon>
                                                    <ListItemText primary={chat.name} />
                                                    <IconButton edge="end" onClick={() => handleDeleteChat(chat.id)}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </ListItem>
                                            );
                                        }

                                        return null; // Les éléments du salon de discussion qui ne font pas partie de la catégorie "Membre" ne seront pas affichés.
                                    })}
                                </List>
                            </Grid>

                            <Grid item sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, margin: '10px' }}>
                                <Button startIcon={<AddIcon />} fullWidth variant="contained" color="primary" onClick={handleCreateChat}>
                                    Create Chat
                                </Button>
                                <TextField
                                    value={newChatName}
                                    onChange={(e) => {
                                        setNewChatName(e.target.value);
                                        setIsChatNameValid(true);
                                    }}
                                    label="Chat Room Name"
                                    fullWidth
                                    variant="outlined"
                                    error={!isChatNameValid}
                                    helperText={!isChatNameValid && 'Chat Room Name cannot be empty'}
                                    sx={{ marginTop: 2 }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleCreateChat();
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
                {/*rendu conditionnel*/}
                {(currentChatRoomIndex!== null) && (
                    <Grid item xs={8} sx={{ height: '100%' }}>
                        <Paper elevation={3} sx={{ height: '100%' }}>
                            <Grid container direction="column" justifyContent="space-between" sx={{ height: '100%', padding: 2, position: 'relative' }}>
                                <Grid item sx={{ position: 'absolute', top: 0, left: 0, right: 0, margin: '10px' }}>
                                    <Typography variant="h6" sx={{ padding: 2, position: 'sticky', bottom: 0, textAlign: 'center', backgroundColor: '#f5f5f5', color: '#333333', fontWeight: 'bold' }}>
                                        {chatRoom[currentChatRoomIndex].name}
                                        <IconButton sx={{ position: 'absolute', right: '5px' }} onClick={handleAddUserClick}>
                                            <PersonAddIcon sx={{ color: 'gray' }} />
                                        </IconButton>
                                    </Typography>
                                </Grid>
                                <Grid item sx={{ flexGrow: 1, maxHeight: 'calc(100% - 80px)', overflowY: 'auto', paddingTop: '70px' }}>
                                    {messageList?.map((message, index) => (
                                        <Box
                                            key={index}
                                            sx={{
                                                display: 'flex',
                                                justifyContent: message.firstName + ' ' + message.lastName === `${currentFirstName} ${currentLastName}` ? 'flex-end' : 'flex-start',
                                                mb: 1,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    backgroundColor: message.firstName + ' ' + message.lastName === `${currentFirstName} ${currentLastName}` ? '#f3e5f5' : '#e1f5fe',
                                                    color: message.firstName + ' ' + message.lastName === `${currentFirstName} ${currentLastName}` ? '#000000' : '#000000',
                                                    padding: '8px 12px',
                                                    borderRadius: '8px',
                                                    maxWidth: '300px',
                                                    width: 'fit-content',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    wordWrap: 'break-word',
                                                }}
                                            >
                                                <Typography variant="caption" sx={{ color: 'gray', fontSize: '0.75rem', textAlign: 'right' }}>
                                                    {message.timestamp}
                                                </Typography>
                                                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{message.content}</Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                </Grid>
                                <Grid item sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, margin: '10px' }}>
                                    <Grid container spacing={2} alignItems="center" sx={{ padding: 2, position: 'sticky', bottom: 0 }}>
                                        <Grid item xs>
                                            <TextField
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                label="Message"
                                                fullWidth
                                                variant="outlined"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        sendMessage();
                                                    }
                                                }}
                                            />
                                        </Grid>
                                        <Grid item>
                                            <IconButton onClick={sendMessage} disabled={!message.trim()}>
                                                <SendIcon />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>

                        </Paper>
                    </Grid>
                )}
            </Grid>
            {/* Ajouter une boîte de saisie pour l'utilisateur */}
            {isAddingUser && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: '#ffffff',
                        padding: 4,
                        borderRadius: '8px',
                        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
                    }}
                >
                    <Typography variant="h6">Add User</Typography>
                    <TextField
                        value={newUserLogin}
                        onChange={(e) => {
                            setNewUserLogin(e.target.value)
                        }}
                        label="User Login"
                        fullWidth
                        variant="outlined"
                        error={invitationErr !== null}
                        helperText={invitationErr}

                        sx={{ marginTop: 2 }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleAddUserConfirm();
                            }
                        }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
                        <Button variant="outlined" color="primary" onClick={handleAddUserConfirm} sx={{ marginTop: 2}}>
                            Confirm
                        </Button>
                        <div style={{ width:'30px' }}></div>
                        <Button variant="outlined" onClick={handleAddUserCancel} sx={{ marginTop: 2 }}>
                            Cancel
                        </Button>
                    </Box>
                </Box>
            )}
            {/* Acceptation de l'invitation */}
            {myInvitation && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: '#ffffff',
                        padding: 4,
                        borderRadius: '8px',
                        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
                    }}
                >
                    <Typography variant="h6">Invitation from {myInvitation.inviter} to {myInvitation.chatRoomName} </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
                        <Button variant="outlined" color="primary" onClick={() => handleResponseInvite("CONFIRM")} sx={{ marginTop: 2}}>
                            Confirm
                        </Button>
                        <div style={{ width:'30px' }}></div>
                        <Button variant="outlined" onClick={() => handleResponseInvite("REFUSE")} sx={{ marginTop: 2 }}>
                            Refuse
                        </Button>
                    </Box>
                </Box>
            )}
        </Container>
    );
};
export default ChatRoom;

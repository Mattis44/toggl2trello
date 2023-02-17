import React, { useState, useEffect, setRedirect, useRef } from 'react';
import axios from 'axios';
import './app.css';
import logo from './logo.png';
const fullUrl = window.location.host;
const [url, port] = fullUrl.split(':');


const Users = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', API_KEY_TOGGL: '' });
  const [error, setError] = useState('');
  const [boardName, setBoardName] = useState('');
  const [boardId, setBoardId] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showModalLogs, setShowModalLogs] = useState(false);
  const [logs, setLogs] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const logsToShow = logs.slice(Math.max(logs.length - 10, 0));
  const logContainerRef = useRef(null);




  useEffect(() => {
    fetchUsers();
    setInterval(() => {
      fetchLogs();
    }, 3000)
    getBoardName();
    getBoardId();
    if (showModalLogs) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [showModalLogs]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`http://${url}:${parseInt(port) + 1}/users`);
      setUsers(res.data.users);
    } catch (error) {
      console.error(error);
    }
  };


  const handleChange = (event) => {
    setNewUser({ ...newUser, [event.target.name]: event.target.value });
  };

  const fetchLogs = async () => {
    try {
      const res = await axios.get(`http://${url}:${parseInt(port) + 1}/logs`);
      const parsedLogs = res.data.split('\n');
      const logs = parsedLogs.filter(log => log.length > 0).map(log => {
        const [infos, message] = log.split(' - ');
        const time = infos.slice(infos.indexOf('T') + 1, infos.indexOf(']')).split('.')[0];
        return { message, time };
      });
      setLogs(logs);
    } catch (error) {
      console.error(error);
    }
  }


  function getBoardName() {
    axios.get(`http://${url}:${parseInt(port) + 1}/api-key`)
      .then(async res => {
        const { TRELLO_API_KEY, TRELLO_API_TOKEN, TRELLO_BOARD_ID } = res.data.Trello[0];
        await axios.get(`https://api.trello.com/1/boards/${TRELLO_BOARD_ID}?key=${TRELLO_API_KEY}&token=${TRELLO_API_TOKEN}`)
          .then(res => {
            setBoardName(res.data.name);
          })
          .catch(err => {
            console.log(err);
          });
      })
  }

  function getBoardId(){
    axios.get(`http://${url}:${parseInt(port) + 1}/api-key`)
      .then(async res => {
        const { TRELLO_API_KEY, TRELLO_API_TOKEN, TRELLO_BOARD_ID } = res.data.Trello[0];
        await axios.get(`https://api.trello.com/1/boards/${TRELLO_BOARD_ID}?key=${TRELLO_API_KEY}&token=${TRELLO_API_TOKEN}`)
          .then(res => {
            setBoardId(res.data.id);
          })
          .catch(err => {
            console.log(err);
          });
      })
  }


  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // Vérifie si un utilisateur avec le même nom ou la même clé API toggl existe déjà
      const existingUser = users.find(user => user.name === newUser.name || user.API_KEY_TOGGL === newUser.API_KEY_TOGGL);
      if (existingUser) {
        setError('Erreur : Un utilisateur avec le même nom ou la même clé API toggl existe déjà.');
      } else {
        await axios.post(`http://${url}:${parseInt(port) + 1}/users`, newUser);
        setUsers([...users, newUser]);
        setNewUser({ name: '', API_KEY_TOGGL: '' });
        fetchUsers();
        setError('');
      }
    } catch (err) {
      if (err.response.status === 403) {
        setError('Erreur : Clé API Toggl incorrecte');
      } else if (err.response.status === 404) {
        setError('Erreur : Liste Trello non trouvée, veuillez la créer.')
      } else {
        setError('Erreur : Veuillez entrer une valeur de clé API Toggl.');
      }
    }
  };

  const handleResetLogs = async () => {
    try {
      await fetch(`http://${url}:${parseInt(port) + 1}/logs`, {
        method: 'DELETE',
      });
      setLogs([]);
    } catch (error) {
      console.error(error);
    }
  }

  async function deleteUser(userId) {
    try {
      const response = await fetch(`http://${url}:${parseInt(port) + 1}/users/${userId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleResetApi(id) {
    try {
      await fetch(`http://${url}:${parseInt(port) + 1}/api-reset/${id}`, {
        method: 'DELETE',
      });
      window.location.href = '/'
    } catch (error) {
      console.error(error);
    }
  }

  async function handleResetBoard(id) {
    try {
      axios.get(`http://${url}:${parseInt(port) + 1}/api-key`).then(async res => {
        const { TRELLO_API_KEY, TRELLO_API_TOKEN } = res.data.Trello[0];
      // get list by id and delete all cards
      await axios.get(`https://api.trello.com/1/boards/${id}/lists?key=${TRELLO_API_KEY}&token=${TRELLO_API_TOKEN}`)
        .then(async res => {
            const lists = res.data;
            for (let i = 0; i < lists.length; i++) {
                await axios.get(`https://api.trello.com/1/lists/${lists[i].id}/cards?key=${TRELLO_API_KEY}&token=${TRELLO_API_TOKEN}`)
                .then(async res => {
                    const cards = res.data;
                    for (let j = 0; j < cards.length; j++) {
                    await axios.delete(`https://api.trello.com/1/cards/${cards[j].id}?key=${TRELLO_API_KEY}&token=${TRELLO_API_TOKEN}`)
                        .then(res => {
                        console.log(res);
                        })
                        .catch(err => {
                        console.log(err);
                        })
                    }
                })
                .catch(err => {
                    console.log(err);
                })
            }
        })
      })
        .catch(err => {
            console.log(err);
        })
    }
    catch (e) {
        console.log(e);
    }
  }


  return (
    <div className=' text-white'>
      <div className='flow-root'>
        <h1 className='text-3xl font-bold font-sans float-left'>TOGGL2TRELLO</h1>
        <h1 className='float-right font-bold font-sans text-2xl'>CONFIG MENU</h1>
      </div>
      <h1 className='text-right font-sans text-3xl'>[{boardName}]</h1>
      <button className='float-right mt-3 bg-blue-500 text-white rounded-full p-1 hover:bg-white hover:text-black mx-auto my-2 flex' onClick={() => handleResetApi(boardId)}>RESET</button>
      <button className='float-right mt-3 bg-blue-500 text-white rounded-full p-1 hover:bg-white hover:text-black mx-auto my-2' onClick={() => handleResetBoard(boardId)}>RESET BOARD</button>
      <div className="container mx-auto my-12">
        <h2 className='text-2xl text-center mb-7'>Utilisateur(s)</h2>
        {users.length > 0 ?
          <table className='w-full border-2 table-auto'>
            <thead>
              <tr>
                <th className='p-2 text-left'>Nom</th>
                <th className='p-2 text-left'>Clé API Toggl</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.name}>
                  <td className='p-2 text-left'>{user.name}</td>
                  <td className='p-2 text-left'>{user.API_KEY_TOGGL}</td>
                  <td className='p-2 text-left'><button className=" bg-red-600 text-white rounded-full p-2 hover:bg-red-800 hover:text-black" onClick={() => deleteUser(user.id)}>Supprimer</button></td>
                </tr>
              ))}
            </tbody>
          </table> : <h3 className='text-center mt-5'>Aucun utilisateur</h3>}
      </div>
      <div>
        <button
          className=" bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full mx-auto my-2 flex"
          onClick={() => setShowModal(true)}
        >
          Ajouter un utilisateur
        </button>
        {showModal && (
          <div className="fixed top-0 left-0 right-0 bottom-0 flex">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="relative p-6 m-auto bg-white rounded-lg overflow-hidden sm:max-w-lg sm:w-full">
              <div className="">
                <div className="">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Ajouter un utilisateur
                  </h3>
                  <div className="mt-2">
                    <form onSubmit={handleSubmit}>
                      <div className="">
                        <div className="">
                          <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Nom
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              name="name"
                              id="name"
                              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-xl border-gray-300 rounded-md text-black"
                              value={newUser.name}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                        <div className="mt-6">
                          <label
                            htmlFor="API_KEY_TOGGL"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Clé API Toggl
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              name="API_KEY_TOGGL"
                              id="API_KEY_TOGGL"
                              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-xl border-gray-300 rounded-md text-black"
                              value={newUser.API_KEY_TOGGL}
                              onChange={handleChange}
                            />
                            {error && <div className="text-red-500">{error}</div>}
                          </div>
                        </div>
                      </div>
                      <div className="mt-6">
                        <button
                          type="submit"
                          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Ajouter
                        </button>
                        <button
                          type="button"
                          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ml-3"
                          onClick={() => setShowModal(false)}
                        >
                          Fermer
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {logs.length > 0 && (
        <>
          <h2 className='text-center font-bold mt-3'>Dernières logs :</h2>
          {!showModal && (
            <div className='bg-black w-max mx-auto mt-3 text-green-300'>
              {logsToShow.map((log, index) => (
                <p key={index}>{log.time} - {log.message}</p>
              ))}
            </div>
          )}
          <div className='container mx-auto'>



            {logs.length > 10 && (
              <button
                className="bg-blue-500 text-white p-2 hover:bg-blue-600 py-2 px-4 rounded-full mx-auto my-2 flex"
                onClick={() => setShowModalLogs(true)}
              >
                Voir tout
              </button>

            )}
          </div>
          <button className='bg-red-600 text-white p-2 hover:bg-red-800 hover:text-black py-2 px-4 rounded-full mx-auto flex mt-3' onClick={handleResetLogs}>
            Reset Logs
          </button>
        </>
      )}
      {showModalLogs && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-4">
            <h1 className='text-black text-center justify-center font-bold text-xl'>LOGS</h1>
            <div className="overflow-y-scroll h-64 bg-black text-green-300" ref={logContainerRef}>
              {logs.map((log, index) => (
                <p key={index}>
                  {log.time} - {log.message}
                </p>
              ))}
            </div>

            <button
              className="bg-red-500 text-white p-2 hover:bg-red-600 py-2 px-4 rounded-full mx-auto my-2 flex"
              onClick={() => setShowModalLogs(false)}
            >
              Fermer
            </button>
          </div>

        </div>
      )}
      {(!showModal && !showModalLogs) && (
        <div className='d-flex justify-content-center text-center'>
          <img src={logo} className='mx-auto relative mt-10' alt='logo' />
        </div>
      )}
    </div>






  );


};





export default Users;

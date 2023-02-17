import React, { useState } from 'react';
import axios from 'axios';
const fullUrl = window.location.host;
const [url, port] = fullUrl.split(':');
const apiUrl = `http://${url}:${parseInt(port)  + 1}/api-key`;

const Setup = () => {
    const [apiKey, setApiKey] = useState('');
    const [apiToken, setApiToken] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(apiKey === '' || apiToken === '') {
            setError('Veuillez remplir les champs.');
            return;
        }
        try {
            const response = await fetch(`https://api.trello.com/1/members/me?key=${apiKey}&token=${apiToken}`);
            if (response.status === 200) {
                // Les clés d'API sont valides
                axios.post(apiUrl, {
                    API_KEY_TRELLO: apiKey,
                    API_TOKEN_TRELLO: apiToken
                })
                    .then(res => {
                        console.log(res.data);
                        window.location.href = '/board';
                    })
                    .catch(error => {
                        console.log(error);
                    });
            } else {
                // Les clés d'API sont invalides
                setError('La clé ou le token est invalide.');
            }
        } catch (error) {
            console.error(error);
        }
    }
    

    const handleChangeApiKeyTrello = (e) => {
        setApiKey(e.target.value);
    }

    const handleChangeApiTokenTrello = (e) => {
        setApiToken(e.target.value);
    }


    return (
        <div className='text-white'>
            <div className='flow-root'>
                <h1 className='text-3xl font-bold font-sans float-left'>TOGGL2TRELLO</h1>
                <h1 className='float-right font-bold font-sans text-2xl'>SETUP MENU</h1>
            </div>
            <div className='container mx-auto my-12'>
                <h2 className='text-2xl text-center mb-7'>Informations API</h2>
                <form className='mx-auto mt-14' onSubmit={handleSubmit}>
                    <div className='flex flex-col'>
                        <label htmlFor='api-key-trello'>CLÉ PERSONNELLE TRELLO</label>
                        <input
                            type='text'
                            id='api-key-trello'
                            name='api-key-trello'
                            className='border-2 border-gray-300 p-2 rounded-lg text-black focus:outline-none focus:border-blue-300'
                            value={apiKey}
                            onChange={handleChangeApiKeyTrello}
                            autoFocus
                        />
                        <label htmlFor='api-token-trello'>JETON TRELLO</label>
                        <input
                            type='text'
                            id='api-token-trello'
                            name='api-token-trello'
                            className='border-2 border-gray-300 p-2 rounded-lg text-black focus:outline-none focus:border-blue-300'
                            value={apiToken}
                            onChange={handleChangeApiTokenTrello}
                        />
                    </div>
                        <button
                            type='submit'
                            className='bg-green-500 text-white rounded-full py-2 px-4 hover:bg-white hover:text-black mt-5 mx-auto my-2 flex'
                        >
                            Envoyer
                        </button>
                        {error && <div className="text-red-500 flex justify-center mt-5">{error}</div>}
                </form>
            </div>

        </div>
    );

}

export default Setup;

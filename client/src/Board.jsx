import React, { useState, useEffect } from 'react';
import axios from 'axios';
const API_PORT = process.env.REACT_APP_API_PORT || 3001;
const fullUrl = window.location.host;
const [url, port] = fullUrl.split(':');

const Board = () => {
    const [boards, setBoards] = useState([]);
    const [selectedBoard, setSelectedBoard] = useState('');


    const handleSubmit = (e) => {
        e.preventDefault();
        axios
            .post(`http://${url}:${parseInt(port) + 1}/api-board`, {
                TRELLO_BOARD_ID: selectedBoard,
            })
            .then(async (res) => {
                const { TRELLO_API_KEY, TRELLO_API_TOKEN } = res.data.Trello[0];
                const labels = await axios.get(
                    `https://api.trello.com/1/boards/${selectedBoard}/labels?key=${TRELLO_API_KEY}&token=${TRELLO_API_TOKEN}`
                );
                const occupiedLabel = labels.data.find(
                    (label) => label.name === "Occupé"
                );
                if (occupiedLabel) {
                    await axios.delete(
                        `https://api.trello.com/1/labels/${occupiedLabel.id}?key=${TRELLO_API_KEY}&token=${TRELLO_API_TOKEN}`
                    );
                }
                const createdLabel = await axios.post(
                    `https://api.trello.com/1/boards/${selectedBoard}/labels?name=Occupé&color=red&key=${TRELLO_API_KEY}&token=${TRELLO_API_TOKEN}`
                );
                return createdLabel;
            })
            .then((response) => {
                return fetch(`http://${url}:${parseInt(port) + 1}/api-label`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        TRELLO_BUSY_LABEL_ID: response.data.id,
                    }),
                });
            })
            .then(() => {
                window.location.href = "/app";
            })
            .catch((err) => console.log(err));
    };



    const handleBack = (e) => {
        e.preventDefault();
        fetch(`http://${url}:${parseInt(port) + 1}/api-key`, {
            method: 'DELETE',
        }).then(() => { window.location.href = '/'; })
    }


    const handleBoardChange = (e) => {
        setSelectedBoard(e.target.value);
    }

    useEffect(() => {
        axios.get(`http://${url}:${parseInt(port) + 1}/api-key`)
            .then(res => {
                const { TRELLO_API_KEY, TRELLO_API_TOKEN } = res.data.Trello[0];
                axios.get(`https://api.trello.com/1/members/me/boards?key=${TRELLO_API_KEY}&token=${TRELLO_API_TOKEN}`)
                    .then(res => {
                        setBoards(res.data);
                    })
                    .catch(err => {
                        console.log(err);
                    });
            })
            .catch(err => {
                console.log(err);
            });
    }, []);



    return (
        <div className='text-white'>
            <div className='flow-root'>
                <h1 className='text-3xl font-bold font-sans float-left'>TOGGL2TRELLO</h1>
                <h1 className='float-right font-bold font-sans text-2xl'>BOARD MENU</h1>
            </div>
            <div className='container mx-auto my-12'>
                <h2 className='text-2xl text-center mb-7'>Choisissez un tableau Trello pour l'utilisation de ce bot : </h2>
                <form className='mx-auto mt-14' onSubmit={handleSubmit}>
                    <div className='flex flex-col'>
                        <select className='border-2 border-gray-300 bg-white h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none max-w-max flex mx-auto text-black' onChange={handleBoardChange}>
                            <option value=''>Choisissez un tableau</option>
                            {boards.map(board => (
                                <option key={board.id} value={board.id}>{board.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-center items-center">
                        <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full mt-10 mr-3' type='submit'>Valider</button>
                        <button className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full mt-10 ml-3' onClick={handleBack}>Retour</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Board;
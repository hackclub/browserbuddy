import { useEffect, useState } from 'preact/hooks';
import './Home.css';
import axios from 'axios';
import { API_URL } from '../config';
import { Navbar } from '../components/Navbar';
import { ChatView } from '../components/ChatView';

export default function Home({page, setPage}) {
    const [user, setUser] = useState();

    useEffect(() => {
        let token = localStorage.getItem('token')
        if(token) {
            getUser(token)
            .then((res) => {
                if(!res) {
                    setPage('login');
                }
            })
        }else{
            setPage('login');
        }
    }, [])

    async function getUser(token) {
        let u = await axios.get(API_URL + '/user/user', {
            headers: {
                Authorization: 'Bearer ' + token
            }
        });
        if(u.data.user) {
            setUser(u.data.user);
            return true;
        }

        return false;
    }
    
    return (
        <div className='home'>
            <Navbar setPage={setPage}/>
            <ChatView user={user} setPage={setPage}/>
        </div>
    );
}
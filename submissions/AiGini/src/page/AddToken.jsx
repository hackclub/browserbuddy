import axios from 'axios';
import { Navbar } from '../components/Navbar';
import { API_URL } from '../config';
import './AddToken.css';
import { useState } from 'preact/hooks';

export function AddToken({page, setPage}) {

    const [key, setKey] = useState('');

    const redeemCode = async () => {
        let token = localStorage.getItem('token');
        if(token) {
            let res = await axios.post(API_URL + '/user/redeem-key', {
                key: key
            }, {
                headers: {
                    Authorization: 'Bearer ' + token
                }
            });
            if(!res.data.error) {
                alert('🎉 Token redeemed successfully!');
            }else{
                alert('Invalid token!');
            }
            setKey('');
        }else{
            setPage('login');
        }
    }

    return (
        <div className="add-token">
            <Navbar setPage={setPage}/>
            <h1 style={{margin: '10px 0'}}>Redeem Code</h1>
            <p style={{cursor: 'pointer', color: '#007BFF', margin: '10px 0'}} onClick={() => setPage('home')}>{'<<'} Home</p>
            <div className='form'>
                <input type='text' placeholder='Code' value={key} onChange={(e) => setKey(e.target.value)}/>
                <button onClick={() => redeemCode()}>Add Token</button>
                <p style={{margin: '10px 0'}}>Buy tokens from <a href='https://aigini.sell.app/' target='_blank'>here</a> then put your code to redeem...</p>
            </div>
        </div>
    )
}
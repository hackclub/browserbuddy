import { useEffect, useState } from 'preact/hooks';
import './ChatView.css';
import axios from 'axios';
import { API_URL } from '../config';

export function ChatView({user, setPage}) {
    const [question, setQuestion] = useState('');
    const [questionText, setQuestionText] = useState('');
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [tokens, setTokens] = useState(0);

    useEffect(() => {
        if(user) {
            setTokens(user.tokens);
        }
    }, [user])

    async function askQuestion() {
        if(question) {
            if(tokens < 1){
                alert('Low balance please buy tokens !!');
                setPage('add-token');
            }else{
                setQuestionText(question);
                setLoading(true);
                let answer = await axios.post(API_URL + '/ai/ask', {
                    question
                }, {
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem('token')
                    }
                });
                if(answer.data.error) {
                    setAnswer({answer: 'Error finding answer !!', steps: []});
                }
                setAnswer(answer.data || {answer: 'Error finding answer !!', steps: []});
                await getTokens();
                setQuestion('');
                setLoading(false);
            }
        }
    }

    async function getTokens() {
        let token = localStorage.getItem('token');
        if(token) {
            let u = await axios.get(API_URL + '/user/user', {
                headers: {
                    Authorization: 'Bearer ' + token
                },
            });
            if(u.data.user) {
                setTokens(u.data.user.tokens);
                return true;
            }
        }
    }

    return (
        <div className='chat-view'>
            {!answer && !loading ? 
            <div className='chat-splash'>
                <div className='chat-splash-text1'>Ask your question</div>
                <div className='chat-splash-text2'>AiGini</div>
            </div> :
            <div className='chats'>
                <p className='question'>{questionText && questionText}</p>
                <div className='answer'>
                    {loading ? <p>Loading...</p> :
                    <>
                        <p>{answer && answer.answer}</p>
                        <ol className='steps'>
                            {answer?.steps && <h3>Steps</h3>}
                            {answer && answer.steps.map((step) => 
                            <li className='step'>{step}</li>)}
                        </ol>
                    </>
                    }
                </div>
            </div>}
            <div className='chats2'>
                <div className='input-view'>
                    <textarea type='text' placeholder='Type your question' value={question} onChange={(e) => setQuestion(e.target.value)}/>
                    <button onClick={askQuestion}>Ask</button>
                </div>
                <div className='token-view'>
                    <div className='token-count'>
                        <p>⭐ {tokens && tokens}</p>
                    </div>
                    <div className='token-add'>
                        <button onClick={() => setPage('add-token')}>Add Tokens</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
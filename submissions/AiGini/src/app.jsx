import { useState } from 'preact/hooks'
import { Login } from './page/Login'
import Home from './page/Home'
import { AddToken } from './page/AddToken'

export function App() {
  const [page, setPage] = useState('home')

  switch(page) {
    case 'login':
      return <Login setPage={setPage} page={page}/>
    case 'home':
      return <Home setPage={setPage} page={page}/>
    case 'add-token':
      return <AddToken setPage={setPage} page={page}/>
  }
}

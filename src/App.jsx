import './App.css'
import SettingsForm from './assets/SettingsForm'
import './index.css'
import 'tailwindcss/tailwind.css';

function App() {
  return (
    <>

      <h1 className='text-2xl font-bold text-center mb-4 bg-orange-800 p-8 rounded-lg shadow-md w-fit ml-auto mr-auto'>LLM Browser</h1>
      <SettingsForm/>
    </>
  )
}

export default App

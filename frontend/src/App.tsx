import { useEffect } from "react"
import axios from "axios"

function App() {
  useEffect(()=>{
      axios.get("http://localhost:8080/users/test")
      .then((data)=>console.log(data))

  },[])
  return (
    <>
     <h1>Hello Starting will zoom clone</h1>
    </>
  )
}

export default App
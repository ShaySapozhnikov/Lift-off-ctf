import React from "react";
import ShipIcon from "./shipIcon";


function Signin()
{
    return(
        <form action="login" className="min-h-screen flex items-center justify-center ">
        <div className="flex flex-col items-center justify-center"> 
           <ShipIcon />
        
          <h1 className="text-[20px] mt-2">Sign in</h1>
          <input className ="rounded mt-5 border bg-zinc-900 border-dotted" type="text" placeholder="  Username"/>
          <input className ="rounded mt-5 border bg-zinc-900 border-dotted" type="password" placeholder="  Password" />
          <footer className="mt-20 glow">
                <p>The Unhackable @ 2025</p>
            
            </footer>
        </div>
      </form>
      
    )

}
export default Signin
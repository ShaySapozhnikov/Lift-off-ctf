import React from "react";
import ShipIcon from "../components/shipIcon";
import Signin from "../components/SignIn-coms";
function Admin()
{
    const lable = `   ░███           ░██                 ░██           
  ░██░██          ░██                               
 ░██  ░██   ░████████ ░█████████████  ░██░████████  
░█████████ ░██    ░██ ░██   ░██   ░██ ░██░██    ░██ 
░██    ░██ ░██    ░██ ░██   ░██   ░██ ░██░██    ░██ 
░██    ░██ ░██   ░███ ░██   ░██   ░██ ░██░██    ░██ 
░██    ░██  ░█████░██ ░██   ░██   ░██ ░██░██    ░██ 
                                                    
                                                    
                                                    `
    return(
        <Signin  textLabel= {lable}></Signin>

        
    );

}


export default Admin
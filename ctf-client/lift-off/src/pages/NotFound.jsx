import React from "react";
import ShipIcon from "../components/shipIcon";

function NotFound(){ // make this nicer 
    return(
        <div class="grid min-h-full place-items-center px-6 py-24 sm:py-32 lg:px-8">
            <div class="text-center">
                
                <h1 class="mt-4 text-5xl text-balance text-amber-100 sm:text-7xl">-- 404: SYSTEM ERROR --</h1>
                <p class="mt-6 text-lg font-medium text-pretty text-white sm:text-xl/8">You've drifted into an uncharted region of the interface.</p>

               
            </div>
        </div>
    );
}

export default NotFound;
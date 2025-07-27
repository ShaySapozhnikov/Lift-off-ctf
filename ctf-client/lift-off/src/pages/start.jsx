import React from "react";



function start(){
    return( 
       
        <body class="flex justify-center items-center h-screen bg-zinc-900">
  <div class="grid h-[650px] w-[650px] grid-rows-2 rounded border-2 border-dotted border-white">
 
    <div>
      <h1 class="text-2xl text-white text-center p-5 animate-pulse">--Activity Log--</h1>
      <h2 class="text-white text-center">Navigation System status: <span class="text-red-400 animate-pulse">OFFLINE</span></h2> 
      <h2 class="text-white text-center">Autopilot status: <span class="text-amber-100 animate-pulse">UNKNOWN</span></h2>
      <h2 class="text-white text-center">Backup status: <span class="text-lime-200 animate-pulse">ONLINE</span></h2>
    </div>


    <div class="flex justify-center items-center pb-[200px]">
        <div class="w-[350px] h-[400px] bg-zinc-900 border-2 rounded border-dotted border-white p-4 flex flex-col justify-center space-y-2">
        <p class="text-white text-sm font-mono"># The Unhackable 1.0V</p>
        <p class="text-white text-sm font-mono">[User-Agent Detected: Unknown]</p>
        <p class="text-white text-sm font-mono">Access Protocol: Autonomous Scan</p>
        <p class="text-white text-sm font-mono text-red-400">Access Denied:</p>
        <p class="text-white text-sm font-mono">– /admin/</p>

        <p class="text-white text-sm font-mono">– /internal-communications/</p>
        <p class="text-white text-sm font-mono">– /emergency-override/</p>
        <p class="text-white text-sm font-mono text-green-400 pt-2">Status: Passive Observation Permitted</p>
  </div>
</div>


  </div>
</body>

      
    );
}

export default start
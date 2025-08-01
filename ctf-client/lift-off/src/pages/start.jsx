import React from "react";

function start(){
  
    return( 

       
        <body class="flex justify-center items-center h-screen bg-zinc-900">
          <div class="fixed inset-0 z-50 bg-black  flex items-center justify-center animate-fadeBgOpacity">
  
          </div>

  <div class="grid h-[650px] w-[650px] grid-rows-2 rounded border-2 border-double shadow-lg shadow-white/50 border-white">
 
    <div>
      <h1 class="text-2xl text-white text-center p-5 animate-pulse">--Activity Log--</h1>
      <h2 class="text-white text-center">Navigation System status: <span class="text-red-400 animate-pulse">OFFLINE</span></h2> 
      <h2 class="text-white text-center">Autopilot status: <span class="text-amber-100 animate-pulse">UNKNOWN</span></h2>
      <h2 class="text-white text-center">Backup status: <span class="text-lime-200 animate-pulse">ONLINE</span></h2>
    </div>
    <div class="flex justify-center items-center pb-[200px]">
  
  
  
  <div class="w-[350px] h-[400px] bg-zinc-900 border-2 rounded border-double border-white p-4 flex flex-col justify-center space-y-2">
    <p class="text-white text-sm font-mono"># Access Node: unhackable-Server-1</p>
    <p class="text-white text-sm font-mono">[Protocol Ping: Autonomous Crawler Detected]</p>
    <p class="text-white text-sm font-mono">Directive Response: Legacy Directives Found</p>
    <p class="text-white text-sm font-mono text-red-400">Status Code 403 – Path Restrictions Active</p>

    <p class="text-white text-sm">• /redacted/</p>
    <p class="text-white text-sm ">• /redacted/</p>
    <p class="text-white text-sm ">• /redacted/</p>
    <p class="text-green-400 text-sm font-mono animate-pulse">Observation Mode: Passive Link Retained</p>
  </div>
  <div className="shhhh theres nothing here to see"
        dangerouslySetInnerHTML={{
          __html: "<!--What file at the root speaks only to bots, revealing what not to seek? -->",
        }}
      />
</div>



    
</div>



</body>

      
    );
}

export default start
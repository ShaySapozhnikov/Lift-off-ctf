

function ChatLog(){
    return(
        <div className="bg-zinc-900 p-4 h-[200px] border-2 border-gray-500 border-dashed rounded-md mt-4 flex flex-col">
        <h1 className="text-center">---Chat Log---</h1>

        <div id="chat-box" className="flex-1 overflow-y-auto space-y-2 mt-2">
          <div className="text-left ">Crewmember 045: Shields holding at 97%.</div>
          <div className="text-left">Crewmember 207: Engines humming nicely, no issues.</div>
          <div className="text-left">Crewmember 589: Starboard sensors need recalibration.</div>
          <div className="text-left">Crewmember 813: Requesting fresh oxygen filters.</div>
          <div className="text-left">Crewmember 990: Cargo bay secure, no breaches.</div>
          <div className="text-left">Crew Tech 442: Diagnostics 80% complete.</div>
        
        </div>
        
      </div>
    );
}

export default ChatLog
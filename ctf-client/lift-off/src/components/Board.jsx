
function Board()
{



    return(
        <div className="relative bg-zinc-900 h-[400px] border-2 border-gray-500 border-dashed rounded-md">
          <h1 className="p-3 text-white text-center italic font-semibold hover:scale-125 transition-transform duration-300">
            ------Leader Board------
          </h1>
          <ul className="text-white text-left pb-3 ml-[130px] list-inside space-y-2">
          <li>1st - </li>
          <li>2nd - </li>
          <li>3rd - </li>
          <li>4th - </li>
          <li>5th - </li>
          <li>6th - </li>
          <li>7th - </li>
          <li>8th - </li>
          <li>9th - </li>
          <li>10th - </li>
        </ul>
        </div>
    );





}
export default Board;
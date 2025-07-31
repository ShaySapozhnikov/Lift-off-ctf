

const asciiArt = `
                                 ___
                              __,' __\`.                _..----....____
                 __...--.'\`\`;.   ,.   ;\`\`--..__     .'    ,-._    _.-'
            _..-''-------'   \`'   \`'   \`'       \`\`-''._   (,;') _,\\'
          ,'________________                          \\ \`-._\`-',' 
          \`._              \`\`\`\`\`\`\`\`\`\`\`------...___   '-.._'-:
              \`\`\`--.._      ,.                     \`\`\`\`--...__\\-.
                    \`.--. \`-\`                       ____    |  |\`
                      \`. \`.                       ,' \`\`\`\`\`.  ;  ;\`
                        \`._\`.        __________   \`.      \\'__/\`
                          \`-:._____/______/___/____\`.     \\  
                                                    \`.    \\
                                                      \`.   \`.___
                                                       \`------'\`
`;

function ShipIcon({className = ""})
{
    const defaultClassName = "text-white text-left font-mono text-[10px] leading-tight whitespace-pre-wrap p-4 mt-[10px] animate-float z-10"
    return(
        <pre className= {`${defaultClassName}  ${className}`}>
        {asciiArt}
      </pre>
    );

}

export default ShipIcon;



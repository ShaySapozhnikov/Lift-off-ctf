

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

function ShipIcon({ className = "" }) {
  const defaultClassName = "text-white text-left font-mono text-[6px] xs:text-[8px] sm:text-[10px] md:text-xs leading-tight whitespace-pre overflow-x-auto p-2 sm:p-4 mt-2 sm:mt-[10px] animate-float z-10";
  
  return (
    <pre className={`${defaultClassName} ${className}`}>
      {asciiArt}
    </pre>
  );
}

export default ShipIcon;



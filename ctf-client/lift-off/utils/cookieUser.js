const spaceNames = [
    "Crewmember",
    "Star Pilot",
    "Navigator",
    "Engineer",
    "Astro Tech",
    "Cosmo Officer",
    "Starboard Crew",
    "Comet Rider",
    "Orbit Specialist",
    "Stellar Scout"
  ];
  
  export function getOrSetUserId() {
    // Get existing cookie
    let userId = document.cookie
      .split("; ")
      .find((row) => row.startsWith("userId="))
      ?.split("=")[1];
  
    if (!userId) {
      userId = crypto.randomUUID();
      document.cookie = `userId=${userId}; path=/; max-age=${60 * 60 * 24 * 365}`; // 1 year
    }
  
    return userId;
  }
  
  // Deterministically generate a space-themed name from userId
  export function getUserName() {
    const userId = getOrSetUserId();
  
    // Simple hash: sum char codes
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash += userId.charCodeAt(i);
    }
  
    const nameIndex = hash % spaceNames.length;
    const number = hash % 1000; // gives 0-999 like Crew 045
    return `${spaceNames[nameIndex]} ${number}`;
  }
  
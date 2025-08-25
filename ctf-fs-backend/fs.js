import dotenv from "dotenv";
dotenv.config();

export const fs = {
  "/": {
    home: {
      user: {
        "readme.txt": {
          type: "file",
          content: "Welcome!",
          owner: "user",
          permissions: "r",
        },
        "exploit.bat": {
          type: "exe",
          content: "exploit",
          owner: "user",
          permissions: "rw",
        },
        "2nak3.bat": {
          type: "exe",
          content: "launch snake game",
          owner: "user",
          permissions: "rw",
        },
      },
    },
    root: {
      secrets: {
        "key.txt": {
          type: "file",
          content: process.env.TOP_SECRET_KEY,
          owner: "root",
          permissions: "r",
        },
        "root_exploit.sh": {
          type: "exe",
          content: "echo Root command executed",
          owner: "root",
          permissions: "rx",
        },
      },
      bin: {
        "safe_exec": {
          type: "exe",
          content: "echo Safe binary",
          owner: "root",
          permissions: "rx",
        },
      },
      _protected: true,
    },
    bin: {},
    etc: {},
  },
};

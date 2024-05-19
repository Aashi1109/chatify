const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Chatify API",
      description: "Backend api for chatify made using ExpressJS and SocketIO",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
    ],
  },
  apis: ["./routes/*.ts"],
};

export default options;

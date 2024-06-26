1. Chatify Frontend
2. Chatify Backend
   - API endpoints
      - User endpoints
          - GET /user - Returns a list of users present in the system
          - POST /user - Create a new user
          - GET /user/query - More refined api to get users and have options for the filtering
          - GET /user/:id - Returns a user with the specified id if it exists or 404 error otherwise
          - PATCH /user/:id - Udpates a particular user with the specified id or 404 error otherwise
          - DELETE /user/:id - Deletes a user with the specified id or 404 error otherwise
          - PATCH /user/:id/updatePasswordById - Updates the password of a user with the specified id or 404 error otherwise
      - Auth endpoints
          - POST /login - Logs a user with provided username and password
      - Chats endpoints
          - GET /chats/query - Refined query based endpoints to get chats data
          - POST /chats/create - Creates a chat
          - GET /chats/:chatId - Get a particular chat with specified chat id or 404 error otherwise
          - PATCH /chats/:chatId - Update chat with specified chat id or 404 error otherwise
          - DELETE /chats/:chatId - Delete chat with specified chat id or 404 error otherwise
          - GET /chats/interaction/:userId/:receiverId - Get chat with specified user and receiver id or 404 error otherwise
      - File endpoints
          - GET /files/query - Refined query based endpoints to get files data
          - POST /upload - Upload files to specified storage and create their meta entry into database
          - POST /cloudinary/:id - Get info about a specific cloudinary file
          - GET /file/:id - Get info about a specific file
          - DELETE /file/:id - Delete file with specified id or 404 error otherwise
